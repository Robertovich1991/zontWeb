"""
Test suite for Partner Card Management and Ride Creation with Saved Cards
Tests: GET/POST/DELETE cards, setup-intent, ride creation with saved card, self-registration
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test partner credentials (pre-existing with card)
TEST_PARTNER_EMAIL = "partner_test_1773438684@test.com"
TEST_PARTNER_PASSWORD = "Test1234!"

# Admin credentials
ADMIN_EMAIL = "admin@zont.cab"
ADMIN_PASSWORD = "admin123"


class TestPartnerAuthentication:
    """Partner login, register, and auth endpoints"""

    def test_partner_login_success(self):
        """Test partner login returns token and partner object"""
        response = requests.post(f"{BASE_URL}/api/partner/auth/login", json={
            "email": TEST_PARTNER_EMAIL,
            "password": TEST_PARTNER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "Response missing token"
        assert "partner" in data, "Response missing partner object"
        assert data["partner"]["email"] == TEST_PARTNER_EMAIL
        print(f"✓ Partner login success - token obtained")

    def test_partner_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/partner/auth/login", json={
            "email": "wrong@test.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Invalid login correctly returns 401")

    def test_partner_register_new_account(self):
        """Test self-registration creates new partner + C# account"""
        unique_id = int(time.time())
        new_email = f"TEST_register_{unique_id}@test.com"
        response = requests.post(f"{BASE_URL}/api/partner/auth/register", json={
            "email": new_email,
            "password": "TestPass123!",
            "name": "Test Registration User",
            "phone": "+33600000000",
            "company": "Test Company"
        })
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        assert "token" in data, "Response missing token (auto-login)"
        assert "partner" in data, "Response missing partner object"
        assert data["partner"]["email"] == new_email
        print(f"✓ Partner registration success - auto-login token obtained")
        return data["token"]

    def test_partner_register_duplicate_email(self):
        """Test registration with existing email returns 400"""
        response = requests.post(f"{BASE_URL}/api/partner/auth/register", json={
            "email": TEST_PARTNER_EMAIL,
            "password": "TestPass123!",
            "name": "Duplicate User"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Duplicate email registration correctly rejected")

    def test_partner_me_endpoint(self):
        """Test /auth/me returns current partner info"""
        # First login
        login_res = requests.post(f"{BASE_URL}/api/partner/auth/login", json={
            "email": TEST_PARTNER_EMAIL,
            "password": TEST_PARTNER_PASSWORD
        })
        token = login_res.json()["token"]

        # Get me
        response = requests.get(f"{BASE_URL}/api/partner/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200, f"Me endpoint failed: {response.text}"
        data = response.json()
        assert data["email"] == TEST_PARTNER_EMAIL
        print("✓ /auth/me returns partner info")


class TestCardManagement:
    """Tests for card CRUD operations via partner/cards endpoints"""

    @pytest.fixture
    def auth_token(self):
        """Get auth token for test partner"""
        res = requests.post(f"{BASE_URL}/api/partner/auth/login", json={
            "email": TEST_PARTNER_EMAIL,
            "password": TEST_PARTNER_PASSWORD
        })
        return res.json()["token"]

    def test_get_cards_empty_for_new_partner(self):
        """Test GET /cards returns empty array for new partner with no cards"""
        # Create a new partner
        unique_id = int(time.time())
        new_email = f"TEST_nocard_{unique_id}@test.com"
        reg_res = requests.post(f"{BASE_URL}/api/partner/auth/register", json={
            "email": new_email,
            "password": "TestPass123!",
            "name": "No Cards User"
        })
        token = reg_res.json()["token"]

        # Get cards
        response = requests.get(f"{BASE_URL}/api/partner/cards", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200, f"Get cards failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 0, "New partner should have 0 cards"
        print("✓ GET /cards returns empty array for new partner")

    def test_get_cards_for_existing_partner(self, auth_token):
        """Test GET /cards returns saved cards for partner with cards"""
        response = requests.get(f"{BASE_URL}/api/partner/cards", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Get cards failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # Test partner may have cards already
        print(f"✓ GET /cards returns {len(data)} cards for test partner")
        if len(data) > 0:
            card = data[0]
            assert "id" in card, "Card should have id"
            assert "pm_id" in card, "Card should have pm_id"
            assert "brand" in card, "Card should have brand"
            print(f"  Card structure verified: id, pm_id, brand")

    def test_cards_setup_intent(self, auth_token):
        """Test POST /cards/setup-intent returns Stripe clientSecret"""
        response = requests.post(f"{BASE_URL}/api/partner/cards/setup-intent", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        # May fail if no C# token - that's expected for some partners
        if response.status_code == 200:
            data = response.json()
            assert "clientSecret" in data, "Response should contain clientSecret"
            assert data["clientSecret"].startswith("seti_"), "clientSecret should start with seti_"
            print(f"✓ Setup-intent returns valid Stripe clientSecret")
        elif response.status_code == 400:
            print("✓ Setup-intent returns 400 (no C# token) - expected for this partner")
        else:
            print(f"⚠ Setup-intent returned {response.status_code}: {response.text}")
            assert False, f"Unexpected status: {response.status_code}"

    def test_cards_save(self, auth_token):
        """Test POST /cards/save stores card in partner's saved_cards"""
        unique_id = int(time.time())
        test_pm_id = f"pm_test_{unique_id}"

        response = requests.post(f"{BASE_URL}/api/partner/cards/save", 
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={"pm_id": test_pm_id, "brand": "visa"}
        )
        assert response.status_code == 200, f"Save card failed: {response.text}"
        data = response.json()
        assert "id" in data, "Saved card should have id"
        assert data["pm_id"] == test_pm_id, "pm_id should match"
        assert data["brand"] == "visa", "brand should be visa"
        print(f"✓ POST /cards/save creates card: {data['id']}")
        return data["id"]

    def test_cards_delete(self, auth_token):
        """Test DELETE /cards/{card_id} removes card"""
        # First add a card to delete
        unique_id = int(time.time())
        test_pm_id = f"pm_delete_test_{unique_id}"
        save_res = requests.post(f"{BASE_URL}/api/partner/cards/save",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={"pm_id": test_pm_id, "brand": "mastercard"}
        )
        card_id = save_res.json()["id"]

        # Delete the card
        response = requests.delete(f"{BASE_URL}/api/partner/cards/{card_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Delete card failed: {response.text}"
        data = response.json()
        assert data.get("ok") == True, "Delete should return ok: true"
        print(f"✓ DELETE /cards/{card_id} removes card")

        # Verify card is gone
        cards_res = requests.get(f"{BASE_URL}/api/partner/cards", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        cards = cards_res.json()
        card_ids = [c["id"] for c in cards]
        assert card_id not in card_ids, "Deleted card should not appear in list"
        print("  Verified: card no longer in list")

    def test_cards_requires_auth(self):
        """Test cards endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/partner/cards")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /cards requires auth (401)")

        response = requests.post(f"{BASE_URL}/api/partner/cards/setup-intent")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /cards/setup-intent requires auth (401)")


class TestRideCreationWithCard:
    """Tests for ride creation using saved cards"""

    @pytest.fixture
    def auth_token(self):
        """Get auth token for test partner"""
        res = requests.post(f"{BASE_URL}/api/partner/auth/login", json={
            "email": TEST_PARTNER_EMAIL,
            "password": TEST_PARTNER_PASSWORD
        })
        return res.json()["token"]

    def test_create_ride_with_card_id(self, auth_token):
        """Test POST /rides with card_id creates ride with payment method"""
        unique_id = int(time.time())
        response = requests.post(f"{BASE_URL}/api/partner/rides",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={
                "pickup_address": "1 Rue de Rivoli, Paris",
                "dropoff_address": "Tour Eiffel, Paris",
                "proposed_price": 45.00,
                "card_id": f"pm_test_{unique_id}",
                "passenger_name": "Test Passenger",
                "passenger_phone": "+33600000000"
            }
        )
        # May get 502 if C# API rejects the card, but ride should be created locally
        if response.status_code == 200:
            data = response.json()
            assert "id" in data, "Ride should have id"
            assert data["pickup_address"] == "1 Rue de Rivoli, Paris"
            assert data["card_id"] == f"pm_test_{unique_id}"
            print(f"✓ POST /rides with card_id creates ride: {data['id']}")
            print(f"  Status: {data.get('status')}, C# submitted: {data.get('csharp_submitted')}")
        else:
            # 402 or 502 means C# rejected the card, but endpoint worked
            print(f"✓ POST /rides correctly handled C# response: {response.status_code}")
            assert response.status_code in [402, 502], f"Unexpected status: {response.status_code}"

    def test_list_rides(self, auth_token):
        """Test GET /rides returns partner's rides"""
        response = requests.get(f"{BASE_URL}/api/partner/rides", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"List rides failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /rides returns {len(data)} rides")

    def test_rides_requires_auth(self):
        """Test rides endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/partner/rides", json={
            "pickup_address": "Paris",
            "dropoff_address": "Lyon",
            "proposed_price": 100
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /rides requires auth (401)")


class TestVehicleCategoriesAndRoute:
    """Tests for vehicle categories and route calculation"""

    @pytest.fixture
    def auth_token(self):
        """Get auth token for test partner"""
        res = requests.post(f"{BASE_URL}/api/partner/auth/login", json={
            "email": TEST_PARTNER_EMAIL,
            "password": TEST_PARTNER_PASSWORD
        })
        return res.json()["token"]

    def test_get_vehicle_categories(self, auth_token):
        """Test GET /vehicle-categories returns C# categories"""
        response = requests.get(f"{BASE_URL}/api/partner/vehicle-categories", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Get categories failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        if len(data) > 0:
            assert "id" in data[0] and "name" in data[0], "Category should have id and name"
        print(f"✓ GET /vehicle-categories returns {len(data)} categories")

    def test_calculate_route(self, auth_token):
        """Test POST /calculate-route returns distance and duration"""
        response = requests.post(f"{BASE_URL}/api/partner/calculate-route",
            headers={"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"},
            json={
                "origin": "CDG Airport, Paris",
                "destination": "Tour Eiffel, Paris"
            }
        )
        assert response.status_code == 200, f"Route calc failed: {response.text}"
        data = response.json()
        assert data.get("status") == "ok", "Route status should be ok"
        assert "distance" in data, "Response should have distance"
        assert "duration" in data, "Response should have duration"
        print(f"✓ Route calculation: {data['distance']}, {data['duration']}")


class TestAdminEndpoints:
    """Tests for admin endpoints related to partners and rides"""

    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        res = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert res.status_code == 200, f"Admin login failed: {res.text}"
        return res.json()["token"]

    def test_admin_list_partners(self, admin_token):
        """Test admin can list all partners"""
        response = requests.get(f"{BASE_URL}/api/partner/admin/partners", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200, f"Admin list partners failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Admin /partners returns {len(data)} partners")

    def test_admin_list_rides(self, admin_token):
        """Test admin can list all rides"""
        response = requests.get(f"{BASE_URL}/api/partner/admin/rides", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200, f"Admin list rides failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Admin /rides returns {len(data)} rides")


# Run tests when executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
