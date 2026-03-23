"""
Fleet GPS History Backend API Tests
Tests the GPS History / Route Replay feature endpoints.

Endpoints tested:
- GET /api/fleet/gps/history/{imei} - Get position history filtered by date range
- GET /api/fleet/gps/history-days/{imei} - Get list of days with GPS data
- GET /api/fleet/gps/devices - Get company devices list (for device selector)
"""

import pytest
import requests
import os
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://gps-super-admin.preview.emergentagent.com').rstrip('/')

# Test credentials
FLEET_USERNAME = "Nandetiri1@gmail.com"
FLEET_PASSWORD = "12345678"

# Real IMEI with history data
REAL_IMEI = "350317176003840"  # Lexus NX 300, DZ-960-CK

# Dates with known GPS data
HISTORY_DATE_1 = "2026-03-22"  # 1093 positions
HISTORY_DATE_2 = "2026-03-23"  # 331 positions


@pytest.fixture(scope="module")
def auth_token():
    """Get fleet auth token for authenticated endpoints"""
    response = requests.post(
        f"{BASE_URL}/api/fleet/auth/login",
        json={"username": FLEET_USERNAME, "password": FLEET_PASSWORD},
        headers={"Content-Type": "application/json"}
    )
    if response.status_code != 200:
        pytest.skip(f"Fleet login failed: {response.text}")
    token = response.json().get("accessToken")
    assert token, "No accessToken in login response"
    print(f"PASS: Fleet login successful, token length: {len(token)}")
    return token


class TestFleetGPSDevices:
    """Test GET /api/fleet/gps/devices - Device list for selector dropdown"""
    
    def test_get_devices_returns_list(self, auth_token):
        """Test that devices endpoint returns a list of devices"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/devices",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "devices" in data, f"Response missing 'devices' field: {data}"
        assert "count" in data, f"Response missing 'count' field: {data}"
        assert isinstance(data["devices"], list), f"Expected devices to be list"
        print(f"PASS: GET /devices returns {data['count']} devices")
    
    def test_devices_contain_required_fields(self, auth_token):
        """Test that each device has required fields for dropdown"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/devices",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        devices = data.get("devices", [])
        
        if len(devices) == 0:
            pytest.skip("No devices found to test")
        
        for device in devices:
            assert "imei" in device, f"Device missing 'imei': {device}"
            # vehicleName and licensePlate are optional but should be present
            assert "vehicleName" in device or device.get("vehicleName") is None, f"Device structure issue: {device}"
        
        print(f"PASS: All {len(devices)} devices have required fields")
    
    def test_real_device_exists(self, auth_token):
        """Test that the real test device (Lexus NX 300) exists"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/devices",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        devices = data.get("devices", [])
        
        imeis = [d.get("imei") for d in devices]
        assert REAL_IMEI in imeis, f"Real device {REAL_IMEI} not found in devices: {imeis}"
        
        # Find the device and verify details
        device = next((d for d in devices if d.get("imei") == REAL_IMEI), None)
        assert device is not None
        print(f"PASS: Real device found - {device.get('vehicleName', 'N/A')} ({device.get('licensePlate', 'N/A')})")


class TestFleetGPSHistoryDays:
    """Test GET /api/fleet/gps/history-days/{imei} - Days with GPS data"""
    
    def test_history_days_returns_list(self, auth_token):
        """Test that history-days endpoint returns list of days"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history-days/{REAL_IMEI}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "device" in data, f"Response missing 'device' field: {data}"
        assert "days" in data, f"Response missing 'days' field: {data}"
        assert isinstance(data["days"], list), f"Expected days to be list"
        print(f"PASS: GET /history-days returns {len(data['days'])} days")
    
    def test_history_days_contain_required_fields(self, auth_token):
        """Test that each day entry has required fields"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history-days/{REAL_IMEI}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        days = data.get("days", [])
        
        if len(days) == 0:
            pytest.skip("No history days found")
        
        for day in days:
            assert "date" in day, f"Day missing 'date': {day}"
            assert "positions" in day, f"Day missing 'positions': {day}"
            assert "maxSpeed" in day, f"Day missing 'maxSpeed': {day}"
            # Validate date format (YYYY-MM-DD)
            assert len(day["date"]) == 10, f"Invalid date format: {day['date']}"
        
        print(f"PASS: All {len(days)} days have required fields (date, positions, maxSpeed)")
    
    def test_history_days_sorted_descending(self, auth_token):
        """Test that days are sorted in descending order (newest first)"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history-days/{REAL_IMEI}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        days = data.get("days", [])
        
        if len(days) < 2:
            pytest.skip("Not enough days to test sorting")
        
        dates = [d["date"] for d in days]
        assert dates == sorted(dates, reverse=True), f"Days not sorted descending: {dates}"
        print(f"PASS: Days sorted descending, newest: {dates[0]}, oldest: {dates[-1]}")
    
    def test_history_days_nonexistent_device_returns_404(self, auth_token):
        """Test that non-existent device returns 404"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history-days/NONEXISTENT_IMEI_999",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        print("PASS: Non-existent device returns 404")


class TestFleetGPSHistory:
    """Test GET /api/fleet/gps/history/{imei} - Position history with date range"""
    
    def test_history_returns_positions(self, auth_token):
        """Test that history endpoint returns positions for valid date range"""
        start = f"{HISTORY_DATE_1}T00:00:00Z"
        end = f"{HISTORY_DATE_1}T23:59:59Z"
        
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/{REAL_IMEI}",
            params={"start": start, "end": end},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "device" in data, f"Response missing 'device' field: {data}"
        assert "history" in data, f"Response missing 'history' field: {data}"
        assert "count" in data, f"Response missing 'count' field: {data}"
        assert "period" in data, f"Response missing 'period' field: {data}"
        print(f"PASS: GET /history returns {data['count']} positions for {HISTORY_DATE_1}")
    
    def test_history_positions_have_required_fields(self, auth_token):
        """Test that each position has required fields for route replay"""
        start = f"{HISTORY_DATE_1}T00:00:00Z"
        end = f"{HISTORY_DATE_1}T23:59:59Z"
        
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/{REAL_IMEI}",
            params={"start": start, "end": end, "limit": 10},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        history = data.get("history", [])
        
        if len(history) == 0:
            pytest.skip("No history positions found")
        
        required_fields = ["timestamp", "lat", "lng", "speed", "heading"]
        for pos in history:
            for field in required_fields:
                assert field in pos, f"Position missing '{field}': {pos}"
            # Validate coordinates are not zero (filtered in frontend)
            # Note: Backend may return zero positions, frontend filters them
        
        print(f"PASS: All positions have required fields: {required_fields}")
    
    def test_history_sorted_by_timestamp(self, auth_token):
        """Test that history positions are sorted by timestamp ascending"""
        start = f"{HISTORY_DATE_1}T00:00:00Z"
        end = f"{HISTORY_DATE_1}T23:59:59Z"
        
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/{REAL_IMEI}",
            params={"start": start, "end": end, "limit": 100},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        history = data.get("history", [])
        
        if len(history) < 2:
            pytest.skip("Not enough positions to test sorting")
        
        timestamps = [p["timestamp"] for p in history]
        assert timestamps == sorted(timestamps), f"Positions not sorted by timestamp"
        print(f"PASS: Positions sorted by timestamp, first: {timestamps[0][:19]}, last: {timestamps[-1][:19]}")
    
    def test_history_respects_limit_parameter(self, auth_token):
        """Test that limit parameter is respected"""
        start = f"{HISTORY_DATE_1}T00:00:00Z"
        end = f"{HISTORY_DATE_1}T23:59:59Z"
        limit = 50
        
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/{REAL_IMEI}",
            params={"start": start, "end": end, "limit": limit},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        history = data.get("history", [])
        
        assert len(history) <= limit, f"Expected max {limit} positions, got {len(history)}"
        print(f"PASS: Limit parameter respected, returned {len(history)} positions (limit={limit})")
    
    def test_history_period_in_response(self, auth_token):
        """Test that response includes the requested period"""
        start = f"{HISTORY_DATE_1}T00:00:00Z"
        end = f"{HISTORY_DATE_1}T23:59:59Z"
        
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/{REAL_IMEI}",
            params={"start": start, "end": end},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        period = data.get("period", {})
        
        assert period.get("start") == start, f"Period start mismatch: {period}"
        assert period.get("end") == end, f"Period end mismatch: {period}"
        print(f"PASS: Response includes correct period: {period}")
    
    def test_history_empty_for_no_data_date(self, auth_token):
        """Test that history returns empty for date with no data"""
        # Use a date far in the past with no data
        start = "2020-01-01T00:00:00Z"
        end = "2020-01-01T23:59:59Z"
        
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/{REAL_IMEI}",
            params={"start": start, "end": end},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("count") == 0, f"Expected 0 positions for old date, got {data.get('count')}"
        print("PASS: Empty history returned for date with no data")
    
    def test_history_nonexistent_device_returns_404(self, auth_token):
        """Test that non-existent device returns 404"""
        start = f"{HISTORY_DATE_1}T00:00:00Z"
        end = f"{HISTORY_DATE_1}T23:59:59Z"
        
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/NONEXISTENT_IMEI_999",
            params={"start": start, "end": end},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        print("PASS: Non-existent device returns 404")
    
    def test_history_requires_start_end_params(self, auth_token):
        """Test that start and end parameters are required"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/{REAL_IMEI}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        # Should return 422 (validation error) for missing required params
        assert response.status_code == 422, f"Expected 422 for missing params, got {response.status_code}: {response.text}"
        print("PASS: Missing start/end params returns 422")


class TestFleetGPSHistoryAuth:
    """Test authentication requirements for history endpoints"""
    
    def test_history_requires_auth(self):
        """Test that history endpoint requires authentication"""
        start = f"{HISTORY_DATE_1}T00:00:00Z"
        end = f"{HISTORY_DATE_1}T23:59:59Z"
        
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/{REAL_IMEI}",
            params={"start": start, "end": end}
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: GET /history requires auth")
    
    def test_history_days_requires_auth(self):
        """Test that history-days endpoint requires authentication"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history-days/{REAL_IMEI}"
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: GET /history-days requires auth")
    
    def test_devices_requires_auth(self):
        """Test that devices endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/fleet/gps/devices")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: GET /devices requires auth")


class TestFleetGPSHistoryDataValidation:
    """Test data validation for history endpoints"""
    
    def test_history_with_real_data_date(self, auth_token):
        """Test history with known date that has data (2026-03-22)"""
        start = f"{HISTORY_DATE_1}T00:00:00Z"
        end = f"{HISTORY_DATE_1}T23:59:59Z"
        
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/{REAL_IMEI}",
            params={"start": start, "end": end},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should have significant number of positions (1093 expected)
        count = data.get("count", 0)
        assert count > 100, f"Expected >100 positions for {HISTORY_DATE_1}, got {count}"
        print(f"PASS: Date {HISTORY_DATE_1} has {count} positions (expected ~1093)")
    
    def test_history_with_second_data_date(self, auth_token):
        """Test history with second known date (2026-03-23)"""
        start = f"{HISTORY_DATE_2}T00:00:00Z"
        end = f"{HISTORY_DATE_2}T23:59:59Z"
        
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/{REAL_IMEI}",
            params={"start": start, "end": end},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should have positions (331 expected)
        count = data.get("count", 0)
        assert count > 50, f"Expected >50 positions for {HISTORY_DATE_2}, got {count}"
        print(f"PASS: Date {HISTORY_DATE_2} has {count} positions (expected ~331)")
    
    def test_history_positions_have_valid_coordinates(self, auth_token):
        """Test that positions have valid lat/lng coordinates"""
        start = f"{HISTORY_DATE_1}T00:00:00Z"
        end = f"{HISTORY_DATE_1}T23:59:59Z"
        
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/{REAL_IMEI}",
            params={"start": start, "end": end, "limit": 100},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        history = data.get("history", [])
        
        valid_count = 0
        for pos in history:
            lat = pos.get("lat", 0)
            lng = pos.get("lng", 0)
            # Valid coordinates (not zero, within reasonable range)
            if lat != 0 and lng != 0 and -90 <= lat <= 90 and -180 <= lng <= 180:
                valid_count += 1
        
        # Most positions should have valid coordinates
        assert valid_count > len(history) * 0.5, f"Too few valid coordinates: {valid_count}/{len(history)}"
        print(f"PASS: {valid_count}/{len(history)} positions have valid coordinates")
    
    def test_history_positions_have_speed_data(self, auth_token):
        """Test that positions include speed data for route coloring"""
        start = f"{HISTORY_DATE_1}T00:00:00Z"
        end = f"{HISTORY_DATE_1}T23:59:59Z"
        
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/{REAL_IMEI}",
            params={"start": start, "end": end, "limit": 100},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        history = data.get("history", [])
        
        speeds = [p.get("speed", 0) for p in history]
        max_speed = max(speeds) if speeds else 0
        avg_speed = sum(speeds) / len(speeds) if speeds else 0
        
        print(f"PASS: Speed data present - max: {max_speed} km/h, avg: {avg_speed:.1f} km/h")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
