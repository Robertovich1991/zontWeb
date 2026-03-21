"""
Fleet GPS Backend API Tests
Tests all GPS endpoints for Teltonika tracker integration via VPS webhook.

Endpoints tested:
- POST /api/fleet/gps/webhook - Receive GPS data from VPS (X-GPS-API-Key auth)
- POST /api/fleet/gps/webhook/batch - Batch GPS data for multiple devices
- POST /api/fleet/gps/devices - Register GPS device (Bearer token auth)
- GET /api/fleet/gps/devices - List registered devices
- PUT /api/fleet/gps/devices/{imei} - Update device metadata
- DELETE /api/fleet/gps/devices/{imei} - Remove device
- GET /api/fleet/gps/positions - Get latest positions for all devices
- GET /api/fleet/gps/positions/{imei} - Get position for specific device
- GET /api/fleet/gps/history/{imei} - Get position history
- GET /api/fleet/gps/stats - Get GPS system stats
- GET /api/fleet/gps/webhook-info - Get webhook setup info
- GET /api/fleet/gps/stream - SSE stream endpoint
"""

import pytest
import requests
import os
import time
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ride-dispatch-33.preview.emergentagent.com').rstrip('/')
GPS_WEBHOOK_KEY = "3iIYkCw2PAWGzDtmv6RAsfRpejFUu0n_4shfkQb-XSg"
GPS_WEBHOOK_HEADER = "X-GPS-API-Key"

# Test IMEI prefixes for cleanup
TEST_IMEI_PREFIX = "TEST_"
TEST_IMEI_1 = "TEST_350424063817001"
TEST_IMEI_2 = "TEST_350424063817002"
TEST_IMEI_3 = "TEST_350424063817003"


class TestFleetAuth:
    """Fleet authentication tests"""
    
    def test_login_returns_access_token(self):
        """Test fleet login returns accessToken"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/auth/login",
            json={"username": "Nandetiri1@gmail.com", "password": "12345678"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "accessToken" in data, "Response missing accessToken"
        assert len(data["accessToken"]) > 50, "Token too short"
        print(f"PASS: Login returns accessToken (length: {len(data['accessToken'])})")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns error"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/auth/login",
            json={"username": "invalid@test.com", "password": "wrongpassword"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code in [400, 401], f"Expected 400/401, got {response.status_code}"
        print(f"PASS: Invalid credentials return {response.status_code}")


class TestGPSWebhook:
    """GPS Webhook endpoint tests (X-GPS-API-Key auth)"""
    
    def test_webhook_rejects_missing_key(self):
        """Test webhook rejects requests without API key"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/gps/webhook",
            json={
                "imei": TEST_IMEI_1,
                "positions": [{
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "lat": 43.2965,
                    "lng": 5.3698,
                    "speed": 0
                }]
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("PASS: Webhook rejects missing API key with 403")
    
    def test_webhook_rejects_invalid_key(self):
        """Test webhook rejects requests with invalid API key"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/gps/webhook",
            json={
                "imei": TEST_IMEI_1,
                "positions": [{
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "lat": 43.2965,
                    "lng": 5.3698,
                    "speed": 0
                }]
            },
            headers={
                "Content-Type": "application/json",
                GPS_WEBHOOK_HEADER: "invalid_key_12345"
            }
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("PASS: Webhook rejects invalid API key with 403")
    
    def test_webhook_accepts_valid_key(self):
        """Test webhook accepts valid API key and stores positions"""
        now = datetime.now(timezone.utc)
        response = requests.post(
            f"{BASE_URL}/api/fleet/gps/webhook",
            json={
                "imei": TEST_IMEI_1,
                "positions": [
                    {
                        "timestamp": now.isoformat(),
                        "lat": 43.2965,
                        "lng": 5.3698,
                        "speed": 45,
                        "heading": 180,
                        "altitude": 12,
                        "satellites": 8,
                        "ignition": True
                    }
                ]
            },
            headers={
                "Content-Type": "application/json",
                GPS_WEBHOOK_HEADER: GPS_WEBHOOK_KEY
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("received") == 1, f"Expected received=1, got {data}"
        assert data.get("imei") == TEST_IMEI_1, f"Expected imei={TEST_IMEI_1}, got {data}"
        print(f"PASS: Webhook accepts valid key, received={data['received']}")
    
    def test_webhook_multiple_positions(self):
        """Test webhook handles multiple positions in single request"""
        now = datetime.now(timezone.utc)
        positions = [
            {
                "timestamp": (now - timedelta(minutes=5)).isoformat(),
                "lat": 43.2960,
                "lng": 5.3690,
                "speed": 30,
                "heading": 90,
                "altitude": 10,
                "satellites": 7,
                "ignition": True
            },
            {
                "timestamp": (now - timedelta(minutes=3)).isoformat(),
                "lat": 43.2962,
                "lng": 5.3694,
                "speed": 40,
                "heading": 95,
                "altitude": 11,
                "satellites": 8,
                "ignition": True
            },
            {
                "timestamp": now.isoformat(),
                "lat": 43.2965,
                "lng": 5.3698,
                "speed": 50,
                "heading": 100,
                "altitude": 12,
                "satellites": 9,
                "ignition": True
            }
        ]
        response = requests.post(
            f"{BASE_URL}/api/fleet/gps/webhook",
            json={"imei": TEST_IMEI_1, "positions": positions},
            headers={
                "Content-Type": "application/json",
                GPS_WEBHOOK_HEADER: GPS_WEBHOOK_KEY
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("received") == 3, f"Expected received=3, got {data}"
        print(f"PASS: Webhook handles multiple positions, received={data['received']}")
    
    def test_webhook_empty_positions(self):
        """Test webhook handles empty positions array"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/gps/webhook",
            json={"imei": TEST_IMEI_1, "positions": []},
            headers={
                "Content-Type": "application/json",
                GPS_WEBHOOK_HEADER: GPS_WEBHOOK_KEY
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("received") == 0, f"Expected received=0, got {data}"
        print("PASS: Webhook handles empty positions array")


class TestGPSBatchWebhook:
    """GPS Batch Webhook endpoint tests"""
    
    def test_batch_webhook_rejects_missing_key(self):
        """Test batch webhook rejects requests without API key"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/gps/webhook/batch",
            json={
                "devices": [{
                    "imei": TEST_IMEI_1,
                    "positions": [{
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "lat": 43.2965,
                        "lng": 5.3698,
                        "speed": 0
                    }]
                }]
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("PASS: Batch webhook rejects missing API key with 403")
    
    def test_batch_webhook_accepts_valid_key(self):
        """Test batch webhook accepts valid API key and stores positions for multiple devices"""
        now = datetime.now(timezone.utc)
        response = requests.post(
            f"{BASE_URL}/api/fleet/gps/webhook/batch",
            json={
                "devices": [
                    {
                        "imei": TEST_IMEI_2,
                        "positions": [{
                            "timestamp": now.isoformat(),
                            "lat": 43.3000,
                            "lng": 5.3700,
                            "speed": 30,
                            "heading": 45,
                            "altitude": 15,
                            "satellites": 10,
                            "ignition": True
                        }]
                    },
                    {
                        "imei": TEST_IMEI_3,
                        "positions": [
                            {
                                "timestamp": (now - timedelta(minutes=2)).isoformat(),
                                "lat": 43.3100,
                                "lng": 5.3800,
                                "speed": 20,
                                "heading": 90,
                                "altitude": 10,
                                "satellites": 8,
                                "ignition": False
                            },
                            {
                                "timestamp": now.isoformat(),
                                "lat": 43.3105,
                                "lng": 5.3810,
                                "speed": 25,
                                "heading": 95,
                                "altitude": 11,
                                "satellites": 9,
                                "ignition": True
                            }
                        ]
                    }
                ]
            },
            headers={
                "Content-Type": "application/json",
                GPS_WEBHOOK_HEADER: GPS_WEBHOOK_KEY
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("received") == 3, f"Expected received=3, got {data}"
        assert data.get("devices") == 2, f"Expected devices=2, got {data}"
        print(f"PASS: Batch webhook accepts valid key, received={data['received']}, devices={data['devices']}")


@pytest.fixture(scope="module")
def auth_token():
    """Get fleet auth token for authenticated endpoints"""
    response = requests.post(
        f"{BASE_URL}/api/fleet/auth/login",
        json={"username": "Nandetiri1@gmail.com", "password": "12345678"},
        headers={"Content-Type": "application/json"}
    )
    if response.status_code != 200:
        pytest.skip(f"Fleet login failed: {response.text}")
    return response.json().get("accessToken")


class TestGPSDeviceCRUD:
    """GPS Device CRUD endpoint tests (Bearer token auth)"""
    
    def test_create_device(self, auth_token):
        """Test creating a new GPS device"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/gps/devices",
            json={
                "imei": TEST_IMEI_1,
                "vehicleName": "Test Vehicle 1",
                "licensePlate": "TEST-001",
                "driverId": "driver-001",
                "driverName": "Test Driver"
            },
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True, f"Expected success=True, got {data}"
        device = data.get("device", {})
        assert device.get("imei") == TEST_IMEI_1, f"Expected imei={TEST_IMEI_1}, got {device}"
        assert device.get("vehicleName") == "Test Vehicle 1", f"Expected vehicleName='Test Vehicle 1', got {device}"
        print(f"PASS: Device created successfully, imei={device.get('imei')}")
    
    def test_create_device_duplicate_returns_409(self, auth_token):
        """Test creating duplicate device returns 409"""
        # First ensure device exists
        requests.post(
            f"{BASE_URL}/api/fleet/gps/devices",
            json={"imei": TEST_IMEI_1, "vehicleName": "Test Vehicle 1"},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        # Try to create duplicate
        response = requests.post(
            f"{BASE_URL}/api/fleet/gps/devices",
            json={"imei": TEST_IMEI_1, "vehicleName": "Duplicate Vehicle"},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        assert response.status_code == 409, f"Expected 409, got {response.status_code}: {response.text}"
        print("PASS: Duplicate IMEI returns 409")
    
    def test_list_devices(self, auth_token):
        """Test listing all GPS devices"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/devices",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "devices" in data, f"Response missing 'devices' field: {data}"
        assert "count" in data, f"Response missing 'count' field: {data}"
        assert isinstance(data["devices"], list), f"Expected devices to be list, got {type(data['devices'])}"
        print(f"PASS: List devices returns {data['count']} devices")
    
    def test_list_devices_enriched_with_position(self, auth_token):
        """Test that listed devices include lastPosition field"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/devices",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Check if any device has lastPosition (may be null if no GPS data yet)
        for device in data.get("devices", []):
            assert "lastPosition" in device, f"Device missing lastPosition field: {device}"
        print("PASS: Devices include lastPosition field")
    
    def test_update_device(self, auth_token):
        """Test updating a GPS device"""
        # First ensure device exists
        requests.post(
            f"{BASE_URL}/api/fleet/gps/devices",
            json={"imei": TEST_IMEI_1, "vehicleName": "Original Name"},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        # Update device
        response = requests.put(
            f"{BASE_URL}/api/fleet/gps/devices/{TEST_IMEI_1}",
            json={
                "vehicleName": "Updated Vehicle Name",
                "licensePlate": "UPDATED-001",
                "driverName": "Updated Driver"
            },
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True, f"Expected success=True, got {data}"
        device = data.get("device", {})
        assert device.get("vehicleName") == "Updated Vehicle Name", f"Expected updated vehicleName, got {device}"
        print(f"PASS: Device updated successfully, vehicleName={device.get('vehicleName')}")
    
    def test_update_nonexistent_device_returns_404(self, auth_token):
        """Test updating non-existent device returns 404"""
        response = requests.put(
            f"{BASE_URL}/api/fleet/gps/devices/NONEXISTENT_IMEI_999",
            json={"vehicleName": "Should Fail"},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        print("PASS: Update non-existent device returns 404")
    
    def test_delete_device(self, auth_token):
        """Test deleting a GPS device"""
        # First create a device to delete
        requests.post(
            f"{BASE_URL}/api/fleet/gps/devices",
            json={"imei": TEST_IMEI_2, "vehicleName": "To Be Deleted"},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        # Delete device
        response = requests.delete(
            f"{BASE_URL}/api/fleet/gps/devices/{TEST_IMEI_2}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True, f"Expected success=True, got {data}"
        print(f"PASS: Device deleted successfully")
        
        # Verify device is gone
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/devices",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        devices = response.json().get("devices", [])
        imeis = [d.get("imei") for d in devices]
        assert TEST_IMEI_2 not in imeis, f"Device {TEST_IMEI_2} still exists after deletion"
        print("PASS: Device verified deleted from list")
    
    def test_delete_nonexistent_device_returns_404(self, auth_token):
        """Test deleting non-existent device returns 404"""
        response = requests.delete(
            f"{BASE_URL}/api/fleet/gps/devices/NONEXISTENT_IMEI_999",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        print("PASS: Delete non-existent device returns 404")


class TestGPSPositions:
    """GPS Position endpoint tests"""
    
    def test_get_all_positions(self, auth_token):
        """Test getting latest positions for all devices"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/positions",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "positions" in data, f"Response missing 'positions' field: {data}"
        assert "count" in data, f"Response missing 'count' field: {data}"
        print(f"PASS: Get all positions returns {data['count']} positions")
    
    def test_get_device_position(self, auth_token):
        """Test getting position for specific device"""
        # First ensure device exists
        requests.post(
            f"{BASE_URL}/api/fleet/gps/devices",
            json={"imei": TEST_IMEI_1, "vehicleName": "Position Test"},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        # Get position
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/positions/{TEST_IMEI_1}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "device" in data, f"Response missing 'device' field: {data}"
        assert "position" in data, f"Response missing 'position' field: {data}"
        print(f"PASS: Get device position returns device and position data")
    
    def test_get_position_nonexistent_device_returns_404(self, auth_token):
        """Test getting position for non-existent device returns 404"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/positions/NONEXISTENT_IMEI_999",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        print("PASS: Get position for non-existent device returns 404")


class TestGPSHistory:
    """GPS History endpoint tests"""
    
    def test_get_device_history(self, auth_token):
        """Test getting position history for a device"""
        # First ensure device exists
        requests.post(
            f"{BASE_URL}/api/fleet/gps/devices",
            json={"imei": TEST_IMEI_1, "vehicleName": "History Test"},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}"
            }
        )
        # Get history
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=1)).isoformat()
        end = now.isoformat()
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/{TEST_IMEI_1}",
            params={"start": start, "end": end},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "device" in data, f"Response missing 'device' field: {data}"
        assert "history" in data, f"Response missing 'history' field: {data}"
        assert "count" in data, f"Response missing 'count' field: {data}"
        assert "period" in data, f"Response missing 'period' field: {data}"
        print(f"PASS: Get device history returns {data['count']} positions")
    
    def test_get_history_nonexistent_device_returns_404(self, auth_token):
        """Test getting history for non-existent device returns 404"""
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=1)).isoformat()
        end = now.isoformat()
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/history/NONEXISTENT_IMEI_999",
            params={"start": start, "end": end},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        print("PASS: Get history for non-existent device returns 404")


class TestGPSStats:
    """GPS Stats endpoint tests"""
    
    def test_get_stats(self, auth_token):
        """Test getting GPS system stats"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "devices" in data, f"Response missing 'devices' field: {data}"
        assert "online" in data, f"Response missing 'online' field: {data}"
        assert "offline" in data, f"Response missing 'offline' field: {data}"
        assert "totalPositions" in data, f"Response missing 'totalPositions' field: {data}"
        print(f"PASS: Get stats returns devices={data['devices']}, online={data['online']}, offline={data['offline']}, totalPositions={data['totalPositions']}")


class TestGPSWebhookInfo:
    """GPS Webhook Info endpoint tests"""
    
    def test_get_webhook_info(self, auth_token):
        """Test getting webhook configuration info"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/webhook-info",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "webhookUrl" in data, f"Response missing 'webhookUrl' field: {data}"
        assert "batchWebhookUrl" in data, f"Response missing 'batchWebhookUrl' field: {data}"
        assert "apiKeyMasked" in data, f"Response missing 'apiKeyMasked' field: {data}"
        assert "headerName" in data, f"Response missing 'headerName' field: {data}"
        assert "format" in data, f"Response missing 'format' field: {data}"
        assert data["headerName"] == "X-GPS-API-Key", f"Expected headerName='X-GPS-API-Key', got {data['headerName']}"
        print(f"PASS: Get webhook info returns webhookUrl={data['webhookUrl']}")


class TestGPSStream:
    """GPS SSE Stream endpoint tests"""
    
    def test_stream_endpoint_responds(self, auth_token):
        """Test SSE stream endpoint responds with correct content type"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/stream",
            headers={"Authorization": f"Bearer {auth_token}"},
            stream=True,
            timeout=5
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert "text/event-stream" in response.headers.get("Content-Type", ""), \
            f"Expected Content-Type to contain 'text/event-stream', got {response.headers.get('Content-Type')}"
        # Close the stream after verifying headers
        response.close()
        print("PASS: SSE stream endpoint responds with correct content type")


class TestGPSAuthRequired:
    """Test that authenticated endpoints require Bearer token"""
    
    def test_devices_requires_auth(self):
        """Test GET /devices requires auth"""
        response = requests.get(f"{BASE_URL}/api/fleet/gps/devices")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: GET /devices requires auth")
    
    def test_positions_requires_auth(self):
        """Test GET /positions requires auth"""
        response = requests.get(f"{BASE_URL}/api/fleet/gps/positions")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: GET /positions requires auth")
    
    def test_stats_requires_auth(self):
        """Test GET /stats requires auth"""
        response = requests.get(f"{BASE_URL}/api/fleet/gps/stats")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: GET /stats requires auth")
    
    def test_webhook_info_requires_auth(self):
        """Test GET /webhook-info requires auth"""
        response = requests.get(f"{BASE_URL}/api/fleet/gps/webhook-info")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: GET /webhook-info requires auth")


class TestCleanup:
    """Cleanup test data after all tests"""
    
    def test_cleanup_test_devices(self, auth_token):
        """Clean up test devices created during testing"""
        # Get all devices
        response = requests.get(
            f"{BASE_URL}/api/fleet/gps/devices",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        if response.status_code == 200:
            devices = response.json().get("devices", [])
            deleted_count = 0
            for device in devices:
                imei = device.get("imei", "")
                if imei.startswith(TEST_IMEI_PREFIX):
                    del_response = requests.delete(
                        f"{BASE_URL}/api/fleet/gps/devices/{imei}",
                        headers={"Authorization": f"Bearer {auth_token}"}
                    )
                    if del_response.status_code == 200:
                        deleted_count += 1
            print(f"PASS: Cleanup completed, deleted {deleted_count} test devices")
        else:
            print(f"WARN: Could not list devices for cleanup: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
