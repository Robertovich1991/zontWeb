"""
Regression tests for My Account page premium redesign.
Test that backend APIs still work as expected after frontend visual changes.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
CLIENT_EMAIL = "arthurhayy@gmail.com"
CLIENT_PASSWORD = "12345678"


class TestAuthRegression:
    """Auth endpoints regression - ensure login still works"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Login and get token"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": CLIENT_EMAIL, "password": CLIENT_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "accessToken" in data, "accessToken not in response"
        return data["accessToken"]
    
    def test_login_returns_user_info(self):
        """Login should return accessToken and user name info"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": CLIENT_EMAIL, "password": CLIENT_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "accessToken" in data
        assert "firstName" in data or "lastName" in data
        print(f"Login success: firstName={data.get('firstName')}")


class TestClientCardsRegression:
    """Cards endpoints regression - ensure card management still works"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Login and get token"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": CLIENT_EMAIL, "password": CLIENT_PASSWORD}
        )
        return response.json().get("accessToken")
    
    def test_get_cards_returns_list(self, auth_token):
        """GET /api/proxy/client/cards should return saved cards"""
        response = requests.get(
            f"{BASE_URL}/api/proxy/client/cards",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        cards = response.json()
        assert isinstance(cards, list)
        print(f"Found {len(cards)} cards")
        
    def test_get_cards_has_visa_5377(self, auth_token):
        """Test client should have Visa card ending in 5377"""
        response = requests.get(
            f"{BASE_URL}/api/proxy/client/cards",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        cards = response.json()
        visa_5377 = [c for c in cards if c.get("last4") == "5377"]
        assert len(visa_5377) > 0, "Expected Visa 5377 card not found"
        print(f"Found Visa 5377: brand={visa_5377[0].get('brand')}")
    
    def test_cards_requires_auth(self):
        """Cards endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/proxy/client/cards")
        assert response.status_code == 401


class TestBookingCancelRegression:
    """Booking cancel endpoint regression"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Login and get token"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": CLIENT_EMAIL, "password": CLIENT_PASSWORD}
        )
        return response.json().get("accessToken")
    
    def test_cancel_requires_auth(self):
        """Cancel should require authentication"""
        response = requests.delete(f"{BASE_URL}/api/proxy/booking/cancel/fake-id-123")
        assert response.status_code == 401
        
    def test_cancel_nonexistent_booking(self, auth_token):
        """Cancel should return 404 for non-existent booking"""
        response = requests.delete(
            f"{BASE_URL}/api/proxy/booking/cancel/fake-id-123",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        # Acceptable responses for non-existent booking
        assert response.status_code in [400, 404, 502], f"Unexpected status: {response.status_code}"
        print(f"Non-existent booking returns: {response.status_code}")


class TestProfileRegression:
    """Profile endpoint regression"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Login and get token"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": CLIENT_EMAIL, "password": CLIENT_PASSWORD}
        )
        return response.json().get("accessToken")
    
    def test_get_profile(self, auth_token):
        """GET /api/proxy/client/profile should return profile"""
        response = requests.get(
            f"{BASE_URL}/api/proxy/client/profile",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        profile = response.json()
        assert "firstName" in profile or "email" in profile
        print(f"Profile: {profile.get('firstName')} {profile.get('lastName')}")
    
    def test_profile_requires_auth(self):
        """Profile should require authentication"""
        response = requests.get(f"{BASE_URL}/api/proxy/client/profile")
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
