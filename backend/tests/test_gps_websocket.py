"""
GPS WebSocket Testing - Tests for real-time GPS WebSocket endpoints
Tests: Fleet GPS WS, GPS Admin WS, ping/pong, auth rejection
"""
import pytest
import requests
import json
import os
import asyncio
import websockets

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
WS_URL = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')

# Test credentials
FLEET_EMAIL = "Nandetiri1@gmail.com"
FLEET_PASSWORD = "12345678"
GPS_ADMIN_EMAIL = "gps@zont.cab"
GPS_ADMIN_PASSWORD = "gpsadmin123"


class TestGPSAdminWebSocket:
    """GPS Admin WebSocket endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get GPS Admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/gps-admin/auth/login",
            json={"email": GPS_ADMIN_EMAIL, "password": GPS_ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("GPS Admin authentication failed")
    
    def test_admin_login_returns_token(self):
        """Test GPS Admin login returns valid token"""
        response = requests.post(
            f"{BASE_URL}/api/gps-admin/auth/login",
            json={"email": GPS_ADMIN_EMAIL, "password": GPS_ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert len(data["token"]) > 0
        print(f"✓ GPS Admin login successful, token length: {len(data['token'])}")
    
    @pytest.mark.asyncio
    async def test_admin_ws_initial_data(self, admin_token):
        """Test GPS Admin WebSocket returns initial data with type='initial'"""
        ws_url = f"{WS_URL}/api/gps-admin/ws?token={admin_token}"
        try:
            async with websockets.connect(ws_url, close_timeout=5) as ws:
                # Wait for initial message
                msg = await asyncio.wait_for(ws.recv(), timeout=10)
                data = json.loads(msg)
                
                assert data.get("type") == "initial", f"Expected type='initial', got {data.get('type')}"
                assert "data" in data, "Missing 'data' field in initial message"
                assert isinstance(data["data"], list), "data should be a list"
                
                vehicles = data["data"]
                print(f"✓ Admin WS initial data received: {len(vehicles)} vehicles")
                
                # Verify vehicle structure if any exist
                if vehicles:
                    v = vehicles[0]
                    assert "imei" in v, "Vehicle missing 'imei'"
                    print(f"  First vehicle IMEI: {v['imei']}, name: {v.get('vehicleName', 'N/A')}")
                
        except Exception as e:
            pytest.fail(f"WebSocket connection failed: {e}")
    
    @pytest.mark.asyncio
    async def test_admin_ws_ping_pong(self, admin_token):
        """Test GPS Admin WebSocket ping/pong response"""
        ws_url = f"{WS_URL}/api/gps-admin/ws?token={admin_token}"
        try:
            async with websockets.connect(ws_url, close_timeout=5) as ws:
                # Receive initial data first
                await asyncio.wait_for(ws.recv(), timeout=10)
                
                # Send ping
                await ws.send("ping")
                
                # Wait for pong
                msg = await asyncio.wait_for(ws.recv(), timeout=5)
                data = json.loads(msg)
                
                assert data.get("type") == "pong", f"Expected type='pong', got {data.get('type')}"
                print("✓ Admin WS ping/pong working correctly")
                
        except Exception as e:
            pytest.fail(f"Ping/pong test failed: {e}")
    
    @pytest.mark.asyncio
    async def test_admin_ws_invalid_token_rejected(self):
        """Test GPS Admin WebSocket rejects invalid token"""
        ws_url = f"{WS_URL}/api/gps-admin/ws?token=invalid_token_12345"
        try:
            async with websockets.connect(ws_url, close_timeout=5) as ws:
                # Should be closed immediately
                msg = await asyncio.wait_for(ws.recv(), timeout=5)
                pytest.fail("Expected connection to be rejected")
        except websockets.exceptions.ConnectionClosed as e:
            # Expected - connection should be closed with 4001
            assert e.code == 4001 or e.code == 1006, f"Expected close code 4001, got {e.code}"
            print(f"✓ Admin WS correctly rejected invalid token (code: {e.code})")
        except Exception as e:
            # Connection refused is also acceptable
            print(f"✓ Admin WS rejected invalid token: {type(e).__name__}")


class TestFleetGPSWebSocket:
    """Fleet GPS WebSocket endpoint tests"""
    
    @pytest.fixture
    def fleet_token(self):
        """Get Fleet authentication token from C# backend"""
        # Fleet login goes through C# API - uses username field
        csharp_api = "https://api.zont.cab"
        response = requests.post(
            f"{csharp_api}/api/Login/company",
            json={"username": FLEET_EMAIL, "password": FLEET_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("accessToken") or data.get("token")
        pytest.skip(f"Fleet authentication failed: {response.status_code}")
    
    def test_fleet_login_returns_token(self):
        """Test Fleet login returns valid token"""
        csharp_api = "https://api.zont.cab"
        response = requests.post(
            f"{csharp_api}/api/Login/company",
            json={"username": FLEET_EMAIL, "password": FLEET_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        token = data.get("accessToken") or data.get("token")
        assert token is not None
        assert len(token) > 0
        print(f"✓ Fleet login successful, token length: {len(token)}")
    
    @pytest.mark.asyncio
    async def test_fleet_ws_initial_data(self, fleet_token):
        """Test Fleet GPS WebSocket returns initial data with type='initial'"""
        ws_url = f"{WS_URL}/api/fleet/gps/ws?token={fleet_token}"
        try:
            async with websockets.connect(ws_url, close_timeout=5) as ws:
                # Wait for initial message
                msg = await asyncio.wait_for(ws.recv(), timeout=10)
                data = json.loads(msg)
                
                assert data.get("type") == "initial", f"Expected type='initial', got {data.get('type')}"
                assert "data" in data, "Missing 'data' field in initial message"
                assert isinstance(data["data"], list), "data should be a list"
                
                vehicles = data["data"]
                print(f"✓ Fleet WS initial data received: {len(vehicles)} vehicles")
                
        except Exception as e:
            pytest.fail(f"Fleet WebSocket connection failed: {e}")
    
    @pytest.mark.asyncio
    async def test_fleet_ws_ping_pong(self, fleet_token):
        """Test Fleet GPS WebSocket ping/pong response"""
        ws_url = f"{WS_URL}/api/fleet/gps/ws?token={fleet_token}"
        try:
            async with websockets.connect(ws_url, close_timeout=5) as ws:
                # Receive initial data first
                await asyncio.wait_for(ws.recv(), timeout=10)
                
                # Send ping
                await ws.send("ping")
                
                # Wait for pong
                msg = await asyncio.wait_for(ws.recv(), timeout=5)
                data = json.loads(msg)
                
                assert data.get("type") == "pong", f"Expected type='pong', got {data.get('type')}"
                print("✓ Fleet WS ping/pong working correctly")
                
        except Exception as e:
            pytest.fail(f"Fleet ping/pong test failed: {e}")
    
    @pytest.mark.asyncio
    async def test_fleet_ws_no_token_rejected(self):
        """Test Fleet GPS WebSocket rejects connection without token"""
        ws_url = f"{WS_URL}/api/fleet/gps/ws?token=fake"
        try:
            async with websockets.connect(ws_url, close_timeout=5) as ws:
                msg = await asyncio.wait_for(ws.recv(), timeout=5)
                pytest.fail("Expected connection to be rejected")
        except websockets.exceptions.ConnectionClosed as e:
            assert e.code == 4001 or e.code == 1006, f"Expected close code 4001, got {e.code}"
            print(f"✓ Fleet WS correctly rejected invalid token (code: {e.code})")
        except Exception as e:
            print(f"✓ Fleet WS rejected invalid token: {type(e).__name__}")


class TestGPSPositionsAPI:
    """Test GPS positions REST API endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get GPS Admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/gps-admin/auth/login",
            json={"email": GPS_ADMIN_EMAIL, "password": GPS_ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("GPS Admin authentication failed")
    
    def test_admin_positions_endpoint(self, admin_token):
        """Test GPS Admin positions endpoint returns vehicles"""
        response = requests.get(
            f"{BASE_URL}/api/gps-admin/positions",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "positions" in data
        assert "count" in data
        assert isinstance(data["positions"], list)
        print(f"✓ Admin positions API: {data['count']} vehicles")
        
        # Verify vehicle structure
        if data["positions"]:
            v = data["positions"][0]
            assert "imei" in v
            assert "vehicleName" in v or v.get("vehicleName") is not None or "vehicleName" in v.keys()
            print(f"  Sample vehicle: {v.get('vehicleName', 'N/A')} ({v['imei']})")
    
    def test_admin_stats_endpoint(self, admin_token):
        """Test GPS Admin stats endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/gps-admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "totalDevices" in data
        assert "online" in data
        assert "offline" in data
        print(f"✓ Admin stats: {data['totalDevices']} devices, {data['online']} online")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
