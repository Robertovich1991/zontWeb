"""
Test suite for Client Card Management via /api/proxy/client endpoints
Tests: GET cards, GET add-card (SetupIntent), DELETE card, Client profile
Testing the My Account Payment tab feature for client-side card management
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Client credentials for testing
CLIENT_EMAIL = "arthurhayy@gmail.com"
CLIENT_PASSWORD = "12345678"


class TestClientAuthentication:
    """Client login endpoint tests"""

    def test_client_login_success(self):
        """Test client login via /api/proxy/auth/login returns accessToken"""
        response = requests.post(f"{BASE_URL}/api/proxy/auth/login", json={
            "username": CLIENT_EMAIL,
            "password": CLIENT_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "accessToken" in data, "Response should contain accessToken"
        assert data["accessToken"].startswith("eyJ"), "accessToken should be a JWT"
        assert "firstName" in data, "Response should contain firstName"
        assert data["firstName"] == "ARTHUR"
        print(f"✓ Client login success - accessToken obtained")

    def test_client_login_invalid_credentials(self):
        """Test login with invalid credentials returns error (400 or 401)"""
        response = requests.post(f"{BASE_URL}/api/proxy/auth/login", json={
            "username": "invalid@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code in [400, 401], f"Expected 400 or 401, got {response.status_code}"
        print(f"✓ Invalid login correctly returns {response.status_code}")


class TestClientCardManagement:
    """Tests for client card CRUD via /api/proxy/client endpoints"""

    @pytest.fixture
    def auth_token(self):
        """Get auth token for test client"""
        res = requests.post(f"{BASE_URL}/api/proxy/auth/login", json={
            "username": CLIENT_EMAIL,
            "password": CLIENT_PASSWORD
        })
        return res.json()["accessToken"]

    def test_get_cards_returns_list(self, auth_token):
        """Test GET /api/proxy/client/cards returns list of saved cards"""
        response = requests.get(f"{BASE_URL}/api/proxy/client/cards", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Get cards failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /client/cards returns {len(data)} cards")
        
        # Verify card structure if cards exist
        if len(data) > 0:
            card = data[0]
            assert "id" in card, "Card should have id"
            assert "brand" in card, "Card should have brand"
            assert "last4" in card, "Card should have last4"
            assert "exp_month" in card, "Card should have exp_month"
            assert "exp_year" in card, "Card should have exp_year"
            print(f"  Card: {card['brand'].upper()} **** {card['last4']}, expires {card['exp_month']}/{card['exp_year']}")

    def test_get_cards_has_visa_5377(self, auth_token):
        """Test client has the expected Visa card ending in 5377"""
        response = requests.get(f"{BASE_URL}/api/proxy/client/cards", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Find card with last4 = 5377
        visa_card = next((c for c in data if c.get("last4") == "5377"), None)
        assert visa_card is not None, "Should have Visa card ending in 5377"
        assert visa_card["brand"] == "visa", "Card should be Visa"
        print(f"✓ Found expected Visa **** 5377 (id: {visa_card['id']})")

    def test_get_add_card_setup_intent(self, auth_token):
        """Test GET /api/proxy/client/add-card returns Stripe SetupIntent clientSecret"""
        response = requests.get(f"{BASE_URL}/api/proxy/client/add-card", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Get add-card failed: {response.text}"
        data = response.json()
        assert "clientSecret" in data, "Response should contain clientSecret"
        assert data["clientSecret"].startswith("seti_"), "clientSecret should start with seti_"
        print(f"✓ GET /client/add-card returns valid SetupIntent clientSecret")

    def test_delete_card_invalid_id(self, auth_token):
        """Test DELETE /api/proxy/client/cards/{invalid_id} returns error"""
        response = requests.delete(f"{BASE_URL}/api/proxy/client/cards/invalid_card_id_123", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        # Should return error for invalid card ID
        assert response.status_code in [400, 404, 500], f"Expected error status, got {response.status_code}"
        print(f"✓ DELETE with invalid card_id correctly returns error (status: {response.status_code})")

    def test_cards_requires_auth(self):
        """Test cards endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/proxy/client/cards")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /client/cards requires auth (401)")

    def test_add_card_requires_auth(self):
        """Test add-card endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/proxy/client/add-card")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /client/add-card requires auth (401)")


class TestClientProfile:
    """Tests for client profile endpoint"""

    @pytest.fixture
    def auth_token(self):
        """Get auth token for test client"""
        res = requests.post(f"{BASE_URL}/api/proxy/auth/login", json={
            "username": CLIENT_EMAIL,
            "password": CLIENT_PASSWORD
        })
        return res.json()["accessToken"]

    def test_get_client_profile(self, auth_token):
        """Test GET /api/proxy/client/profile returns client info"""
        response = requests.get(f"{BASE_URL}/api/proxy/client/profile", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Get profile failed: {response.text}"
        data = response.json()
        assert "firstName" in data, "Profile should have firstName"
        assert "lastName" in data, "Profile should have lastName"
        assert "email" in data, "Profile should have email"
        assert "phoneNumber" in data, "Profile should have phoneNumber"
        assert data["firstName"] == "ARTHUR", "firstName should be ARTHUR"
        print(f"✓ GET /client/profile returns: {data['firstName']} {data['lastName']}")

    def test_profile_requires_auth(self):
        """Test profile endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/proxy/client/profile")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /client/profile requires auth (401)")


# Run tests when executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
