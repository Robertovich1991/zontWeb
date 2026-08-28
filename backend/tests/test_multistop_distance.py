"""Multi-stop pricing proxy tests: POST /api/proxy/distance with 2/3/4 coordinates."""
import os

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")

CDG = {"latitude": 49.0096906, "longitude": 2.5479245}
EIFFEL = {"latitude": 48.8583701, "longitude": 2.2944813}
VERSAILLES = {"latitude": 48.8048649, "longitude": 2.1203554}
ORLY = {"latitude": 48.7262433, "longitude": 2.3652093}


def post_distance(coords):
    return requests.post(
        f"{BASE_URL}/api/proxy/distance",
        json={"coordinates": coords, "radius": 50000},
        timeout=60,
    )


def std_amount(data):
    """Return (maxAmount, distance) of the Standard-ish first vehicle."""
    assert isinstance(data, list) and len(data) > 0, f"Unexpected payload: {data}"
    v = data[0]
    amount = max(v.get("minAmount") or 0, v.get("maxAmount") or 0)
    return amount, v.get("distance")


class TestMultiStopDistance:
    def test_two_coordinates(self):
        r = post_distance([CDG, EIFFEL])
        assert r.status_code == 200, r.text[:300]
        data = r.json()
        amount, dist = std_amount(data)
        assert amount > 0
        assert dist and dist > 0
        print(f"2 coords -> amount={amount} distance={dist}")

    def test_three_coordinates_costs_more(self):
        r2 = post_distance([CDG, EIFFEL])
        r3 = post_distance([CDG, EIFFEL, VERSAILLES])
        assert r3.status_code == 200, r3.text[:300]
        a2, d2 = std_amount(r2.json())
        a3, d3 = std_amount(r3.json())
        print(f"2 coords: {a2}/{d2}km | 3 coords: {a3}/{d3}km")
        assert a3 > a2, f"3-stop price {a3} not greater than 2-stop {a2}"
        assert d3 > d2

    def test_four_coordinates_costs_more(self):
        r3 = post_distance([CDG, EIFFEL, VERSAILLES])
        r4 = post_distance([CDG, EIFFEL, VERSAILLES, ORLY])
        assert r4.status_code == 200, r4.text[:300]
        a3, d3 = std_amount(r3.json())
        a4, d4 = std_amount(r4.json())
        print(f"3 coords: {a3}/{d3}km | 4 coords: {a4}/{d4}km")
        assert a4 > a3
        assert d4 > d3

    def test_all_vehicles_have_positive_amounts_multistop(self):
        r = post_distance([CDG, EIFFEL, VERSAILLES])
        assert r.status_code == 200
        for v in r.json():
            amount = max(v.get("minAmount") or 0, v.get("maxAmount") or 0)
            assert amount > 0, f"Vehicle {v.get('name') or v.get('id')} has no price: {v}"
            assert "_id" not in v

    def test_single_coordinate_rejected_or_handled(self):
        r = post_distance([CDG])
        assert r.status_code in (200, 400, 422, 500, 502), r.status_code
        print(f"1 coord -> {r.status_code}")

    def test_invalid_payload_returns_422(self):
        r = requests.post(f"{BASE_URL}/api/proxy/distance", json={"coordinates": "bad"}, timeout=30)
        assert r.status_code == 422


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
