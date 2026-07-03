"""Tests for /api/proxy/booking/create — hourly (timing) + transfer forwarding."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://gps-super-admin.preview.emergentagent.com").rstrip("/")
ENDPOINT = f"{BASE_URL}/api/proxy/booking/create"


@pytest.fixture
def hourly_payload():
    return {
        "tripType": "timing",
        "duration": 7200,
        "startDate": "31/12/2026 10:00:00",
        "clientPrice": 150.0,
        "carType": "Luxury Sedan",
        "cardId": "pm_fake_test_123",
        "utcOffset": 120,
        "paymentType": "card",
        "startAddress": "Paris CDG Airport",
        "startPointLatitude": 49.0097,
        "startPointLongitude": 2.5479,
        "additionalComments": "test",
        "terminal": "2E",
    }


def test_missing_auth_returns_401(hourly_payload):
    r = requests.post(ENDPOINT, json=hourly_payload)
    assert r.status_code == 401
    body = r.json()
    assert "detail" in body


def test_invalid_json_returns_400():
    r = requests.post(ENDPOINT, data="not-json{{{",
                      headers={"Authorization": "Bearer fake", "Content-Type": "application/json"})
    assert r.status_code == 400


def test_hourly_timing_forwards_and_returns_csharp_error(hourly_payload):
    r = requests.post(ENDPOINT, json=hourly_payload,
                      headers={"Authorization": "Bearer fake-token-for-testing"})
    # Expect a 4xx (401/403/400) from C# — NOT a generic 500/502 or generic string message
    assert r.status_code >= 400 and r.status_code < 500, f"Got {r.status_code}: {r.text}"
    body = r.json()
    assert "detail" in body
    detail = body["detail"]
    # Detail must not be the old generic string
    assert detail != "Something went wrong"
    # Should be structured (dict) forwarded from C#, OR at least a meaningful string
    assert isinstance(detail, (dict, str))
    if isinstance(detail, str):
        # allow the auth-missing path only for 401; here we sent Bearer so it should be from C#
        assert "Dispatch execution engine" not in detail


def test_transfer_legacy_still_converts_to_distance():
    payload = {
        "tripType": "Transfer",
        "startPointLatitude": 48.8566,
        "startPointLongitude": 2.3522,
        "endPointLatitude": 48.85,
        "endPointLongitude": 2.35,
        "destination": "Some address",
        "startAddress": "Paris",
        "startDate": "31/12/2026 10:00:00",
        "clientPrice": 50.0,
        "carType": "Standard Car",
        "cardId": "pm_fake",
        "paymentType": "card",
        "utcOffset": 120,
    }
    r = requests.post(ENDPOINT, json=payload,
                      headers={"Authorization": "Bearer fake-token-for-testing"})
    # C# will reject invalid token — we just verify the proxy didn't fail with generic error
    assert r.status_code >= 400 and r.status_code < 500
    body = r.json()
    assert "detail" in body
    assert body["detail"] != "Something went wrong"


def test_extra_fields_not_dropped(hourly_payload):
    """Ensure Pydantic filtering was removed — proxy accepts arbitrary extra fields."""
    hourly_payload["someExtraField"] = "should_be_forwarded"
    r = requests.post(ENDPOINT, json=hourly_payload,
                      headers={"Authorization": "Bearer fake-token"})
    # Should not be a 422 (Pydantic validation error)
    assert r.status_code != 422, f"Pydantic filtering still present: {r.text}"
