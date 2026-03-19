"""
Fleet Planning Source Filter Tests
Tests for:
- GET /api/fleet/planning returns events with 'source' field (zont/company)
- GET /api/fleet/planning returns unassigned bookings with 'source' field
- Source filter works client-side (all data returned from backend)
- Day/Week/Month views all return events with source
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Fleet company credentials
FLEET_EMAIL = "Nandetiri1@gmail.com"
FLEET_PASSWORD = "12345678"

# Test dates with known data
TEST_DATE_WITH_EVENTS = "2026-03-19"  # Has both company and zont events


class TestFleetPlanningSourceField:
    """Test that planning endpoint returns correct source field"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for fleet company"""
        login_resp = requests.post(
            f"{BASE_URL}/api/fleet/auth/login",
            json={"username": FLEET_EMAIL, "password": FLEET_PASSWORD}
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        self.token = login_data.get("accessToken")
        assert self.token, f"No accessToken in login response"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    # =========== Assigned Events Source Field ===========
    
    def test_planning_returns_assigned_events_with_source(self):
        """GET /api/fleet/planning returns assigned events with source field"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE_WITH_EVENTS}&view=day",
            headers=self.headers,
            timeout=30
        )
        assert response.status_code == 200
        
        data = response.json()
        drivers = data["drivers"]
        
        # Collect all events
        all_events = []
        for driver in drivers:
            all_events.extend(driver.get("events", []))
        
        assert len(all_events) > 0, "Expected events on test date"
        
        # Verify each event has source field
        for event in all_events:
            assert "source" in event, f"Event missing source field: {event.get('id')}"
            assert event["source"] in ["zont", "company"], f"Invalid source: {event['source']}"
        
        print(f"PASS: {len(all_events)} assigned events have valid source field")
    
    def test_planning_has_both_zont_and_company_events(self):
        """GET /api/fleet/planning returns events from both sources"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE_WITH_EVENTS}&view=day",
            headers=self.headers,
            timeout=30
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Collect all events with their sources
        zont_events = []
        company_events = []
        
        for driver in data["drivers"]:
            for event in driver.get("events", []):
                if event.get("source") == "zont":
                    zont_events.append(event)
                elif event.get("source") == "company":
                    company_events.append(event)
        
        print(f"Found {len(zont_events)} Zont events, {len(company_events)} Company events")
        
        # Verify we have both types (this date has both in test data)
        assert len(zont_events) > 0, "Expected Zont events on test date"
        assert len(company_events) > 0, "Expected Company events on test date"
        
        # Verify Zont event structure
        zont_event = zont_events[0]
        assert zont_event["id"].startswith("zont-"), f"Zont event ID should start with 'zont-': {zont_event['id']}"
        
        # Verify Company event structure
        company_event = company_events[0]
        assert company_event["id"].startswith("company-"), f"Company event ID should start with 'company-': {company_event['id']}"
        
        print("PASS: Both Zont and Company events returned with correct ID prefixes")
    
    def test_event_has_required_fields(self):
        """Verify each event has all required fields for display"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE_WITH_EVENTS}&view=day",
            headers=self.headers,
            timeout=30
        )
        assert response.status_code == 200
        
        data = response.json()
        
        required_fields = ["id", "driverId", "source", "type", "status", "startTime", "endTime"]
        
        for driver in data["drivers"]:
            for event in driver.get("events", []):
                for field in required_fields:
                    assert field in event, f"Event {event.get('id')} missing field: {field}"
        
        print("PASS: All events have required fields")
    
    # =========== Unassigned Bookings Source Field ===========
    
    def test_unassigned_bookings_have_source_field(self):
        """GET /api/fleet/planning returns unassigned bookings with source field"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE_WITH_EVENTS}&view=day",
            headers=self.headers,
            timeout=30
        )
        assert response.status_code == 200
        
        data = response.json()
        unassigned = data.get("unassigned", [])
        
        if len(unassigned) > 0:
            for booking in unassigned:
                assert "source" in booking, f"Unassigned booking missing source: {booking.get('id')}"
                assert booking["source"] in ["zont", "company"], f"Invalid unassigned source: {booking['source']}"
            print(f"PASS: {len(unassigned)} unassigned bookings have valid source field")
        else:
            print("INFO: No unassigned bookings on this date to verify")
    
    def test_unassigned_company_booking_structure(self):
        """Verify unassigned company booking has correct structure"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE_WITH_EVENTS}&view=day",
            headers=self.headers,
            timeout=30
        )
        assert response.status_code == 200
        
        data = response.json()
        company_unassigned = [b for b in data.get("unassigned", []) if b.get("source") == "company"]
        
        if len(company_unassigned) > 0:
            booking = company_unassigned[0]
            # Required fields for company unassigned booking
            assert "id" in booking
            assert "source" in booking
            assert booking["source"] == "company"
            assert "type" in booking
            assert "date" in booking
            assert "time" in booking
            assert "pickupAddress" in booking
            print(f"PASS: Company unassigned booking has correct structure")
        else:
            print("INFO: No company unassigned bookings to verify")
    
    # =========== Week View Source Field ===========
    
    def test_week_view_has_source_field(self):
        """GET /api/fleet/planning?view=week returns events with source"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE_WITH_EVENTS}&view=week",
            headers=self.headers,
            timeout=30
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["view"] == "week"
        
        # Check events have source
        events_checked = 0
        for driver in data["drivers"]:
            for event in driver.get("events", []):
                assert "source" in event
                events_checked += 1
        
        print(f"PASS: Week view - {events_checked} events have source field")
    
    # =========== Month View Source Field ===========
    
    def test_month_view_has_source_field(self):
        """GET /api/fleet/planning?view=month returns events with source"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE_WITH_EVENTS}&view=month",
            headers=self.headers,
            timeout=45  # Month view may be slower
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["view"] == "month"
        
        # Check events have source
        events_checked = 0
        for driver in data["drivers"]:
            for event in driver.get("events", []):
                assert "source" in event
                events_checked += 1
        
        print(f"PASS: Month view - {events_checked} events have source field")
    
    # =========== Response Structure Tests ===========
    
    def test_planning_response_structure(self):
        """Verify complete planning response structure"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE_WITH_EVENTS}&view=day",
            headers=self.headers,
            timeout=30
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Top level fields
        assert "dateStart" in data
        assert "dateEnd" in data
        assert "view" in data
        assert "drivers" in data
        assert "unassigned" in data
        
        # Drivers array
        assert isinstance(data["drivers"], list)
        if len(data["drivers"]) > 0:
            driver = data["drivers"][0]
            assert "id" in driver
            assert "firstName" in driver
            assert "lastName" in driver
            assert "events" in driver
            assert isinstance(driver["events"], list)
        
        # Unassigned array
        assert isinstance(data["unassigned"], list)
        
        print("PASS: Planning response has correct structure")
    
    def test_drivers_list_returned(self):
        """GET /api/fleet/planning returns list of drivers"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning",
            headers=self.headers,
            timeout=30
        )
        assert response.status_code == 200
        
        data = response.json()
        drivers = data["drivers"]
        
        assert len(drivers) >= 2, "Expected at least 2 drivers"
        
        driver_names = [f"{d['firstName']} {d['lastName']}" for d in drivers]
        print(f"PASS: Found {len(drivers)} drivers: {driver_names}")


class TestFleetPlanningFilterScenarios:
    """Test scenarios that would use the source filter on frontend"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for fleet company"""
        login_resp = requests.post(
            f"{BASE_URL}/api/fleet/auth/login",
            json={"username": FLEET_EMAIL, "password": FLEET_PASSWORD}
        )
        assert login_resp.status_code == 200
        self.token = login_resp.json().get("accessToken")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_filter_all_returns_everything(self):
        """Simulating 'Tout' filter - backend returns all events"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE_WITH_EVENTS}&view=day",
            headers=self.headers,
            timeout=30
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Count events by source
        total_events = sum(len(d.get("events", [])) for d in data["drivers"])
        zont_count = sum(1 for d in data["drivers"] for e in d.get("events", []) if e.get("source") == "zont")
        company_count = sum(1 for d in data["drivers"] for e in d.get("events", []) if e.get("source") == "company")
        
        assert total_events == zont_count + company_count
        print(f"PASS: Total events={total_events} (Zont={zont_count}, Company={company_count})")
    
    def test_simulated_zont_filter(self):
        """Simulating 'Zont' filter - verify zont events can be filtered client-side"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE_WITH_EVENTS}&view=day",
            headers=self.headers,
            timeout=30
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Simulate frontend filter: only zont events
        for driver in data["drivers"]:
            zont_events = [e for e in driver.get("events", []) if e.get("source") == "zont"]
            driver["filtered_events"] = zont_events
        
        filtered_total = sum(len(d["filtered_events"]) for d in data["drivers"])
        print(f"PASS: Zont filter would show {filtered_total} events")
    
    def test_simulated_company_filter(self):
        """Simulating 'Societe' filter - verify company events can be filtered client-side"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE_WITH_EVENTS}&view=day",
            headers=self.headers,
            timeout=30
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Simulate frontend filter: only company events
        for driver in data["drivers"]:
            company_events = [e for e in driver.get("events", []) if e.get("source") == "company"]
            driver["filtered_events"] = company_events
        
        filtered_total = sum(len(d["filtered_events"]) for d in data["drivers"])
        print(f"PASS: Company filter would show {filtered_total} events")
    
    def test_simulated_unassigned_filter_zont(self):
        """Simulating unassigned panel filter for Zont"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE_WITH_EVENTS}&view=day",
            headers=self.headers,
            timeout=30
        )
        assert response.status_code == 200
        
        data = response.json()
        
        zont_unassigned = [b for b in data.get("unassigned", []) if b.get("source") == "zont"]
        company_unassigned = [b for b in data.get("unassigned", []) if b.get("source") == "company"]
        
        print(f"PASS: Unassigned - Zont={len(zont_unassigned)}, Company={len(company_unassigned)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
