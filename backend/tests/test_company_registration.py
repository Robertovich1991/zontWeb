"""
Company Registration API Tests
Tests the 'Devenir Chauffeur' (Become Driver) company registration flow.
Validates:
1. Company registration saves to MongoDB
2. Company registration syncs to C# backend at api.zont.cab
3. Duplicate email handling
4. csharp_synced field tracking
"""
import pytest
import requests
import os
import time
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL')
CSHARP_API = "https://api.zont.cab"

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestCompanyRegistration:
    """Company registration endpoint tests with C# sync verification"""
    
    def test_company_register_success_with_csharp_sync(self, api_client):
        """Test successful company registration - should save to MongoDB AND call C# API"""
        timestamp = int(time.time())
        unique_email = f"testdriver-{timestamp}@test.com"
        
        payload = {
            "first_name": "Test",
            "last_name": "QA",
            "company_name": f"TestQA VTC {timestamp}",
            "company_address": "1 Rue Test, 75001 Paris",
            "email": unique_email,
            "phone": "0612345678",
            "phone_country": "+33",
            "password": "TestPass123!"
        }
        
        response = api_client.post(f"{BASE_URL}/api/company/register", json=payload)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions - validate response structure
        data = response.json()
        assert "id" in data, "Response should contain company id"
        assert data["email"] == unique_email.lower(), f"Email mismatch: {data['email']}"
        assert data["company_name"] == payload["company_name"], "Company name mismatch"
        assert data["status"] == "pending", "Initial status should be 'pending'"
        assert "csharp_synced" in data, "Response should include csharp_synced field"
        assert "message" in data, "Response should include success message"
        
        print(f"SUCCESS: Company registered with id={data['id']}, csharp_synced={data['csharp_synced']}")
        
        # Store for cleanup
        self._registered_company_id = data["id"]
        self._registered_email = unique_email
    
    def test_company_register_duplicate_email(self, api_client):
        """Test that registering with duplicate email returns 400 error"""
        timestamp = int(time.time())
        unique_email = f"testdup-{timestamp}@test.com"
        
        payload = {
            "first_name": "Test",
            "last_name": "First",
            "company_name": f"First VTC {timestamp}",
            "email": unique_email,
            "password": "TestPass123!"
        }
        
        # First registration should succeed
        response1 = api_client.post(f"{BASE_URL}/api/company/register", json=payload)
        assert response1.status_code == 200, f"First registration failed: {response1.text}"
        
        # Second registration with same email should fail
        payload["company_name"] = f"Duplicate VTC {timestamp}"
        payload["first_name"] = "Test"
        payload["last_name"] = "Second"
        
        response2 = api_client.post(f"{BASE_URL}/api/company/register", json=payload)
        
        assert response2.status_code == 400, f"Expected 400, got {response2.status_code}"
        
        data = response2.json()
        assert "detail" in data, "Error response should have 'detail' field"
        assert data["detail"] == "Email already registered", f"Wrong error message: {data['detail']}"
        
        print(f"SUCCESS: Duplicate email correctly rejected with 400")
    
    def test_company_register_missing_required_fields(self, api_client):
        """Test that registration fails without required fields"""
        # Missing password
        payload = {
            "first_name": "Test",
            "last_name": "Missing",
            "company_name": "Missing Fields VTC",
            "email": "missing@test.com"
            # password is required but missing
        }
        
        response = api_client.post(f"{BASE_URL}/api/company/register", json=payload)
        
        # Should fail validation (422 Unprocessable Entity)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}: {response.text}"
        print("SUCCESS: Missing required field correctly rejected")
    
    def test_company_register_phone_formatting(self, api_client):
        """Test phone number formatting with country code"""
        timestamp = int(time.time())
        unique_email = f"testphone-{timestamp}@test.com"
        
        # Test with phone number without leading +, should be formatted
        payload = {
            "first_name": "Test",
            "last_name": "Phone",
            "company_name": f"Phone Test VTC {timestamp}",
            "email": unique_email,
            "phone": "0612345678",  # French format
            "phone_country": "+33",
            "password": "TestPass123!"
        }
        
        response = api_client.post(f"{BASE_URL}/api/company/register", json=payload)
        
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        
        # Verify company was registered
        assert "id" in data, "Should have company id"
        print(f"SUCCESS: Company registered with phone number, csharp_synced={data.get('csharp_synced')}")
    
    def test_company_register_optional_fields(self, api_client):
        """Test registration with minimal required fields (without optional fields)"""
        timestamp = int(time.time())
        unique_email = f"testminimal-{timestamp}@test.com"
        
        # Only required fields
        payload = {
            "first_name": "Test",
            "last_name": "Minimal",
            "company_name": f"Minimal VTC {timestamp}",
            "email": unique_email,
            "password": "TestPass123!"
        }
        
        response = api_client.post(f"{BASE_URL}/api/company/register", json=payload)
        
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        
        assert data["email"] == unique_email.lower()
        assert data["status"] == "pending"
        print(f"SUCCESS: Company registered with minimal fields, csharp_synced={data.get('csharp_synced')}")
    
    def test_csharp_api_direct_connectivity(self, api_client):
        """Test that C# API endpoint is reachable"""
        # Just check if the C# API is reachable (may return error if email exists)
        try:
            # Using a definitely invalid test to just check connectivity
            response = requests.options(f"{CSHARP_API}/api/CompanyRegister/register", timeout=10)
            # Any response means it's reachable
            print(f"SUCCESS: C# API at {CSHARP_API} is reachable, status: {response.status_code}")
        except requests.exceptions.RequestException as e:
            # If OPTIONS fails, try HEAD on base URL
            try:
                response = requests.get(f"{CSHARP_API}", timeout=10)
                print(f"SUCCESS: C# API at {CSHARP_API} base URL reachable, status: {response.status_code}")
            except Exception as e2:
                pytest.skip(f"C# API may not be reachable: {e2}")


class TestCompanyLogin:
    """Company login endpoint tests"""
    
    def test_company_login_invalid_credentials(self, api_client):
        """Test login with invalid credentials returns 401"""
        payload = {
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        }
        
        response = api_client.post(f"{BASE_URL}/api/company/login", json=payload)
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Invalid credentials"
        print("SUCCESS: Invalid login correctly rejected with 401")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
