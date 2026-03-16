"""
Hotel Portal API Tests
Tests for /api/hotel/* endpoints including authentication, dashboard, bookings, and CSV export
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Hotel Admin Credentials
HOTEL_ADMIN_EMAIL = "admin@bristol.fr"
HOTEL_ADMIN_PASSWORD = "hotelc9baf685"
ALT_HOTEL_EMAIL = "admin@negresco.fr"
ALT_HOTEL_PASSWORD = "hotel523e9be3"


class TestHotelAuth:
    """Hotel Authentication Tests"""
    
    def test_login_success(self):
        """Test hotel admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/hotel/auth/login", json={
            "email": HOTEL_ADMIN_EMAIL,
            "password": HOTEL_ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "user" in data, "Response should contain user object"
        assert "hotel" in data, "Response should contain hotel object"
        assert data["user"]["email"] == HOTEL_ADMIN_EMAIL
        assert data["hotel"]["name"] == "Hotel Le Bristol Paris"
        print(f"PASS: Login successful for {HOTEL_ADMIN_EMAIL}")
    
    def test_login_invalid_password(self):
        """Test login with invalid password"""
        response = requests.post(f"{BASE_URL}/api/hotel/auth/login", json={
            "email": HOTEL_ADMIN_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Invalid password rejected")
    
    def test_login_invalid_email(self):
        """Test login with non-existent email"""
        response = requests.post(f"{BASE_URL}/api/hotel/auth/login", json={
            "email": "nonexistent@hotel.com",
            "password": "anypassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Invalid email rejected")
    
    def test_alt_hotel_login(self):
        """Test alternative hotel admin login"""
        response = requests.post(f"{BASE_URL}/api/hotel/auth/login", json={
            "email": ALT_HOTEL_EMAIL,
            "password": ALT_HOTEL_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["hotel"]["name"] == "Hotel Negresco Nice"
        print(f"PASS: Alt hotel login successful for {ALT_HOTEL_EMAIL}")


@pytest.fixture
def hotel_token():
    """Get hotel admin JWT token"""
    response = requests.post(f"{BASE_URL}/api/hotel/auth/login", json={
        "email": HOTEL_ADMIN_EMAIL,
        "password": HOTEL_ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["token"]
    pytest.skip("Cannot login to get hotel token")


class TestHotelDashboard:
    """Hotel Dashboard API Tests"""
    
    def test_dashboard_requires_auth(self):
        """Dashboard should require authentication"""
        response = requests.get(f"{BASE_URL}/api/hotel/dashboard")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Dashboard requires authentication")
    
    def test_dashboard_returns_data(self, hotel_token):
        """Dashboard should return hotel stats"""
        response = requests.get(f"{BASE_URL}/api/hotel/dashboard", headers={
            "Authorization": f"Bearer {hotel_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify required fields
        required_fields = [
            "hotel_name", "hotel_city", "commission_rate",
            "bookings_today", "bookings_month", "bookings_prev_month",
            "total_revenue", "total_bookings", "total_commission",
            "month_revenue", "month_commission", "prev_month_revenue",
            "evolution_percent", "kiosks", "monthly_chart"
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        assert data["hotel_name"] == "Hotel Le Bristol Paris"
        assert isinstance(data["commission_rate"], (int, float))
        assert isinstance(data["total_revenue"], (int, float))
        assert isinstance(data["kiosks"], list)
        print(f"PASS: Dashboard returns data for {data['hotel_name']}")
        print(f"  - Bookings today: {data['bookings_today']}")
        print(f"  - Total revenue: {data['total_revenue']} EUR")
        print(f"  - Commission rate: {data['commission_rate']}%")


class TestHotelBookings:
    """Hotel Bookings API Tests"""
    
    def test_bookings_requires_auth(self):
        """Bookings should require authentication"""
        response = requests.get(f"{BASE_URL}/api/hotel/bookings")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Bookings requires authentication")
    
    def test_bookings_returns_array(self, hotel_token):
        """Bookings should return array of hotel bookings"""
        response = requests.get(f"{BASE_URL}/api/hotel/bookings", headers={
            "Authorization": f"Bearer {hotel_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: Bookings returns {len(data)} bookings")
        
        if len(data) > 0:
            booking = data[0]
            # Verify booking fields
            expected_fields = [
                "id", "hotel_id", "client_name", "pickup_address", "dropoff_address",
                "ride_date", "ride_time", "total_price", "status",
                "hotel_commission", "zont_commission", "driver_amount"
            ]
            for field in expected_fields:
                assert field in booking, f"Missing field: {field}"
            
            # Verify commission calculation
            total = booking.get("total_price", 0)
            hotel_comm = booking.get("hotel_commission", 0)
            zont_comm = booking.get("zont_commission", 0)
            driver_amt = booking.get("driver_amount", 0)
            calculated_total = hotel_comm + zont_comm + driver_amt
            assert abs(total - calculated_total) < 0.1, f"Commission split error: {total} != {calculated_total}"
            print(f"  - First booking: {booking['id']}, price: {total} EUR")
            print(f"  - Commission breakdown: hotel={hotel_comm}, zont={zont_comm}, driver={driver_amt}")


class TestHotelBookingsExport:
    """Hotel Bookings Export CSV Tests"""
    
    def test_export_requires_auth(self):
        """CSV export should require token"""
        response = requests.get(f"{BASE_URL}/api/hotel/bookings/export")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: CSV export requires authentication")
    
    def test_export_with_token_query_param(self, hotel_token):
        """CSV export should work with token as query parameter"""
        response = requests.get(f"{BASE_URL}/api/hotel/bookings/export?token={hotel_token}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify content type
        content_type = response.headers.get("content-type", "")
        assert "text/csv" in content_type, f"Expected CSV content type, got {content_type}"
        
        # Verify content disposition (download filename)
        content_disp = response.headers.get("content-disposition", "")
        assert "attachment" in content_disp, "Should have attachment disposition"
        assert "reservations_" in content_disp, "Should have reservations_ in filename"
        
        # Verify CSV content
        csv_content = response.text
        assert "ID" in csv_content, "CSV should have ID column"
        assert "Date" in csv_content, "CSV should have Date column"
        assert "Commission Hotel" in csv_content, "CSV should have Commission Hotel column"
        
        lines = csv_content.strip().split('\n')
        print(f"PASS: CSV export returns {len(lines) - 1} rows (plus header)")


class TestHotelProfile:
    """Hotel Profile API Tests"""
    
    def test_profile_requires_auth(self):
        """Profile should require authentication"""
        response = requests.get(f"{BASE_URL}/api/hotel/profile")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Profile requires authentication")
    
    def test_profile_returns_hotel_data(self, hotel_token):
        """Profile should return hotel info"""
        response = requests.get(f"{BASE_URL}/api/hotel/profile", headers={
            "Authorization": f"Bearer {hotel_token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "name" in data, "Should have hotel name"
        assert "city" in data, "Should have hotel city"
        assert data["name"] == "Hotel Le Bristol Paris"
        print(f"PASS: Profile returns hotel data: {data['name']}, {data['city']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
