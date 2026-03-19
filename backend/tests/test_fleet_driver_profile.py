"""
Test Fleet Driver Profile API - Ride history and forfait management
Tests:
  - GET /api/fleet/drivers/{driver_id}/rides?month=YYYY-MM - returns rides with forfait
  - PUT /api/fleet/drivers/{driver_id}/rides/{ride_id}/forfait - saves forfait amount
  - Rides include both Zont and company (MongoDB) bookings
  - Rides are filtered by month correctly
  - Response includes totalRides, totalPrice, totalForfait summary
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
FLEET_USERNAME = "Nandetiri1@gmail.com"
FLEET_PASSWORD = "12345678"

# Test driver IDs
DRIVER_ID_VOVA = "2055d816-8d81-4152-8dac-272f4e569e39"  # Vova YERITSYAN
DRIVER_ID_MARIAM = "858e3dc3-5bb4-431d-b108-4c620375551c"  # Mariam saroyan

# Test month with existing rides
TEST_MONTH = "2026-03"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for fleet portal"""
    response = requests.post(
        f"{BASE_URL}/api/fleet/auth/login",
        json={"username": FLEET_USERNAME, "password": FLEET_PASSWORD}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    token = data.get("accessToken")
    assert token, "No access token in login response"
    return token


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Authorization headers with bearer token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestDriverRidesEndpoint:
    """Tests for GET /api/fleet/drivers/{driver_id}/rides"""
    
    def test_get_rides_requires_auth(self):
        """Endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_get_rides_default_month(self, auth_headers):
        """GET rides without month parameter defaults to current month"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "driverId" in data, "Missing driverId in response"
        assert "month" in data, "Missing month in response"
        assert "rides" in data, "Missing rides array in response"
        assert "totalRides" in data, "Missing totalRides in response"
        assert "totalPrice" in data, "Missing totalPrice in response"
        assert "totalForfait" in data, "Missing totalForfait in response"
        assert "dateStart" in data, "Missing dateStart in response"
        assert "dateEnd" in data, "Missing dateEnd in response"
        
        # Verify types
        assert isinstance(data["rides"], list), "rides should be a list"
        assert isinstance(data["totalRides"], int), "totalRides should be int"
        assert isinstance(data["totalPrice"], (int, float)), "totalPrice should be numeric"
        assert isinstance(data["totalForfait"], (int, float)), "totalForfait should be numeric"
    
    def test_get_rides_with_month_filter(self, auth_headers):
        """GET rides with month parameter filters correctly"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides?month={TEST_MONTH}",
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify month filter applied
        assert data["month"] == TEST_MONTH, f"Expected month {TEST_MONTH}, got {data['month']}"
        assert data["dateStart"] == f"{TEST_MONTH}-01", f"Date start should be first of month"
        assert data["dateEnd"].startswith(TEST_MONTH), "Date end should be in same month"
        
        # Verify rides are within date range
        for ride in data["rides"]:
            assert ride["date"].startswith(TEST_MONTH), f"Ride date {ride['date']} outside month {TEST_MONTH}"
    
    def test_get_rides_structure(self, auth_headers):
        """Verify ride object structure"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides?month={TEST_MONTH}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        if data["rides"]:
            ride = data["rides"][0]
            # Required fields per requirement
            expected_fields = ["id", "source", "type", "status", "date", "time", 
                              "pickupAddress", "dropoffAddress", "clientName", 
                              "passengers", "price", "forfait"]
            for field in expected_fields:
                assert field in ride, f"Missing field '{field}' in ride object"
            
            # Source should be 'zont' or 'company'
            assert ride["source"] in ["zont", "company"], f"Invalid source: {ride['source']}"
            
            # Forfait should be numeric
            assert isinstance(ride["forfait"], (int, float)), "forfait should be numeric"
    
    def test_get_rides_empty_month(self, auth_headers):
        """GET rides for month with no bookings returns empty list"""
        # Use a past month with no data
        response = requests.get(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides?month=2020-01",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["rides"] == [], "Should return empty rides array"
        assert data["totalRides"] == 0
        assert data["totalPrice"] == 0
        assert data["totalForfait"] == 0
    
    def test_get_rides_totals_calculation(self, auth_headers):
        """Verify totalRides, totalPrice, totalForfait calculations"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides?month={TEST_MONTH}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify totalRides matches actual rides count
        assert data["totalRides"] == len(data["rides"]), "totalRides should match rides count"
        
        # Verify totalPrice calculation
        calculated_price = sum(r["price"] for r in data["rides"])
        assert abs(data["totalPrice"] - calculated_price) < 0.01, "totalPrice calculation mismatch"
        
        # Verify totalForfait calculation
        calculated_forfait = sum(r["forfait"] for r in data["rides"])
        assert abs(data["totalForfait"] - calculated_forfait) < 0.01, "totalForfait calculation mismatch"


class TestForfaitEndpoint:
    """Tests for PUT /api/fleet/drivers/{driver_id}/rides/{ride_id}/forfait"""
    
    def test_set_forfait_requires_auth(self):
        """Endpoint requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides/test-ride-id/forfait",
            json={"amount": 50.0}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_set_forfait_success(self, auth_headers):
        """PUT forfait saves amount correctly"""
        # First get rides to find a valid ride ID
        response = requests.get(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides?month={TEST_MONTH}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        if not data["rides"]:
            pytest.skip("No rides available to test forfait")
        
        ride = data["rides"][0]
        ride_id = ride["id"]
        test_amount = 42.75
        
        # Set forfait
        response = requests.put(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides/{ride_id}/forfait?month={TEST_MONTH}",
            headers=auth_headers,
            json={"amount": test_amount}
        )
        assert response.status_code == 200, f"Failed to set forfait: {response.text}"
        result = response.json()
        
        assert result.get("success") == True, "Response should indicate success"
        assert result.get("rideId") == ride_id, "Response should include rideId"
        assert result.get("amount") == test_amount, "Response should include amount"
        
        # Verify forfait was saved by fetching rides again
        response = requests.get(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides?month={TEST_MONTH}",
            headers=auth_headers
        )
        data = response.json()
        
        # Find the ride we updated
        updated_ride = next((r for r in data["rides"] if r["id"] == ride_id), None)
        assert updated_ride is not None, "Ride should still exist"
        assert updated_ride["forfait"] == test_amount, f"Forfait not saved: expected {test_amount}, got {updated_ride['forfait']}"
    
    def test_set_forfait_zero(self, auth_headers):
        """Can set forfait to zero"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides?month={TEST_MONTH}",
            headers=auth_headers
        )
        data = response.json()
        
        if not data["rides"]:
            pytest.skip("No rides available")
        
        ride_id = data["rides"][0]["id"]
        
        response = requests.put(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides/{ride_id}/forfait?month={TEST_MONTH}",
            headers=auth_headers,
            json={"amount": 0}
        )
        assert response.status_code == 200
    
    def test_set_forfait_updates_total(self, auth_headers):
        """Setting forfait updates totalForfait in rides response"""
        # Get current rides
        response = requests.get(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides?month={TEST_MONTH}",
            headers=auth_headers
        )
        data = response.json()
        
        if len(data["rides"]) < 2:
            pytest.skip("Need at least 2 rides to test total calculation")
        
        # Set specific forfaits
        for i, ride in enumerate(data["rides"][:2]):
            amount = 10.0 * (i + 1)  # 10.0, 20.0
            requests.put(
                f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides/{ride['id']}/forfait?month={TEST_MONTH}",
                headers=auth_headers,
                json={"amount": amount}
            )
        
        # Verify total
        response = requests.get(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides?month={TEST_MONTH}",
            headers=auth_headers
        )
        data = response.json()
        
        expected_total = sum(r["forfait"] for r in data["rides"])
        assert abs(data["totalForfait"] - expected_total) < 0.01, "totalForfait should match sum of forfaits"


class TestMonthNavigation:
    """Tests for month navigation (different months filter correctly)"""
    
    def test_february_vs_march(self, auth_headers):
        """February and March return different results"""
        # Get February
        feb_response = requests.get(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides?month=2026-02",
            headers=auth_headers
        )
        assert feb_response.status_code == 200
        feb_data = feb_response.json()
        
        # Get March
        mar_response = requests.get(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides?month=2026-03",
            headers=auth_headers
        )
        assert mar_response.status_code == 200
        mar_data = mar_response.json()
        
        # Verify different months
        assert feb_data["month"] == "2026-02"
        assert mar_data["month"] == "2026-03"
        
        # Verify date ranges are different
        assert feb_data["dateStart"] == "2026-02-01"
        assert feb_data["dateEnd"] == "2026-02-28"  # February 2026 has 28 days
        assert mar_data["dateStart"] == "2026-03-01"
        assert mar_data["dateEnd"] == "2026-03-31"
    
    def test_invalid_month_format(self, auth_headers):
        """Invalid month format falls back to current month"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/drivers/{DRIVER_ID_VOVA}/rides?month=invalid",
            headers=auth_headers
        )
        assert response.status_code == 200, "Should not error on invalid month"
        data = response.json()
        # Should use current month as fallback
        assert "month" in data


class TestDriverList:
    """Tests for driver list to get driver info"""
    
    def test_drivers_list_includes_vova(self, auth_headers):
        """Driver list includes Vova YERITSYAN"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/drivers",
            headers=auth_headers
        )
        assert response.status_code == 200
        drivers = response.json()
        
        vova = next((d for d in drivers if d["id"] == DRIVER_ID_VOVA), None)
        assert vova is not None, "Vova YERITSYAN should be in driver list"
        assert "firstName" in vova
        assert "lastName" in vova
        assert "phone" in vova
        assert "email" in vova
        assert "isActivated" in vova


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
