"""
Hotel Management API Tests
Tests for the hotel kiosk management system:
- GET /api/admin/hotels - List hotels with enriched stats
- POST /api/admin/hotels - Create hotel + auto-create hotel admin
- PUT /api/admin/hotels/{id} - Update hotel
- DELETE /api/admin/hotels/{id} - Delete hotel
- GET /api/admin/hotels/dashboard - Dashboard stats
- GET /api/admin/hotels/{id} - Hotel detail with kiosks/bookings
- POST /api/admin/hotels/kiosks/create - Create kiosk
- GET /api/admin/hotels/bookings/all - All bookings with commission calculations
- Auth tests: 401 without token, 403 for non-admin
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@zont.cab"
ADMIN_PASSWORD = "admin123"

class TestAdminAuth:
    """Tests for admin authentication requirements"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "token" in data
        return data["token"]
    
    def test_hotels_list_requires_auth(self):
        """GET /api/admin/hotels returns 401 without token"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_dashboard_requires_auth(self):
        """GET /api/admin/hotels/dashboard returns 401 without token"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels/dashboard")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_create_hotel_requires_auth(self):
        """POST /api/admin/hotels returns 401 without token"""
        response = requests.post(f"{BASE_URL}/api/admin/hotels", json={
            "name": "Test Hotel",
            "city": "Paris"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_bookings_all_requires_auth(self):
        """GET /api/admin/hotels/bookings/all returns 401 without token"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels/bookings/all")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_kiosks_all_requires_auth(self):
        """GET /api/admin/hotels/kiosks/all returns 401 without token"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels/kiosks/all")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestHotelsDashboard:
    """Tests for dashboard stats endpoint"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin auth headers"""
        response = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_dashboard_returns_stats(self, admin_headers):
        """GET /api/admin/hotels/dashboard returns expected stats structure"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels/dashboard", headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify all expected fields exist
        expected_fields = [
            "total_hotels", "active_hotels", "total_kiosks", "kiosks_online",
            "bookings_today", "bookings_month", "total_revenue", "total_bookings",
            "total_hotel_commissions", "total_zont_commissions", "monthly_revenue"
        ]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        # Verify numeric types
        assert isinstance(data["total_hotels"], int)
        assert isinstance(data["active_hotels"], int)
        assert isinstance(data["total_kiosks"], int)
        assert isinstance(data["total_revenue"], (int, float))
        assert isinstance(data["monthly_revenue"], list)
        
        print(f"Dashboard stats: {data['total_hotels']} hotels, {data['total_kiosks']} kiosks, {data['total_revenue']} EUR revenue")


class TestHotelsList:
    """Tests for listing hotels with enriched stats"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin auth headers"""
        response = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_list_hotels_returns_array(self, admin_headers):
        """GET /api/admin/hotels returns list of hotels"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels", headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"Found {len(data)} hotels")
    
    def test_hotels_have_enriched_stats(self, admin_headers):
        """Each hotel has booking stats and commission totals"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels", headers=admin_headers)
        assert response.status_code == 200
        
        hotels = response.json()
        if len(hotels) > 0:
            hotel = hotels[0]
            # Check enriched fields
            assert "total_bookings" in hotel, "Missing total_bookings"
            assert "total_revenue" in hotel, "Missing total_revenue"
            assert "hotel_commission_total" in hotel, "Missing hotel_commission_total"
            assert "zont_commission_total" in hotel, "Missing zont_commission_total"
            assert "kiosks_count" in hotel, "Missing kiosks_count"
            assert "kiosks_online" in hotel, "Missing kiosks_online"
            
            print(f"Hotel '{hotel['name']}': {hotel['total_bookings']} bookings, {hotel['total_revenue']} EUR")
    
    def test_hotels_have_required_fields(self, admin_headers):
        """Each hotel has name, city, status, commission rates"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels", headers=admin_headers)
        assert response.status_code == 200
        
        hotels = response.json()
        if len(hotels) > 0:
            hotel = hotels[0]
            required_fields = ["id", "name", "city", "status", "commission_rate", "zont_commission_rate"]
            for field in required_fields:
                assert field in hotel, f"Missing required field: {field}"


class TestHotelCRUD:
    """Tests for hotel Create/Read/Update/Delete operations"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin auth headers"""
        response = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    @pytest.fixture(scope="class")
    def test_hotel_data(self):
        """Test hotel data with unique identifiers"""
        unique_id = str(uuid.uuid4())[:6]
        return {
            "name": f"TEST_Hotel_{unique_id}",
            "hotel_group": "TEST Group",
            "address": "123 Test Street",
            "city": "Paris",
            "postal_code": "75001",
            "country": "France",
            "rooms": 50,
            "contact_name": "Test Contact",
            "contact_role": "Manager",
            "contact_phone": "+33600000001",
            "contact_email": f"test_{unique_id}@testhotel.com",
            "commission_rate": 12.5,
            "zont_commission_rate": 8.0,
            "status": "active",
            "kiosks_planned": 2,
            "notes": "Test hotel for automated testing"
        }
    
    def test_create_hotel(self, admin_headers, test_hotel_data):
        """POST /api/admin/hotels creates hotel and returns it"""
        response = requests.post(
            f"{BASE_URL}/api/admin/hotels",
            headers=admin_headers,
            json=test_hotel_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created = response.json()
        assert "id" in created, "Created hotel should have an id"
        assert created["name"] == test_hotel_data["name"]
        assert created["city"] == test_hotel_data["city"]
        assert created["commission_rate"] == test_hotel_data["commission_rate"]
        assert created["contact_email"] == test_hotel_data["contact_email"]
        
        print(f"Created hotel with id: {created['id']}")
        return created
    
    def test_get_hotel_detail(self, admin_headers, test_hotel_data):
        """GET /api/admin/hotels/{id} returns hotel with kiosks and bookings"""
        # First create a hotel
        create_response = requests.post(
            f"{BASE_URL}/api/admin/hotels",
            headers=admin_headers,
            json={**test_hotel_data, "name": f"TEST_Detail_{str(uuid.uuid4())[:6]}"}
        )
        created_hotel = create_response.json()
        hotel_id = created_hotel["id"]
        
        # Get hotel detail
        response = requests.get(f"{BASE_URL}/api/admin/hotels/{hotel_id}", headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        hotel = response.json()
        assert hotel["id"] == hotel_id
        assert "kiosks" in hotel, "Hotel detail should include kiosks"
        assert "recent_bookings" in hotel, "Hotel detail should include recent_bookings"
        assert "total_bookings" in hotel
        assert "total_revenue" in hotel
        
        print(f"Hotel detail: {hotel['name']}, {len(hotel.get('kiosks', []))} kiosks")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/hotels/{hotel_id}", headers=admin_headers)
    
    def test_update_hotel(self, admin_headers, test_hotel_data):
        """PUT /api/admin/hotels/{id} updates hotel fields"""
        # Create hotel
        create_response = requests.post(
            f"{BASE_URL}/api/admin/hotels",
            headers=admin_headers,
            json={**test_hotel_data, "name": f"TEST_Update_{str(uuid.uuid4())[:6]}"}
        )
        created_hotel = create_response.json()
        hotel_id = created_hotel["id"]
        
        # Update hotel
        update_data = {
            "name": "Updated Hotel Name",
            "commission_rate": 20.0,
            "status": "inactive"
        }
        response = requests.put(
            f"{BASE_URL}/api/admin/hotels/{hotel_id}",
            headers=admin_headers,
            json=update_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        updated = response.json()
        assert updated["name"] == "Updated Hotel Name"
        assert updated["commission_rate"] == 20.0
        assert updated["status"] == "inactive"
        # Unchanged fields should be preserved
        assert updated["city"] == test_hotel_data["city"]
        
        print(f"Updated hotel: {updated['name']}, commission: {updated['commission_rate']}%")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/hotels/{hotel_id}", headers=admin_headers)
    
    def test_delete_hotel(self, admin_headers, test_hotel_data):
        """DELETE /api/admin/hotels/{id} removes hotel"""
        # Create hotel
        create_response = requests.post(
            f"{BASE_URL}/api/admin/hotels",
            headers=admin_headers,
            json={**test_hotel_data, "name": f"TEST_Delete_{str(uuid.uuid4())[:6]}"}
        )
        created_hotel = create_response.json()
        hotel_id = created_hotel["id"]
        
        # Delete hotel
        response = requests.delete(f"{BASE_URL}/api/admin/hotels/{hotel_id}", headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        result = response.json()
        assert result.get("ok") == True
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/admin/hotels/{hotel_id}", headers=admin_headers)
        assert get_response.status_code == 404, "Hotel should not exist after deletion"
        
        print(f"Successfully deleted hotel {hotel_id}")
    
    def test_get_nonexistent_hotel(self, admin_headers):
        """GET /api/admin/hotels/{id} returns 404 for non-existent hotel"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels/nonexistent123", headers=admin_headers)
        assert response.status_code == 404


class TestKiosks:
    """Tests for kiosk management"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin auth headers"""
        response = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_create_kiosk_for_hotel(self, admin_headers):
        """POST /api/admin/hotels/kiosks/create creates kiosk for hotel"""
        # First create a hotel
        hotel_response = requests.post(
            f"{BASE_URL}/api/admin/hotels",
            headers=admin_headers,
            json={"name": f"TEST_KioskHotel_{str(uuid.uuid4())[:6]}", "city": "Paris"}
        )
        hotel = hotel_response.json()
        hotel_id = hotel["id"]
        
        # Create kiosk
        kiosk_data = {
            "hotel_id": hotel_id,
            "name": "Test Lobby Kiosk",
            "location": "Main Lobby"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/hotels/kiosks/create",
            headers=admin_headers,
            json=kiosk_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        kiosk = response.json()
        assert "id" in kiosk
        assert kiosk["hotel_id"] == hotel_id
        assert kiosk["name"] == "Test Lobby Kiosk"
        assert kiosk["status"] == "online"
        
        print(f"Created kiosk '{kiosk['name']}' for hotel {hotel_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/hotels/{hotel_id}", headers=admin_headers)
    
    def test_create_kiosk_invalid_hotel(self, admin_headers):
        """POST /api/admin/hotels/kiosks/create returns 404 for non-existent hotel"""
        response = requests.post(
            f"{BASE_URL}/api/admin/hotels/kiosks/create",
            headers=admin_headers,
            json={"hotel_id": "nonexistent123", "name": "Test Kiosk"}
        )
        assert response.status_code == 404
    
    def test_list_all_kiosks(self, admin_headers):
        """GET /api/admin/hotels/kiosks/all returns all kiosks with hotel names"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels/kiosks/all", headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        kiosks = response.json()
        assert isinstance(kiosks, list)
        
        if len(kiosks) > 0:
            kiosk = kiosks[0]
            assert "hotel_id" in kiosk
            assert "hotel_name" in kiosk, "Kiosk should have hotel_name enrichment"
            assert "status" in kiosk
        
        print(f"Found {len(kiosks)} kiosks")


class TestHotelBookings:
    """Tests for hotel bookings endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin auth headers"""
        response = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_list_all_bookings(self, admin_headers):
        """GET /api/admin/hotels/bookings/all returns bookings with commission calculations"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels/bookings/all", headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        bookings = response.json()
        assert isinstance(bookings, list)
        
        if len(bookings) > 0:
            booking = bookings[0]
            # Check booking fields
            assert "id" in booking
            assert "hotel_id" in booking
            assert "hotel_name" in booking, "Booking should have hotel_name enrichment"
            assert "total_price" in booking
            # Check commission calculations
            assert "hotel_commission" in booking, "Booking should have hotel_commission calculated"
            assert "zont_commission" in booking, "Booking should have zont_commission calculated"
            assert "driver_amount" in booking, "Booking should have driver_amount calculated"
            
            # Verify commission math
            total = booking["total_price"]
            hotel_comm = booking["hotel_commission"]
            zont_comm = booking["zont_commission"]
            driver = booking["driver_amount"]
            calculated_total = round(hotel_comm + zont_comm + driver, 2)
            assert abs(calculated_total - total) < 0.02, f"Commission math doesn't add up: {hotel_comm} + {zont_comm} + {driver} = {calculated_total} != {total}"
            
            print(f"Found {len(bookings)} bookings. Sample: {booking['id']}, {booking['total_price']} EUR, Hotel: {booking['hotel_name']}")
        else:
            print("No bookings found - this may be expected if demo data wasn't seeded")


class TestDemoDataSeed:
    """Tests for demo data seeding (optional)"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin auth headers"""
        response = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_seed_endpoint_exists(self, admin_headers):
        """POST /api/admin/hotels/seed endpoint is accessible"""
        response = requests.post(f"{BASE_URL}/api/admin/hotels/seed", headers=admin_headers)
        # Should be 200 (either seeds or says already seeded)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        result = response.json()
        assert "message" in result
        print(f"Seed result: {result['message']}")


class TestCleanup:
    """Cleanup test hotels created during testing"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Get admin auth headers"""
        response = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json()["token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_cleanup_test_hotels(self, admin_headers):
        """Delete all TEST_ prefixed hotels"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels", headers=admin_headers)
        hotels = response.json()
        
        deleted_count = 0
        for hotel in hotels:
            if hotel.get("name", "").startswith("TEST_"):
                del_response = requests.delete(
                    f"{BASE_URL}/api/admin/hotels/{hotel['id']}",
                    headers=admin_headers
                )
                if del_response.status_code == 200:
                    deleted_count += 1
        
        print(f"Cleaned up {deleted_count} test hotels")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
