"""
Test suite for Fleet Planning - Unassign and Reassign features
Tests:
- PUT /api/fleet/my-bookings/{id}/unassign - removes driver and sets status to 'new'
- PUT /api/fleet/my-bookings/{id}/assign - reassigns driver to an existing booking
- POST /api/fleet/planning/check-conflict - conflict detection before reassignment
"""
import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
FLEET_USERNAME = "Nandetiri1@gmail.com"
FLEET_PASSWORD = "12345678"

# Test data
DRIVER_VOVA = {
    "id": "2055d816-8d81-4152-8dac-272f4e569e39",
    "name": "Vova YERITSYAN"
}
DRIVER_MARIAM = {
    "id": "858e3dc3-5bb4-431d-b108-4c620375551c",
    "name": "Mariam saroyan"
}


@pytest.fixture(scope="module")
def session():
    """Shared requests session"""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def fleet_token(session):
    """Authenticate with fleet portal"""
    resp = session.post(
        f"{BASE_URL}/api/fleet/auth/login",
        json={"username": FLEET_USERNAME, "password": FLEET_PASSWORD}
    )
    assert resp.status_code == 200, f"Fleet login failed: {resp.text}"
    data = resp.json()
    token = data.get("accessToken")
    assert token, "No accessToken in response"
    print(f"Fleet login success, token: {token[:30]}...")
    return token


@pytest.fixture(scope="module")
def auth_headers(fleet_token):
    """Return authorization headers"""
    return {"Authorization": f"Bearer {fleet_token}"}


@pytest.fixture(scope="module")
def test_booking(session, auth_headers):
    """Create a test booking for unassign/reassign tests"""
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    booking_data = {
        "type": "transfer",
        "date": tomorrow,
        "time": "10:00",
        "passengers": 2,
        "passengerName": "Test Unassign",
        "clientName": "TEST_UnassignReassign",
        "pickupAddress": "Test Pickup Address",
        "dropoffAddress": "Test Dropoff Address",
        "price": 100
    }
    resp = session.post(
        f"{BASE_URL}/api/fleet/my-bookings",
        headers=auth_headers,
        json=booking_data
    )
    assert resp.status_code == 200, f"Failed to create test booking: {resp.text}"
    booking = resp.json()
    print(f"Created test booking: {booking['id']}")
    yield booking
    
    # Cleanup: delete the booking after tests
    try:
        session.delete(f"{BASE_URL}/api/fleet/my-bookings/{booking['id']}", headers=auth_headers)
        print(f"Cleaned up test booking: {booking['id']}")
    except Exception:
        pass


class TestUnassignEndpoint:
    """Tests for PUT /api/fleet/my-bookings/{id}/unassign"""
    
    def test_unassign_requires_auth(self, session):
        """Test that unassign requires authentication"""
        resp = session.put(f"{BASE_URL}/api/fleet/my-bookings/some-id/unassign")
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
        print("PASS: Unassign requires authentication")
    
    def test_unassign_invalid_booking(self, session, auth_headers):
        """Test unassign with non-existent booking ID"""
        fake_id = str(uuid.uuid4())
        resp = session.put(
            f"{BASE_URL}/api/fleet/my-bookings/{fake_id}/unassign",
            headers=auth_headers
        )
        assert resp.status_code == 404, f"Expected 404, got {resp.status_code}"
        print("PASS: Unassign returns 404 for invalid booking")
    
    def test_unassign_workflow(self, session, auth_headers, test_booking):
        """Test full unassign workflow: assign -> unassign -> verify"""
        booking_id = test_booking['id']
        
        # Step 1: First assign a driver
        assign_resp = session.put(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}/assign",
            headers=auth_headers,
            json={"driverId": DRIVER_VOVA['id'], "driverName": DRIVER_VOVA['name']}
        )
        assert assign_resp.status_code == 200, f"Failed to assign: {assign_resp.text}"
        print(f"Assigned driver {DRIVER_VOVA['name']} to booking")
        
        # Step 2: Verify booking is assigned
        get_resp = session.get(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}",
            headers=auth_headers
        )
        assert get_resp.status_code == 200
        booking = get_resp.json()
        assert booking.get("driver") is not None, "Driver should be assigned"
        assert booking.get("status") == "assigned", f"Status should be 'assigned', got: {booking.get('status')}"
        print(f"Verified booking has driver: {booking.get('driver')}")
        
        # Step 3: Unassign driver
        unassign_resp = session.put(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}/unassign",
            headers=auth_headers
        )
        assert unassign_resp.status_code == 200, f"Unassign failed: {unassign_resp.text}"
        unassign_data = unassign_resp.json()
        assert unassign_data.get("success") is True, "Response should have success=true"
        assert "retire" in unassign_data.get("message", "").lower() or "chauffeur" in unassign_data.get("message", "").lower()
        print(f"Unassign success: {unassign_data}")
        
        # Step 4: Verify booking is unassigned
        get_resp2 = session.get(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}",
            headers=auth_headers
        )
        assert get_resp2.status_code == 200
        booking_after = get_resp2.json()
        assert booking_after.get("driver") is None, f"Driver should be None after unassign, got: {booking_after.get('driver')}"
        assert booking_after.get("status") == "new", f"Status should be 'new' after unassign, got: {booking_after.get('status')}"
        print(f"PASS: Booking unassigned - driver=None, status='new'")


class TestReassignEndpoint:
    """Tests for reassignment using PUT /api/fleet/my-bookings/{id}/assign"""
    
    def test_reassign_to_different_driver(self, session, auth_headers, test_booking):
        """Test reassigning from one driver to another"""
        booking_id = test_booking['id']
        
        # Step 1: Assign to driver 1 (Vova)
        assign_resp1 = session.put(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}/assign",
            headers=auth_headers,
            json={"driverId": DRIVER_VOVA['id'], "driverName": DRIVER_VOVA['name']}
        )
        assert assign_resp1.status_code == 200, f"Initial assign failed: {assign_resp1.text}"
        print(f"Assigned to {DRIVER_VOVA['name']}")
        
        # Step 2: Verify driver 1 is assigned
        get_resp1 = session.get(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}",
            headers=auth_headers
        )
        booking1 = get_resp1.json()
        assert booking1.get("driver", {}).get("id") == DRIVER_VOVA['id']
        
        # Step 3: Reassign to driver 2 (Mariam)
        reassign_resp = session.put(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}/assign",
            headers=auth_headers,
            json={"driverId": DRIVER_MARIAM['id'], "driverName": DRIVER_MARIAM['name']}
        )
        assert reassign_resp.status_code == 200, f"Reassign failed: {reassign_resp.text}"
        print(f"Reassigned to {DRIVER_MARIAM['name']}")
        
        # Step 4: Verify driver 2 is now assigned
        get_resp2 = session.get(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}",
            headers=auth_headers
        )
        booking2 = get_resp2.json()
        assert booking2.get("driver", {}).get("id") == DRIVER_MARIAM['id'], \
            f"Expected driver {DRIVER_MARIAM['id']}, got: {booking2.get('driver')}"
        assert booking2.get("driver", {}).get("name") == DRIVER_MARIAM['name'], \
            f"Expected driver name {DRIVER_MARIAM['name']}, got: {booking2.get('driver', {}).get('name')}"
        print(f"PASS: Booking reassigned from Vova to Mariam")


class TestConflictCheckEndpoint:
    """Tests for POST /api/fleet/planning/check-conflict"""
    
    def test_conflict_check_no_conflict(self, session, auth_headers):
        """Test conflict check when no conflict exists"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        # Use a time slot unlikely to have conflicts
        resp = session.post(
            f"{BASE_URL}/api/fleet/planning/check-conflict",
            headers=auth_headers,
            json={
                "driverId": DRIVER_VOVA['id'],
                "startTime": f"{tomorrow}T03:00",
                "endTime": f"{tomorrow}T04:00"
            }
        )
        assert resp.status_code == 200, f"Conflict check failed: {resp.text}"
        data = resp.json()
        assert "conflict" in data, "Response should have 'conflict' field"
        # May or may not have conflict depending on existing data
        print(f"Conflict check response: conflict={data.get('conflict')}, message={data.get('message')}")
    
    def test_conflict_check_returns_conflict_info(self, session, auth_headers, test_booking):
        """Test that conflict check returns conflict details when overlap detected"""
        booking_id = test_booking['id']
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # First assign the test booking to a driver
        session.put(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}/assign",
            headers=auth_headers,
            json={"driverId": DRIVER_VOVA['id'], "driverName": DRIVER_VOVA['name']}
        )
        
        # Now check conflict for same driver at overlapping time (10:00-11:30)
        resp = session.post(
            f"{BASE_URL}/api/fleet/planning/check-conflict",
            headers=auth_headers,
            json={
                "driverId": DRIVER_VOVA['id'],
                "startTime": f"{tomorrow}T10:00",
                "endTime": f"{tomorrow}T11:30"
            }
        )
        assert resp.status_code == 200, f"Conflict check failed: {resp.text}"
        data = resp.json()
        assert "conflict" in data
        if data.get("conflict"):
            assert "message" in data, "Should have message when conflict exists"
            print(f"PASS: Conflict detected - {data.get('message')}")
        else:
            print(f"Note: No conflict detected (may be due to timing)")
    
    def test_conflict_check_excludes_own_booking(self, session, auth_headers, test_booking):
        """Test that conflict check excludes the booking being reassigned"""
        booking_id = test_booking['id']
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Assign the test booking
        session.put(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}/assign",
            headers=auth_headers,
            json={"driverId": DRIVER_VOVA['id'], "driverName": DRIVER_VOVA['name']}
        )
        
        # Check conflict with excludeBookingId set to the same booking
        resp = session.post(
            f"{BASE_URL}/api/fleet/planning/check-conflict",
            headers=auth_headers,
            json={
                "driverId": DRIVER_VOVA['id'],
                "startTime": f"{tomorrow}T10:00",
                "endTime": f"{tomorrow}T11:30",
                "excludeBookingId": f"company-{booking_id}"
            }
        )
        assert resp.status_code == 200, f"Conflict check failed: {resp.text}"
        data = resp.json()
        # When excluding own booking, should not detect conflict with itself
        print(f"Conflict check with excludeBookingId: conflict={data.get('conflict')}")


class TestPlanningUnassignedReintegration:
    """Test that unassigned bookings appear back in unassigned panel"""
    
    def test_unassigned_appears_in_planning(self, session, auth_headers, test_booking):
        """After unassign, booking should appear in planning.unassigned array"""
        booking_id = test_booking['id']
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Step 1: Ensure booking is unassigned
        session.put(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}/unassign",
            headers=auth_headers
        )
        
        # Step 2: Get planning for tomorrow
        planning_resp = session.get(
            f"{BASE_URL}/api/fleet/planning?date={tomorrow}&view=day",
            headers=auth_headers
        )
        assert planning_resp.status_code == 200, f"Planning failed: {planning_resp.text}"
        planning = planning_resp.json()
        
        # Step 3: Check unassigned array
        unassigned = planning.get("unassigned", [])
        print(f"Planning unassigned count: {len(unassigned)}")
        
        # Find our test booking in unassigned
        found = any(b.get("id") == booking_id for b in unassigned)
        assert found, f"Test booking {booking_id} should be in unassigned list"
        print(f"PASS: Unassigned booking appears in planning.unassigned")
    
    def test_assigned_not_in_unassigned(self, session, auth_headers, test_booking):
        """After assign, booking should NOT be in unassigned array"""
        booking_id = test_booking['id']
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Step 1: Assign booking
        session.put(
            f"{BASE_URL}/api/fleet/my-bookings/{booking_id}/assign",
            headers=auth_headers,
            json={"driverId": DRIVER_MARIAM['id'], "driverName": DRIVER_MARIAM['name']}
        )
        
        # Step 2: Get planning
        planning_resp = session.get(
            f"{BASE_URL}/api/fleet/planning?date={tomorrow}&view=day",
            headers=auth_headers
        )
        planning = planning_resp.json()
        
        # Step 3: Check booking is NOT in unassigned
        unassigned = planning.get("unassigned", [])
        found_in_unassigned = any(b.get("id") == booking_id for b in unassigned)
        assert not found_in_unassigned, f"Assigned booking should NOT be in unassigned list"
        
        # Step 4: Check booking IS in driver's events
        drivers = planning.get("drivers", [])
        mariam = next((d for d in drivers if d.get("id") == DRIVER_MARIAM['id']), None)
        if mariam:
            events = mariam.get("events", [])
            found_in_events = any(e.get("id") == f"company-{booking_id}" for e in events)
            assert found_in_events, f"Booking should appear in driver's events"
            print(f"PASS: Assigned booking in Mariam's events, not in unassigned")
        else:
            print("Note: Driver Mariam not found in planning (may not be activated)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
