"""
Driver Portal API Tests
Tests dual authentication (C# + local), missions, profile endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from review request
CSHARP_DRIVER_EMAIL = "nandetiri1@gmail.com"
CSHARP_DRIVER_PASSWORD = "12345678"


class TestDriverLogin:
    """Test driver authentication endpoints"""
    
    def test_csharp_driver_login_success(self):
        """C# driver login should succeed and return driverType='csharp'"""
        response = requests.post(
            f"{BASE_URL}/api/driver/auth/login",
            json={"username": CSHARP_DRIVER_EMAIL, "password": CSHARP_DRIVER_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        print(f"Login response status: {response.status_code}")
        print(f"Login response: {response.text[:500]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "accessToken" in data, "Response should contain accessToken"
        assert data.get("driverType") == "csharp", f"Expected driverType='csharp', got {data.get('driverType')}"
        assert "driver" in data, "Response should contain driver object"
        
        driver = data["driver"]
        assert "id" in driver, "Driver should have id"
        assert "firstName" in driver, "Driver should have firstName"
        assert "email" in driver, "Driver should have email"
        
    def test_driver_login_invalid_credentials(self):
        """Login with invalid credentials should fail"""
        response = requests.post(
            f"{BASE_URL}/api/driver/auth/login",
            json={"username": "invalid@test.com", "password": "wrongpassword"},
            headers={"Content-Type": "application/json"}
        )
        print(f"Invalid login response: {response.status_code}")
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"


class TestDriverMissions:
    """Test driver missions endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for C# driver"""
        response = requests.post(
            f"{BASE_URL}/api/driver/auth/login",
            json={"username": CSHARP_DRIVER_EMAIL, "password": CSHARP_DRIVER_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code != 200:
            pytest.skip("Could not authenticate driver")
        data = response.json()
        return data.get("accessToken"), data.get("driverType")
    
    def test_get_scheduled_missions(self, auth_token):
        """GET /api/driver/missions?tab=scheduled should return missions"""
        token, driver_type = auth_token
        response = requests.get(
            f"{BASE_URL}/api/driver/missions?tab=scheduled",
            headers={
                "Authorization": f"Bearer {token}",
                "X-Driver-Type": driver_type
            }
        )
        print(f"Scheduled missions response: {response.status_code}")
        print(f"Missions data: {response.text[:1000]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "missions" in data, "Response should contain missions array"
        assert "count" in data, "Response should contain count"
        assert isinstance(data["missions"], list), "missions should be a list"
        
        # Check mission structure if any exist
        if data["missions"]:
            mission = data["missions"][0]
            assert "id" in mission, "Mission should have id"
            assert "source" in mission, "Mission should have source (zont or company)"
            assert mission["source"] in ["zont", "company"], f"Invalid source: {mission['source']}"
            
            # Verify Zont missions have price, company missions don't
            for m in data["missions"]:
                if m["source"] == "zont":
                    # Zont missions should have currentPrice field
                    assert "currentPrice" in m, "Zont mission should have currentPrice"
                    print(f"Zont mission {m['id']}: price={m.get('currentPrice')}")
                elif m["source"] == "company":
                    # Company missions should NOT expose price
                    print(f"Company mission {m['id']}: source=company (no price shown)")
    
    def test_get_history_missions(self, auth_token):
        """GET /api/driver/missions?tab=history should return past missions"""
        token, driver_type = auth_token
        response = requests.get(
            f"{BASE_URL}/api/driver/missions?tab=history",
            headers={
                "Authorization": f"Bearer {token}",
                "X-Driver-Type": driver_type
            }
        )
        print(f"History missions response: {response.status_code}")
        print(f"History data: {response.text[:1000]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "missions" in data, "Response should contain missions array"
        assert isinstance(data["missions"], list), "missions should be a list"
    
    def test_missions_without_auth(self):
        """Missions endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/driver/missions?tab=scheduled")
        print(f"No auth response: {response.status_code}")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestDriverProfile:
    """Test driver profile endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for C# driver"""
        response = requests.post(
            f"{BASE_URL}/api/driver/auth/login",
            json={"username": CSHARP_DRIVER_EMAIL, "password": CSHARP_DRIVER_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code != 200:
            pytest.skip("Could not authenticate driver")
        data = response.json()
        return data.get("accessToken"), data.get("driverType")
    
    def test_get_driver_profile(self, auth_token):
        """GET /api/driver/profile should return driver info including company name"""
        token, driver_type = auth_token
        response = requests.get(
            f"{BASE_URL}/api/driver/profile",
            headers={
                "Authorization": f"Bearer {token}",
                "X-Driver-Type": driver_type
            }
        )
        print(f"Profile response: {response.status_code}")
        print(f"Profile data: {response.text[:500]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Profile should have id"
        assert "firstName" in data, "Profile should have firstName"
        assert "lastName" in data, "Profile should have lastName"
        assert "email" in data, "Profile should have email"
        assert "companyName" in data, "Profile should have companyName"
        assert "driverType" in data, "Profile should have driverType"
        
        print(f"Driver: {data.get('firstName')} {data.get('lastName')}")
        print(f"Company: {data.get('companyName')}")
        print(f"Type: {data.get('driverType')}")
    
    def test_profile_without_auth(self):
        """Profile endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/driver/profile")
        print(f"No auth response: {response.status_code}")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestFleetBookingsFilter:
    """Test fleet bookings filter - should only show ApprovedByAdmin with future dates"""
    
    @pytest.fixture
    def fleet_auth_token(self):
        """Get authentication token for fleet admin"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/auth/login",
            json={"username": "Nandetiri1@gmail.com", "password": "12345678"},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code != 200:
            pytest.skip("Could not authenticate fleet admin")
        return response.json().get("accessToken")
    
    def test_fleet_bookings_only_approved_by_admin(self, fleet_auth_token):
        """GET /api/fleet/bookings should only return ApprovedByAdmin auctions with future dates"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/bookings",
            headers={"Authorization": f"Bearer {fleet_auth_token}"}
        )
        print(f"Fleet bookings response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify all returned bookings have ApprovedByAdmin status
        for booking in data:
            status = booking.get("status", "")
            print(f"Booking {booking.get('id')}: status={status}")
            # Should only be ApprovedByAdmin (no 'New' status)
            assert status == "ApprovedByAdmin", f"Expected ApprovedByAdmin, got {status}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
