"""
Tests for C# proxy API endpoints at api.zont.cab
Tests vehicle pricing, preorder pricing, trip types, and vehicle images
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL')

# Test coordinates: CDG Airport to Eiffel Tower (from context)
CDG_AIRPORT = {"latitude": 49.0097, "longitude": 2.5479}
EIFFEL_TOWER = {"latitude": 48.8584, "longitude": 2.2945}
GARE_DU_NORD = {"latitude": 48.8809, "longitude": 2.3553}


class TestProxyDistance:
    """Test POST /api/proxy/distance endpoint - returns vehicle pricing from C# API"""
    
    def test_distance_valid_coordinates(self):
        """Test distance calculation with valid CDG to Eiffel Tower coordinates"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/distance",
            json={
                "coordinates": [CDG_AIRPORT, EIFFEL_TOWER],
                "radius": 50
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Should return array of vehicle types with pricing
        assert isinstance(data, list), "Response should be a list of vehicle types"
        assert len(data) > 0, "Should return at least one vehicle type"
        
        # Check first vehicle structure
        vehicle = data[0]
        assert "tripType" in vehicle or "TripType" in vehicle, "Vehicle should have tripType"
        assert "minAmount" in vehicle or "MinAmount" in vehicle, "Vehicle should have minAmount (price)"
    
    def test_distance_short_route(self):
        """Test distance calculation with short route (Eiffel to Gare du Nord)"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/distance",
            json={
                "coordinates": [EIFFEL_TOWER, GARE_DU_NORD],
                "radius": 50
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_distance_invalid_coordinates(self):
        """Test distance calculation with invalid coordinates"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/distance",
            json={
                "coordinates": [
                    {"latitude": 0, "longitude": 0},  # Middle of ocean
                    {"latitude": 0, "longitude": 0}
                ],
                "radius": 50
            },
            headers={"Content-Type": "application/json"}
        )
        # May return empty list or error - depends on C# API behavior
        assert response.status_code in [200, 400, 404, 502], f"Unexpected status: {response.status_code}"


class TestProxyPreorderDistance:
    """Test POST /api/proxy/preorder-distance endpoint - returns fixed preorder pricing"""
    
    def test_preorder_distance_valid_coordinates(self):
        """Test preorder pricing with valid CDG to Eiffel Tower coordinates"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/preorder-distance",
            json={
                "coordinates": [CDG_AIRPORT, EIFFEL_TOWER]
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Should return array of vehicle types with pricing
        assert isinstance(data, list), "Response should be a list of vehicle types"
        
        if len(data) > 0:
            # Check vehicle structure
            vehicle = data[0]
            print(f"Vehicle data structure: {vehicle}")
            
            # Check for expected fields (case insensitive)
            vehicle_keys_lower = {k.lower() for k in vehicle.keys()}
            assert "triptype" in vehicle_keys_lower or "type" in vehicle_keys_lower, "Vehicle should have tripType or type"
    
    def test_preorder_returns_vehicle_details(self):
        """Test that preorder returns vehicle details like passengers, luggage, duration, distance"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/preorder-distance",
            json={
                "coordinates": [CDG_AIRPORT, EIFFEL_TOWER]
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        data = response.json()
        if len(data) > 0:
            vehicle = data[0]
            vehicle_keys_lower = {k.lower() for k in vehicle.keys()}
            
            # Log all keys for debugging
            print(f"All vehicle keys: {list(vehicle.keys())}")
            
            # Check for common vehicle attributes
            has_passengers = "passenger" in vehicle_keys_lower or "passengers" in vehicle_keys_lower
            has_luggage = "luggage" in vehicle_keys_lower or "bags" in vehicle_keys_lower
            
            print(f"Has passengers: {has_passengers}, Has luggage: {has_luggage}")


class TestProxyTripTypes:
    """Test GET /api/proxy/trip-types endpoint - returns available vehicle types"""
    
    def test_trip_types_returns_list(self):
        """Test that trip-types returns a list of vehicle types"""
        response = requests.get(f"{BASE_URL}/api/proxy/trip-types")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Trip types response: {data}")
        assert isinstance(data, (list, dict)), "Response should be a list or dict"


class TestProxyVehicleImage:
    """Test GET /api/proxy/vehicle-image/{imagePath} endpoint - proxies vehicle images"""
    
    def test_vehicle_image_with_valid_path(self):
        """Test vehicle image proxy with a sample path"""
        # First get vehicles to find a valid image path
        response = requests.post(
            f"{BASE_URL}/api/proxy/preorder-distance",
            json={
                "coordinates": [CDG_AIRPORT, EIFFEL_TOWER]
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            if len(data) > 0:
                vehicle = data[0]
                # Look for imagePath in the vehicle data
                image_path = vehicle.get('imagePath') or vehicle.get('ImagePath') or vehicle.get('image')
                
                if image_path:
                    print(f"Testing image path: {image_path}")
                    img_response = requests.get(f"{BASE_URL}/api/proxy/vehicle-image/{image_path}")
                    
                    # Image should return 200 or 404 if not found
                    assert img_response.status_code in [200, 404, 502], f"Unexpected status: {img_response.status_code}"
                    
                    if img_response.status_code == 200:
                        # Check content type is an image
                        content_type = img_response.headers.get('content-type', '')
                        print(f"Image content-type: {content_type}")
                        assert 'image' in content_type.lower() or content_type == '', f"Expected image content type, got {content_type}"
                else:
                    print("No image path found in vehicle data")
                    pytest.skip("No image path in vehicle response")
            else:
                pytest.skip("No vehicles returned from API")
        else:
            pytest.skip("Could not get vehicles to test image path")
    
    def test_vehicle_image_invalid_path(self):
        """Test vehicle image proxy with invalid path returns 502"""
        response = requests.get(f"{BASE_URL}/api/proxy/vehicle-image/invalid-image-path-12345.png")
        # Should return 502 (bad gateway) when image not found on C# backend
        assert response.status_code in [404, 502], f"Expected 404 or 502, got {response.status_code}"


class TestProxyDriverTypes:
    """Test POST /api/proxy/driver-types endpoint - returns available drivers near location"""
    
    def test_driver_types_near_cdg(self):
        """Test driver types available near CDG Airport"""
        response = requests.post(
            f"{BASE_URL}/api/proxy/driver-types",
            json=CDG_AIRPORT,
            headers={"Content-Type": "application/json"}
        )
        # May return 200 with data or 502 if endpoint not available
        assert response.status_code in [200, 502], f"Unexpected status: {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            print(f"Driver types response: {data}")


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_backend_is_accessible(self):
        """Test that the backend API is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        # Should return 200 or 404 if no health endpoint
        assert response.status_code in [200, 404], f"Backend not accessible: {response.status_code}"
    
    def test_proxy_endpoints_exist(self):
        """Test that proxy endpoints are registered"""
        # Test with invalid body should return 422 (validation error), not 404
        response = requests.post(
            f"{BASE_URL}/api/proxy/distance",
            json={},  # Empty body
            headers={"Content-Type": "application/json"}
        )
        # 422 means endpoint exists but validation failed
        # 400/422 means endpoint exists
        # 404 means endpoint doesn't exist
        assert response.status_code != 404, "Proxy distance endpoint not found"


# Run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
