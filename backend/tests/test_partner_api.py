"""
Partner & Rides API Tests for Zont Driver/Partner PWA
Tests partner authentication, rides CRUD, admin management, and vehicle categories

Features tested:
- Partner login authentication (valid/invalid credentials)
- Vehicle categories from C# API
- Partner rides CRUD (create, list)
- Admin partners management (CRUD)
- Admin rides management and status updates
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


class TestPartnerAuth:
    """Partner authentication endpoint tests"""
    
    def test_partner_login_success(self, api_client):
        """Test partner login with valid credentials"""
        response = api_client.post(f"{BASE_URL}/api/partner/auth/login", json={
            "email": TEST_PARTNER_EMAIL,
            "password": TEST_PARTNER_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "partner" in data, "Response should contain partner object"
        assert data["partner"]["email"] == TEST_PARTNER_EMAIL
        assert data["partner"]["status"] == "active"
        assert "id" in data["partner"]
        assert "name" in data["partner"]
    
    def test_partner_login_invalid_credentials(self, api_client):
        """Test partner login with invalid credentials returns 401"""
        response = api_client.post(f"{BASE_URL}/api/partner/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401 for invalid credentials, got {response.status_code}"
        data = response.json()
        assert "detail" in data
    
    def test_partner_login_empty_credentials(self, api_client):
        """Test partner login with empty credentials"""
        response = api_client.post(f"{BASE_URL}/api/partner/auth/login", json={
            "email": "",
            "password": ""
        })
        assert response.status_code in [401, 422], f"Expected 401/422, got {response.status_code}"
    
    def test_partner_me_endpoint(self, api_client, partner_token):
        """Test /auth/me returns current partner info"""
        response = api_client.get(
            f"{BASE_URL}/api/partner/auth/me",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_PARTNER_EMAIL
        assert "name" in data
        assert "status" in data


class TestVehicleCategories:
    """Vehicle categories from C# API tests"""
    
    def test_get_vehicle_categories(self, api_client, partner_token):
        """Test GET /vehicle-categories returns normalized array"""
        response = api_client.get(
            f"{BASE_URL}/api/partner/vehicle-categories",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one vehicle category"
        # Check structure of categories - normalized to {id, name}
        for cat in data:
            assert "id" in cat, "Category should have id"
            assert "name" in cat, "Category should have name"
            assert isinstance(cat["id"], str), "Category id should be string"
            assert isinstance(cat["name"], str), "Category name should be string"
    
    def test_vehicle_categories_requires_auth(self, api_client):
        """Test vehicle categories requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/partner/vehicle-categories")
        assert response.status_code == 401, "Should require authentication"


class TestPartnerRides:
    """Partner rides CRUD tests"""
    
    def test_create_ride(self, api_client, partner_token):
        """Test POST /rides creates a ride with status 'pending'"""
        ride_data = {
            "pickup_address": "Aeroport CDG Terminal 2E",
            "dropoff_address": "15 Rue de Rivoli, Paris",
            "vehicle_category_id": "0",
            "vehicle_category_name": "Business",
            "proposed_price": 95.00,
            "currency": "EUR",
            "passenger_name": "TEST_Pytest Passenger",
            "passenger_phone": "+33699999999",
            "pickup_datetime": "2026-04-01T14:00:00",
            "notes": "Pytest API test ride",
            "flight_number": "AF123"
        }
        response = api_client.post(
            f"{BASE_URL}/api/partner/rides",
            headers={"Authorization": f"Bearer {partner_token}"},
            json=ride_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data, "Response should contain ride id"
        assert data["status"] == "pending", "New ride should have 'pending' status"
        assert data["pickup_address"] == ride_data["pickup_address"]
        assert data["dropoff_address"] == ride_data["dropoff_address"]
        assert data["proposed_price"] == ride_data["proposed_price"]
        assert data["passenger_name"] == ride_data["passenger_name"]
    
    def test_list_partner_rides(self, api_client, partner_token):
        """Test GET /rides returns rides for authenticated partner"""
        response = api_client.get(
            f"{BASE_URL}/api/partner/rides",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # Verify ride structure
        if len(data) > 0:
            ride = data[0]
            assert "id" in ride
            assert "pickup_address" in ride
            assert "dropoff_address" in ride
            assert "status" in ride
            assert "proposed_price" in ride
    
    def test_rides_requires_auth(self, api_client):
        """Test rides endpoint requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/partner/rides")
        assert response.status_code == 401


class TestAdminPartners:
    """Admin partner management CRUD tests"""
    
    def test_admin_list_partners(self, api_client, admin_token):
        """Test GET /admin/partners returns all partners"""
        response = api_client.get(
            f"{BASE_URL}/api/partner/admin/partners",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # Verify partner structure
        if len(data) > 0:
            partner = data[0]
            assert "id" in partner
            assert "email" in partner
            assert "name" in partner
            assert "status" in partner
            # password_hash should not be in response
            assert "password_hash" not in partner
    
    def test_admin_create_partner(self, api_client, admin_token):
        """Test POST /admin/partners creates a new partner"""
        unique_email = f"TEST_partner_{uuid.uuid4().hex[:8]}@test.com"
        partner_data = {
            "email": unique_email,
            "password": "testpass123",
            "name": "TEST Pytest Partner",
            "phone": "+33655555555",
            "company": "Pytest Transport",
            "status": "active"
        }
        response = api_client.post(
            f"{BASE_URL}/api/partner/admin/partners",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=partner_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["email"] == unique_email
        assert data["name"] == partner_data["name"]
        assert data["status"] == "active"
        assert "password_hash" not in data
        # Store ID for cleanup
        return data["id"]
    
    def test_admin_create_partner_duplicate_email(self, api_client, admin_token):
        """Test creating partner with existing email returns 400"""
        response = api_client.post(
            f"{BASE_URL}/api/partner/admin/partners",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "email": TEST_PARTNER_EMAIL,  # Existing email
                "password": "testpass123",
                "name": "Duplicate Test"
            }
        )
        assert response.status_code == 400, f"Should return 400 for duplicate email, got {response.status_code}"
    
    def test_admin_update_and_delete_partner(self, api_client, admin_token):
        """Test PUT and DELETE /admin/partners/{id}"""
        # First create a partner to update/delete
        unique_email = f"TEST_todelete_{uuid.uuid4().hex[:8]}@test.com"
        create_response = api_client.post(
            f"{BASE_URL}/api/partner/admin/partners",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "email": unique_email,
                "password": "testpass123",
                "name": "TEST To Delete"
            }
        )
        assert create_response.status_code == 200
        partner_id = create_response.json()["id"]
        
        # Update partner
        update_response = api_client.put(
            f"{BASE_URL}/api/partner/admin/partners/{partner_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"name": "TEST Updated Name", "status": "inactive"}
        )
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}"
        assert update_response.json().get("success") == True
        
        # Verify update by listing
        list_response = api_client.get(
            f"{BASE_URL}/api/partner/admin/partners",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        partners = list_response.json()
        updated_partner = next((p for p in partners if p["id"] == partner_id), None)
        assert updated_partner is not None
        assert updated_partner["name"] == "TEST Updated Name"
        assert updated_partner["status"] == "inactive"
        
        # Delete partner
        delete_response = api_client.delete(
            f"{BASE_URL}/api/partner/admin/partners/{partner_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        assert delete_response.json().get("success") == True
        
        # Verify deletion
        list_response2 = api_client.get(
            f"{BASE_URL}/api/partner/admin/partners",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        partners2 = list_response2.json()
        deleted_partner = next((p for p in partners2 if p["id"] == partner_id), None)
        assert deleted_partner is None, "Partner should be deleted"


class TestAdminRides:
    """Admin rides management tests"""
    
    def test_admin_list_rides(self, api_client, admin_token):
        """Test GET /admin/rides returns all rides"""
        response = api_client.get(
            f"{BASE_URL}/api/partner/admin/rides",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        if len(data) > 0:
            ride = data[0]
            assert "id" in ride
            assert "status" in ride
            assert "partner_id" in ride
            assert "pickup_address" in ride
    
    def test_admin_update_ride_status(self, api_client, admin_token, partner_token):
        """Test PUT /admin/rides/{id} changes ride status"""
        # First create a ride to update
        create_response = api_client.post(
            f"{BASE_URL}/api/partner/rides",
            headers={"Authorization": f"Bearer {partner_token}"},
            json={
                "pickup_address": "TEST Status Update Pickup",
                "dropoff_address": "TEST Status Update Dropoff",
                "vehicle_category_id": "1",
                "vehicle_category_name": "Premium",
                "proposed_price": 50.00,
                "currency": "EUR"
            }
        )
        assert create_response.status_code == 200
        ride_id = create_response.json()["id"]
        
        # Update ride status to accepted
        update_response = api_client.put(
            f"{BASE_URL}/api/partner/admin/rides/{ride_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"status": "accepted", "admin_notes": "Pytest status update test"}
        )
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}"
        assert update_response.json().get("success") == True
        
        # Verify status change
        list_response = api_client.get(
            f"{BASE_URL}/api/partner/admin/rides",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        rides = list_response.json()
        updated_ride = next((r for r in rides if r["id"] == ride_id), None)
        assert updated_ride is not None
        assert updated_ride["status"] == "accepted"
        assert updated_ride["admin_notes"] == "Pytest status update test"
    
    def test_admin_rides_requires_admin_token(self, api_client, partner_token):
        """Test admin rides endpoint rejects partner token"""
        response = api_client.get(
            f"{BASE_URL}/api/partner/admin/rides",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert response.status_code == 403, f"Expected 403 for partner token, got {response.status_code}"


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_rides(self, api_client, admin_token):
        """Cleanup rides created during testing (TEST_ prefix in passenger_name)"""
        response = api_client.get(
            f"{BASE_URL}/api/partner/admin/rides",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        if response.status_code == 200:
            rides = response.json()
            test_rides = [r for r in rides if r.get("passenger_name", "").startswith("TEST_") or r.get("pickup_address", "").startswith("TEST")]
            print(f"Found {len(test_rides)} test rides to review")
            # Note: No delete endpoint for rides, just reporting


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
