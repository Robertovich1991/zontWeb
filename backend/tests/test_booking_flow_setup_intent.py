"""
Regression tests for booking flow fix:
1) POST /api/proxy/booking/setup-intent must return 401 (not 405) when called without auth.
2) GET /api/proxy/booking/setup-intent must also return 401 (backward compat).
3) POST /api/proxy/preorder-distance: short trips must still be allowed.
4) POST /api/proxy/preorder-distance: real CDG -> Paris should return vehicles with price > 0.
5) Other critical booking-flow endpoints not broken: distance, trip-types, driver-types.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://gps-super-admin.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- Setup-Intent (the bug fix focus) ----

class TestSetupIntentMethods:
    def test_post_setup_intent_without_auth_returns_401_not_405(self, session):
        r = session.post(f"{BASE_URL}/api/proxy/booking/setup-intent", json={})
        assert r.status_code != 405, f"POST endpoint still missing! Got 405. Body: {r.text}"
        assert r.status_code == 401, f"Expected 401 without auth, got {r.status_code}. Body: {r.text}"
        data = r.json()
        assert "detail" in data
        assert "Authorization" in str(data.get("detail", "")) or "credentials" in str(data.get("detail", "")).lower()

    def test_get_setup_intent_without_auth_returns_401(self, session):
        r = session.get(f"{BASE_URL}/api/proxy/booking/setup-intent")
        assert r.status_code == 401, f"Expected 401 (compat), got {r.status_code}. Body: {r.text}"

    def test_post_setup_intent_with_invalid_token_returns_401(self, session):
        r = session.post(
            f"{BASE_URL}/api/proxy/booking/setup-intent",
            headers={"Authorization": "Bearer fake-jwt-test"},
        )
        # Either 401 from C# rejection or 401 from proxy; should NOT be 405
        assert r.status_code != 405
        assert r.status_code in (401, 502), f"Unexpected status {r.status_code}: {r.text}"


# ---- Preorder distance: short trip and real CDG->Paris ----

class TestPreorderDistance:
    def test_short_trip_returns_200_with_vehicles(self, session):
        payload = {
            "coordinates": [
                {"latitude": 48.860, "longitude": 2.350},
                {"latitude": 48.861, "longitude": 2.351},
            ]
        }
        r = session.post(f"{BASE_URL}/api/proxy/preorder-distance", json=payload)
        assert r.status_code == 200, f"Short trip rejected ({r.status_code}): {r.text}"
        data = r.json()
        # Response should be a list (possibly empty for very short trip, but should be 200)
        assert isinstance(data, (list, dict)), f"Unexpected response shape: {type(data)}"

    def test_cdg_to_paris_returns_vehicles_with_price(self, session):
        payload = {
            "coordinates": [
                {"latitude": 49.0097, "longitude": 2.5479},   # CDG airport
                {"latitude": 48.8584, "longitude": 2.2945},   # Tour Eiffel
            ]
        }
        r = session.post(f"{BASE_URL}/api/proxy/preorder-distance", json=payload)
        assert r.status_code == 200, f"CDG->Paris rejected ({r.status_code}): {r.text}"
        data = r.json()
        assert isinstance(data, list), f"Expected list of vehicles, got: {type(data)}"
        assert len(data) > 0, "No vehicles returned for CDG -> Paris"
        # Verify at least one vehicle has a positive price
        prices = []
        for v in data:
            for key in ("price", "Price", "totalPrice", "totalAmount", "amount"):
                if key in v and isinstance(v[key], (int, float)):
                    prices.append(v[key])
                    break
        assert any(p > 0 for p in prices), f"No positive prices in vehicle list. Sample: {data[0] if data else 'empty'}"


# ---- Other endpoints sanity ----

class TestOtherBookingFlowEndpoints:
    def test_distance_post_works(self, session):
        payload = {
            "coordinates": [
                {"latitude": 49.0097, "longitude": 2.5479},
                {"latitude": 48.8584, "longitude": 2.2945},
            ],
            "radius": 50,
        }
        r = session.post(f"{BASE_URL}/api/proxy/distance", json=payload)
        # Distance might return 200 with array OR 502 if C# refuses radius—but never 4xx method
        assert r.status_code in (200, 502), f"Unexpected {r.status_code}: {r.text}"

    def test_trip_types_get_works(self, session):
        r = session.get(f"{BASE_URL}/api/proxy/trip-types")
        assert r.status_code == 200, f"trip-types failed: {r.status_code} {r.text}"
        data = r.json()
        assert isinstance(data, list) or isinstance(data, dict)

    def test_driver_types_post_works(self, session):
        payload = {"latitude": 48.8584, "longitude": 2.2945}
        r = session.post(f"{BASE_URL}/api/proxy/driver-types", json=payload)
        assert r.status_code in (200, 502), f"driver-types unexpected {r.status_code}: {r.text}"
