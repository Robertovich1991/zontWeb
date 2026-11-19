# One-off: concurrent idempotency race check for record_referral_booking + sync revert check
import os, sys, asyncio, uuid
sys.path.insert(0, "/app/backend")
from dotenv import load_dotenv
load_dotenv("/app/backend/.env")
from motor.motor_asyncio import AsyncIOMotorClient
import routes.hotel_referral as hr


async def main():
    c = AsyncIOMotorClient(os.environ["MONGO_URL"])
    hr.set_db(c[os.environ["DB_NAME"]])
    aid = f"TEST_RACE_{uuid.uuid4().hex[:6]}"
    toks = [hr._issue_token("hotel-negresco-nice", "523e9be3") for _ in range(5)]
    await asyncio.gather(*[hr.record_referral_booking({"referralToken": t, "clientPrice": 50}, {"id": aid}) for t in toks])
    rows = await hr.db.referral_bookings.find({"csharp_auction_id": aid}, {"_id": 0, "id": 1}).to_list(10)
    print("concurrent rows for same auction:", len(rows))
    # same token reused for a 2nd different booking
    t = hr._issue_token("hotel-negresco-nice", "523e9be3")
    a1, a2 = f"TEST_R1_{uuid.uuid4().hex[:6]}", f"TEST_R2_{uuid.uuid4().hex[:6]}"
    await hr.record_referral_booking({"referralToken": t, "clientPrice": 50}, {"id": a1})
    await hr.record_referral_booking({"referralToken": t, "clientPrice": 50}, {"id": a2})
    r2 = await hr.db.referral_bookings.find({"csharp_auction_id": {"$in": [a1, a2]}}, {"_id": 0, "id": 1}).to_list(10)
    print("same token, 2 different bookings ->", len(r2), "rows")
    # negative client price
    a3 = f"TEST_R3_{uuid.uuid4().hex[:6]}"
    await hr.record_referral_booking({"referralToken": hr._issue_token("x", "523e9be3"), "clientPrice": -500}, {"id": a3})
    r3 = await hr.db.referral_bookings.find_one({"csharp_auction_id": a3}, {"_id": 0})
    print("negative price commission:", r3 and r3["commission_amount"], "slug stored:", r3 and r3["hotel_slug"])
    ids = [r["id"] for r in rows + r2] + ([r3["id"]] if r3 else [])
    res = await hr.db.referral_bookings.delete_many({"id": {"$in": ids}})
    print("cleaned", res.deleted_count)
    # restore hotel fields touched by tests
    await hr.db.hotels.update_one({"id": "523e9be3"}, {"$unset": {"partner_link_rate": "", "partner_link_enabled": ""}})
    print("remaining TEST rows:", await hr.db.referral_bookings.count_documents({"csharp_auction_id": {"$regex": "^TEST_"}}))
    c.close()

asyncio.run(main())
