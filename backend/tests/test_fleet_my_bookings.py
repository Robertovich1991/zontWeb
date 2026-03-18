"""
Tests for Fleet My Bookings API (Mes Reservations) - Company's own reservations in MongoDB.
Tests: CRUD operations, assign/unassign drivers, send to Zont, cancel booking
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Fleet company credentials
FLEET_EMAIL = "Nandetiri1@gmail.com"
FLEET_PASSWORD = "12345678"

# Test driver for assignment (from context)
TEST_DRIVER_ID = "858e3dc3-5bb4-431d-b108-4c620375551c"
TEST_DRIVER_NAME = "Mariam saroyan"


@pytest.fixture(scope="module")
def fleet_token():
    """Get fleet company JWT token for authenticated requests."""
    response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
        "username": FLEET_EMAIL,
        "password": FLEET_PASSWORD
    })
    assert response.status_code == 200, f"Fleet login failed: {response.text}"
    data = response.json()
    return data.get("accessToken")


@pytest.fixture(scope="module")
def auth_headers(fleet_token):
    """Authenticated headers for fleet API requests."""
    return {
        "Authorization": f"Bearer {fleet_token}",
        "Content-Type": "application/json"
    }


class TestMyBookingsUnauthorized:
    """Test endpoints require authentication."""
    
    def test_list_unauthorized(self):
        """GET /api/fleet/my-bookings returns 401 without token."""
        response = requests.get(f"{BASE_URL}/api/fleet/my-bookings")
        assert response.status_code == 401
        print("PASS: List my-bookings returns 401 without auth")
    
    def test_create_unauthorized(self):
        """POST /api/fleet/my-bookings returns 401 without token."""
        response = requests.post(f"{BASE_URL}/api/fleet/my-bookings", json={
            "type": "transfer",
            "date": "2026-01-20",
            "time": "10:00",
            "pickupAddress": "Airport",
            "dropoffAddress": "Hotel"
        })
        assert response.status_code == 401
        print("PASS: Create my-booking returns 401 without auth")


class TestMyBookingsList:
    """Test listing my bookings."""
    
    def test_list_bookings_authenticated(self, auth_headers):
        """GET /api/fleet/my-bookings returns array of bookings."""
        response = requests.get(f"{BASE_URL}/api/fleet/my-bookings", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: List my-bookings returns {len(data)} bookings")
        return data
    
    def test_list_bookings_with_type_filter(self, auth_headers):
        """GET /api/fleet/my-bookings?type=transfer filters by type."""
        response = requests.get(f"{BASE_URL}/api/fleet/my-bookings?type=transfer", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned bookings should be transfer type
        for booking in data:
            assert booking.get("type") == "transfer"
        print(f"PASS: List with type=transfer returns {len(data)} bookings")
    
    def test_list_bookings_with_status_filter(self, auth_headers):
        """GET /api/fleet/my-bookings?status=new filters by status."""
        response = requests.get(f"{BASE_URL}/api/fleet/my-bookings?status=new", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned bookings should be 'new' status
        for booking in data:
            assert booking.get("status") == "new"
        print(f"PASS: List with status=new returns {len(data)} bookings")


class TestCreateTransferBooking:
    """Test creating Transfer type booking."""
    
    def test_create_transfer_success(self, auth_headers):
        """POST /api/fleet/my-bookings creates transfer booking."""
        payload = {
            "type": "transfer",
            "date": "2026-02-01",
            "time": "09:00",
            "passengers": 3,
            "pickupAddress": "TEST_Airport CDG Terminal 2",
            "dropoffAddress": "TEST_Hotel Ritz Paris",
            "price": 150.50,
            "comment": "TEST_VIP client, please be on time"
        }
        response = requests.post(f"{BASE_URL}/api/fleet/my-bookings", headers=auth_headers, json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert data["type"] == "transfer"
        assert data["date"] == "2026-02-01"
        assert data["time"] == "09:00"
        assert data["passengers"] == 3
        assert data["pickupAddress"] == "TEST_Airport CDG Terminal 2"
        assert data["dropoffAddress"] == "TEST_Hotel Ritz Paris"
        assert data["price"] == 150.50
        assert data["comment"] == "TEST_VIP client, please be on time"
        assert data["status"] == "new"
        assert data["driver"] is None
        assert data["sentToZont"] == False
        
        print(f"PASS: Created transfer booking with ID: {data['id']}")
        return data
    
    def test_create_transfer_missing_addresses(self, auth_headers):
        """POST /api/fleet/my-bookings returns 400 for transfer without addresses."""
        payload = {
            "type": "transfer",
            "date": "2026-02-01",
            "time": "10:00"
        }
        response = requests.post(f"{BASE_URL}/api/fleet/my-bookings", headers=auth_headers, json=payload)
        assert response.status_code == 400
        print("PASS: Create transfer without addresses returns 400")


class TestCreateDispoBooking:
    """Test creating Dispo type booking."""
    
    def test_create_dispo_success(self, auth_headers):
        """POST /api/fleet/my-bookings creates dispo booking."""
        payload = {
            "type": "dispo",
            "date": "2026-02-02",
            "time": "14:00",
            "hours": 4,
            "vehicleModel": "Mercedes S-Class",
            "price": 280.00,
            "comment": "TEST_Corporate client tour"
        }
        response = requests.post(f"{BASE_URL}/api/fleet/my-bookings", headers=auth_headers, json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert data["type"] == "dispo"
        assert data["hours"] == 4
        assert data["vehicleModel"] == "Mercedes S-Class"
        assert data["status"] == "new"
        
        print(f"PASS: Created dispo booking with ID: {data['id']}")
        return data
    
    def test_create_dispo_missing_hours(self, auth_headers):
        """POST /api/fleet/my-bookings returns 400 for dispo without hours."""
        payload = {
            "type": "dispo",
            "date": "2026-02-02",
            "time": "15:00"
        }
        response = requests.post(f"{BASE_URL}/api/fleet/my-bookings", headers=auth_headers, json=payload)
        assert response.status_code == 400
        print("PASS: Create dispo without hours returns 400")


class TestCreateExcursionBooking:
    """Test creating Excursion type booking."""
    
    def test_create_excursion_success(self, auth_headers):
        """POST /api/fleet/my-bookings creates excursion booking."""
        payload = {
            "type": "excursion",
            "date": "2026-02-03",
            "time": "08:00",
            "pickupAddress": "TEST_Hotel Bristol Paris",
            "hours": 6,
            "vehicleModel": "Mercedes V-Class",
            "tourName": "Versailles Palace",
            "guideName": "Jean-Pierre Martin",
            "price": 450.00,
            "comment": "TEST_Group excursion to Versailles"
        }
        response = requests.post(f"{BASE_URL}/api/fleet/my-bookings", headers=auth_headers, json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert data["type"] == "excursion"
        assert data["pickupAddress"] == "TEST_Hotel Bristol Paris"
        assert data["hours"] == 6
        assert data["tourName"] == "Versailles Palace"
        assert data["guideName"] == "Jean-Pierre Martin"
        assert data["status"] == "new"
        
        print(f"PASS: Created excursion booking with ID: {data['id']}")
        return data
    
    def test_create_excursion_missing_pickup(self, auth_headers):
        """POST /api/fleet/my-bookings returns 400 for excursion without pickup address."""
        payload = {
            "type": "excursion",
            "date": "2026-02-03",
            "time": "09:00"
        }
        response = requests.post(f"{BASE_URL}/api/fleet/my-bookings", headers=auth_headers, json=payload)
        assert response.status_code == 400
        print("PASS: Create excursion without pickup returns 400")


class TestBookingActions:
    """Test booking actions: assign, unassign, send-to-zont, cancel."""
    
    @pytest.fixture(scope="class")
    def test_booking_id(self, auth_headers):
        """Create a test booking for action tests."""
        payload = {
            "type": "transfer",
            "date": "2026-02-10",
            "time": "11:00",
            "passengers": 2,
            "pickupAddress": "TEST_Action Test Pickup",
            "dropoffAddress": "TEST_Action Test Dropoff",
            "price": 100.00
        }
        response = requests.post(f"{BASE_URL}/api/fleet/my-bookings", headers=auth_headers, json=payload)
        assert response.status_code == 200
        booking_id = response.json()["id"]
        print(f"Created test booking for actions: {booking_id}")
        return booking_id
    
    def test_assign_driver(self, auth_headers, test_booking_id):
        """PUT /api/fleet/my-bookings/{id}/assign assigns driver and changes status."""
        response = requests.put(
            f"{BASE_URL}/api/fleet/my-bookings/{test_booking_id}/assign",
            headers=auth_headers,
            json={
                "driverId": TEST_DRIVER_ID,
                "driverName": TEST_DRIVER_NAME
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        # Verify booking is updated
        get_response = requests.get(f"{BASE_URL}/api/fleet/my-bookings/{test_booking_id}", headers=auth_headers)
        assert get_response.status_code == 200
        booking = get_response.json()
        assert booking["status"] == "assigned"
        assert booking["driver"]["id"] == TEST_DRIVER_ID
        assert booking["driver"]["name"] == TEST_DRIVER_NAME
        
        print(f"PASS: Assigned driver {TEST_DRIVER_NAME} to booking {test_booking_id}, status is now 'assigned'")
    
    def test_unassign_driver(self, auth_headers, test_booking_id):
        """PUT /api/fleet/my-bookings/{id}/unassign removes driver and resets status."""
        response = requests.put(
            f"{BASE_URL}/api/fleet/my-bookings/{test_booking_id}/unassign",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        # Verify booking is updated
        get_response = requests.get(f"{BASE_URL}/api/fleet/my-bookings/{test_booking_id}", headers=auth_headers)
        assert get_response.status_code == 200
        booking = get_response.json()
        assert booking["status"] == "new"
        assert booking["driver"] is None
        
        print(f"PASS: Unassigned driver from booking {test_booking_id}, status is now 'new'")
    
    def test_send_to_zont(self, auth_headers, test_booking_id):
        """PUT /api/fleet/my-bookings/{id}/send-to-zont marks booking as sent."""
        response = requests.put(
            f"{BASE_URL}/api/fleet/my-bookings/{test_booking_id}/send-to-zont",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        # Verify booking is updated
        get_response = requests.get(f"{BASE_URL}/api/fleet/my-bookings/{test_booking_id}", headers=auth_headers)
        assert get_response.status_code == 200
        booking = get_response.json()
        assert booking["status"] == "sent_to_zont"
        assert booking["sentToZont"] == True
        
        print(f"PASS: Sent booking {test_booking_id} to Zont, status is now 'sent_to_zont'")
    
    def test_cancel_booking(self, auth_headers, test_booking_id):
        """PUT /api/fleet/my-bookings/{id}/cancel cancels the booking."""
        response = requests.put(
            f"{BASE_URL}/api/fleet/my-bookings/{test_booking_id}/cancel",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        # Verify booking is updated
        get_response = requests.get(f"{BASE_URL}/api/fleet/my-bookings/{test_booking_id}", headers=auth_headers)
        assert get_response.status_code == 200
        booking = get_response.json()
        assert booking["status"] == "cancelled"
        
        print(f"PASS: Cancelled booking {test_booking_id}, status is now 'cancelled'")


class TestBookingNotFound:
    """Test 404 error handling for non-existent bookings."""
    
    def test_get_nonexistent_booking(self, auth_headers):
        """GET /api/fleet/my-bookings/{id} returns 404 for non-existent ID."""
        fake_id = "non-existent-booking-id"
        response = requests.get(f"{BASE_URL}/api/fleet/my-bookings/{fake_id}", headers=auth_headers)
        assert response.status_code == 404
        print("PASS: Get non-existent booking returns 404")
    
    def test_assign_nonexistent_booking(self, auth_headers):
        """PUT /api/fleet/my-bookings/{id}/assign returns 404 for non-existent ID."""
        fake_id = "non-existent-booking-id"
        response = requests.put(
            f"{BASE_URL}/api/fleet/my-bookings/{fake_id}/assign",
            headers=auth_headers,
            json={"driverId": "test", "driverName": "Test"}
        )
        assert response.status_code == 404
        print("PASS: Assign non-existent booking returns 404")


class TestInvalidBookingType:
    """Test validation of booking type."""
    
    def test_create_invalid_type(self, auth_headers):
        """POST /api/fleet/my-bookings returns 400 for invalid type."""
        payload = {
            "type": "invalid_type",
            "date": "2026-02-01",
            "time": "10:00"
        }
        response = requests.post(f"{BASE_URL}/api/fleet/my-bookings", headers=auth_headers, json=payload)
        assert response.status_code == 400
        print("PASS: Create booking with invalid type returns 400")


class TestCleanup:
    """Clean up test data created during tests."""
    
    def test_delete_test_bookings(self, auth_headers):
        """Delete bookings created during testing (prefixed with TEST_)."""
        # Get all bookings
        response = requests.get(f"{BASE_URL}/api/fleet/my-bookings", headers=auth_headers)
        assert response.status_code == 200
        bookings = response.json()
        
        deleted_count = 0
        for booking in bookings:
            # Delete bookings with TEST_ prefix in addresses or comments
            if (booking.get("pickupAddress", "").startswith("TEST_") or 
                booking.get("dropoffAddress", "").startswith("TEST_") or
                booking.get("comment", "").startswith("TEST_")):
                del_response = requests.delete(
                    f"{BASE_URL}/api/fleet/my-bookings/{booking['id']}", 
                    headers=auth_headers
                )
                if del_response.status_code == 200:
                    deleted_count += 1
        
        print(f"PASS: Cleaned up {deleted_count} test bookings")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
