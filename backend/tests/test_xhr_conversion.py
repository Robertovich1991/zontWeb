"""
Test suite for XHR conversion verification - Stripe.js fetch() interception fix
Tests that all auth and checkout-related APIs work correctly via the proxy
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials — load from environment, no hardcoded secrets
TEST_CLIENT_EMAIL = os.environ.get('TEST_CLIENT_EMAIL', 'testclient@example.com')
TEST_CLIENT_PASSWORD = os.environ.get('TEST_CLIENT_PASSWORD', 'changeme')


class TestAuthServiceXHR:
    """Test auth service endpoints that were converted from fetch() to XHR"""
    
    def test_login_success(self):
        """Test login endpoint works (authService.login uses XHR)"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": TEST_CLIENT_EMAIL, "password": TEST_CLIENT_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "accessToken" in data, "No accessToken in response"
        assert "firstName" in data, "No firstName in response"
        print(f"✅ Login successful - firstName: {data.get('firstName')}")
        return data["accessToken"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns error"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": "invalid@test.com", "password": "wrongpassword"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code in [400, 401], f"Expected 400/401, got {response.status_code}"
        print("✅ Invalid login correctly rejected")
    
    def test_forgot_password_endpoint(self):
        """Test forgot password endpoint works (authService.forgotPassword uses XHR)"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/forgot-password",
            json={"email": TEST_CLIENT_EMAIL},
            headers={"Content-Type": "application/json"}
        )
        # May return 200 or 400 depending on email verification status
        assert response.status_code in [200, 400], f"Unexpected status: {response.status_code}"
        print(f"✅ Forgot password endpoint responded: {response.status_code}")


class TestCheckoutXHR:
    """Test checkout-related endpoints that were converted from fetch() to XHR"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": TEST_CLIENT_EMAIL, "password": TEST_CLIENT_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            return response.json().get("accessToken")
        pytest.skip("Could not authenticate")
    
    def test_setup_intent_requires_auth(self):
        """Test setup-intent endpoint requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/booking/setup-intent",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Setup-intent correctly requires auth")
    
    def test_setup_intent_with_auth(self, auth_token):
        """Test setup-intent endpoint works with valid auth (uses XHR in frontend)"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/booking/setup-intent",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        # May return 200 with clientSecret or error if Stripe not configured
        assert response.status_code in [200, 400, 401, 502], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            if "clientSecret" in data:
                print(f"✅ Setup-intent returned clientSecret")
            else:
                print(f"✅ Setup-intent responded: {data}")
        else:
            print(f"✅ Setup-intent responded with status {response.status_code}")
    
    def test_client_cards_requires_auth(self):
        """Test client cards endpoint requires authentication"""
        response = requests.get(
            f"{BASE_URL}/api/proxy/client/cards",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Client cards correctly requires auth")
    
    def test_client_cards_with_auth(self, auth_token):
        """Test client cards endpoint works with valid auth (uses XHR in frontend)"""
        response = requests.get(
            f"{BASE_URL}/api/proxy/client/cards",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of cards"
        print(f"✅ Client cards returned {len(data)} cards")
    
    def test_client_profile_requires_auth(self):
        """Test client profile endpoint requires authentication (used for session validation)"""
        response = requests.get(
            f"{BASE_URL}/api/proxy/client/profile",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Client profile correctly requires auth")
    
    def test_client_profile_with_auth(self, auth_token):
        """Test client profile endpoint works with valid auth (AuthContext uses XHR)"""
        response = requests.get(
            f"{BASE_URL}/api/proxy/client/profile",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "firstName" in data or "email" in data, "Expected profile data"
        print(f"✅ Client profile returned data")


class TestKioskAPI:
    """Test kiosk API endpoints"""
    
    def test_kiosk_hotel_exists(self):
        """Test kiosk hotel 'bristol' exists"""
        response = requests.get(f"{BASE_URL}/api/kiosk/bristol")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("name") == "Hotel Le Bristol Paris"
        print(f"✅ Kiosk hotel found: {data.get('name')}")
    
    def test_kiosk_prices(self):
        """Test kiosk prices endpoint returns destinations with pricing"""
        response = requests.post(f"{BASE_URL}/api/kiosk/bristol/prices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "hotel" in data, "No hotel in response"
        assert "destinations" in data, "No destinations in response"
        assert len(data["destinations"]) > 0, "No destinations returned"
        
        # Check first destination has vehicles and pricing
        first_dest = data["destinations"][0]
        assert "name" in first_dest, "Destination missing name"
        assert "vehicles" in first_dest, "Destination missing vehicles"
        assert "cheapest" in first_dest, "Destination missing cheapest price"
        print(f"✅ Kiosk prices returned {len(data['destinations'])} destinations")
        print(f"   First destination: {first_dest['name']} - from {first_dest['cheapest']}€")
    
    def test_kiosk_custom_price(self):
        """Test kiosk custom price endpoint for Google Places destinations"""
        response = requests.post(
            f"{BASE_URL}/api/kiosk/bristol/custom-price",
            json={
                "destinationLat": 48.8566,
                "destinationLng": 2.3522,
                "destinationAddress": "Paris, France",
                "destinationName": "Paris Center"
            },
            headers={"Content-Type": "application/json"}
        )
        # May return 200 or 502 if C# API is slow
        assert response.status_code in [200, 502], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            assert "vehicles" in data, "No vehicles in response"
            print(f"✅ Custom price returned {len(data.get('vehicles', []))} vehicles")
        else:
            print(f"⚠️ Custom price returned 502 (C# API may be slow)")


class TestTransferServiceXHR:
    """Test transfer service endpoints - submitBooking uses XHR"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": TEST_CLIENT_EMAIL, "password": TEST_CLIENT_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            return response.json().get("accessToken")
        pytest.skip("Could not authenticate")
    
    def test_booking_create_requires_auth(self):
        """Test booking create endpoint requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/booking/create",
            json={
                "startPointLatitude": 48.8718,
                "startPointLongitude": 2.3161,
                "clientPrice": 49,
                "startDate": "20/04/2026 14:00:00"
            },
            headers={"Content-Type": "application/json"}
        )
        # Returns 401 when auth is missing (after body validation)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Booking create correctly requires auth")
    
    def test_booking_create_validates_payload(self, auth_token):
        """Test booking create validates required fields"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/booking/create",
            json={
                "startPointLatitude": 48.8718,
                "startPointLongitude": 2.3161,
                "clientPrice": 49,
                "startDate": "20/04/2026 14:00:00",
                "startAddress": "Hotel Le Bristol Paris",
                "endAddress": "CDG Airport",
                "destination": "49.0097,2.5479",
                "tripType": "distance",
                "carType": "Regular Zont",
                # Missing cardId - should fail
            },
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        # Should fail due to missing cardId or other validation
        assert response.status_code in [400, 422, 500, 502], f"Expected validation error, got {response.status_code}"
        print(f"✅ Booking create validates payload (status: {response.status_code})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
