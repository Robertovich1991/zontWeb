"""Fleet Portal API Tests - Tests for fleet management portal proxy endpoints."""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Fleet Test Credentials
FLEET_EMAIL = "nandetiri1@gmail.com"
FLEET_PASSWORD = "12345678"


class TestFleetAuthentication:
    """Fleet login/auth endpoint tests"""
    
    def test_fleet_login_success(self):
        """POST /api/fleet/auth/login - Valid credentials returns token and company data"""
        response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
            "username": FLEET_EMAIL,
            "password": FLEET_PASSWORD
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify accessToken present
        assert "accessToken" in data, "Response should contain accessToken"
        assert isinstance(data["accessToken"], str)
        assert len(data["accessToken"]) > 0
        
        # Verify refreshToken present
        assert "refreshToken" in data, "Response should contain refreshToken"
        
        # Verify company data
        assert "company" in data, "Response should contain company data"
        company = data["company"]
        assert company["companyName"] == "comfort cars 1", f"Expected 'comfort cars 1', got {company.get('companyName')}"
        assert company["email"] == FLEET_EMAIL
        assert "id" in company
        assert "isActivated" in company
    
    def test_fleet_login_invalid_credentials(self):
        """POST /api/fleet/auth/login - Invalid credentials returns 400"""
        response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
            "username": "wrong@email.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    def test_fleet_login_missing_fields(self):
        """POST /api/fleet/auth/login - Missing fields returns 422"""
        response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
            "username": FLEET_EMAIL
        })
        
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"


class TestFleetDriversAPI:
    """Fleet drivers endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get fleet auth token"""
        response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
            "username": FLEET_EMAIL,
            "password": FLEET_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("accessToken")
        pytest.skip("Fleet authentication failed")
    
    def test_fleet_drivers_list(self, auth_token):
        """GET /api/fleet/drivers - Returns array of drivers"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/drivers",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify at least one driver
        assert len(data) >= 1, "Expected at least 1 driver"
        
        # Verify driver structure
        driver = data[0]
        assert "id" in driver
        assert "firstName" in driver
        assert "lastName" in driver
        assert "email" in driver
        assert "phone" in driver
        assert "isActivated" in driver
        assert "isVerified" in driver
        assert "rank" in driver
    
    def test_fleet_drivers_unauthorized(self):
        """GET /api/fleet/drivers - No token returns 401"""
        response = requests.get(f"{BASE_URL}/api/fleet/drivers")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestFleetVehiclesAPI:
    """Fleet vehicles endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get fleet auth token"""
        response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
            "username": FLEET_EMAIL,
            "password": FLEET_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("accessToken")
        pytest.skip("Fleet authentication failed")
    
    def test_fleet_vehicles_list(self, auth_token):
        """GET /api/fleet/vehicles - Returns array of vehicles"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/vehicles",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify at least one vehicle
        assert len(data) >= 1, "Expected at least 1 vehicle"
        
        # Verify vehicle structure
        vehicle = data[0]
        assert "id" in vehicle
        assert "plateNumber" in vehicle
        assert "make" in vehicle
        assert "model" in vehicle
        assert "year" in vehicle
        assert "color" in vehicle
        assert "type" in vehicle
        assert "isActivated" in vehicle
    
    def test_fleet_vehicles_unauthorized(self):
        """GET /api/fleet/vehicles - No token returns 401"""
        response = requests.get(f"{BASE_URL}/api/fleet/vehicles")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestFleetCompanyProfile:
    """Fleet company profile endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get fleet auth token"""
        response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
            "username": FLEET_EMAIL,
            "password": FLEET_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("accessToken")
        pytest.skip("Fleet authentication failed")
    
    def test_fleet_company_profile(self, auth_token):
        """GET /api/fleet/company/profile - Returns company data"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/company/profile",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify company profile structure
        assert data["companyName"] == "comfort cars 1"
        assert data["email"] == FLEET_EMAIL
        assert "phone" in data
        assert "address" in data
        assert "referalCode" in data
        assert "isActivated" in data
        assert "isAdminActivated" in data
        assert "numberOfDrivers" in data
        assert "vehicleCount" in data
        assert "tripsCount" in data
        assert "balance" in data
        assert "rank" in data
    
    def test_fleet_profile_unauthorized(self):
        """GET /api/fleet/company/profile - No token returns 401"""
        response = requests.get(f"{BASE_URL}/api/fleet/company/profile")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestFleetAddDriverAPI:
    """Fleet add driver endpoint tests - POST /api/fleet/drivers"""
    
    @pytest.fixture
    def auth_token(self):
        """Get fleet auth token"""
        response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
            "username": FLEET_EMAIL,
            "password": FLEET_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("accessToken")
        pytest.skip("Fleet authentication failed")
    
    def test_add_driver_unauthorized(self):
        """POST /api/fleet/drivers - No token returns 401"""
        response = requests.post(f"{BASE_URL}/api/fleet/drivers", json={
            "firstName": "Test",
            "lastName": "Driver",
            "email": "test@test.com",
            "phone": "+33612345678",
            "gender": "Male",
            "password": "testpass123"
        })
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_add_driver_missing_required_fields(self, auth_token):
        """POST /api/fleet/drivers - Missing required fields returns 422"""
        # Only firstName provided, missing lastName, email, gender, password
        response = requests.post(
            f"{BASE_URL}/api/fleet/drivers",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"firstName": "Test"}
        )
        
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        
        # Verify error mentions missing fields
        data = response.json()
        assert "detail" in data
    
    def test_add_driver_validation_structure(self, auth_token):
        """POST /api/fleet/drivers - Validates request body structure"""
        # Valid structure but might fail on C# side - we test that our proxy handles it
        test_payload = {
            "firstName": "TestFirst",
            "lastName": "TestLast",
            "email": "invalid-email",  # Invalid email format
            "phone": "+33612345678",
            "gender": "Male",
            "password": "short"  # Might be too short
        }
        
        response = requests.post(
            f"{BASE_URL}/api/fleet/drivers",
            headers={"Authorization": f"Bearer {auth_token}"},
            json=test_payload
        )
        
        # Either 200/201 (C# accepted) or 4xx (C# validation failed)
        # We're testing that our proxy passes the request correctly
        assert response.status_code in [200, 201, 400, 409, 422], f"Unexpected status {response.status_code}: {response.text}"
        
        # Verify response is valid JSON
        data = response.json()
        assert isinstance(data, dict)


class TestFleetAddVehicleRefEndpoints:
    """Fleet vehicle reference data endpoints - for cascade dropdowns"""
    
    @pytest.fixture
    def auth_token(self):
        """Get fleet auth token"""
        response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
            "username": FLEET_EMAIL,
            "password": FLEET_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("accessToken")
        pytest.skip("Fleet authentication failed")
    
    def test_vehicle_years_endpoint(self, auth_token):
        """GET /api/fleet/vehicles/ref/years - Returns available years"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/vehicles/ref/years",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Expected at least one year"
        # Known years from C# API: 2000, 2019, 2020, 2024
        assert 2024 in data, f"Expected 2024 in years list, got {data}"
    
    def test_vehicle_years_unauthorized(self):
        """GET /api/fleet/vehicles/ref/years - No token returns 401"""
        response = requests.get(f"{BASE_URL}/api/fleet/vehicles/ref/years")
        assert response.status_code == 401
    
    def test_vehicle_makers_by_year(self, auth_token):
        """GET /api/fleet/vehicles/ref/makers/{year} - Returns makers for specific year"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/vehicles/ref/makers/2024",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # Verify maker structure (C# returns {id, make} not {id, maker})
        if len(data) > 0:
            maker = data[0]
            assert "id" in maker, "Maker should have 'id' field"
            # Backend returns either 'make' or 'maker' - frontend handles both
            assert "make" in maker or "maker" in maker, f"Maker should have 'make' or 'maker' field, got: {maker}"
    
    def test_vehicle_makers_unauthorized(self):
        """GET /api/fleet/vehicles/ref/makers/{year} - No token returns 401"""
        response = requests.get(f"{BASE_URL}/api/fleet/vehicles/ref/makers/2024")
        assert response.status_code == 401
    
    def test_vehicle_models_by_year_and_make(self, auth_token):
        """GET /api/fleet/vehicles/ref/models/{year}/{make} - Returns models for year and make"""
        # First get makers for 2024 to get a valid make name
        makers_resp = requests.get(
            f"{BASE_URL}/api/fleet/vehicles/ref/makers/2024",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        if makers_resp.status_code != 200 or len(makers_resp.json()) == 0:
            pytest.skip("No makers available for 2024")
        
        makers = makers_resp.json()
        make_name = makers[0].get("make") or makers[0].get("maker", "Audi")
        
        response = requests.get(
            f"{BASE_URL}/api/fleet/vehicles/ref/models/2024/{make_name}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # Verify model structure
        if len(data) > 0:
            model = data[0]
            assert "id" in model, "Model should have 'id' field"
            assert "model" in model, "Model should have 'model' field"
            # Optional: type, isVTC
    
    def test_vehicle_types_endpoint(self, auth_token):
        """GET /api/fleet/vehicles/ref/types - Returns vehicle category types"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/vehicles/ref/types",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Expected at least one vehicle type"
        # Known types: 'Luxury Sedan', 'Luxury Van', 'Regular Zont', 'Shuttle private 8 pers.'
        # Verify they are strings
        assert all(isinstance(t, str) for t in data), "Types should be strings"
    
    def test_vehicle_types_unauthorized(self):
        """GET /api/fleet/vehicles/ref/types - No token returns 401"""
        response = requests.get(f"{BASE_URL}/api/fleet/vehicles/ref/types")
        assert response.status_code == 401


class TestFleetAddVehicleAPI:
    """Fleet add vehicle endpoint tests - POST /api/fleet/vehicles"""
    
    @pytest.fixture
    def auth_token(self):
        """Get fleet auth token"""
        response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
            "username": FLEET_EMAIL,
            "password": FLEET_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("accessToken")
        pytest.skip("Fleet authentication failed")
    
    def test_add_vehicle_unauthorized(self):
        """POST /api/fleet/vehicles - No token returns 401"""
        response = requests.post(f"{BASE_URL}/api/fleet/vehicles", json={
            "vim": "TEST12345678901234",
            "color": "Black",
            "number": "TEST-123-AB",
            "vehicleMakeModelId": 1,
            "year": 2024,
            "makeId": 6,
            "maker": "Audi",
            "model": "A4",
            "type": "Luxury Sedan",
            "isVTC": False
        })
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_add_vehicle_missing_required_fields(self, auth_token):
        """POST /api/fleet/vehicles - Missing required fields returns 422"""
        # Only vim provided, missing other required fields
        response = requests.post(
            f"{BASE_URL}/api/fleet/vehicles",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"vim": "TEST12345678901234"}
        )
        
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        
        # Verify error mentions missing fields
        data = response.json()
        assert "detail" in data
    
    def test_add_vehicle_validation_structure(self, auth_token):
        """POST /api/fleet/vehicles - Validates payload structure passes to C# API"""
        # NOTE: Do not actually create a vehicle - use invalid data that C# will reject
        # but our proxy should correctly format and forward
        test_payload = {
            "vim": "INVALID_SHORT",  # VIN too short - C# will likely reject
            "color": "TestColor",
            "number": "INVALID-PLATE",
            "vehicleMakeModelId": 0,  # Invalid ID
            "year": 2024,
            "makeId": 6,
            "maker": "Audi",
            "model": "TestModel",
            "type": "Luxury Sedan",
            "isVTC": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/fleet/vehicles",
            headers={"Authorization": f"Bearer {auth_token}"},
            json=test_payload
        )
        
        # We expect 4xx from C# validation or possibly 200/201 if C# accepts
        assert response.status_code in [200, 201, 400, 404, 409, 422, 500], f"Unexpected status {response.status_code}: {response.text}"
        
        # Verify response is valid JSON
        data = response.json()
        assert isinstance(data, dict)


# ─── Bookings (Reservations) API Tests ───

class TestFleetBookingsAPI:
    """Fleet bookings/reservations endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get fleet auth token"""
        response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
            "username": FLEET_EMAIL,
            "password": FLEET_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("accessToken")
        pytest.skip("Fleet authentication failed")
    
    def test_fleet_bookings_list(self, auth_token):
        """GET /api/fleet/bookings - Returns array of bookings/reservations"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/bookings",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify booking structure if there are bookings
        if len(data) > 0:
            booking = data[0]
            assert "id" in booking, "Booking should have 'id'"
            assert "status" in booking, "Booking should have 'status'"
            assert "startAddress" in booking, "Booking should have 'startAddress'"
            assert "endAddress" in booking, "Booking should have 'endAddress'"
            assert "startDate" in booking, "Booking should have 'startDate'"
            assert "totalAmount" in booking, "Booking should have 'totalAmount'"
            # Status should be one of known values
            valid_statuses = ['New', 'Confirmed', 'Started', 'Completed', 'Cancelled', 'CancelledByDriver', 'CancelledByClient']
            assert booking["status"] in valid_statuses, f"Unexpected status: {booking['status']}"
    
    def test_fleet_bookings_unauthorized(self):
        """GET /api/fleet/bookings - No token returns 401"""
        response = requests.get(f"{BASE_URL}/api/fleet/bookings")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_fleet_bookings_with_pagination(self, auth_token):
        """GET /api/fleet/bookings - Supports pagination parameters"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/bookings?count=5&pageNumber=1",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # Should return max 5 items
        assert len(data) <= 5, f"Expected max 5 items, got {len(data)}"
    
    def test_fleet_bookings_count(self, auth_token):
        """GET /api/fleet/bookings/count - Returns count of bookings"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/bookings/count",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Response can be integer or object with count
        data = response.json()
        # Either integer or object
        if isinstance(data, int):
            assert data >= 0, "Count should be non-negative"
        elif isinstance(data, dict):
            # Some APIs return {count: X}
            pass
        # C# might return just the integer
    
    def test_fleet_bookings_count_unauthorized(self):
        """GET /api/fleet/bookings/count - No token returns 401"""
        response = requests.get(f"{BASE_URL}/api/fleet/bookings/count")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestFleetDispatchAPI:
    """Fleet dispatch endpoint tests - POST /api/fleet/bookings/dispatch"""
    
    @pytest.fixture
    def auth_token(self):
        """Get fleet auth token"""
        response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
            "username": FLEET_EMAIL,
            "password": FLEET_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("accessToken")
        pytest.skip("Fleet authentication failed")
    
    def test_dispatch_unauthorized(self):
        """POST /api/fleet/bookings/dispatch - No token returns 401"""
        response = requests.post(f"{BASE_URL}/api/fleet/bookings/dispatch", json={
            "driverId": "test-driver-id",
            "auctionId": 12345
        })
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_dispatch_missing_driverId(self, auth_token):
        """POST /api/fleet/bookings/dispatch - Missing driverId returns 422"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/bookings/dispatch",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"auctionId": 12345}
        )
        
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    
    def test_dispatch_missing_auctionId(self, auth_token):
        """POST /api/fleet/bookings/dispatch - Missing auctionId returns 422"""
        response = requests.post(
            f"{BASE_URL}/api/fleet/bookings/dispatch",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"driverId": "some-driver-id"}
        )
        
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    
    def test_dispatch_validation_structure(self, auth_token):
        """POST /api/fleet/bookings/dispatch - Validates payload passes to C# API"""
        # NOTE: Using invalid IDs to avoid actually dispatching
        test_payload = {
            "driverId": "invalid-driver-id-that-does-not-exist",
            "auctionId": 999999999  # Non-existent auction
        }
        
        response = requests.post(
            f"{BASE_URL}/api/fleet/bookings/dispatch",
            headers={"Authorization": f"Bearer {auth_token}"},
            json=test_payload
        )
        
        # C# API should reject with 4xx or 5xx for invalid IDs
        # We're testing that proxy correctly forwards the request
        assert response.status_code in [200, 201, 400, 404, 409, 422, 500], f"Unexpected status {response.status_code}: {response.text}"


# ─── Trips (Courses) API Tests ───

class TestFleetTripsAPI:
    """Fleet trips/courses endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get fleet auth token"""
        response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
            "username": FLEET_EMAIL,
            "password": FLEET_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("accessToken")
        pytest.skip("Fleet authentication failed")
    
    def test_fleet_trips_list(self, auth_token):
        """GET /api/fleet/trips - Returns array of trips/courses"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/trips",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify trip structure if there are trips
        if len(data) > 0:
            trip = data[0]
            assert "id" in trip, "Trip should have 'id'"
            assert "status" in trip, "Trip should have 'status'"
            assert "startAddress" in trip, "Trip should have 'startAddress'"
            assert "endAddress" in trip, "Trip should have 'endAddress'"
            assert "startDate" in trip, "Trip should have 'startDate'"
            assert "totalAmount" in trip, "Trip should have 'totalAmount'"
    
    def test_fleet_trips_unauthorized(self):
        """GET /api/fleet/trips - No token returns 401"""
        response = requests.get(f"{BASE_URL}/api/fleet/trips")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_fleet_trips_with_pagination(self, auth_token):
        """GET /api/fleet/trips - Supports pagination parameters"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/trips?count=10&pageNumber=1",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) <= 10, f"Expected max 10 items, got {len(data)}"
    
    def test_fleet_trips_count(self, auth_token):
        """GET /api/fleet/trips/count - Returns count of trips"""
        response = requests.get(
            f"{BASE_URL}/api/fleet/trips/count",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Response can be integer or object
        data = response.json()
        if isinstance(data, int):
            assert data >= 0, "Count should be non-negative"
    
    def test_fleet_trips_count_unauthorized(self):
        """GET /api/fleet/trips/count - No token returns 401"""
        response = requests.get(f"{BASE_URL}/api/fleet/trips/count")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
