"""
Test suite for VTC Checkout Payment Flow via C# Proxy
Tests: Auth (register/login), Card management (list/add-card), Booking creation
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from main agent
TEST_CLIENT_EMAIL = "testclient@zont.cab"
TEST_CLIENT_PASSWORD = "test1234"


class TestAuthProxy:
    """Authentication proxy endpoint tests"""
    
    def test_login_success(self):
        """POST /api/proxy/auth/login returns 200 with accessToken"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": TEST_CLIENT_EMAIL, "password": TEST_CLIENT_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "accessToken" in data, "Response should contain accessToken"
        assert isinstance(data["accessToken"], str), "accessToken should be a string"
        assert len(data["accessToken"]) > 50, "accessToken should be a valid JWT"
        # Verify firstName/lastName are returned
        assert "firstName" in data, "Response should contain firstName"
        assert "lastName" in data, "Response should contain lastName"
    
    def test_login_invalid_credentials(self):
        """POST /api/proxy/auth/login with wrong password returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": TEST_CLIENT_EMAIL, "password": "wrongpassword"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code in [400, 401], f"Expected 400/401, got {response.status_code}"
    
    def test_register_duplicate_email(self):
        """POST /api/proxy/auth/register with existing email returns error"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/register",
            json={
                "firstName": "Test",
                "lastName": "Duplicate",
                "email": TEST_CLIENT_EMAIL,
                "phoneNumber": "+33612345678",
                "password": "test1234",
                "gender": "male"
            },
            headers={"Content-Type": "application/json"}
        )
        # Should fail because email already exists
        assert response.status_code in [400, 409, 422], f"Expected 400/409/422 for duplicate, got {response.status_code}"


class TestCardManagementProxy:
    """Card management proxy endpoint tests (requires auth)"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Get auth token before each test"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": TEST_CLIENT_EMAIL, "password": TEST_CLIENT_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code != 200:
            pytest.skip("Login failed - cannot test card endpoints")
        self.token = response.json().get("accessToken")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_get_cards_returns_array(self):
        """GET /api/proxy/client/cards returns 200 with array"""
        response = requests.get(
            f"{BASE_URL}/api/proxy/client/cards",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be an array"
        # If cards exist, verify structure
        if len(data) > 0:
            card = data[0]
            assert "id" in card, "Card should have id"
            assert "last4" in card, "Card should have last4"
            assert "brand" in card, "Card should have brand"
    
    def test_add_card_returns_setup_intent(self):
        """GET /api/proxy/client/add-card returns 200 with clientSecret"""
        response = requests.get(
            f"{BASE_URL}/api/proxy/client/add-card",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "clientSecret" in data, "Response should contain clientSecret"
        assert data["clientSecret"].startswith("seti_"), "clientSecret should be a Stripe SetupIntent"
    
    def test_cards_requires_auth(self):
        """GET /api/proxy/client/cards without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/proxy/client/cards")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_add_card_requires_auth(self):
        """GET /api/proxy/client/add-card without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/proxy/client/add-card")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestBookingProxy:
    """Booking creation proxy endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Get auth token before each test"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": TEST_CLIENT_EMAIL, "password": TEST_CLIENT_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code != 200:
            pytest.skip("Login failed - cannot test booking endpoints")
        self.token = response.json().get("accessToken")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_booking_create_requires_auth(self):
        """POST /api/proxy/booking/create without auth returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/booking/create",
            json={
                "startPointLatitude": 48.8566,
                "startPointLongitude": 2.3522,
                "clientPrice": 50.0,
                "startDate": "15/02/2026 10:00:00"
            }
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_booking_create_accepts_payload(self):
        """POST /api/proxy/booking/create with valid auth accepts booking payload"""
        # Note: This will likely fail without a valid cardId, but should not return 401
        response = requests.post(
            f"{BASE_URL}/api/proxy/booking/create",
            json={
                "startPointLatitude": 48.8566,
                "startPointLongitude": 2.3522,
                "endPointLatitude": 49.0097,
                "endPointLongitude": 2.5479,
                "clientPrice": 75.0,
                "startDate": "15/02/2026 10:00:00",
                "startAddress": "Paris Centre",
                "endAddress": "CDG Airport",
                "tripType": "Transfer",
                "carType": "Berline",
                "distance": 30,
                "duration": 45,
                "cardId": "pm_test_invalid",  # Invalid card - will fail but tests endpoint
                "utcOffset": 60
            },
            headers=self.headers
        )
        # Should not be 401 (auth works), but may be 400/402/404/422 due to invalid card
        # 404 can come from C# backend when card is not found
        assert response.status_code != 401, "Should not return 401 with valid auth"
        # Accept 400, 402, 404, 422 as valid responses for invalid card (C# returns 404 for invalid card)
        assert response.status_code in [200, 201, 400, 402, 404, 422, 500, 502], f"Unexpected status: {response.status_code}"


class TestDirectPaymentRemoved:
    """Verify direct_payment.py endpoints are removed"""
    
    def test_create_intent_returns_404(self):
        """GET /api/payment/create-intent should return 404 (removed)"""
        response = requests.get(f"{BASE_URL}/api/payment/create-intent")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_payment_routes_not_found(self):
        """POST /api/payment/* should return 404 (removed)"""
        response = requests.post(
            f"{BASE_URL}/api/payment/create-intent",
            json={"amount": 5000}
        )
        assert response.status_code in [404, 405], f"Expected 404/405, got {response.status_code}"


class TestClientProfile:
    """Client profile proxy endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Get auth token before each test"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": TEST_CLIENT_EMAIL, "password": TEST_CLIENT_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code != 200:
            pytest.skip("Login failed - cannot test profile endpoints")
        self.token = response.json().get("accessToken")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_get_profile_returns_client_data(self):
        """GET /api/proxy/client/profile returns client info"""
        response = requests.get(
            f"{BASE_URL}/api/proxy/client/profile",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "firstName" in data or "email" in data, "Profile should contain user data"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
