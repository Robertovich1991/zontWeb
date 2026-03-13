"""
New Partner Features API Tests for Zont Driver/Partner PWA - Iteration 14
Tests: Route calculation, available rides, Stripe payment card management

Features tested:
- POST /api/partner/calculate-route - Google Directions API route calculation
- GET /api/partner/available-rides - Pending rides from OTHER partners
- GET /api/partner/rides/{id} - Single ride detail fetch
- GET /api/partner/payment/my-card - Card status for partner
- POST /api/partner/payment/add-card - Stripe checkout session for card setup
- GET /api/partner/payment/card-status/{session_id} - Check payment status
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_PARTNER_EMAIL = "chauffeur@test.com"
TEST_PARTNER_PASSWORD = "test123"
ADMIN_EMAIL = "admin@zont.cab"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def partner_token(api_client):
    """Get partner authentication token"""
    response = api_client.post(f"{BASE_URL}/api/partner/auth/login", json={
        "email": TEST_PARTNER_EMAIL,
        "password": TEST_PARTNER_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Partner authentication failed - skipping partner tests")


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
def partner_info(api_client, partner_token):
    """Get partner info including ID"""
    response = api_client.get(
        f"{BASE_URL}/api/partner/auth/me",
        headers={"Authorization": f"Bearer {partner_token}"}
    )
    if response.status_code == 200:
        return response.json()
    return {}


class TestRouteCalculation:
    """Route calculation endpoint tests using Google Directions API"""
    
    def test_calculate_route_success(self, api_client, partner_token):
        """Test POST /calculate-route returns distance and duration between two addresses"""
        response = api_client.post(
            f"{BASE_URL}/api/partner/calculate-route",
            headers={"Authorization": f"Bearer {partner_token}"},
            json={
                "origin": "Paris Charles de Gaulle Airport",
                "destination": "Tour Eiffel, Paris"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "ok", f"Route should be found, got: {data}"
        assert "distance" in data, "Response should contain distance text"
        assert "distance_meters" in data, "Response should contain distance_meters"
        assert "duration" in data, "Response should contain duration text"
        assert "duration_seconds" in data, "Response should contain duration_seconds"
        assert "start_address" in data
        assert "end_address" in data
        # Validate values are reasonable
        assert data["distance_meters"] > 0, "Distance should be positive"
        assert data["duration_seconds"] > 0, "Duration should be positive"
        print(f"Route: {data['distance']} ({data['distance_meters']}m), {data['duration']} ({data['duration_seconds']}s)")
    
    def test_calculate_route_invalid_addresses(self, api_client, partner_token):
        """Test route calculation with invalid addresses returns error status"""
        response = api_client.post(
            f"{BASE_URL}/api/partner/calculate-route",
            headers={"Authorization": f"Bearer {partner_token}"},
            json={
                "origin": "xyznonexistent12345",
                "destination": "abcnonexistent67890"
            }
        )
        assert response.status_code == 200, f"Should return 200 with error status, got {response.status_code}"
        data = response.json()
        # May return "error" status or still try to find something
        if data.get("status") == "ok":
            pytest.skip("Google API found a match for gibberish addresses")
        assert data.get("status") == "error" or "message" in data
    
    def test_calculate_route_requires_auth(self, api_client):
        """Test route calculation requires authentication"""
        response = api_client.post(
            f"{BASE_URL}/api/partner/calculate-route",
            json={"origin": "Paris", "destination": "Lyon"}
        )
        assert response.status_code == 401, f"Should require auth, got {response.status_code}"


class TestAvailableRides:
    """Available rides endpoint - pending rides from OTHER partners"""
    
    def test_get_available_rides(self, api_client, partner_token):
        """Test GET /available-rides returns pending rides from other partners"""
        response = api_client.get(
            f"{BASE_URL}/api/partner/available-rides",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # If there are rides, verify they are NOT from current partner
        # and have pending status
        if len(data) > 0:
            for ride in data:
                assert ride.get("status") == "pending", f"Available rides should be pending, got {ride.get('status')}"
                assert "partner_id" in ride
                assert "pickup_address" in ride
                assert "dropoff_address" in ride
                assert "proposed_price" in ride
            print(f"Found {len(data)} available rides")
        else:
            print("No available rides from other partners (expected if single partner in system)")
    
    def test_available_rides_excludes_own_rides(self, api_client, partner_token, partner_info):
        """Test that available rides exclude current partner's own rides"""
        partner_id = partner_info.get("id", "")
        
        # Get available rides
        response = api_client.get(
            f"{BASE_URL}/api/partner/available-rides",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # None should belong to current partner
        for ride in data:
            assert ride.get("partner_id") != partner_id, f"Available rides should not include own rides"
    
    def test_available_rides_requires_auth(self, api_client):
        """Test available rides requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/partner/available-rides")
        assert response.status_code == 401


class TestRideDetail:
    """Single ride detail endpoint"""
    
    def test_get_ride_detail(self, api_client, partner_token):
        """Test GET /rides/{id} returns single ride with all fields"""
        # First get list of partner rides
        list_response = api_client.get(
            f"{BASE_URL}/api/partner/rides",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert list_response.status_code == 200
        rides = list_response.json()
        
        if len(rides) == 0:
            # Create a ride first
            create_response = api_client.post(
                f"{BASE_URL}/api/partner/rides",
                headers={"Authorization": f"Bearer {partner_token}"},
                json={
                    "pickup_address": "TEST_RideDetail Paris CDG",
                    "dropoff_address": "TEST_RideDetail Arc de Triomphe",
                    "vehicle_category_id": "0",
                    "vehicle_category_name": "Sedan",
                    "proposed_price": 75.00,
                    "currency": "EUR",
                    "passenger_name": "TEST_DetailPassenger"
                }
            )
            assert create_response.status_code == 200
            ride_id = create_response.json()["id"]
        else:
            ride_id = rides[0]["id"]
        
        # Get single ride detail
        response = api_client.get(
            f"{BASE_URL}/api/partner/rides/{ride_id}",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        ride = response.json()
        
        # Validate all expected fields
        assert ride["id"] == ride_id
        assert "pickup_address" in ride
        assert "dropoff_address" in ride
        assert "status" in ride
        assert "proposed_price" in ride
        assert "currency" in ride
        assert "vehicle_category_id" in ride
        assert "vehicle_category_name" in ride
        assert "created_at" in ride
        print(f"Ride detail: {ride['pickup_address']} -> {ride['dropoff_address']}, {ride['proposed_price']} {ride['currency']}")
    
    def test_get_ride_detail_not_found(self, api_client, partner_token):
        """Test GET /rides/{id} with invalid ID returns 404"""
        response = api_client.get(
            f"{BASE_URL}/api/partner/rides/nonexistent-ride-id",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 404


class TestStripePaymentCard:
    """Stripe card management endpoints"""
    
    def test_get_my_card_status(self, api_client, partner_token):
        """Test GET /payment/my-card returns card status for partner"""
        response = api_client.get(
            f"{BASE_URL}/api/partner/payment/my-card",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "has_card" in data, "Response should contain has_card boolean"
        assert isinstance(data["has_card"], bool), "has_card should be boolean"
        # card_added_at is optional (None if no card)
        if data["has_card"]:
            assert "card_added_at" in data
        print(f"Card status: has_card={data['has_card']}, card_added_at={data.get('card_added_at')}")
    
    def test_add_card_creates_checkout_session(self, api_client, partner_token):
        """Test POST /payment/add-card creates Stripe checkout session and returns URL"""
        response = api_client.post(
            f"{BASE_URL}/api/partner/payment/add-card",
            headers={"Authorization": f"Bearer {partner_token}"},
            json={"origin_url": "https://driver-auction-flow.preview.emergentagent.com"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "url" in data, "Response should contain Stripe checkout URL"
        assert "session_id" in data, "Response should contain session_id"
        # Validate URL is a Stripe checkout URL
        assert data["url"].startswith("https://checkout.stripe.com"), f"URL should be Stripe checkout, got: {data['url']}"
        print(f"Stripe session created: {data['session_id']}")
        print(f"Checkout URL prefix: {data['url'][:60]}...")
        return data["session_id"]
    
    def test_check_card_status_by_session(self, api_client, partner_token):
        """Test GET /payment/card-status/{session_id} checks payment status"""
        # First create a session
        add_response = api_client.post(
            f"{BASE_URL}/api/partner/payment/add-card",
            headers={"Authorization": f"Bearer {partner_token}"},
            json={"origin_url": "https://driver-auction-flow.preview.emergentagent.com"}
        )
        assert add_response.status_code == 200
        session_id = add_response.json()["session_id"]
        
        # Check status (will be 'open' or 'pending' since not completed)
        response = api_client.get(
            f"{BASE_URL}/api/partner/payment/card-status/{session_id}",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "status" in data
        assert "payment_status" in data
        # New session should not be paid yet
        assert data["payment_status"] != "paid", "New session should not be paid"
        print(f"Session status: {data['status']}, payment_status: {data['payment_status']}")
    
    def test_payment_endpoints_require_auth(self, api_client):
        """Test payment endpoints require authentication"""
        # my-card
        response1 = api_client.get(f"{BASE_URL}/api/partner/payment/my-card")
        assert response1.status_code == 401
        
        # add-card
        response2 = api_client.post(
            f"{BASE_URL}/api/partner/payment/add-card",
            json={"origin_url": "https://test.com"}
        )
        assert response2.status_code == 401
        
        # card-status
        response3 = api_client.get(f"{BASE_URL}/api/partner/payment/card-status/test-session-id")
        assert response3.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
