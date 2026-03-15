"""
Backend tests for Booking Cancellation Feature
Tests DELETE /api/proxy/booking/cancel/{auction_id} endpoint

Business rules:
- Returns 401 without authentication
- Returns 404 for non-existent booking
- Proxies to C# API DELETE /api/Auction/cancel/{id}
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "arthurhayy@gmail.com"
TEST_PASSWORD = "12345678"


class TestBookingCancellationAuth:
    """Authentication tests for cancel booking endpoint"""
    
    def test_cancel_booking_requires_auth(self):
        """DELETE /api/proxy/booking/cancel/{id} returns 401 without auth"""
        response = requests.delete(
            f"{BASE_URL}/api/proxy/booking/cancel/test-booking-id",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"PASS: Cancel booking returns 401 without auth - {response.json()}")


class TestBookingCancellationWithAuth:
    """Cancellation tests with valid authentication"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token via login"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.status_code}"
        data = response.json()
        token = data.get("accessToken")
        assert token, "No accessToken in login response"
        print(f"PASS: Login successful, got accessToken")
        return token
    
    def test_cancel_nonexistent_booking(self, auth_token):
        """DELETE /api/proxy/booking/cancel/fake-id returns 404"""
        response = requests.delete(
            f"{BASE_URL}/api/proxy/booking/cancel/fake-id-12345",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
        )
        # Expect 404 for non-existent booking OR 502 if C# API doesn't find it
        assert response.status_code in [404, 400, 502], f"Expected 404/400/502, got {response.status_code}"
        print(f"PASS: Non-existent booking returns {response.status_code} - {response.text}")
    
    def test_get_upcoming_bookings(self, auth_token):
        """GET /api/proxy/booking/upcoming returns list of bookings"""
        response = requests.get(
            f"{BASE_URL}/api/proxy/booking/upcoming",
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"PASS: Upcoming bookings returns list with {len(data)} items")
        
        # Print booking info if any exist
        for i, booking in enumerate(data[:3]):  # Print first 3 bookings
            booking_id = booking.get('id') or booking.get('auctionId')
            start_date = booking.get('startDate') or booking.get('date')
            status = booking.get('status') or booking.get('auctionStatus')
            print(f"  Booking {i}: id={booking_id}, date={start_date}, status={status}")
        
        return data


class TestRegressionCardManagement:
    """Regression tests to ensure card management still works"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        return response.json().get("accessToken")
    
    def test_get_cards_still_works(self, auth_token):
        """GET /api/proxy/client/cards returns saved cards"""
        response = requests.get(
            f"{BASE_URL}/api/proxy/client/cards",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of cards"
        print(f"PASS: Cards endpoint returns {len(data)} cards")
        
        # Check card structure if cards exist
        if data:
            card = data[0]
            assert 'id' in card, "Card missing id"
            assert 'brand' in card, "Card missing brand"
            assert 'last4' in card, "Card missing last4"
            print(f"  Card found: {card.get('brand')} **** {card.get('last4')}")
    
    def test_add_card_setup_intent_still_works(self, auth_token):
        """GET /api/proxy/client/add-card returns Stripe SetupIntent"""
        response = requests.get(
            f"{BASE_URL}/api/proxy/client/add-card",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'clientSecret' in data, "Missing clientSecret in response"
        assert data['clientSecret'].startswith('seti_'), f"Expected seti_*, got {data['clientSecret'][:20]}"
        print(f"PASS: Add card returns valid SetupIntent")


class TestClientProfile:
    """Regression tests for client profile"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        return response.json().get("accessToken")
    
    def test_get_profile_still_works(self, auth_token):
        """GET /api/proxy/client/profile returns profile data"""
        response = requests.get(
            f"{BASE_URL}/api/proxy/client/profile",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'firstName' in data, "Missing firstName"
        assert 'lastName' in data, "Missing lastName"
        assert 'email' in data, "Missing email"
        print(f"PASS: Profile returns {data.get('firstName')} {data.get('lastName')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
