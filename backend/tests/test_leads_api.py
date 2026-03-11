"""
Test B2B Leads API endpoints
Tests: POST /api/leads (create lead), GET /api/leads (list leads)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestLeadsAPI:
    """B2B Leads endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data with unique identifier"""
        self.test_prefix = f"TEST_{uuid.uuid4().hex[:8]}"
    
    def test_get_leads_returns_list(self):
        """GET /api/leads should return list of leads"""
        response = requests.get(f"{BASE_URL}/api/leads")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"GET /api/leads returned {len(data)} leads")
    
    def test_create_lead_success(self):
        """POST /api/leads should create a new lead"""
        payload = {
            "name": f"{self.test_prefix}_Agent",
            "company": f"{self.test_prefix}_Company",
            "email": f"{self.test_prefix}@example.com",
            "phone": "+33123456789",
            "message": "Test lead from pytest",
            "source_page": "/partners"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Status assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Data assertions
        data = response.json()
        assert "id" in data, "Response should contain id"
        assert data["name"] == payload["name"], "Name should match"
        assert data["company"] == payload["company"], "Company should match"
        assert data["email"] == payload["email"], "Email should match"
        assert data["phone"] == payload["phone"], "Phone should match"
        assert data["source_page"] == payload["source_page"], "Source page should match"
        assert data["status"] == "new", "Status should be 'new'"
        assert "timestamp" in data, "Timestamp should be present"
        
        print(f"Created lead with id: {data['id']}")
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/leads")
        assert get_response.status_code == 200
        leads = get_response.json()
        created_lead = next((l for l in leads if l['id'] == data['id']), None)
        assert created_lead is not None, "Created lead should be in GET response"
        assert created_lead['email'] == payload['email'], "Persisted email should match"
    
    def test_create_lead_minimal_fields(self):
        """POST /api/leads with only required fields"""
        payload = {
            "name": f"{self.test_prefix}_Min",
            "company": f"{self.test_prefix}_MinCo",
            "email": f"{self.test_prefix}_min@example.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["company"] == payload["company"]
        assert data["email"] == payload["email"]
        assert data["phone"] == "", "Phone should default to empty string"
        assert data["message"] == "", "Message should default to empty string"
        print(f"Created minimal lead with id: {data['id']}")
    
    def test_create_lead_missing_required_field(self):
        """POST /api/leads without required fields should fail"""
        # Missing email
        payload = {
            "name": "Test",
            "company": "Test Co"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Should return 422 Unprocessable Entity for validation error
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("Validation correctly rejected missing email field")
    
    def test_create_lead_from_different_source_pages(self):
        """POST /api/leads from various B2B pages"""
        source_pages = ["/travel-agencies", "/hotels", "/partners"]
        
        for source in source_pages:
            payload = {
                "name": f"{self.test_prefix}_{source.replace('/', '')}",
                "company": "Test Company",
                "email": f"{self.test_prefix}{source.replace('/', '')}@test.com",
                "source_page": source
            }
            
            response = requests.post(
                f"{BASE_URL}/api/leads",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            assert response.status_code == 200, f"Lead from {source} failed: {response.status_code}"
            data = response.json()
            assert data["source_page"] == source, f"Source page should be {source}"
            print(f"Successfully created lead from source: {source}")


class TestAPIHealth:
    """Basic API health checks"""
    
    def test_root_endpoint(self):
        """GET /api/ should return hello world"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Hello World"
        print("API root endpoint healthy")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
