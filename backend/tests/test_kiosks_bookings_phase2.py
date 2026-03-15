"""
Phase 2 - Kiosks Management & Hotel Bookings Tests
Tests for:
- GET /api/admin/hotels/kiosks/all - List kiosks with hotel names
- POST /api/admin/hotels/kiosks/create - Create kiosk linked to hotel
- PUT /api/admin/hotels/kiosks/{id}/status - Toggle kiosk online/offline
- DELETE /api/admin/hotels/kiosks/{id} - Delete kiosk
- GET /api/admin/hotels/bookings/all - List bookings with hotel names and commission calculations
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@zont.cab"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="module")
def admin_headers():
    """Get admin auth headers"""
    response = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    token = response.json()["token"]
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


class TestKiosksListAll:
    """Tests for GET /api/admin/hotels/kiosks/all"""
    
    def test_kiosks_all_returns_list(self, admin_headers):
        """GET /api/admin/hotels/kiosks/all returns list of kiosks"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels/kiosks/all", headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        kiosks = response.json()
        assert isinstance(kiosks, list), "Response should be a list"
        print(f"Found {len(kiosks)} kiosks")
        return kiosks
    
    def test_kiosks_have_hotel_name(self, admin_headers):
        """Each kiosk has hotel_name enrichment"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels/kiosks/all", headers=admin_headers)
        assert response.status_code == 200
        
        kiosks = response.json()
        if len(kiosks) > 0:
            kiosk = kiosks[0]
            required_fields = ["id", "hotel_id", "hotel_name", "name", "status", "location", "installed_at"]
            for field in required_fields:
                assert field in kiosk, f"Missing field: {field}"
            
            print(f"Sample kiosk: {kiosk['name']} at {kiosk['hotel_name']}, status: {kiosk['status']}")
    
    def test_kiosks_have_correct_status_values(self, admin_headers):
        """Kiosk status is either 'online' or 'offline'"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels/kiosks/all", headers=admin_headers)
        kiosks = response.json()
        
        for kiosk in kiosks:
            assert kiosk["status"] in ["online", "offline"], f"Invalid status: {kiosk['status']}"
        
        online_count = len([k for k in kiosks if k["status"] == "online"])
        offline_count = len([k for k in kiosks if k["status"] == "offline"])
        print(f"Kiosks: {online_count} online, {offline_count} offline")


class TestKioskCreate:
    """Tests for POST /api/admin/hotels/kiosks/create"""
    
    @pytest.fixture
    def test_hotel(self, admin_headers):
        """Create a test hotel for kiosk tests"""
        unique_id = str(uuid.uuid4())[:6]
        response = requests.post(
            f"{BASE_URL}/api/admin/hotels",
            headers=admin_headers,
            json={
                "name": f"TEST_KioskTestHotel_{unique_id}",
                "city": "Paris",
                "commission_rate": 15.0,
                "zont_commission_rate": 10.0
            }
        )
        assert response.status_code == 200
        hotel = response.json()
        yield hotel
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/hotels/{hotel['id']}", headers=admin_headers)
    
    def test_create_kiosk_success(self, admin_headers, test_hotel):
        """POST /api/admin/hotels/kiosks/create creates kiosk linked to hotel"""
        kiosk_data = {
            "hotel_id": test_hotel["id"],
            "name": "TEST_Borne Lobby",
            "location": "Hall principal"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/hotels/kiosks/create",
            headers=admin_headers,
            json=kiosk_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        kiosk = response.json()
        assert "id" in kiosk, "Kiosk should have an id"
        assert kiosk["hotel_id"] == test_hotel["id"]
        assert kiosk["name"] == "TEST_Borne Lobby"
        assert kiosk["location"] == "Hall principal"
        assert kiosk["status"] == "online", "New kiosk should default to online"
        assert "installed_at" in kiosk
        
        print(f"Created kiosk: {kiosk['name']} (id: {kiosk['id']})")
        
        # Cleanup kiosk
        requests.delete(f"{BASE_URL}/api/admin/hotels/kiosks/{kiosk['id']}", headers=admin_headers)
    
    def test_create_kiosk_with_empty_name(self, admin_headers, test_hotel):
        """POST with empty name should auto-generate name"""
        kiosk_data = {
            "hotel_id": test_hotel["id"],
            "name": "",
            "location": "Reception"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/hotels/kiosks/create",
            headers=admin_headers,
            json=kiosk_data
        )
        assert response.status_code == 200
        
        kiosk = response.json()
        assert kiosk["name"], "Name should be auto-generated if empty"
        print(f"Auto-generated name: {kiosk['name']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/hotels/kiosks/{kiosk['id']}", headers=admin_headers)
    
    def test_create_kiosk_invalid_hotel(self, admin_headers):
        """POST with non-existent hotel_id returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/admin/hotels/kiosks/create",
            headers=admin_headers,
            json={
                "hotel_id": "nonexistent123",
                "name": "Test Kiosk"
            }
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestKioskStatusToggle:
    """Tests for PUT /api/admin/hotels/kiosks/{id}/status"""
    
    @pytest.fixture
    def test_kiosk(self, admin_headers):
        """Create a test hotel and kiosk"""
        unique_id = str(uuid.uuid4())[:6]
        # Create hotel
        hotel_response = requests.post(
            f"{BASE_URL}/api/admin/hotels",
            headers=admin_headers,
            json={"name": f"TEST_StatusHotel_{unique_id}", "city": "Lyon"}
        )
        hotel = hotel_response.json()
        
        # Create kiosk
        kiosk_response = requests.post(
            f"{BASE_URL}/api/admin/hotels/kiosks/create",
            headers=admin_headers,
            json={"hotel_id": hotel["id"], "name": "TEST_StatusKiosk", "location": "Lobby"}
        )
        kiosk = kiosk_response.json()
        
        yield kiosk, hotel
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/hotels/kiosks/{kiosk['id']}", headers=admin_headers)
        requests.delete(f"{BASE_URL}/api/admin/hotels/{hotel['id']}", headers=admin_headers)
    
    def test_toggle_kiosk_to_offline(self, admin_headers, test_kiosk):
        """PUT /api/admin/hotels/kiosks/{id}/status toggles to offline"""
        kiosk, hotel = test_kiosk
        assert kiosk["status"] == "online", "New kiosk should be online"
        
        response = requests.put(
            f"{BASE_URL}/api/admin/hotels/kiosks/{kiosk['id']}/status",
            headers=admin_headers,
            json={"status": "offline"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        result = response.json()
        assert result.get("ok") == True
        
        # Verify change
        kiosks = requests.get(f"{BASE_URL}/api/admin/hotels/kiosks/all", headers=admin_headers).json()
        updated_kiosk = next((k for k in kiosks if k["id"] == kiosk["id"]), None)
        assert updated_kiosk is not None
        assert updated_kiosk["status"] == "offline", "Status should be offline"
        
        print(f"Kiosk {kiosk['id']} toggled to offline")
    
    def test_toggle_kiosk_to_online(self, admin_headers, test_kiosk):
        """PUT /api/admin/hotels/kiosks/{id}/status toggles back to online"""
        kiosk, hotel = test_kiosk
        
        # First set to offline
        requests.put(
            f"{BASE_URL}/api/admin/hotels/kiosks/{kiosk['id']}/status",
            headers=admin_headers,
            json={"status": "offline"}
        )
        
        # Then toggle back to online
        response = requests.put(
            f"{BASE_URL}/api/admin/hotels/kiosks/{kiosk['id']}/status",
            headers=admin_headers,
            json={"status": "online"}
        )
        assert response.status_code == 200
        
        # Verify change
        kiosks = requests.get(f"{BASE_URL}/api/admin/hotels/kiosks/all", headers=admin_headers).json()
        updated_kiosk = next((k for k in kiosks if k["id"] == kiosk["id"]), None)
        assert updated_kiosk["status"] == "online"
        
        print(f"Kiosk {kiosk['id']} toggled back to online")
    
    def test_toggle_nonexistent_kiosk(self, admin_headers):
        """PUT /api/admin/hotels/kiosks/{id}/status returns 404 for non-existent kiosk"""
        response = requests.put(
            f"{BASE_URL}/api/admin/hotels/kiosks/nonexistent123/status",
            headers=admin_headers,
            json={"status": "offline"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestKioskDelete:
    """Tests for DELETE /api/admin/hotels/kiosks/{id}"""
    
    @pytest.fixture
    def test_kiosk_for_delete(self, admin_headers):
        """Create a test hotel and kiosk for deletion test"""
        unique_id = str(uuid.uuid4())[:6]
        # Create hotel
        hotel_response = requests.post(
            f"{BASE_URL}/api/admin/hotels",
            headers=admin_headers,
            json={"name": f"TEST_DeleteHotel_{unique_id}", "city": "Marseille"}
        )
        hotel = hotel_response.json()
        
        # Create kiosk
        kiosk_response = requests.post(
            f"{BASE_URL}/api/admin/hotels/kiosks/create",
            headers=admin_headers,
            json={"hotel_id": hotel["id"], "name": "TEST_ToDelete", "location": "Lobby"}
        )
        kiosk = kiosk_response.json()
        
        yield kiosk, hotel
        
        # Cleanup hotel (kiosk should be deleted in test)
        requests.delete(f"{BASE_URL}/api/admin/hotels/{hotel['id']}", headers=admin_headers)
    
    def test_delete_kiosk_success(self, admin_headers, test_kiosk_for_delete):
        """DELETE /api/admin/hotels/kiosks/{id} removes kiosk"""
        kiosk, hotel = test_kiosk_for_delete
        
        response = requests.delete(
            f"{BASE_URL}/api/admin/hotels/kiosks/{kiosk['id']}",
            headers=admin_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        result = response.json()
        assert result.get("ok") == True
        
        # Verify deletion
        kiosks = requests.get(f"{BASE_URL}/api/admin/hotels/kiosks/all", headers=admin_headers).json()
        deleted_kiosk = next((k for k in kiosks if k["id"] == kiosk["id"]), None)
        assert deleted_kiosk is None, "Kiosk should not exist after deletion"
        
        print(f"Successfully deleted kiosk {kiosk['id']}")
    
    def test_delete_nonexistent_kiosk(self, admin_headers):
        """DELETE /api/admin/hotels/kiosks/{id} returns 404 for non-existent kiosk"""
        response = requests.delete(
            f"{BASE_URL}/api/admin/hotels/kiosks/nonexistent123",
            headers=admin_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestBookingsAll:
    """Tests for GET /api/admin/hotels/bookings/all"""
    
    def test_bookings_all_returns_list(self, admin_headers):
        """GET /api/admin/hotels/bookings/all returns list of bookings"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels/bookings/all", headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        bookings = response.json()
        assert isinstance(bookings, list), "Response should be a list"
        print(f"Found {len(bookings)} bookings")
        return bookings
    
    def test_bookings_have_hotel_name(self, admin_headers):
        """Each booking has hotel_name field"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels/bookings/all", headers=admin_headers)
        bookings = response.json()
        
        if len(bookings) > 0:
            booking = bookings[0]
            assert "hotel_name" in booking, "Booking should have hotel_name enrichment"
            assert booking["hotel_name"], "hotel_name should not be empty"
            print(f"Sample booking hotel: {booking['hotel_name']}")
    
    def test_bookings_have_commission_calculations(self, admin_headers):
        """Each booking has calculated commission fields"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels/bookings/all", headers=admin_headers)
        bookings = response.json()
        
        if len(bookings) > 0:
            booking = bookings[0]
            # Check commission fields exist
            assert "hotel_commission" in booking, "Booking should have hotel_commission"
            assert "zont_commission" in booking, "Booking should have zont_commission"
            assert "driver_amount" in booking, "Booking should have driver_amount"
            assert "total_price" in booking, "Booking should have total_price"
            
            # Verify math: hotel_comm + zont_comm + driver_amount = total_price
            total = booking["total_price"]
            hotel_comm = booking["hotel_commission"]
            zont_comm = booking["zont_commission"]
            driver = booking["driver_amount"]
            calculated = round(hotel_comm + zont_comm + driver, 2)
            
            assert abs(calculated - total) < 0.02, f"Commission math error: {hotel_comm} + {zont_comm} + {driver} = {calculated} != {total}"
            print(f"Booking {booking['id']}: {total} EUR = {hotel_comm} (hotel) + {zont_comm} (zont) + {driver} (driver)")
    
    def test_bookings_have_required_fields(self, admin_headers):
        """Each booking has required display fields"""
        response = requests.get(f"{BASE_URL}/api/admin/hotels/bookings/all", headers=admin_headers)
        bookings = response.json()
        
        required_fields = [
            "id", "hotel_id", "hotel_name", "client_name", "pickup_address", 
            "dropoff_address", "ride_date", "ride_time", "total_price", "status",
            "hotel_commission", "zont_commission"
        ]
        
        if len(bookings) > 0:
            booking = bookings[0]
            for field in required_fields:
                assert field in booking, f"Missing field: {field}"
            print(f"All required fields present in booking")
    
    def test_bookings_have_valid_status(self, admin_headers):
        """Booking status is a valid value"""
        valid_statuses = ["pending", "confirmed", "assigned", "completed", "cancelled", "refunded"]
        
        response = requests.get(f"{BASE_URL}/api/admin/hotels/bookings/all", headers=admin_headers)
        bookings = response.json()
        
        status_counts = {}
        for booking in bookings:
            status = booking.get("status", "unknown")
            assert status in valid_statuses, f"Invalid status: {status}"
            status_counts[status] = status_counts.get(status, 0) + 1
        
        print(f"Booking status distribution: {status_counts}")


class TestCleanupPhase2:
    """Cleanup any TEST_ prefixed kiosks and hotels"""
    
    def test_cleanup_test_data(self, admin_headers):
        """Delete TEST_ prefixed kiosks and hotels"""
        # Get all kiosks
        kiosks_response = requests.get(f"{BASE_URL}/api/admin/hotels/kiosks/all", headers=admin_headers)
        kiosks = kiosks_response.json()
        
        kiosk_deleted = 0
        for kiosk in kiosks:
            if kiosk.get("name", "").startswith("TEST_"):
                del_response = requests.delete(
                    f"{BASE_URL}/api/admin/hotels/kiosks/{kiosk['id']}",
                    headers=admin_headers
                )
                if del_response.status_code == 200:
                    kiosk_deleted += 1
        
        # Get all hotels
        hotels_response = requests.get(f"{BASE_URL}/api/admin/hotels", headers=admin_headers)
        hotels = hotels_response.json()
        
        hotel_deleted = 0
        for hotel in hotels:
            if hotel.get("name", "").startswith("TEST_"):
                del_response = requests.delete(
                    f"{BASE_URL}/api/admin/hotels/{hotel['id']}",
                    headers=admin_headers
                )
                if del_response.status_code == 200:
                    hotel_deleted += 1
        
        print(f"Cleanup: deleted {kiosk_deleted} test kiosks and {hotel_deleted} test hotels")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
