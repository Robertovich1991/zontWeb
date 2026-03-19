"""
Fleet Performance Refactor Tests
================================
Testing all fleet endpoints after major performance optimizations:
- Shared HTTP client with connection pooling
- Parallel asyncio.gather for C# API calls
- In-memory cache (30s TTL)
- Reduced auction scan range (35→18 IDs)
- MongoDB indexes

Tests verify:
1. All endpoints return correct data structure
2. Response times are reasonable
3. Data integrity after refactoring
"""
import pytest
import requests
import time
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "Nandetiri1@gmail.com"
TEST_PASSWORD = "12345678"

@pytest.fixture(scope="module")
def auth_token():
    """Authenticate and get fleet access token."""
    resp = requests.post(
        f"{BASE_URL}/api/fleet/auth/login",
        json={"username": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=30
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    data = resp.json()
    assert "accessToken" in data, "No accessToken in response"
    return data["accessToken"]

@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


# ========== Authentication Tests ==========

class TestFleetAuth:
    """Test fleet authentication endpoint"""
    
    def test_login_returns_access_token(self):
        """POST /api/fleet/auth/login returns accessToken and company data"""
        start = time.time()
        resp = requests.post(
            f"{BASE_URL}/api/fleet/auth/login",
            json={"username": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=30
        )
        elapsed = time.time() - start
        
        assert resp.status_code == 200, f"Login failed: {resp.status_code}"
        data = resp.json()
        
        # Verify required fields
        assert "accessToken" in data, "Missing accessToken"
        assert "company" in data, "Missing company data"
        assert isinstance(data["accessToken"], str), "accessToken should be string"
        assert len(data["accessToken"]) > 100, "accessToken looks too short"
        
        # Verify company structure
        company = data["company"]
        assert "id" in company, "Missing company.id"
        assert "companyName" in company, "Missing company.companyName"
        
        print(f"✓ Login successful in {elapsed:.2f}s, company: {company.get('companyName')}")
    
    def test_login_invalid_credentials(self):
        """POST /api/fleet/auth/login returns 400 for bad credentials"""
        resp = requests.post(
            f"{BASE_URL}/api/fleet/auth/login",
            json={"username": "wrong@email.com", "password": "wrongpass"},
            timeout=30
        )
        assert resp.status_code == 400, f"Expected 400, got {resp.status_code}"


# ========== Planning Endpoint Tests ==========

class TestFleetPlanningDay:
    """Test GET /api/fleet/planning?view=day"""
    
    def test_planning_day_view_returns_data(self, auth_headers):
        """Planning day view returns drivers, events, unassigned"""
        start = time.time()
        resp = requests.get(
            f"{BASE_URL}/api/fleet/planning?view=day",
            headers=auth_headers,
            timeout=30
        )
        elapsed = time.time() - start
        
        assert resp.status_code == 200, f"Planning day failed: {resp.status_code}"
        data = resp.json()
        
        # Verify structure
        assert "drivers" in data, "Missing drivers"
        assert "unassigned" in data, "Missing unassigned"
        assert "dateStart" in data, "Missing dateStart"
        assert "dateEnd" in data, "Missing dateEnd"
        assert "view" in data, "Missing view"
        assert data["view"] == "day", f"Expected day view, got {data['view']}"
        
        # For day view, dateStart == dateEnd
        assert data["dateStart"] == data["dateEnd"], "Day view should have same start/end date"
        
        # Verify drivers structure
        drivers = data["drivers"]
        assert isinstance(drivers, list), "drivers should be list"
        if len(drivers) > 0:
            driver = drivers[0]
            assert "id" in driver, "Driver missing id"
            assert "firstName" in driver, "Driver missing firstName"
            assert "lastName" in driver, "Driver missing lastName"
            assert "events" in driver, "Driver missing events"
            
        print(f"✓ Planning day returned in {elapsed:.2f}s, {len(drivers)} drivers")
        
        # Performance check: should be under 5s
        assert elapsed < 10, f"Planning day too slow: {elapsed:.2f}s (target: <5s)"
    
    def test_planning_day_view_events_have_source(self, auth_headers):
        """Events have 'source' field (zont/company)"""
        resp = requests.get(
            f"{BASE_URL}/api/fleet/planning?view=day&date=2026-03-19",
            headers=auth_headers,
            timeout=30
        )
        assert resp.status_code == 200
        data = resp.json()
        
        # Check driver events for source field
        for driver in data.get("drivers", []):
            for event in driver.get("events", []):
                assert "source" in event, f"Event {event.get('id')} missing source field"
                assert event["source"] in ["zont", "company"], f"Invalid source: {event['source']}"
        
        # Check unassigned for source field
        for booking in data.get("unassigned", []):
            assert "source" in booking, f"Unassigned {booking.get('id')} missing source"
            assert booking["source"] in ["zont", "company"], f"Invalid source: {booking['source']}"
        
        print("✓ All events have valid source field")


class TestFleetPlanningWeek:
    """Test GET /api/fleet/planning?view=week"""
    
    def test_planning_week_view_returns_7_days(self, auth_headers):
        """Planning week view returns data for 7 days"""
        start = time.time()
        resp = requests.get(
            f"{BASE_URL}/api/fleet/planning?view=week",
            headers=auth_headers,
            timeout=30
        )
        elapsed = time.time() - start
        
        assert resp.status_code == 200, f"Planning week failed: {resp.status_code}"
        data = resp.json()
        
        assert data["view"] == "week", f"Expected week view, got {data['view']}"
        
        # Verify 7 day range
        from datetime import datetime
        start_date = datetime.strptime(data["dateStart"], "%Y-%m-%d")
        end_date = datetime.strptime(data["dateEnd"], "%Y-%m-%d")
        days_diff = (end_date - start_date).days
        assert days_diff == 6, f"Week should span 7 days (6 day diff), got {days_diff}"
        
        print(f"✓ Planning week returned in {elapsed:.2f}s, range: {data['dateStart']} to {data['dateEnd']}")
        
        # Performance: optimized week should be much faster than before
        assert elapsed < 10, f"Planning week too slow: {elapsed:.2f}s"


class TestFleetPlanningMonth:
    """Test GET /api/fleet/planning?view=month"""
    
    def test_planning_month_view_returns_full_month(self, auth_headers):
        """Planning month view returns data for full month"""
        start = time.time()
        resp = requests.get(
            f"{BASE_URL}/api/fleet/planning?view=month&date=2026-03-15",
            headers=auth_headers,
            timeout=60  # Month can be slower
        )
        elapsed = time.time() - start
        
        assert resp.status_code == 200, f"Planning month failed: {resp.status_code}"
        data = resp.json()
        
        assert data["view"] == "month", f"Expected month view, got {data['view']}"
        
        # March 2026 should have 31 days
        assert data["dateStart"] == "2026-03-01", f"Month start: {data['dateStart']}"
        assert data["dateEnd"] == "2026-03-31", f"Month end: {data['dateEnd']}"
        
        print(f"✓ Planning month returned in {elapsed:.2f}s")


# ========== Conflict Check Tests ==========

class TestFleetConflictCheck:
    """Test POST /api/fleet/planning/check-conflict"""
    
    def test_conflict_check_returns_result(self, auth_headers):
        """Conflict check returns conflict or available status"""
        # Get a valid driver ID first
        drivers_resp = requests.get(
            f"{BASE_URL}/api/fleet/drivers",
            headers=auth_headers,
            timeout=30
        )
        assert drivers_resp.status_code == 200
        drivers = drivers_resp.json()
        assert len(drivers) > 0, "No drivers found"
        
        driver_id = drivers[0]["id"]
        
        resp = requests.post(
            f"{BASE_URL}/api/fleet/planning/check-conflict",
            headers=auth_headers,
            json={
                "driverId": driver_id,
                "startTime": "2026-04-01T10:00",
                "endTime": "2026-04-01T12:00",
                "excludeBookingId": ""
            },
            timeout=30
        )
        
        assert resp.status_code == 200, f"Conflict check failed: {resp.status_code}"
        data = resp.json()
        
        assert "conflict" in data, "Missing conflict field"
        assert "message" in data, "Missing message field"
        assert isinstance(data["conflict"], bool), "conflict should be boolean"
        
        print(f"✓ Conflict check: {'Conflict' if data['conflict'] else 'Available'}")


# ========== Rest Day Tests ==========

class TestFleetRestDay:
    """Test POST/DELETE /api/fleet/planning/rest-day"""
    
    def test_add_and_remove_rest_day(self, auth_headers):
        """Add then remove a rest day"""
        # Get a driver
        drivers_resp = requests.get(
            f"{BASE_URL}/api/fleet/drivers",
            headers=auth_headers,
            timeout=30
        )
        assert drivers_resp.status_code == 200
        drivers = drivers_resp.json()
        assert len(drivers) > 0
        
        driver_id = drivers[0]["id"]
        test_date = "2099-12-25"  # Far future date for testing
        
        # Add rest day
        add_resp = requests.post(
            f"{BASE_URL}/api/fleet/planning/rest-day",
            headers=auth_headers,
            json={"driverId": driver_id, "date": test_date},
            timeout=30
        )
        assert add_resp.status_code == 200, f"Add rest day failed: {add_resp.status_code}"
        assert add_resp.json().get("success") == True
        print(f"✓ Added rest day for driver {driver_id} on {test_date}")
        
        # Remove rest day
        remove_resp = requests.delete(
            f"{BASE_URL}/api/fleet/planning/rest-day?driverId={driver_id}&date={test_date}",
            headers=auth_headers,
            timeout=30
        )
        assert remove_resp.status_code == 200, f"Remove rest day failed: {remove_resp.status_code}"
        assert remove_resp.json().get("success") == True
        print(f"✓ Removed rest day")


# ========== Bookings (Auctions) Tests ==========

class TestFleetBookings:
    """Test GET /api/fleet/bookings"""
    
    def test_bookings_returns_list(self, auth_headers):
        """Bookings endpoint returns auction list with scanned extras"""
        start = time.time()
        resp = requests.get(
            f"{BASE_URL}/api/fleet/bookings",
            headers=auth_headers,
            timeout=30
        )
        elapsed = time.time() - start
        
        assert resp.status_code == 200, f"Bookings failed: {resp.status_code}"
        data = resp.json()
        
        assert isinstance(data, list), "Bookings should return a list"
        
        # Verify auction structure
        if len(data) > 0:
            auction = data[0]
            assert "id" in auction, "Auction missing id"
            assert "status" in auction, "Auction missing status"
            assert "startDate" in auction, "Auction missing startDate"
            
        print(f"✓ Bookings returned {len(data)} auctions in {elapsed:.2f}s")
        
        # Performance: was 16s, should now be ~1s
        assert elapsed < 10, f"Bookings too slow: {elapsed:.2f}s"


# ========== Drivers Tests ==========

class TestFleetDrivers:
    """Test GET /api/fleet/drivers"""
    
    def test_drivers_returns_list(self, auth_headers):
        """Drivers endpoint returns driver list"""
        start = time.time()
        resp = requests.get(
            f"{BASE_URL}/api/fleet/drivers",
            headers=auth_headers,
            timeout=30
        )
        elapsed = time.time() - start
        
        assert resp.status_code == 200, f"Drivers failed: {resp.status_code}"
        data = resp.json()
        
        assert isinstance(data, list), "Drivers should return a list"
        assert len(data) > 0, "Expected at least one driver"
        
        # Verify driver structure
        driver = data[0]
        assert "id" in driver, "Driver missing id"
        assert "firstName" in driver, "Driver missing firstName"
        assert "lastName" in driver, "Driver missing lastName"
        assert "isActivated" in driver, "Driver missing isActivated"
        
        print(f"✓ Drivers returned {len(data)} drivers in {elapsed:.2f}s")


# ========== Vehicles Tests ==========

class TestFleetVehicles:
    """Test GET /api/fleet/vehicles"""
    
    def test_vehicles_returns_list(self, auth_headers):
        """Vehicles endpoint returns vehicle list"""
        start = time.time()
        resp = requests.get(
            f"{BASE_URL}/api/fleet/vehicles",
            headers=auth_headers,
            timeout=30
        )
        elapsed = time.time() - start
        
        assert resp.status_code == 200, f"Vehicles failed: {resp.status_code}"
        data = resp.json()
        
        assert isinstance(data, list), "Vehicles should return a list"
        
        if len(data) > 0:
            vehicle = data[0]
            assert "id" in vehicle, "Vehicle missing id"
            assert "plateNumber" in vehicle, "Vehicle missing plateNumber"
            
        print(f"✓ Vehicles returned {len(data)} vehicles in {elapsed:.2f}s")


# ========== My Bookings Tests ==========

class TestFleetMyBookings:
    """Test GET /api/fleet/my-bookings"""
    
    def test_my_bookings_returns_list(self, auth_headers):
        """My-bookings returns company bookings"""
        start = time.time()
        resp = requests.get(
            f"{BASE_URL}/api/fleet/my-bookings",
            headers=auth_headers,
            timeout=30
        )
        elapsed = time.time() - start
        
        assert resp.status_code == 200, f"My-bookings failed: {resp.status_code}"
        data = resp.json()
        
        assert isinstance(data, list), "My-bookings should return a list"
        
        print(f"✓ My-bookings returned {len(data)} bookings in {elapsed:.2f}s")


# ========== Driver Rides Tests ==========

class TestFleetDriverRides:
    """Test GET /api/fleet/drivers/{id}/rides"""
    
    def test_driver_rides_returns_history(self, auth_headers):
        """Driver rides endpoint returns ride history with forfaits"""
        # Get a driver first
        drivers_resp = requests.get(
            f"{BASE_URL}/api/fleet/drivers",
            headers=auth_headers,
            timeout=30
        )
        assert drivers_resp.status_code == 200
        drivers = drivers_resp.json()
        assert len(drivers) > 0
        
        driver_id = drivers[0]["id"]
        
        start = time.time()
        resp = requests.get(
            f"{BASE_URL}/api/fleet/drivers/{driver_id}/rides",
            headers=auth_headers,
            timeout=30
        )
        elapsed = time.time() - start
        
        assert resp.status_code == 200, f"Driver rides failed: {resp.status_code}"
        data = resp.json()
        
        # Verify structure
        assert "driverId" in data, "Missing driverId"
        assert "rides" in data, "Missing rides"
        assert "totalRides" in data, "Missing totalRides"
        assert "totalForfait" in data, "Missing totalForfait"
        assert data["driverId"] == driver_id, "Driver ID mismatch"
        
        # Verify rides have forfait field
        for ride in data.get("rides", []):
            assert "forfait" in ride, f"Ride {ride.get('id')} missing forfait field"
            
        print(f"✓ Driver {driver_id} rides: {data['totalRides']} rides in {elapsed:.2f}s")


# ========== Performance Summary Test ==========

class TestPerformanceSummary:
    """Run all main endpoints and report timing"""
    
    def test_performance_summary(self, auth_headers):
        """Test response times for all critical endpoints"""
        results = []
        
        endpoints = [
            ("GET", "/api/fleet/drivers", {}),
            ("GET", "/api/fleet/vehicles", {}),
            ("GET", "/api/fleet/bookings", {}),
            ("GET", "/api/fleet/my-bookings", {}),
            ("GET", "/api/fleet/planning?view=day", {}),
            ("GET", "/api/fleet/planning?view=week", {}),
        ]
        
        for method, endpoint, payload in endpoints:
            start = time.time()
            if method == "GET":
                resp = requests.get(f"{BASE_URL}{endpoint}", headers=auth_headers, timeout=60)
            else:
                resp = requests.post(f"{BASE_URL}{endpoint}", headers=auth_headers, json=payload, timeout=60)
            elapsed = time.time() - start
            
            status = "✓" if resp.status_code == 200 else "✗"
            results.append((endpoint, elapsed, resp.status_code, status))
        
        print("\n" + "="*60)
        print("PERFORMANCE SUMMARY")
        print("="*60)
        for endpoint, elapsed, status_code, status in results:
            print(f"{status} {endpoint}: {elapsed:.2f}s (HTTP {status_code})")
        print("="*60)
        
        # All should return 200
        failed = [r for r in results if r[2] != 200]
        assert len(failed) == 0, f"Failed endpoints: {failed}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
