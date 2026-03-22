"""
GPS Admin Portal Backend API Tests
Tests for GPS Admin authentication, companies CRUD, devices CRUD, and positions
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
GPS_ADMIN_EMAIL = "gps@zont.cab"
GPS_ADMIN_PASSWORD = "gpsadmin123"


class TestGpsAdminAuth:
    """GPS Admin Authentication Tests"""
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/gps-admin/auth/login", json={
            "email": GPS_ADMIN_EMAIL,
            "password": GPS_ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "Token not in response"
        assert "user" in data, "User not in response"
        assert data["user"]["email"] == GPS_ADMIN_EMAIL
        print(f"Login successful, token received")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/gps-admin/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("Invalid credentials correctly rejected")
    
    def test_auth_me_with_token(self):
        """Test /auth/me endpoint with valid token"""
        # First login
        login_res = requests.post(f"{BASE_URL}/api/gps-admin/auth/login", json={
            "email": GPS_ADMIN_EMAIL,
            "password": GPS_ADMIN_PASSWORD
        })
        token = login_res.json()["token"]
        
        # Then get me
        response = requests.get(f"{BASE_URL}/api/gps-admin/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200, f"Auth/me failed: {response.text}"
        data = response.json()
        assert data["email"] == GPS_ADMIN_EMAIL
        print(f"Auth/me successful: {data}")
    
    def test_auth_me_without_token(self):
        """Test /auth/me endpoint without token"""
        response = requests.get(f"{BASE_URL}/api/gps-admin/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("Unauthorized access correctly rejected")


@pytest.fixture(scope="class")
def auth_token():
    """Get authentication token for tests"""
    response = requests.post(f"{BASE_URL}/api/gps-admin/auth/login", json={
        "email": GPS_ADMIN_EMAIL,
        "password": GPS_ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["token"]
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="class")
def auth_headers(auth_token):
    """Get headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


class TestGpsAdminStats:
    """GPS Admin Dashboard Stats Tests"""
    
    def test_get_stats(self, auth_headers):
        """Test getting dashboard stats"""
        response = requests.get(f"{BASE_URL}/api/gps-admin/stats", headers=auth_headers)
        assert response.status_code == 200, f"Stats failed: {response.text}"
        data = response.json()
        
        # Verify all required fields
        required_fields = ["totalDevices", "assigned", "unassigned", "online", "offline", "totalCompanies"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"Stats: {data}")
    
    def test_stats_without_auth(self):
        """Test stats endpoint without authentication"""
        response = requests.get(f"{BASE_URL}/api/gps-admin/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestGpsAdminCompanies:
    """GPS Admin Companies CRUD Tests"""
    
    def test_list_companies(self, auth_headers):
        """Test listing all companies"""
        response = requests.get(f"{BASE_URL}/api/gps-admin/companies", headers=auth_headers)
        assert response.status_code == 200, f"List companies failed: {response.text}"
        data = response.json()
        assert "companies" in data, "Companies array not in response"
        assert "count" in data, "Count not in response"
        print(f"Found {data['count']} companies")
    
    def test_create_company(self, auth_headers):
        """Test creating a new company"""
        unique_id = f"TEST_{uuid.uuid4().hex[:8]}"
        company_data = {
            "name": f"Test Company {unique_id}",
            "companyId": unique_id,
            "contactEmail": f"test_{unique_id}@example.com",
            "phone": "+33123456789",
            "maxDevices": 25
        }
        
        response = requests.post(f"{BASE_URL}/api/gps-admin/companies", 
                                 headers=auth_headers, json=company_data)
        assert response.status_code == 200, f"Create company failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["company"]["name"] == company_data["name"]
        assert data["company"]["companyId"] == unique_id
        print(f"Created company: {data['company']['name']}")
        
        # Verify by GET
        list_res = requests.get(f"{BASE_URL}/api/gps-admin/companies", headers=auth_headers)
        companies = list_res.json()["companies"]
        found = any(c["companyId"] == unique_id for c in companies)
        assert found, "Created company not found in list"
        
        # Cleanup - delete the test company
        company_id = data["company"]["id"]
        requests.delete(f"{BASE_URL}/api/gps-admin/companies/{company_id}", headers=auth_headers)
    
    def test_create_duplicate_company(self, auth_headers):
        """Test creating a company with duplicate companyId"""
        unique_id = f"TEST_DUP_{uuid.uuid4().hex[:8]}"
        company_data = {
            "name": f"Test Company {unique_id}",
            "companyId": unique_id,
            "contactEmail": "test@example.com",
            "maxDevices": 10
        }
        
        # Create first
        res1 = requests.post(f"{BASE_URL}/api/gps-admin/companies", 
                            headers=auth_headers, json=company_data)
        assert res1.status_code == 200
        company_id = res1.json()["company"]["id"]
        
        # Try to create duplicate
        res2 = requests.post(f"{BASE_URL}/api/gps-admin/companies", 
                            headers=auth_headers, json=company_data)
        assert res2.status_code == 409, f"Expected 409 for duplicate, got {res2.status_code}"
        print("Duplicate company correctly rejected")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/gps-admin/companies/{company_id}", headers=auth_headers)
    
    def test_update_company(self, auth_headers):
        """Test updating a company"""
        # Create a company first
        unique_id = f"TEST_UPD_{uuid.uuid4().hex[:8]}"
        create_res = requests.post(f"{BASE_URL}/api/gps-admin/companies", 
                                   headers=auth_headers, json={
            "name": f"Original Name {unique_id}",
            "companyId": unique_id,
            "maxDevices": 10
        })
        company_id = create_res.json()["company"]["id"]
        
        # Update
        update_res = requests.put(f"{BASE_URL}/api/gps-admin/companies/{company_id}", 
                                  headers=auth_headers, json={
            "name": "Updated Name",
            "maxDevices": 100
        })
        assert update_res.status_code == 200, f"Update failed: {update_res.text}"
        data = update_res.json()
        assert data["company"]["name"] == "Updated Name"
        assert data["company"]["maxDevices"] == 100
        print("Company updated successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/gps-admin/companies/{company_id}", headers=auth_headers)
    
    def test_delete_company(self, auth_headers):
        """Test deleting a company"""
        # Create a company first
        unique_id = f"TEST_DEL_{uuid.uuid4().hex[:8]}"
        create_res = requests.post(f"{BASE_URL}/api/gps-admin/companies", 
                                   headers=auth_headers, json={
            "name": f"To Delete {unique_id}",
            "companyId": unique_id,
            "maxDevices": 10
        })
        company_id = create_res.json()["company"]["id"]
        
        # Delete
        delete_res = requests.delete(f"{BASE_URL}/api/gps-admin/companies/{company_id}", 
                                     headers=auth_headers)
        assert delete_res.status_code == 200, f"Delete failed: {delete_res.text}"
        
        # Verify deleted
        list_res = requests.get(f"{BASE_URL}/api/gps-admin/companies", headers=auth_headers)
        companies = list_res.json()["companies"]
        found = any(c["id"] == company_id for c in companies)
        assert not found, "Deleted company still in list"
        print("Company deleted successfully")


class TestGpsAdminDevices:
    """GPS Admin Devices CRUD Tests"""
    
    def test_list_devices(self, auth_headers):
        """Test listing all devices"""
        response = requests.get(f"{BASE_URL}/api/gps-admin/devices", headers=auth_headers)
        assert response.status_code == 200, f"List devices failed: {response.text}"
        data = response.json()
        assert "devices" in data, "Devices array not in response"
        assert "count" in data, "Count not in response"
        print(f"Found {data['count']} devices")
        
        # Verify device structure if devices exist
        if data["count"] > 0:
            device = data["devices"][0]
            assert "imei" in device, "IMEI not in device"
            print(f"First device IMEI: {device['imei']}")
    
    def test_create_device(self, auth_headers):
        """Test creating a new device"""
        unique_imei = f"TEST{uuid.uuid4().hex[:12].upper()}"
        device_data = {
            "imei": unique_imei,
            "vehicleName": "Test Vehicle",
            "licensePlate": "TEST-123",
            "driverName": "Test Driver"
        }
        
        response = requests.post(f"{BASE_URL}/api/gps-admin/devices", 
                                 headers=auth_headers, json=device_data)
        assert response.status_code == 200, f"Create device failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["device"]["imei"] == unique_imei
        print(f"Created device: {unique_imei}")
        
        # Verify by GET
        list_res = requests.get(f"{BASE_URL}/api/gps-admin/devices", headers=auth_headers)
        devices = list_res.json()["devices"]
        found = any(d["imei"] == unique_imei for d in devices)
        assert found, "Created device not found in list"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/gps-admin/devices/{unique_imei}", headers=auth_headers)
    
    def test_create_duplicate_device(self, auth_headers):
        """Test creating a device with duplicate IMEI"""
        unique_imei = f"TESTDUP{uuid.uuid4().hex[:8].upper()}"
        device_data = {"imei": unique_imei, "vehicleName": "Test"}
        
        # Create first
        res1 = requests.post(f"{BASE_URL}/api/gps-admin/devices", 
                            headers=auth_headers, json=device_data)
        assert res1.status_code == 200
        
        # Try to create duplicate
        res2 = requests.post(f"{BASE_URL}/api/gps-admin/devices", 
                            headers=auth_headers, json=device_data)
        assert res2.status_code == 409, f"Expected 409 for duplicate, got {res2.status_code}"
        print("Duplicate device correctly rejected")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/gps-admin/devices/{unique_imei}", headers=auth_headers)
    
    def test_update_device(self, auth_headers):
        """Test updating a device"""
        unique_imei = f"TESTUPD{uuid.uuid4().hex[:8].upper()}"
        
        # Create device
        requests.post(f"{BASE_URL}/api/gps-admin/devices", 
                     headers=auth_headers, json={"imei": unique_imei, "vehicleName": "Original"})
        
        # Update
        update_res = requests.put(f"{BASE_URL}/api/gps-admin/devices/{unique_imei}", 
                                  headers=auth_headers, json={
            "vehicleName": "Updated Vehicle",
            "licensePlate": "UPD-999",
            "driverName": "Updated Driver"
        })
        assert update_res.status_code == 200, f"Update failed: {update_res.text}"
        data = update_res.json()
        assert data["device"]["vehicleName"] == "Updated Vehicle"
        print("Device updated successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/gps-admin/devices/{unique_imei}", headers=auth_headers)
    
    def test_delete_device(self, auth_headers):
        """Test deleting a device"""
        unique_imei = f"TESTDEL{uuid.uuid4().hex[:8].upper()}"
        
        # Create device
        requests.post(f"{BASE_URL}/api/gps-admin/devices", 
                     headers=auth_headers, json={"imei": unique_imei})
        
        # Delete
        delete_res = requests.delete(f"{BASE_URL}/api/gps-admin/devices/{unique_imei}", 
                                     headers=auth_headers)
        assert delete_res.status_code == 200, f"Delete failed: {delete_res.text}"
        
        # Verify deleted
        list_res = requests.get(f"{BASE_URL}/api/gps-admin/devices", headers=auth_headers)
        devices = list_res.json()["devices"]
        found = any(d["imei"] == unique_imei for d in devices)
        assert not found, "Deleted device still in list"
        print("Device deleted successfully")


class TestGpsAdminAssignment:
    """GPS Admin Device Assignment Tests"""
    
    def test_assign_device_to_company(self, auth_headers):
        """Test assigning a device to a company"""
        # Create company
        company_id_str = f"TEST_ASSIGN_{uuid.uuid4().hex[:8]}"
        company_res = requests.post(f"{BASE_URL}/api/gps-admin/companies", 
                                    headers=auth_headers, json={
            "name": f"Assign Test Company",
            "companyId": company_id_str,
            "maxDevices": 10
        })
        company_internal_id = company_res.json()["company"]["id"]
        
        # Create device
        unique_imei = f"TESTASSIGN{uuid.uuid4().hex[:6].upper()}"
        requests.post(f"{BASE_URL}/api/gps-admin/devices", 
                     headers=auth_headers, json={"imei": unique_imei})
        
        # Assign device to company
        assign_res = requests.put(f"{BASE_URL}/api/gps-admin/devices/{unique_imei}/assign", 
                                  headers=auth_headers, json={"companyId": company_id_str})
        assert assign_res.status_code == 200, f"Assign failed: {assign_res.text}"
        data = assign_res.json()
        assert data["device"]["companyId"] == company_id_str
        assert data["device"]["companyName"] == "Assign Test Company"
        print(f"Device {unique_imei} assigned to company {company_id_str}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/gps-admin/devices/{unique_imei}", headers=auth_headers)
        requests.delete(f"{BASE_URL}/api/gps-admin/companies/{company_internal_id}", headers=auth_headers)
    
    def test_unassign_device(self, auth_headers):
        """Test unassigning a device from a company"""
        # Create company
        company_id_str = f"TEST_UNASSIGN_{uuid.uuid4().hex[:8]}"
        company_res = requests.post(f"{BASE_URL}/api/gps-admin/companies", 
                                    headers=auth_headers, json={
            "name": f"Unassign Test Company",
            "companyId": company_id_str,
            "maxDevices": 10
        })
        company_internal_id = company_res.json()["company"]["id"]
        
        # Create device and assign
        unique_imei = f"TESTUNASSIGN{uuid.uuid4().hex[:4].upper()}"
        requests.post(f"{BASE_URL}/api/gps-admin/devices", 
                     headers=auth_headers, json={"imei": unique_imei, "companyId": company_id_str})
        
        # Unassign
        unassign_res = requests.put(f"{BASE_URL}/api/gps-admin/devices/{unique_imei}/unassign", 
                                    headers=auth_headers)
        assert unassign_res.status_code == 200, f"Unassign failed: {unassign_res.text}"
        data = unassign_res.json()
        assert data["device"]["companyId"] is None
        print(f"Device {unique_imei} unassigned")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/gps-admin/devices/{unique_imei}", headers=auth_headers)
        requests.delete(f"{BASE_URL}/api/gps-admin/companies/{company_internal_id}", headers=auth_headers)


class TestGpsAdminPositions:
    """GPS Admin Positions Tests"""
    
    def test_get_positions(self, auth_headers):
        """Test getting all positions"""
        response = requests.get(f"{BASE_URL}/api/gps-admin/positions", headers=auth_headers)
        assert response.status_code == 200, f"Get positions failed: {response.text}"
        data = response.json()
        assert "positions" in data, "Positions array not in response"
        assert "count" in data, "Count not in response"
        print(f"Found {data['count']} positions")
    
    def test_positions_without_auth(self):
        """Test positions endpoint without authentication"""
        response = requests.get(f"{BASE_URL}/api/gps-admin/positions")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
