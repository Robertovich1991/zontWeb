"""
Kiosk API Tests - Hotel Lobby Self-Service Booking
Tests for:
- GET /api/kiosk/{slug} - Get hotel info with destinations
- POST /api/kiosk/{slug}/prices - Get real-time prices from C# API
- POST /api/kiosk/book - Create a kiosk booking
- GET /api/kiosk/{slug}/bookings - Get recent kiosk bookings
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Demo hotel slug
DEMO_HOTEL_SLUG = "bristol"


class TestKioskHotelInfo:
    """Tests for GET /api/kiosk/{slug}"""
    
    def test_get_hotel_info_success(self):
        """GET /api/kiosk/bristol returns hotel info"""
        response = requests.get(f"{BASE_URL}/api/kiosk/{DEMO_HOTEL_SLUG}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        hotel = response.json()
        assert hotel["slug"] == "bristol"
        assert hotel["name"] == "Hotel Le Bristol Paris"
        assert "address" in hotel
        assert "lat" in hotel
        assert "lng" in hotel
        print(f"Hotel: {hotel['name']} at {hotel['address']}")
    
    def test_hotel_has_6_destinations(self):
        """Hotel has exactly 6 popular destinations"""
        response = requests.get(f"{BASE_URL}/api/kiosk/{DEMO_HOTEL_SLUG}")
        assert response.status_code == 200
        
        hotel = response.json()
        destinations = hotel.get("destinations", [])
        assert len(destinations) == 6, f"Expected 6 destinations, got {len(destinations)}"
        
        expected_names = ["CDG Terminal 1", "CDG Terminal 2", "Orly Aeroport", 
                         "Gare de Lyon", "Gare du Nord", "Disneyland Paris"]
        actual_names = [d["name"] for d in destinations]
        for name in expected_names:
            assert name in actual_names, f"Missing destination: {name}"
        
        print(f"Destinations: {actual_names}")
    
    def test_destinations_have_required_fields(self):
        """Each destination has name, address, lat, lng, icon"""
        response = requests.get(f"{BASE_URL}/api/kiosk/{DEMO_HOTEL_SLUG}")
        hotel = response.json()
        
        for dest in hotel["destinations"]:
            assert "name" in dest, "Missing name"
            assert "address" in dest, "Missing address"
            assert "lat" in dest, "Missing lat"
            assert "lng" in dest, "Missing lng"
            assert "icon" in dest, "Missing icon"
            assert dest["icon"] in ["plane", "train", "star"], f"Invalid icon: {dest['icon']}"
    
    def test_nonexistent_hotel_returns_404(self):
        """GET /api/kiosk/nonexistent returns 404"""
        response = requests.get(f"{BASE_URL}/api/kiosk/nonexistent_hotel_xyz")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestKioskPrices:
    """Tests for POST /api/kiosk/{slug}/prices"""
    
    def test_get_prices_success(self):
        """POST /api/kiosk/bristol/prices returns prices from C# API"""
        response = requests.post(f"{BASE_URL}/api/kiosk/{DEMO_HOTEL_SLUG}/prices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "hotel" in data
        assert "destinations" in data
        assert data["hotel"]["slug"] == "bristol"
        print(f"Got prices for {len(data['destinations'])} destinations")
    
    def test_prices_have_6_destinations(self):
        """Prices response has 6 destinations with vehicle data"""
        response = requests.post(f"{BASE_URL}/api/kiosk/{DEMO_HOTEL_SLUG}/prices")
        data = response.json()
        
        destinations = data["destinations"]
        assert len(destinations) == 6, f"Expected 6 destinations, got {len(destinations)}"
    
    def test_destinations_have_vehicles(self):
        """Each destination has vehicles array with pricing"""
        response = requests.post(f"{BASE_URL}/api/kiosk/{DEMO_HOTEL_SLUG}/prices")
        data = response.json()
        
        for dest in data["destinations"]:
            assert "vehicles" in dest, f"Missing vehicles for {dest['name']}"
            assert "cheapest" in dest, f"Missing cheapest for {dest['name']}"
            
            if len(dest["vehicles"]) > 0:
                vehicle = dest["vehicles"][0]
                assert "tripType" in vehicle, "Missing tripType"
                assert "minAmount" in vehicle, "Missing minAmount"
                assert "maxAmount" in vehicle, "Missing maxAmount"
                assert "duration" in vehicle, "Missing duration"
                assert "distance" in vehicle, "Missing distance"
                assert "passenger" in vehicle, "Missing passenger"
                assert "luggage" in vehicle, "Missing luggage"
                
                print(f"{dest['name']}: {len(dest['vehicles'])} vehicles, cheapest: {dest['cheapest']}€")
    
    def test_cheapest_is_minimum_price(self):
        """Cheapest field equals minimum minAmount across vehicles"""
        response = requests.post(f"{BASE_URL}/api/kiosk/{DEMO_HOTEL_SLUG}/prices")
        data = response.json()
        
        for dest in data["destinations"]:
            if len(dest["vehicles"]) > 0:
                min_price = min(v["minAmount"] for v in dest["vehicles"])
                assert dest["cheapest"] == min_price, f"Cheapest mismatch for {dest['name']}: {dest['cheapest']} != {min_price}"
    
    def test_nonexistent_hotel_prices_returns_404(self):
        """POST /api/kiosk/nonexistent/prices returns 404"""
        response = requests.post(f"{BASE_URL}/api/kiosk/nonexistent_hotel_xyz/prices")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestKioskBooking:
    """Tests for POST /api/kiosk/book"""
    
    def test_create_booking_success(self):
        """POST /api/kiosk/book creates booking with ZK-XXXXX reference"""
        unique_id = str(uuid.uuid4())[:6]
        booking_data = {
            "hotelSlug": DEMO_HOTEL_SLUG,
            "clientName": f"TEST_User_{unique_id}",
            "clientPhone": "+33612345678",
            "destination": "CDG Terminal 1",
            "destinationAddress": "Aeroport Charles de Gaulle T1, 95700 Roissy-en-France",
            "date": "2026-01-25",
            "time": "10:00",
            "vehicleType": "Regular Zont",
            "price": 74,
            "passengers": 1
        }
        
        response = requests.post(
            f"{BASE_URL}/api/kiosk/book",
            json=booking_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "reference" in data, "Missing reference"
        assert data["reference"].startswith("ZK-"), f"Reference should start with ZK-: {data['reference']}"
        assert len(data["reference"]) == 8, f"Reference should be 8 chars (ZK-XXXXX): {data['reference']}"
        
        assert "booking" in data
        booking = data["booking"]
        assert booking["hotelSlug"] == DEMO_HOTEL_SLUG
        assert booking["clientName"] == f"TEST_User_{unique_id}"
        assert booking["status"] == "confirmed"
        assert booking["hotelName"] == "Hotel Le Bristol Paris"
        
        print(f"Created booking: {data['reference']}")
    
    def test_booking_has_all_fields(self):
        """Booking response has all required fields"""
        booking_data = {
            "hotelSlug": DEMO_HOTEL_SLUG,
            "clientName": "TEST_FieldCheck",
            "clientPhone": "+33699887766",
            "destination": "Orly Aeroport",
            "destinationAddress": "Aeroport d'Orly, 94390 Orly",
            "date": "2026-01-26",
            "time": "15:30",
            "vehicleType": "Luxury Sedan",
            "price": 95,
            "passengers": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/kiosk/book", json=booking_data)
        assert response.status_code == 200
        
        booking = response.json()["booking"]
        required_fields = [
            "reference", "hotelSlug", "hotelName", "pickup", "pickupLat", "pickupLng",
            "destination", "destinationAddress", "clientName", "clientPhone",
            "date", "time", "vehicleType", "price", "passengers", "status", "createdAt"
        ]
        
        for field in required_fields:
            assert field in booking, f"Missing field: {field}"
        
        print(f"All {len(required_fields)} required fields present")
    
    def test_booking_nonexistent_hotel_returns_404(self):
        """POST /api/kiosk/book with invalid hotel returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/kiosk/book",
            json={
                "hotelSlug": "nonexistent_hotel_xyz",
                "clientName": "Test",
                "clientPhone": "+33600000000",
                "destination": "CDG",
                "destinationAddress": "CDG",
                "date": "2026-01-20",
                "time": "10:00",
                "vehicleType": "Regular",
                "price": 50,
                "passengers": 1
            }
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestKioskBookingsList:
    """Tests for GET /api/kiosk/{slug}/bookings"""
    
    def test_get_bookings_success(self):
        """GET /api/kiosk/bristol/bookings returns list of bookings"""
        response = requests.get(f"{BASE_URL}/api/kiosk/{DEMO_HOTEL_SLUG}/bookings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        bookings = response.json()
        assert isinstance(bookings, list), "Response should be a list"
        print(f"Found {len(bookings)} bookings")
    
    def test_bookings_have_required_fields(self):
        """Each booking has required fields"""
        response = requests.get(f"{BASE_URL}/api/kiosk/{DEMO_HOTEL_SLUG}/bookings")
        bookings = response.json()
        
        if len(bookings) > 0:
            booking = bookings[0]
            required_fields = ["reference", "hotelSlug", "clientName", "destination", 
                              "date", "time", "vehicleType", "price", "status"]
            
            for field in required_fields:
                assert field in booking, f"Missing field: {field}"
            
            print(f"Sample booking: {booking['reference']} - {booking['clientName']} to {booking['destination']}")
    
    def test_bookings_sorted_by_created_at_desc(self):
        """Bookings are sorted by createdAt descending (newest first)"""
        response = requests.get(f"{BASE_URL}/api/kiosk/{DEMO_HOTEL_SLUG}/bookings")
        bookings = response.json()
        
        if len(bookings) >= 2:
            for i in range(len(bookings) - 1):
                assert bookings[i]["createdAt"] >= bookings[i+1]["createdAt"], \
                    f"Bookings not sorted: {bookings[i]['createdAt']} < {bookings[i+1]['createdAt']}"
            print("Bookings correctly sorted by createdAt DESC")
    
    def test_bookings_limit_parameter(self):
        """Limit parameter restricts number of results"""
        response = requests.get(f"{BASE_URL}/api/kiosk/{DEMO_HOTEL_SLUG}/bookings?limit=2")
        bookings = response.json()
        
        assert len(bookings) <= 2, f"Expected max 2 bookings, got {len(bookings)}"
        print(f"Limit=2 returned {len(bookings)} bookings")


class TestKioskCleanup:
    """Cleanup TEST_ prefixed bookings"""
    
    def test_cleanup_test_bookings(self):
        """Note: Kiosk bookings don't have a delete endpoint - this is informational only"""
        response = requests.get(f"{BASE_URL}/api/kiosk/{DEMO_HOTEL_SLUG}/bookings?limit=50")
        bookings = response.json()
        
        test_bookings = [b for b in bookings if b.get("clientName", "").startswith("TEST_")]
        print(f"Found {len(test_bookings)} TEST_ prefixed bookings (no delete endpoint available)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
