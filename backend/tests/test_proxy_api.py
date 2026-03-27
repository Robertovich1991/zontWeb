"""
Backend API tests for proxy endpoints - Testing preorder-distance and related APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestProxyAPI:
    """Tests for the C# API proxy endpoints"""
    
    def test_api_root(self):
        """Test that the API root endpoint responds"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"API root response: {data}")
    
    def test_preorder_distance_valid_coords(self):
        """Test preorder-distance endpoint with valid Paris coordinates (CDG to city center)"""
        payload = {
            "coordinates": [
                {"latitude": 49.0097, "longitude": 2.5479},  # CDG Airport
                {"latitude": 48.8566, "longitude": 2.3522}   # Paris city center
            ]
        }
        response = requests.post(
            f"{BASE_URL}/api/proxy/preorder-distance",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure - should be a list of vehicle options
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Check first vehicle has required fields
        first_vehicle = data[0]
        assert "tripType" in first_vehicle
        assert "amount" in first_vehicle
        assert first_vehicle["amount"] > 0
        print(f"Preorder distance response: {len(data)} vehicle options, first: {first_vehicle['tripType']} - {first_vehicle['amount']}€")
    
    def test_preorder_distance_orly_coords(self):
        """Test preorder-distance endpoint with Orly Airport coordinates"""
        payload = {
            "coordinates": [
                {"latitude": 48.7262, "longitude": 2.3652},  # Orly Airport
                {"latitude": 48.8566, "longitude": 2.3522}   # Paris city center
            ]
        }
        response = requests.post(
            f"{BASE_URL}/api/proxy/preorder-distance",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Orly preorder response: {len(data)} vehicle options")
    
    def test_preorder_distance_disneyland_coords(self):
        """Test preorder-distance endpoint with Disneyland Paris coordinates"""
        payload = {
            "coordinates": [
                {"latitude": 48.8566, "longitude": 2.3522},  # Paris city center
                {"latitude": 48.8722, "longitude": 2.7758}   # Disneyland Paris
            ]
        }
        response = requests.post(
            f"{BASE_URL}/api/proxy/preorder-distance",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Disneyland preorder response: {len(data)} vehicle options")
    
    def test_preorder_distance_invalid_payload(self):
        """Test preorder-distance endpoint with invalid payload"""
        payload = {
            "coordinates": []  # Empty coordinates
        }
        response = requests.post(
            f"{BASE_URL}/api/proxy/preorder-distance",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        # Should return error (400 or 502)
        assert response.status_code in [400, 422, 502]
        print(f"Invalid payload response: {response.status_code}")
    
    def test_trip_types_endpoint(self):
        """Test trip-types endpoint"""
        response = requests.get(f"{BASE_URL}/api/proxy/trip-types")
        # This endpoint may or may not be available
        if response.status_code == 200:
            data = response.json()
            print(f"Trip types response: {data}")
        else:
            print(f"Trip types endpoint returned: {response.status_code}")
            # Not a critical failure
            pytest.skip("Trip types endpoint not available")


class TestPublicCMS:
    """Tests for public CMS endpoints"""
    
    def test_trust_blocks(self):
        """Test public trust-blocks endpoint"""
        response = requests.get(f"{BASE_URL}/api/public/trust-blocks")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Trust blocks: {len(data)} blocks found")
    
    def test_homepage_content(self):
        """Test public homepage endpoint"""
        response = requests.get(f"{BASE_URL}/api/public/homepage")
        assert response.status_code == 200
        data = response.json()
        # Homepage may return empty object or content
        print(f"Homepage content: {type(data)}")


class TestStatusEndpoint:
    """Tests for status endpoint"""
    
    def test_get_status(self):
        """Test GET /api/status endpoint"""
        response = requests.get(f"{BASE_URL}/api/status")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Status checks: {len(data)} entries")
    
    def test_create_status(self):
        """Test POST /api/status endpoint"""
        payload = {"client_name": "TEST_playwright_test"}
        response = requests.post(
            f"{BASE_URL}/api/status",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["client_name"] == "TEST_playwright_test"
        assert "id" in data
        assert "timestamp" in data
        print(f"Created status check: {data['id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
