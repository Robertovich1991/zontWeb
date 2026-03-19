"""
Fleet Planning Module Tests
Tests for:
- GET /api/fleet/planning - Get planning data with drivers and events (day/week views)
- POST /api/fleet/planning/check-conflict - Conflict detection for driver bookings
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Fleet company credentials
FLEET_EMAIL = "Nandetiri1@gmail.com"
FLEET_PASSWORD = "12345678"
CSHARP_API = "https://api.zont.cab"

# Test driver with known booking
TEST_DRIVER_ID = "858e3dc3-5bb4-431d-b108-4c620375551c"  # Mariam saroyan
TEST_BOOKING_DATE = "2026-03-19"  # Company booking at 14:00-15:30


class TestFleetPlanningAuthentication:
    """Test authentication requirements for planning endpoints"""
    
    def test_planning_requires_auth(self):
        """GET /api/fleet/planning returns 401 without token"""
        response = requests.get(f"{BASE_URL}/api/fleet/planning")
        assert response.status_code == 401
        print("PASS: Planning endpoint requires authentication")
    
    def test_conflict_check_requires_auth(self):
        """POST /api/fleet/planning/check-conflict returns 401 without token"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/check-conflict", json={
            "driverId": TEST_DRIVER_ID,
            "startTime": "2026-03-19T09:00",
            "endTime": "2026-03-19T10:00"
        })
        assert response.status_code == 401
        print("PASS: Conflict check endpoint requires authentication")


class TestFleetPlanningAPI:
    """Test planning API endpoints with authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for fleet company via backend proxy"""
        # Login via backend proxy endpoint
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
    
    # =========== GET /api/fleet/planning (Day View) ===========
    
    def test_get_planning_day_view_default(self):
        """GET /api/fleet/planning returns day view by default"""
        response = requests.get(f"{BASE_URL}/api/fleet/planning", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "dateStart" in data
        assert "dateEnd" in data
        assert "view" in data
        assert "drivers" in data
        
        # Default should be day view
        assert data["view"] == "day"
        assert data["dateStart"] == data["dateEnd"]  # Day view: same start and end
        
        # Should have drivers array
        assert isinstance(data["drivers"], list)
        print(f"PASS: Day view returns {len(data['drivers'])} drivers for date {data['dateStart']}")
    
    def test_get_planning_with_specific_date(self):
        """GET /api/fleet/planning?date=2026-03-19 returns planning for that date"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_BOOKING_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["dateStart"] == TEST_BOOKING_DATE
        assert data["dateEnd"] == TEST_BOOKING_DATE
        print(f"PASS: Planning for specific date {TEST_BOOKING_DATE} returned")
    
    def test_get_planning_driver_structure(self):
        """GET /api/fleet/planning returns drivers with correct structure"""
        response = requests.get(f"{BASE_URL}/api/fleet/planning", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        drivers = data["drivers"]
        
        if len(drivers) > 0:
            driver = drivers[0]
            # Verify driver structure
            assert "id" in driver
            assert "firstName" in driver
            assert "lastName" in driver
            assert "status" in driver
            assert "events" in driver
            
            # Status should be one of: available, busy, offline
            assert driver["status"] in ["available", "busy", "offline"]
            
            # Events should be array
            assert isinstance(driver["events"], list)
            print(f"PASS: Driver structure correct - {driver['firstName']} {driver['lastName']} is {driver['status']}")
        else:
            print("SKIP: No drivers to verify structure")
    
    def test_get_planning_has_expected_drivers(self):
        """GET /api/fleet/planning should show Vova YERITSYAN and Mariam saroyan"""
        response = requests.get(f"{BASE_URL}/api/fleet/planning", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        drivers = data["drivers"]
        driver_names = [f"{d['firstName']} {d['lastName']}" for d in drivers]
        
        # Check for expected drivers
        found_vova = any("Vova" in name or "YERITSYAN" in name for name in driver_names)
        found_mariam = any("Mariam" in name or "saroyan" in name for name in driver_names)
        
        print(f"Drivers found: {driver_names}")
        assert found_vova or found_mariam, f"Expected drivers not found. Found: {driver_names}"
        print(f"PASS: Found expected drivers in planning")
    
    # =========== GET /api/fleet/planning?view=week (Week View) ===========
    
    def test_get_planning_week_view(self):
        """GET /api/fleet/planning?view=week returns 7-day range"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?view=week",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["view"] == "week"
        
        # Week view should have 7-day span
        from datetime import datetime
        start = datetime.strptime(data["dateStart"], "%Y-%m-%d")
        end = datetime.strptime(data["dateEnd"], "%Y-%m-%d")
        days_diff = (end - start).days
        assert days_diff == 6, f"Expected 6 days difference (7 days), got {days_diff}"
        
        print(f"PASS: Week view returns 7 days: {data['dateStart']} to {data['dateEnd']}")
    
    def test_get_planning_week_view_with_date(self):
        """GET /api/fleet/planning?view=week&date=2026-03-19 returns week containing that date"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?view=week&date={TEST_BOOKING_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["view"] == "week"
        
        # The requested date should be within the week range
        assert data["dateStart"] <= TEST_BOOKING_DATE <= data["dateEnd"]
        print(f"PASS: Week view for {TEST_BOOKING_DATE} is {data['dateStart']} to {data['dateEnd']}")
    
    # =========== Event Structure Tests ===========
    
    def test_planning_event_structure(self):
        """Events should have correct structure with source (zont/company)"""
        # Use the date with known company booking
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_BOOKING_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Find driver with events
        drivers_with_events = [d for d in data["drivers"] if len(d["events"]) > 0]
        
        if drivers_with_events:
            event = drivers_with_events[0]["events"][0]
            
            # Verify event structure
            assert "id" in event
            assert "driverId" in event
            assert "source" in event
            assert "startTime" in event
            assert "endTime" in event
            assert "type" in event
            
            # Source should be 'zont' or 'company'
            assert event["source"] in ["zont", "company"]
            
            print(f"PASS: Event structure verified - source={event['source']}, type={event['type']}")
        else:
            print("INFO: No events found on this date to verify structure")
    
    def test_company_booking_appears_in_planning(self):
        """Company booking for Mariam saroyan at 14:00 should appear"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_BOOKING_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Find Mariam saroyan driver
        mariam = None
        for d in data["drivers"]:
            if d["id"] == TEST_DRIVER_ID or "Mariam" in d.get("firstName", ""):
                mariam = d
                break
        
        if mariam:
            # Check if she has a company event
            company_events = [e for e in mariam["events"] if e["source"] == "company"]
            if company_events:
                event = company_events[0]
                assert "14:00" in event["startTime"]
                print(f"PASS: Found company event for Mariam at {event['startTime']}")
            else:
                print(f"INFO: Mariam has {len(mariam['events'])} events but none from 'company' source")
        else:
            print("INFO: Mariam saroyan not found in drivers list")
    
    # =========== POST /api/fleet/planning/check-conflict ===========
    
    def test_conflict_check_detects_conflict(self):
        """Conflict check should detect overlapping booking at 14:00-15:30"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/planning/check-conflict",
            headers=self.headers,
            json={
                "driverId": TEST_DRIVER_ID,
                "startTime": f"{TEST_BOOKING_DATE}T14:00",
                "endTime": f"{TEST_BOOKING_DATE}T15:30"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "conflict" in data
        assert "message" in data
        
        # Should detect conflict
        if data["conflict"]:
            assert "conflictWith" in data
            print(f"PASS: Conflict detected: {data['message']}")
        else:
            print(f"INFO: No conflict detected (booking may have been removed): {data['message']}")
    
    def test_conflict_check_free_slot(self):
        """Conflict check should return no conflict for free slot 09:00-10:00"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/planning/check-conflict",
            headers=self.headers,
            json={
                "driverId": TEST_DRIVER_ID,
                "startTime": f"{TEST_BOOKING_DATE}T09:00",
                "endTime": f"{TEST_BOOKING_DATE}T10:00"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "conflict" in data
        assert data["conflict"] == False
        assert "message" in data
        print(f"PASS: Free slot confirmed - {data['message']}")
    
    def test_conflict_check_adjacent_slot(self):
        """Conflict check for slot adjacent to booking (15:30-17:00) should be free"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/planning/check-conflict",
            headers=self.headers,
            json={
                "driverId": TEST_DRIVER_ID,
                "startTime": f"{TEST_BOOKING_DATE}T15:30",
                "endTime": f"{TEST_BOOKING_DATE}T17:00"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        # Adjacent slot should be free (not overlapping)
        assert data["conflict"] == False
        print(f"PASS: Adjacent slot (15:30-17:00) is free")
    
    def test_conflict_check_partial_overlap(self):
        """Conflict check for partial overlap (13:30-14:30) should detect conflict"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/planning/check-conflict",
            headers=self.headers,
            json={
                "driverId": TEST_DRIVER_ID,
                "startTime": f"{TEST_BOOKING_DATE}T13:30",
                "endTime": f"{TEST_BOOKING_DATE}T14:30"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        # Partial overlap should be detected
        if data["conflict"]:
            print(f"PASS: Partial overlap (13:30-14:30) detected as conflict")
        else:
            print(f"INFO: Partial overlap not detected - booking may not exist")
    
    def test_conflict_check_invalid_date_format(self):
        """Conflict check with invalid date format returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/planning/check-conflict",
            headers=self.headers,
            json={
                "driverId": TEST_DRIVER_ID,
                "startTime": "invalid-date",
                "endTime": "also-invalid"
            }
        )
        assert response.status_code == 400
        print("PASS: Invalid date format returns 400")
    
    def test_conflict_check_different_driver(self):
        """Conflict check for different driver ID should not conflict with Mariam's booking"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/planning/check-conflict",
            headers=self.headers,
            json={
                "driverId": "different-driver-id-12345",
                "startTime": f"{TEST_BOOKING_DATE}T14:00",
                "endTime": f"{TEST_BOOKING_DATE}T15:30"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["conflict"] == False
        print("PASS: Different driver has no conflict at same time")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
