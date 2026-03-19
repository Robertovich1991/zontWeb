"""
Fleet Planning - Unassigned Bookings & Driver Assignment Tests
Tests for:
- GET /api/fleet/planning returns 'unassigned' array with bookings without drivers
- PUT /api/fleet/my-bookings/{booking_id}/assign - Assign driver to booking
- POST /api/fleet/planning/check-conflict - Conflict detection before assignment
- Assigned booking moves from unassigned panel to driver timeline
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Fleet company credentials
FLEET_EMAIL = "Nandetiri1@gmail.com"
FLEET_PASSWORD = "12345678"

# Test date
TEST_DATE = "2026-03-19"


class TestUnassignedBookingsAPI:
    """Test unassigned bookings in planning endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for fleet company"""
        login_resp = requests.post(
            f"{BASE_URL}/api/fleet/auth/login",
            json={"username": FLEET_EMAIL, "password": FLEET_PASSWORD}
        )
        assert login_resp.status_code == 200, f"Failed to login: {login_resp.text}"
        login_data = login_resp.json()
        self.token = login_data.get("accessToken") or login_data.get("token")
        assert self.token, f"No token in login response: {login_data}"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        print(f"Setup complete: Got auth token")
    
    # =========== Unassigned Bookings Structure ===========
    
    def test_planning_returns_unassigned_array(self):
        """GET /api/fleet/planning should return 'unassigned' array"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "unassigned" in data, "Planning response missing 'unassigned' field"
        assert isinstance(data["unassigned"], list), "'unassigned' should be an array"
        
        print(f"PASS: Planning returns unassigned array with {len(data['unassigned'])} bookings")
    
    def test_unassigned_booking_structure(self):
        """Unassigned bookings should have required fields"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        unassigned = data.get("unassigned", [])
        
        if len(unassigned) > 0:
            booking = unassigned[0]
            
            # Required fields
            assert "id" in booking, "Missing 'id'"
            assert "type" in booking, "Missing 'type'"
            assert "date" in booking, "Missing 'date'"
            assert "time" in booking, "Missing 'time'"
            assert "price" in booking, "Missing 'price'"
            assert "pickupAddress" in booking, "Missing 'pickupAddress'"
            assert "passengers" in booking, "Missing 'passengers'"
            
            # Type should be valid
            assert booking["type"] in ["transfer", "dispo", "excursion"]
            
            print(f"PASS: Unassigned booking structure verified")
            print(f"  Type: {booking['type']}, Date: {booking['date']} {booking['time']}")
            print(f"  Price: {booking['price']} EUR, Passengers: {booking['passengers']}")
        else:
            pytest.skip("No unassigned bookings to verify structure")
    
    def test_unassigned_has_start_end_time(self):
        """Unassigned bookings should have startTime and endTime for conflict checks"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        unassigned = data.get("unassigned", [])
        
        if len(unassigned) > 0:
            booking = unassigned[0]
            assert "startTime" in booking, "Missing 'startTime'"
            assert "endTime" in booking, "Missing 'endTime'"
            
            # Format should be ISO datetime
            assert "T" in booking["startTime"], "startTime should be ISO format"
            print(f"PASS: Booking has startTime={booking['startTime']}, endTime={booking['endTime']}")
        else:
            pytest.skip("No unassigned bookings to verify times")


class TestDriverAssignment:
    """Test driver assignment to bookings"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token and fetch planning data"""
        login_resp = requests.post(
            f"{BASE_URL}/api/fleet/auth/login",
            json={"username": FLEET_EMAIL, "password": FLEET_PASSWORD}
        )
        assert login_resp.status_code == 200
        login_data = login_resp.json()
        self.token = login_data.get("accessToken") or login_data.get("token")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        # Fetch planning to get driver IDs and booking IDs
        planning_resp = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE}",
            headers=self.headers
        )
        planning = planning_resp.json()
        self.drivers = planning.get("drivers", [])
        self.unassigned = planning.get("unassigned", [])
        self.active_drivers = [d for d in self.drivers if d.get("isActivated")]
        
        print(f"Setup: {len(self.unassigned)} unassigned, {len(self.active_drivers)} active drivers")
    
    def test_assign_driver_requires_auth(self):
        """PUT /api/fleet/my-bookings/{id}/assign returns 401 without token"""
        response = requests.put(
            f"{BASE_URL}/api/fleet/my-bookings/test-booking-id/assign",
            json={"driverId": "test-driver", "driverName": "Test Driver"}
        )
        assert response.status_code == 401
        print("PASS: Assign endpoint requires authentication")
    
    def test_assign_driver_invalid_booking(self):
        """PUT /api/fleet/my-bookings/{invalid_id}/assign returns 404"""
        response = requests.put(
            f"{BASE_URL}/api/fleet/my-bookings/invalid-booking-id-12345/assign",
            headers=self.headers,
            json={"driverId": "test-driver", "driverName": "Test Driver"}
        )
        assert response.status_code == 404
        print("PASS: Assign with invalid booking ID returns 404")
    
    def test_assign_driver_to_booking(self):
        """PUT /api/fleet/my-bookings/{id}/assign successfully assigns driver"""
        if not self.unassigned or not self.active_drivers:
            pytest.skip("No unassigned bookings or active drivers")
        
        booking = self.unassigned[0]
        driver = self.active_drivers[0]
        booking_id = booking["id"]
        driver_id = driver["id"]
        driver_name = f"{driver['firstName']} {driver['lastName']}"
        
        # Assign
        response = requests.put(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}/assign",
            headers=self.headers,
            json={"driverId": driver_id, "driverName": driver_name}
        )
        
        assert response.status_code == 200, f"Failed to assign: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "message" in data
        
        print(f"PASS: Assigned {driver_name} to booking {booking_id[:15]}...")
        print(f"  Response: {data['message']}")
        
        # Cleanup: unassign
        requests.put(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}/unassign",
            headers=self.headers
        )
    
    def test_assigned_booking_moves_from_unassigned_to_driver_events(self):
        """After assignment, booking should not be in unassigned and should be in driver events"""
        if not self.unassigned or not self.active_drivers:
            pytest.skip("No unassigned bookings or active drivers")
        
        booking = self.unassigned[0]
        driver = self.active_drivers[0]
        booking_id = booking["id"]
        driver_id = driver["id"]
        driver_name = f"{driver['firstName']} {driver['lastName']}"
        
        # Assign
        requests.put(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}/assign",
            headers=self.headers,
            json={"driverId": driver_id, "driverName": driver_name}
        )
        
        # Verify
        verify_resp = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE}",
            headers=self.headers
        )
        verify = verify_resp.json()
        
        # Booking should NOT be in unassigned
        unassigned_ids = [b["id"] for b in verify.get("unassigned", [])]
        assert booking_id not in unassigned_ids, "Booking still in unassigned after assignment"
        print("PASS: Booking removed from unassigned list")
        
        # Booking should be in driver's events
        target_driver = [d for d in verify.get("drivers", []) if d["id"] == driver_id][0]
        event_ids = [e.get("id", "") for e in target_driver.get("events", [])]
        found_in_events = any(booking_id in eid for eid in event_ids)
        assert found_in_events, f"Booking not found in driver events: {event_ids}"
        print(f"PASS: Booking found in {driver_name}'s events")
        
        # Cleanup: unassign
        requests.put(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}/unassign",
            headers=self.headers
        )


class TestConflictDetectionForAssignment:
    """Test conflict detection during assignment"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token and fetch planning data"""
        login_resp = requests.post(
            f"{BASE_URL}/api/fleet/auth/login",
            json={"username": FLEET_EMAIL, "password": FLEET_PASSWORD}
        )
        assert login_resp.status_code == 200
        login_data = login_resp.json()
        self.token = login_data.get("accessToken") or login_data.get("token")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        # Fetch planning
        planning_resp = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE}",
            headers=self.headers
        )
        planning = planning_resp.json()
        self.drivers = planning.get("drivers", [])
        self.unassigned = planning.get("unassigned", [])
    
    def test_conflict_check_for_unassigned_booking(self):
        """POST /api/fleet/planning/check-conflict validates driver availability"""
        if not self.unassigned or not self.drivers:
            pytest.skip("No unassigned bookings or drivers")
        
        booking = self.unassigned[0]
        driver = self.drivers[0]
        
        if not booking.get("startTime") or not booking.get("endTime"):
            pytest.skip("Booking missing startTime/endTime")
        
        response = requests.post(
            f"{BASE_URL}/api/fleet/planning/check-conflict",
            headers=self.headers,
            json={
                "driverId": driver["id"],
                "startTime": booking["startTime"],
                "endTime": booking["endTime"]
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "conflict" in data
        assert "message" in data
        assert isinstance(data["conflict"], bool)
        
        print(f"PASS: Conflict check returned conflict={data['conflict']}")
        print(f"  Message: {data['message']}")


class TestUnassignDriver:
    """Test unassign driver from booking"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token"""
        login_resp = requests.post(
            f"{BASE_URL}/api/fleet/auth/login",
            json={"username": FLEET_EMAIL, "password": FLEET_PASSWORD}
        )
        assert login_resp.status_code == 200
        login_data = login_resp.json()
        self.token = login_data.get("accessToken") or login_data.get("token")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_unassign_driver_requires_auth(self):
        """PUT /api/fleet/my-bookings/{id}/unassign returns 401 without token"""
        response = requests.put(
            f"{BASE_URL}/api/fleet/my-bookings/test-booking-id/unassign"
        )
        assert response.status_code == 401
        print("PASS: Unassign endpoint requires authentication")
    
    def test_unassign_driver_invalid_booking(self):
        """PUT /api/fleet/my-bookings/{invalid_id}/unassign returns 404"""
        response = requests.put(
            f"{BASE_URL}/api/fleet/my-bookings/invalid-booking-id-12345/unassign",
            headers=self.headers
        )
        assert response.status_code == 404
        print("PASS: Unassign with invalid booking ID returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
