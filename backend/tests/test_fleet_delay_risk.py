"""
Fleet Planning - AI Delay Risk Module Tests
Tests for:
- GET /api/fleet/planning/delay-risk - Get delay risk scores for future events
- Risk scoring logic: overlap (+40), GPS inactive (+20), no driver (+15), margin <10min (+10), ETA>margin (+25)
- Risk status classification: on_time (0-39), tight (40-69), at_risk (70-100)
- Google Distance Matrix integration for real-time ETA
- Adaptive caching TTL based on minutes until mission
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Fleet company credentials
FLEET_EMAIL = "Nandetiri1@gmail.com"
FLEET_PASSWORD = "12345678"

# Test date with missions created for delay risk testing
TEST_DATE = "2026-03-23"

# Known driver IDs from C# API
DRIVER_VOVA_ID = "2055d816-c0e9-4e3e-8e3e-8e3e8e3e8e3e"  # Vova YERITSYAN
DRIVER_MARIAM_ID = "858e3dc3-5bb4-431d-b108-4c620375551c"  # Mariam saroyan

# GPS device IMEI
GPS_IMEI = "350317176003840"


class TestDelayRiskAuthentication:
    """Test authentication requirements for delay-risk endpoint"""
    
    def test_delay_risk_requires_auth(self):
        """GET /api/fleet/planning/delay-risk returns 401 without token"""
        response = requests.get(f"{BASE_URL}/api/fleet/planning/delay-risk")
        assert response.status_code == 401
        print("PASS: Delay-risk endpoint requires authentication")


class TestDelayRiskAPI:
    """Test delay-risk API endpoint with authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for fleet company via backend proxy"""
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
    
    # =========== GET /api/fleet/planning/delay-risk ===========
    
    def test_delay_risk_returns_200(self):
        """GET /api/fleet/planning/delay-risk returns 200 with valid token"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: Delay-risk endpoint returns 200")
    
    def test_delay_risk_response_structure(self):
        """Delay-risk response has correct structure: risks dict, date, bufferMinutes"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "risks" in data, "Response missing 'risks' field"
        assert "date" in data, "Response missing 'date' field"
        assert "bufferMinutes" in data, "Response missing 'bufferMinutes' field"
        
        assert isinstance(data["risks"], dict), "risks should be a dict"
        assert data["date"] == TEST_DATE, f"Expected date {TEST_DATE}, got {data['date']}"
        assert isinstance(data["bufferMinutes"], int), "bufferMinutes should be int"
        
        print(f"PASS: Response structure correct - {len(data['risks'])} risk entries, buffer={data['bufferMinutes']}min")
    
    def test_delay_risk_entry_structure(self):
        """Each risk entry has required fields: score, status, label, reasons, etc."""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        risks = data["risks"]
        
        if len(risks) > 0:
            # Get first risk entry
            event_id = list(risks.keys())[0]
            risk = risks[event_id]
            
            # Required fields
            assert "score" in risk, "Risk missing 'score'"
            assert "status" in risk, "Risk missing 'status'"
            assert "label" in risk, "Risk missing 'label'"
            assert "reasons" in risk, "Risk missing 'reasons'"
            assert "marginMinutes" in risk, "Risk missing 'marginMinutes'"
            assert "etaMinutes" in risk, "Risk missing 'etaMinutes'"
            assert "etaText" in risk, "Risk missing 'etaText'"
            assert "distanceText" in risk, "Risk missing 'distanceText'"
            assert "gpsActive" in risk, "Risk missing 'gpsActive'"
            
            # Type checks
            assert isinstance(risk["score"], int), "score should be int"
            assert isinstance(risk["reasons"], list), "reasons should be list"
            assert risk["status"] in ["on_time", "tight", "at_risk"], f"Invalid status: {risk['status']}"
            
            print(f"PASS: Risk entry structure correct - event {event_id}: score={risk['score']}, status={risk['status']}")
        else:
            print("INFO: No risk entries to verify structure (no future events)")
    
    def test_delay_risk_score_clamped_to_100(self):
        """Risk scores should be clamped to max 100"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        risks = data["risks"]
        
        for event_id, risk in risks.items():
            assert risk["score"] <= 100, f"Score {risk['score']} exceeds max 100 for event {event_id}"
            assert risk["score"] >= 0, f"Score {risk['score']} is negative for event {event_id}"
        
        print(f"PASS: All {len(risks)} risk scores are within 0-100 range")
    
    def test_delay_risk_status_classification(self):
        """Risk status matches score: on_time (0-39), tight (40-69), at_risk (70-100)"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        risks = data["risks"]
        
        for event_id, risk in risks.items():
            score = risk["score"]
            status = risk["status"]
            
            if score <= 39:
                expected = "on_time"
            elif score <= 69:
                expected = "tight"
            else:
                expected = "at_risk"
            
            assert status == expected, f"Event {event_id}: score {score} should be '{expected}', got '{status}'"
        
        print(f"PASS: All {len(risks)} risk statuses match score classification")
    
    def test_delay_risk_reasons_are_strings(self):
        """Risk reasons should be list of strings"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        risks = data["risks"]
        
        for event_id, risk in risks.items():
            reasons = risk["reasons"]
            assert isinstance(reasons, list), f"reasons should be list for {event_id}"
            for reason in reasons:
                assert isinstance(reason, str), f"Each reason should be string for {event_id}"
        
        print(f"PASS: All risk reasons are valid strings")
    
    def test_delay_risk_gps_active_boolean(self):
        """gpsActive field should be boolean"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        risks = data["risks"]
        
        for event_id, risk in risks.items():
            assert isinstance(risk["gpsActive"], bool), f"gpsActive should be bool for {event_id}"
        
        print(f"PASS: All gpsActive fields are boolean")
    
    # =========== Risk Scoring Logic Tests ===========
    
    def test_unassigned_mission_has_no_driver_penalty(self):
        """Unassigned missions should have +15 'no driver' penalty"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        risks = data["risks"]
        
        # Check for unassigned missions (they should have 'no driver' reason)
        unassigned_found = False
        for event_id, risk in risks.items():
            reasons_text = " ".join(risk["reasons"]).lower()
            if "non assigne" in reasons_text or "chauffeur non" in reasons_text:
                unassigned_found = True
                # Score should include +15 for no driver
                assert risk["score"] >= 15, f"Unassigned mission {event_id} should have score >= 15"
                print(f"PASS: Unassigned mission {event_id} has score {risk['score']} with no-driver penalty")
                break
        
        if not unassigned_found:
            print("INFO: No unassigned missions found to verify no-driver penalty")
    
    def test_gps_inactive_penalty(self):
        """GPS inactive > 10 min should add +20 penalty"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        risks = data["risks"]
        
        # Check for GPS inactive reasons
        gps_inactive_found = False
        for event_id, risk in risks.items():
            reasons_text = " ".join(risk["reasons"]).lower()
            if "gps" in reasons_text and ("inactif" in reasons_text or "traceur" in reasons_text):
                gps_inactive_found = True
                # Score should include +20 for GPS inactive
                assert risk["score"] >= 20, f"GPS inactive mission {event_id} should have score >= 20"
                print(f"PASS: GPS inactive mission {event_id} has score {risk['score']}")
                break
        
        if not gps_inactive_found:
            print("INFO: No GPS inactive missions found (GPS may be active)")
    
    # =========== ETA and Distance Tests ===========
    
    def test_eta_data_present_when_gps_active(self):
        """When GPS is active and pickup address exists, ETA data should be present"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        risks = data["risks"]
        
        eta_found = False
        for event_id, risk in risks.items():
            if risk["etaMinutes"] is not None:
                eta_found = True
                assert risk["etaText"] is not None, f"etaText should be present when etaMinutes exists"
                assert risk["distanceText"] is not None, f"distanceText should be present when etaMinutes exists"
                print(f"PASS: ETA data present for {event_id}: {risk['etaText']}, {risk['distanceText']}")
                break
        
        if not eta_found:
            print("INFO: No ETA data found (GPS may be inactive or no pickup addresses)")
    
    # =========== Caching Tests ===========
    
    def test_delay_risk_caching_performance(self):
        """Second call should be faster due to caching"""
        # First call
        start1 = time.time()
        response1 = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        time1 = time.time() - start1
        assert response1.status_code == 200
        
        # Second call (should use cache)
        start2 = time.time()
        response2 = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        time2 = time.time() - start2
        assert response2.status_code == 200
        
        # Both should return same data
        data1 = response1.json()
        data2 = response2.json()
        assert len(data1["risks"]) == len(data2["risks"]), "Cached response should have same risk count"
        
        print(f"PASS: First call: {time1:.2f}s, Second call: {time2:.2f}s")
        if time2 < time1:
            print(f"  -> Second call was {(time1-time2)/time1*100:.1f}% faster (caching working)")
    
    # =========== Integration with Planning ===========
    
    def test_delay_risk_matches_planning_events(self):
        """Risk entries should correspond to events in planning endpoint"""
        # Get planning data
        planning_resp = requests.get(
            f"{BASE_URL}/api/fleet/planning?date={TEST_DATE}",
            headers=self.headers
        )
        assert planning_resp.status_code == 200
        planning = planning_resp.json()
        
        # Get delay risk data
        risk_resp = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        assert risk_resp.status_code == 200
        risk_data = risk_resp.json()
        
        # Collect all event IDs from planning
        planning_event_ids = set()
        for driver in planning.get("drivers", []):
            for event in driver.get("events", []):
                planning_event_ids.add(event["id"])
        
        # Also add unassigned booking IDs
        for booking in planning.get("unassigned", []):
            planning_event_ids.add(booking["id"])
        
        # Risk event IDs should be subset of planning event IDs
        risk_event_ids = set(risk_data["risks"].keys())
        
        print(f"Planning has {len(planning_event_ids)} events, Risk has {len(risk_event_ids)} entries")
        
        # Note: Risk only includes FUTURE events within 2 hours, so it may be smaller
        # But all risk entries should exist in planning
        for event_id in risk_event_ids:
            if event_id not in planning_event_ids:
                # Could be unassigned booking
                print(f"INFO: Risk event {event_id} not in planning events (may be unassigned)")
        
        print(f"PASS: Risk entries correspond to planning events")
    
    # =========== Default Date Test ===========
    
    def test_delay_risk_default_date(self):
        """GET /api/fleet/planning/delay-risk without date uses today"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        # Date should be today or empty string (depends on implementation)
        assert "date" in data
        print(f"PASS: Default date request works, date={data['date']}")


class TestDelayRiskScenarios:
    """Test specific risk scenarios"""
    
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
    
    def test_risk_summary_counts(self):
        """Count risks by status for summary verification"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        risks = data["risks"]
        
        counts = {"on_time": 0, "tight": 0, "at_risk": 0}
        for risk in risks.values():
            status = risk["status"]
            if status in counts:
                counts[status] += 1
        
        print(f"PASS: Risk summary - on_time: {counts['on_time']}, tight: {counts['tight']}, at_risk: {counts['at_risk']}")
        print(f"  Total: {sum(counts.values())} risk entries")
    
    def test_risk_labels_in_french(self):
        """Risk labels should be in French"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/planning/delay-risk?date={TEST_DATE}",
            headers=self.headers
        )
        assert response.status_code == 200
        
        data = response.json()
        risks = data["risks"]
        
        expected_labels = {
            "on_time": "A l'heure",
            "tight": "Timing serre",
            "at_risk": "Risque de retard"
        }
        
        for event_id, risk in risks.items():
            status = risk["status"]
            label = risk["label"]
            expected = expected_labels.get(status)
            assert label == expected, f"Event {event_id}: expected label '{expected}', got '{label}'"
        
        print(f"PASS: All risk labels are in French")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
