"""
Backend tests for Driver Review/Rating System
Tests the review endpoints and validation rules:
- POST /api/partner/rides/{ride_id}/review - Create review
- GET /api/partner/rides/{ride_id}/review - Get review for ride
- GET /api/partner/reviews/my - Get all reviews by partner
- GET /api/partner/reviews/stats/{partner_id} - Get review stats
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')

# Test credentials
PARTNER_EMAIL = "chauffeur@test.com"
PARTNER_PASSWORD = "test123"

# Test ride IDs (from the problem statement)
RIDE_WITHOUT_REVIEW = "20bbedeb-3521-4da9-beac-ebe80e69e8e6"
RIDE_WITH_REVIEW = "52ecf8ac-9071-4bb1-b597-c7747689f196"


@pytest.fixture(scope="module")
def partner_token():
    """Get partner authentication token"""
    response = requests.post(
        f"{BASE_URL}/api/partner/auth/login",
        json={"email": PARTNER_EMAIL, "password": PARTNER_PASSWORD}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    assert "token" in data
    return data["token"]


@pytest.fixture
def auth_headers(partner_token):
    """Return headers with auth token"""
    return {"Authorization": f"Bearer {partner_token}", "Content-Type": "application/json"}


class TestPartnerLogin:
    """Test partner login endpoint"""
    
    def test_partner_login_success(self):
        """Test successful partner login"""
        response = requests.post(
            f"{BASE_URL}/api/partner/auth/login",
            json={"email": PARTNER_EMAIL, "password": PARTNER_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "partner" in data
        assert data["partner"]["email"] == PARTNER_EMAIL
        print(f"PASS: Login successful for {PARTNER_EMAIL}")
    
    def test_partner_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/partner/auth/login",
            json={"email": "wrong@email.com", "password": "wrongpass"}
        )
        assert response.status_code == 401
        print("PASS: Invalid credentials return 401")


class TestReviewValidation:
    """Test review creation validation rules"""
    
    def test_review_3_star_empty_comment_fails(self, auth_headers):
        """Test that 3-star rating with empty comment returns error"""
        response = requests.post(
            f"{BASE_URL}/api/partner/rides/{RIDE_WITHOUT_REVIEW}/review",
            json={"rating": 3, "comment": ""},
            headers=auth_headers
        )
        # Should return 400 because comment is required for ratings < 5
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        # Verify error message mentions mandatory comment
        assert "obligatoire" in data["detail"].lower() or "comment" in data["detail"].lower()
        print(f"PASS: 3-star with empty comment returns 400: {data['detail']}")
    
    def test_review_invalid_rating_zero(self, auth_headers):
        """Test that 0-star rating returns error"""
        response = requests.post(
            f"{BASE_URL}/api/partner/rides/{RIDE_WITHOUT_REVIEW}/review",
            json={"rating": 0, "comment": "Test comment"},
            headers=auth_headers
        )
        assert response.status_code == 400
        print("PASS: 0-star rating returns 400")
    
    def test_review_invalid_rating_six(self, auth_headers):
        """Test that 6-star rating returns error"""
        response = requests.post(
            f"{BASE_URL}/api/partner/rides/{RIDE_WITHOUT_REVIEW}/review",
            json={"rating": 6, "comment": "Test comment"},
            headers=auth_headers
        )
        assert response.status_code == 400
        print("PASS: 6-star rating returns 400")


class TestReviewCreation:
    """Test review creation endpoint"""
    
    def test_already_reviewed_ride_returns_error(self, auth_headers):
        """Test that trying to review an already-reviewed ride returns error"""
        response = requests.post(
            f"{BASE_URL}/api/partner/rides/{RIDE_WITH_REVIEW}/review",
            json={"rating": 5, "comment": "Duplicate review attempt"},
            headers=auth_headers
        )
        # Should return 400 because ride already has a review
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print(f"PASS: Already reviewed ride returns 400: {data['detail']}")


class TestReviewRetrieval:
    """Test review retrieval endpoints"""
    
    def test_get_existing_review(self, auth_headers):
        """Test getting review for a ride that has been reviewed"""
        response = requests.get(
            f"{BASE_URL}/api/partner/rides/{RIDE_WITH_REVIEW}/review",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "rating" in data
        assert "comment" in data
        assert "created_at" in data
        assert data["ride_id"] == RIDE_WITH_REVIEW
        print(f"PASS: Got existing review - Rating: {data['rating']}, Comment: {data.get('comment', 'N/A')}")
    
    def test_get_nonexistent_review(self, auth_headers):
        """Test getting review for a ride without a review returns 404"""
        response = requests.get(
            f"{BASE_URL}/api/partner/rides/{RIDE_WITHOUT_REVIEW}/review",
            headers=auth_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Ride without review returns 404")
    
    def test_get_my_reviews(self, auth_headers):
        """Test getting all reviews by current partner"""
        response = requests.get(
            f"{BASE_URL}/api/partner/reviews/my",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Got {len(data)} reviews for current partner")
        for review in data:
            assert "rating" in review
            assert "ride_id" in review


class TestReviewStats:
    """Test review statistics endpoint"""
    
    def test_get_partner_review_stats(self, partner_token, auth_headers):
        """Test getting review stats for a partner"""
        # First get partner ID from the /me endpoint
        me_response = requests.get(
            f"{BASE_URL}/api/partner/auth/me",
            headers=auth_headers
        )
        assert me_response.status_code == 200
        partner_id = me_response.json()["id"]
        
        # Now get review stats
        response = requests.get(
            f"{BASE_URL}/api/partner/reviews/stats/{partner_id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "average_rating" in data
        assert "total_reviews" in data
        assert "ratings" in data
        print(f"PASS: Got review stats - Average: {data['average_rating']}, Total: {data['total_reviews']}")
        print(f"  Rating breakdown: {data['ratings']}")


class TestRideDetail:
    """Test ride detail shows review status"""
    
    def test_ride_with_review_has_reviewed_flag(self, auth_headers):
        """Test that a reviewed ride has reviewed=True flag"""
        response = requests.get(
            f"{BASE_URL}/api/partner/rides/{RIDE_WITH_REVIEW}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("reviewed") == True or data.get("review_rating") is not None
        print(f"PASS: Ride {RIDE_WITH_REVIEW} has reviewed flag or review_rating")
    
    def test_ride_without_review_has_no_reviewed_flag(self, auth_headers):
        """Test that an unreviewed ride has reviewed=False or missing"""
        response = requests.get(
            f"{BASE_URL}/api/partner/rides/{RIDE_WITHOUT_REVIEW}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        # Either reviewed is False/None or doesn't exist
        is_reviewed = data.get("reviewed", False)
        assert is_reviewed == False or is_reviewed is None
        print(f"PASS: Ride {RIDE_WITHOUT_REVIEW} is not reviewed (reviewed={is_reviewed})")


class TestUnauthenticatedAccess:
    """Test that review endpoints require authentication"""
    
    def test_create_review_requires_auth(self):
        """Test that creating a review without auth fails"""
        response = requests.post(
            f"{BASE_URL}/api/partner/rides/{RIDE_WITHOUT_REVIEW}/review",
            json={"rating": 5, "comment": "Test"}
        )
        assert response.status_code == 401
        print("PASS: Create review requires authentication")
    
    def test_get_my_reviews_requires_auth(self):
        """Test that getting my reviews without auth fails"""
        response = requests.get(f"{BASE_URL}/api/partner/reviews/my")
        assert response.status_code == 401
        print("PASS: Get my reviews requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
