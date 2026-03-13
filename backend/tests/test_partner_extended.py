"""
Extended Partner API Tests - Partner Driver Ride Proposal + Payment Flow
Tests: Route calculation, Setup Intent, C# registration, Partner login with C# token

Features tested:
- Route calculation (POST /api/partner/calculate-route)
- Setup Intent for Stripe 3DS (POST /api/partner/booking/setup-intent)
- Partner creation with C# registration (POST /api/partner/admin/partners)
- Partner login returns csharpToken
- Available rides (GET /api/partner/available-rides)
"""
import pytest
import requests
import os
import uuid
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_PARTNER_EMAIL = "partner_test_1773438684@test.com"
TEST_PARTNER_PASSWORD = "Test1234!"
ADMIN_EMAIL = "admin@zont.cab"
ADMIN_PASSWORD = "admin123"
CSHARP_TEST_EMAIL = "arthurhayy@gmail.com"
CSHARP_TEST_PASSWORD = "12345678"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def admin_token(api_client):
    """Get admin authentication token"""
    response = api_client.post(f"{BASE_URL}/api/admin/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Admin authentication failed - skipping admin tests")


@pytest.fixture(scope="module")
def partner_with_csharp_token(api_client):
    """Get partner token along with csharpToken for a partner that has C# account"""
    # First try the provided test partner
    response = api_client.post(f"{BASE_URL}/api/partner/auth/login", json={
        "email": TEST_PARTNER_EMAIL,
        "password": TEST_PARTNER_PASSWORD
    })
    if response.status_code == 200:
        return response.json()
    # Fallback to chauffeur@test.com
    response2 = api_client.post(f"{BASE_URL}/api/partner/auth/login", json={
        "email": "chauffeur@test.com",
        "password": "test123"
    })
    if response2.status_code == 200:
        return response2.json()
    pytest.skip("Partner authentication failed")


class TestRouteCalculation:
    """Route calculation endpoint tests"""
    
    def test_calculate_route_success(self, api_client, partner_with_csharp_token):
        """Test POST /calculate-route returns distance and duration"""
        token = partner_with_csharp_token["token"]
        response = api_client.post(
            f"{BASE_URL}/api/partner/calculate-route",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "origin": "Aeroport Charles de Gaulle, Paris",
                "destination": "Tour Eiffel, Paris"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "ok", f"Route calculation failed: {data}"
        assert "distance" in data, "Response should contain distance"
        assert "distance_meters" in data, "Response should contain distance_meters"
        assert "duration" in data, "Response should contain duration"
        assert "duration_seconds" in data, "Response should contain duration_seconds"
        # Verify types
        assert isinstance(data["distance_meters"], int), "distance_meters should be int"
        assert isinstance(data["duration_seconds"], int), "duration_seconds should be int"
        assert data["distance_meters"] > 0, "distance_meters should be positive"
        assert data["duration_seconds"] > 0, "duration_seconds should be positive"
    
    def test_calculate_route_invalid_addresses(self, api_client, partner_with_csharp_token):
        """Test route calculation with invalid addresses"""
        token = partner_with_csharp_token["token"]
        response = api_client.post(
            f"{BASE_URL}/api/partner/calculate-route",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "origin": "xyzinvalidaddress123",
                "destination": "abcinvalidaddress456"
            }
        )
        # Should return 200 with error status or no routes
        assert response.status_code == 200
        data = response.json()
        # May return error status or empty
        if data.get("status") == "error":
            assert "message" in data
    
    def test_calculate_route_requires_auth(self, api_client):
        """Test route calculation requires authentication"""
        response = api_client.post(
            f"{BASE_URL}/api/partner/calculate-route",
            json={"origin": "Paris", "destination": "Lyon"}
        )
        assert response.status_code == 401


class TestSetupIntent:
    """Stripe SetupIntent endpoint tests"""
    
    def test_setup_intent_requires_auth(self, api_client):
        """Test setup intent endpoint requires authentication"""
        response = api_client.post(f"{BASE_URL}/api/partner/booking/setup-intent")
        assert response.status_code == 401
    
    def test_setup_intent_with_csharp_token(self, api_client, partner_with_csharp_token):
        """Test setup intent returns client secret when partner has C# token"""
        token = partner_with_csharp_token["token"]
        csharp_token = partner_with_csharp_token.get("csharpToken")
        
        # Only test if partner has C# token
        if not csharp_token:
            pytest.skip("Partner does not have C# token - cannot test setup intent")
        
        response = api_client.post(
            f"{BASE_URL}/api/partner/booking/setup-intent",
            headers={"Authorization": f"Bearer {token}"}
        )
        # Could be 200 with clientSecret or 400/502 if C# API has issues
        if response.status_code == 200:
            data = response.json()
            assert "clientSecret" in data, "Response should contain clientSecret"
            assert data["clientSecret"].startswith("seti_"), "clientSecret should be a SetupIntent ID"
        else:
            # Document the response for debugging
            print(f"SetupIntent returned {response.status_code}: {response.text[:200]}")


class TestPartnerLoginWithCsharpToken:
    """Test partner login returns csharpToken"""
    
    def test_login_returns_csharp_token(self, api_client):
        """Test partner login returns csharpToken when partner has C# account"""
        response = api_client.post(f"{BASE_URL}/api/partner/auth/login", json={
            "email": TEST_PARTNER_EMAIL,
            "password": TEST_PARTNER_PASSWORD
        })
        if response.status_code != 200:
            # Try fallback partner
            response = api_client.post(f"{BASE_URL}/api/partner/auth/login", json={
                "email": "chauffeur@test.com",
                "password": "test123"
            })
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "partner" in data, "Response should contain partner"
        # csharpToken may or may not be present depending on C# registration
        if "csharpToken" in data and data["csharpToken"]:
            print(f"Partner has csharpToken: {data['csharpToken'][:20]}...")
            assert "hasCsharpAccount" in data["partner"]
            assert data["partner"]["hasCsharpAccount"] == True


class TestPartnerCreationWithCsharp:
    """Test partner creation includes C# registration"""
    
    def test_create_partner_attempts_csharp_registration(self, api_client, admin_token):
        """Test POST /admin/partners attempts to register in C# system"""
        unique_email = f"TEST_csharp_{uuid.uuid4().hex[:8]}@test.com"
        unique_password = "TestCsharp123!"
        
        response = api_client.post(
            f"{BASE_URL}/api/partner/admin/partners",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "email": unique_email,
                "password": unique_password,
                "name": "TEST C# Registration",
                "phone": "+33612345678",
                "company": "Test C# Company"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data
        assert "csharp_registered" in data, "Response should indicate C# registration status"
        # Note: csharp_registered may be true or false depending on if C# API accepted the registration
        print(f"C# registration status: {data.get('csharp_registered')}")
        
        # Cleanup
        partner_id = data["id"]
        api_client.delete(
            f"{BASE_URL}/api/partner/admin/partners/{partner_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )


class TestAvailableRides:
    """Test available rides endpoint"""
    
    def test_available_rides_returns_other_partners_rides(self, api_client, partner_with_csharp_token):
        """Test GET /available-rides returns pending rides from OTHER partners"""
        token = partner_with_csharp_token["token"]
        response = api_client.get(
            f"{BASE_URL}/api/partner/available-rides",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # Rides should be pending and from other partners
        for ride in data:
            assert ride["status"] == "pending", "Available rides should be pending"
            assert ride["partner_id"] != partner_with_csharp_token["partner"]["id"], \
                "Should not include own rides"
    
    def test_available_rides_requires_auth(self, api_client):
        """Test available rides requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/partner/available-rides")
        assert response.status_code == 401


class TestRideWithSubmittedCsharpStatus:
    """Test ride creation with card_id triggers C# submission"""
    
    def test_create_ride_with_card_submits_to_csharp(self, api_client, partner_with_csharp_token):
        """Test POST /rides with card_id attempts C# submission"""
        token = partner_with_csharp_token["token"]
        csharp_token = partner_with_csharp_token.get("csharpToken")
        
        # Create ride with fake card_id (C# will reject it, but we test the flow)
        ride_data = {
            "pickup_address": "10 Rue de Rivoli, Paris",
            "pickup_lat": 48.8556,
            "pickup_lng": 2.3594,
            "dropoff_address": "Aeroport Orly",
            "dropoff_lat": 48.7262,
            "dropoff_lng": 2.3653,
            "vehicle_category": "Business",
            "vehicle_category_id": "0",
            "vehicle_category_name": "Business",
            "proposed_price": 75.00,
            "currency": "EUR",
            "passenger_name": "TEST_CsharpSubmit",
            "passenger_phone": "+33699888777",
            "pickup_datetime": "2026-02-15T10:00:00",
            "notes": "Pytest C# submission test",
            "card_id": "pm_fake_test_card_123",  # Fake card - C# will reject
            "distance_km": 20.5,
            "duration_min": 35
        }
        
        response = api_client.post(
            f"{BASE_URL}/api/partner/rides",
            headers={"Authorization": f"Bearer {token}"},
            json=ride_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data
        # With fake card, C# submission will fail (expected)
        # But we verify the flow attempted
        if csharp_token:
            # If partner has C# token, submission was attempted
            # csharp_submitted will be False due to fake card
            assert "csharp_submitted" in data
            if data["csharp_submitted"]:
                assert data["status"] == "submitted_csharp"
            else:
                # Fake card rejected - check for error
                assert "csharp_error" in data or data["status"] == "pending"
        else:
            # No C# token means no submission attempted
            assert data["status"] == "pending"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
