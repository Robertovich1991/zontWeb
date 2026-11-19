# Hotel partner booking link + commission attribution (MVP Phase 1) regression tests
import os
import sys
import uuid
import asyncio
import pytest
import requests
from dotenv import load_dotenv

sys.path.insert(0, "/app/backend")
load_dotenv("/app/backend/.env")
load_dotenv("/app/frontend/.env")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
SLUG = "hotel-negresco-nice"
NEG_ID = "523e9be3"
BRISTOL_ID = "c9baf685"
CRON_SECRET = os.environ.get("WEBHOOK_CRON_SECRET")

CREATED_IDS = []  # referral_bookings ids inserted by this module


def _run(coro):
    from motor.motor_asyncio import AsyncIOMotorClient
    import routes.hotel_referral as hr

    async def wrapper():
        client = AsyncIOMotorClient(os.environ["MONGO_URL"])
        hr.set_db(client[os.environ["DB_NAME"]])
        try:
            return await coro(hr)
        finally:
            client.close()
    return asyncio.run(wrapper())


@pytest.fixture(scope="module")
def admin_headers():
    r = requests.post(f"{BASE_URL}/api/admin/auth/login", json={"email": "admin@zont.cab", "password": "admin123"})
    if r.status_code != 200:
        pytest.skip("admin login failed")
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture(scope="module")
def hotel_headers():
    r = requests.post(f"{BASE_URL}/api/hotel/auth/login", json={"email": "admin@bristol.fr", "password": "hotel123"})
    if r.status_code != 200:
        pytest.skip("hotel login failed")
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture(scope="module", autouse=True)
def cleanup():
    yield
    if CREATED_IDS:
        async def rm(hr):
            await hr.db.referral_bookings.delete_many({"id": {"$in": list(CREATED_IDS)}})
        _run(rm)


def _record(token, auction_id, price=120, email="TEST_ref@example.com"):
    async def go(hr):
        payload = {"referralToken": token, "clientPrice": price, "email": email,
                   "startAddress": "TEST_pickup", "endAddress": "37 Promenade des Anglais, Nice",
                   "carType": "Berline"}
        await hr.record_referral_booking(payload, {"id": auction_id})
        rows = await hr.db.referral_bookings.find({"csharp_auction_id": auction_id}, {"_id": 0}).to_list(10)
        for r in rows:
            if r["id"] not in CREATED_IDS:
                CREATED_IDS.append(r["id"])
        return rows
    return _run(go)


# --- Public link ---
class TestPublicLink:
    def test_link_enabled_returns_token(self):
        r = requests.get(f"{BASE_URL}/api/referral/link/{SLUG}")
        assert r.status_code == 200
        d = r.json()
        assert d["enabled"] is True
        assert d["hotelName"] == "Hotel Negresco Nice"
        assert d["destination"]["address"] == "37 Promenade des Anglais, Nice"
        assert isinstance(d["destination"]["latitude"], float)
        assert isinstance(d["token"], str) and len(d["token"]) > 20

    def test_unknown_slug_404(self):
        assert requests.get(f"{BASE_URL}/api/referral/link/TEST_nope-{uuid.uuid4().hex[:6]}").status_code == 404

    def test_disabled_link_no_token(self, admin_headers):
        try:
            r = requests.put(f"{BASE_URL}/api/admin/hotels/{NEG_ID}/partner-link", json={"enabled": False}, headers=admin_headers)
            assert r.status_code == 200 and r.json()["enabled"] is False
            d = requests.get(f"{BASE_URL}/api/referral/link/{SLUG}").json()
            assert d["enabled"] is False
            assert "token" not in d
        finally:
            requests.put(f"{BASE_URL}/api/admin/hotels/{NEG_ID}/partner-link", json={"enabled": True}, headers=admin_headers)
        assert requests.get(f"{BASE_URL}/api/referral/link/{SLUG}").json()["enabled"] is True


# --- Admin partner-link config ---
class TestAdminConfig:
    def test_get_config(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/admin/hotels/{NEG_ID}/partner-link", headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["url"].endswith(f"/p/{SLUG}")
        assert d["commission_base"] == "total_paid"
        assert d["rate"] == 12
        assert "totals" in d and "destination" in d and "enabled" in d

    def test_get_config_no_token_401(self):
        assert requests.get(f"{BASE_URL}/api/admin/hotels/{NEG_ID}/partner-link").status_code == 401

    def test_get_config_hotel_token_403(self, hotel_headers):
        assert requests.get(f"{BASE_URL}/api/admin/hotels/{NEG_ID}/partner-link", headers=hotel_headers).status_code == 403

    def test_update_rate(self, admin_headers):
        try:
            r = requests.put(f"{BASE_URL}/api/admin/hotels/{NEG_ID}/partner-link", json={"rate": 9.5}, headers=admin_headers)
            assert r.status_code == 200 and r.json()["rate"] == 9.5
            g = requests.get(f"{BASE_URL}/api/admin/hotels/{NEG_ID}/partner-link", headers=admin_headers).json()
            assert g["rate"] == 9.5
        finally:
            requests.put(f"{BASE_URL}/api/admin/hotels/{NEG_ID}/partner-link", json={"rate": 12}, headers=admin_headers)

    def test_update_rate_invalid_400(self, admin_headers):
        r = requests.put(f"{BASE_URL}/api/admin/hotels/{NEG_ID}/partner-link", json={"rate": "abc"}, headers=admin_headers)
        assert r.status_code == 400

    def test_unknown_hotel_404(self, admin_headers):
        assert requests.get(f"{BASE_URL}/api/admin/hotels/TEST_x/partner-link", headers=admin_headers).status_code == 404


# --- Attribution / idempotency / anti-fraud ---
class TestAttribution:
    def test_record_idempotent_and_math(self):
        token = requests.get(f"{BASE_URL}/api/referral/link/{SLUG}").json()["token"]
        aid = f"TEST_AUC_{uuid.uuid4().hex[:8]}"
        _record(token, aid)
        rows = _record(token, aid)
        assert len(rows) == 1
        row = rows[0]
        assert row["hotel_id"] == NEG_ID
        assert row["commission_rate"] == 12
        assert row["commission_amount"] == 14.4
        assert row["status"] == "pending"
        assert row["commission_base"] == "total_paid"

    def test_same_auction_different_token_still_one(self):
        aid = f"TEST_AUC_{uuid.uuid4().hex[:8]}"
        t1 = requests.get(f"{BASE_URL}/api/referral/link/{SLUG}").json()["token"]
        t2 = requests.get(f"{BASE_URL}/api/referral/link/{SLUG}").json()["token"]
        _record(t1, aid)
        rows = _record(t2, aid)
        assert len(rows) == 1

    def test_no_token_no_commission(self):
        aid = f"TEST_AUC_{uuid.uuid4().hex[:8]}"
        rows = _record(None, aid)
        assert rows == []

    def test_forged_token_no_commission(self):
        import jwt
        forged = jwt.encode({"type": "referral", "slug": SLUG, "hotel_id": NEG_ID, "jti": "x"}, "wrong", algorithm="HS256")
        aid = f"TEST_AUC_{uuid.uuid4().hex[:8]}"
        assert _record(forged, aid) == []

    def test_per_link_rate_used(self, admin_headers):
        try:
            requests.put(f"{BASE_URL}/api/admin/hotels/{NEG_ID}/partner-link", json={"rate": 20}, headers=admin_headers)
            token = requests.get(f"{BASE_URL}/api/referral/link/{SLUG}").json()["token"]
            rows = _record(token, f"TEST_AUC_{uuid.uuid4().hex[:8]}", price=150)
            assert rows[0]["commission_rate"] == 20 and rows[0]["commission_amount"] == 30.0
        finally:
            requests.put(f"{BASE_URL}/api/admin/hotels/{NEG_ID}/partner-link", json={"rate": 12}, headers=admin_headers)

    def test_map_status(self):
        import routes.hotel_referral as hr
        for s in ["completed", "Finished", "done", "ended"]:
            assert hr._map_status(s) == "validated"
        for s in ["cancelled", "canceled", "declined", "rejected", "Refunded"]:
            assert hr._map_status(s) == "cancelled"
        for s in ["", None, "accepted", "open"]:
            assert hr._map_status(s) == "pending"


# --- Admin ledger + lifecycle + hotel isolation ---
class TestLedger:
    def test_lifecycle_and_isolation(self, admin_headers, hotel_headers):
        tok = requests.get(f"{BASE_URL}/api/referral/link/{SLUG}").json()["token"]
        neg_row = _record(tok, f"TEST_AUC_{uuid.uuid4().hex[:8]}", price=100)[0]
        # Bristol row (token minted for Bristol via internal issuer)
        import routes.hotel_referral as hr
        btok = hr._issue_token("TEST_bristol", BRISTOL_ID)
        b_row = _record(btok, f"TEST_AUC_{uuid.uuid4().hex[:8]}", price=200)[0]
        assert b_row["commission_amount"] == 30.0  # 15%

        # admin filters
        r = requests.get(f"{BASE_URL}/api/admin/referrals", params={"hotel_id": NEG_ID}, headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        assert all(x["hotel_id"] == NEG_ID for x in d["referrals"])
        assert neg_row["id"] in [x["id"] for x in d["referrals"]]
        assert "pending" in d["totals"]
        r = requests.get(f"{BASE_URL}/api/admin/referrals", params={"status": "paid"}, headers=admin_headers).json()
        assert all(x["status"] == "paid" for x in r["referrals"])

        # validate / payout / cancel
        v = requests.post(f"{BASE_URL}/api/admin/referrals/{neg_row['id']}/validate", headers=admin_headers)
        assert v.status_code == 200 and v.json()["status"] == "validated"
        p = requests.post(f"{BASE_URL}/api/admin/referrals/{neg_row['id']}/payout",
                          json={"method": "virement", "reference": "TEST_REF"}, headers=admin_headers)
        assert p.status_code == 200
        pj = p.json()
        assert pj["status"] == "paid" and pj["payout"]["reference"] == "TEST_REF"
        assert [h["event"] for h in pj["history"]][-2:] == ["status:validated", "status:paid"]
        c = requests.post(f"{BASE_URL}/api/admin/referrals/{b_row['id']}/cancel", headers=admin_headers)
        assert c.status_code == 200 and c.json()["status"] == "cancelled"
        assert requests.post(f"{BASE_URL}/api/admin/referrals/TEST_nope/validate", headers=admin_headers).status_code == 404

        # hotel isolation (Bristol)
        h = requests.get(f"{BASE_URL}/api/hotel/referrals", headers=hotel_headers)
        assert h.status_code == 200
        hj = h.json()
        ids = [x["id"] for x in hj["referrals"]]
        assert b_row["id"] in ids
        assert neg_row["id"] not in ids
        assert all(x["hotel_id"] == BRISTOL_ID for x in hj["referrals"])
        assert all("token_jti" not in x for x in hj["referrals"])
        assert "cancelled" in hj["totals"]

    def test_hotel_token_cannot_read_admin(self, hotel_headers):
        assert requests.get(f"{BASE_URL}/api/admin/referrals", headers=hotel_headers).status_code == 403
        assert requests.post(f"{BASE_URL}/api/admin/referrals/x/validate", headers=hotel_headers).status_code == 403

    def test_admin_no_token_401(self):
        assert requests.get(f"{BASE_URL}/api/admin/referrals").status_code == 401
        assert requests.get(f"{BASE_URL}/api/hotel/referrals").status_code == 401

    def test_admin_token_cannot_read_hotel(self, admin_headers):
        assert requests.get(f"{BASE_URL}/api/hotel/referrals", headers=admin_headers).status_code == 403


# --- Cron auth ---
class TestCron:
    def test_cron_auth(self):
        u = f"{BASE_URL}/api/cron/referral-sync"
        assert requests.post(u).status_code == 401
        assert requests.post(u, headers={"Authorization": "Bearer wrong"}).status_code == 401
        r = requests.post(u, headers={"Authorization": f"Bearer {CRON_SECRET}"})
        assert r.status_code == 200 and r.json()["accepted"] is True


# --- Proxy safety (code inspection) ---
def test_proxy_pops_referral_token_before_forward():
    src = open("/app/backend/routes/csharp_proxy.py").read()
    i_pop = src.find('payload.pop("referralToken", None)')
    i_post = src.find('"/api/Auction/addAuction"')
    assert i_pop != -1 and i_post != -1 and i_pop < i_post
