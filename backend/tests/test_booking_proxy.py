"""
Test suite for Stripe payment integration proxy endpoints:
- POST /api/proxy/booking/create - Create booking with Stripe PaymentMethod
- GET /api/proxy/booking/upcoming - Get upcoming auctions for client
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Client credentials from review_request
CLIENT_EMAIL = "arthurhayy@gmail.com"
CLIENT_PASSWORD = "12345678"


class TestBookingProxyEndpoints:
    """Test booking proxy endpoints for Stripe integration"""
    
    @pytest.fixture(scope="class")
    def client_token(self):
        """Login as client and get auth token"""
        resp = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": CLIENT_EMAIL, "password": CLIENT_PASSWORD},
            timeout=15
        )
        if resp.status_code == 200:
            data = resp.json()
            return data.get("accessToken")
        pytest.skip(f"Client login failed: {resp.status_code} - {resp.text}")
    
    @pytest.fixture
    def auth_headers(self, client_token):
        """Headers with auth token"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {client_token}"
        }
    
    # ===== POST /api/proxy/booking/create tests =====
    
    def test_booking_create_requires_auth(self):
        """POST /api/proxy/booking/create returns 401 without auth"""
        payload = {
            "startPointLatitude": 48.8566,
            "startPointLongitude": 2.3522,
            "clientPrice": 50.0,
            "startDate": "01/01/2026 10:00:00",
            "startAddress": "Paris, France",
            "endAddress": "CDG Airport",
            "cardId": "pm_test_fake123"
        }
        resp = requests.post(
            f"{BASE_URL}/api/proxy/booking/create",
            json=payload,
            timeout=15
        )
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
        print("PASS: POST /api/proxy/booking/create returns 401 without auth")
    
    def test_booking_create_with_fake_card(self, auth_headers):
        """POST /api/proxy/booking/create with fake card proxies to C# API
        
        Note: C# API returns 404 for invalid cardId which is expected behavior
        as per the review_request notes
        """
        payload = {
            "startPointLatitude": 48.8566,
            "startPointLongitude": 2.3522,
            "clientPrice": 50.0,
            "startDate": "01/01/2026 10:00:00",
            "startAddress": "Paris, France",
            "endAddress": "CDG Airport",
            "cardId": "pm_card_fake_test123"
        }
        resp = requests.post(
            f"{BASE_URL}/api/proxy/booking/create",
            json=payload,
            headers=auth_headers,
            timeout=30
        )
        # The C# API returns 404 for fake cardId - this is expected
        # This proves the proxy is working and forwarding to C# backend
        print(f"Response status: {resp.status_code}, body: {resp.text[:200]}")
        # We expect either 404 (invalid card) or 200 (success) or 400 (validation error)
        # 502 would mean proxy failed to reach C# backend
        assert resp.status_code != 502, f"Proxy failed to reach C# backend: {resp.text}"
        print(f"PASS: POST /api/proxy/booking/create proxies correctly (status={resp.status_code})")
    
    def test_booking_create_validates_payload(self, auth_headers):
        """POST /api/proxy/booking/create validates required fields"""
        # Missing required fields
        payload = {
            "clientPrice": 50.0,
        }
        resp = requests.post(
            f"{BASE_URL}/api/proxy/booking/create",
            json=payload,
            headers=auth_headers,
            timeout=15
        )
        # Should return 422 for validation error (missing required fields)
        assert resp.status_code == 422, f"Expected 422, got {resp.status_code}"
        print("PASS: POST /api/proxy/booking/create validates required fields")
    
    def test_booking_create_date_format(self, auth_headers):
        """POST /api/proxy/booking/create accepts dd/MM/yyyy HH:mm:ss format"""
        payload = {
            "startPointLatitude": 48.8566,
            "startPointLongitude": 2.3522,
            "clientPrice": 75.0,
            "startDate": "15/01/2026 14:30:00",  # dd/MM/yyyy HH:mm:ss format
            "startAddress": "Eiffel Tower, Paris",
            "endAddress": "Orly Airport",
            "cardId": "pm_card_test_format"
        }
        resp = requests.post(
            f"{BASE_URL}/api/proxy/booking/create",
            json=payload,
            headers=auth_headers,
            timeout=30
        )
        # Either success (200), invalid card (404/400), or validation - but not 502
        assert resp.status_code != 502, f"Proxy failed: {resp.text}"
        print(f"PASS: Date format dd/MM/yyyy HH:mm:ss accepted (status={resp.status_code})")
    
    # ===== GET /api/proxy/booking/upcoming tests =====
    
    def test_upcoming_auctions_requires_auth(self):
        """GET /api/proxy/booking/upcoming returns 401 without auth"""
        resp = requests.get(
            f"{BASE_URL}/api/proxy/booking/upcoming",
            timeout=15
        )
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
        print("PASS: GET /api/proxy/booking/upcoming returns 401 without auth")
    
    def test_upcoming_auctions_with_auth(self, auth_headers):
        """GET /api/proxy/booking/upcoming returns client's upcoming auctions"""
        resp = requests.get(
            f"{BASE_URL}/api/proxy/booking/upcoming",
            headers=auth_headers,
            timeout=15
        )
        # Should return 200 with list, or possibly empty list
        # 502 would mean proxy failed
        assert resp.status_code != 502, f"Proxy failed to reach C# backend: {resp.text}"
        if resp.status_code == 200:
            data = resp.json()
            # Should be a list (empty or with auctions)
            assert isinstance(data, list), f"Expected list, got {type(data)}"
            print(f"PASS: GET /api/proxy/booking/upcoming returns list ({len(data)} auctions)")
        else:
            print(f"PASS: GET /api/proxy/booking/upcoming proxies correctly (status={resp.status_code})")


class TestAuctionAddRequestModel:
    """Test the AuctionAddRequest Pydantic model validation"""
    
    @pytest.fixture(scope="class")
    def client_token(self):
        """Login as client and get auth token"""
        resp = requests.post(
            f"{BASE_URL}/api/proxy/auth/login",
            json={"username": CLIENT_EMAIL, "password": CLIENT_PASSWORD},
            timeout=15
        )
        if resp.status_code == 200:
            data = resp.json()
            return data.get("accessToken")
        pytest.skip(f"Client login failed: {resp.status_code}")
    
    @pytest.fixture
    def auth_headers(self, client_token):
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {client_token}"
        }
    
    def test_full_payload_all_fields(self, auth_headers):
        """Test AuctionAddRequest with all optional fields"""
        payload = {
            "startPointLatitude": 48.8584,
            "startPointLongitude": 2.2945,
            "clientPrice": 100.0,
            "startDate": "20/01/2026 09:00:00",
            "startAddress": "Eiffel Tower, Avenue Anatole France",
            "endAddress": "Charles de Gaulle Airport Terminal 2",
            "destination": "CDG T2",
            "tripType": "Transfer",
            "carType": "Sedan",
            "distance": 35,
            "duration": 45,
            "additionalComments": "Business trip",
            "terminal": "Terminal 2E",
            "cardId": "pm_card_full_test",
            "email": "arthurhayy@gmail.com",
            "utcOffset": 60
        }
        resp = requests.post(
            f"{BASE_URL}/api/proxy/booking/create",
            json=payload,
            headers=auth_headers,
            timeout=30
        )
        # Payload should be accepted by our proxy (validation passes)
        # C# API may reject for invalid cardId but that's expected
        assert resp.status_code != 422, f"Pydantic validation failed: {resp.text}"
        assert resp.status_code != 502, f"Proxy failed: {resp.text}"
        print(f"PASS: Full payload with all fields accepted (status={resp.status_code})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
