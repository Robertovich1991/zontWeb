# Seed / clean TEST referral rows for UI checks. Usage: python seed_referral_ui.py seed|clean <ids...>
import os, sys, asyncio, uuid
sys.path.insert(0, "/app/backend")
from dotenv import load_dotenv
load_dotenv("/app/backend/.env")
from motor.motor_asyncio import AsyncIOMotorClient
import routes.hotel_referral as hr


async def main():
    c = AsyncIOMotorClient(os.environ["MONGO_URL"])
    hr.set_db(c[os.environ["DB_NAME"]])
    if sys.argv[1] == "seed":
        ids = []
        for hid, slug, price in [("523e9be3", "hotel-negresco-nice", 120), ("c9baf685", "TEST_bristol", 80)]:
            aid = f"TEST_UI_{uuid.uuid4().hex[:6]}"
            await hr.record_referral_booking({"referralToken": hr._issue_token(slug, hid), "clientPrice": price,
                                              "email": "TEST_ui@example.com", "startAddress": "TEST pickup",
                                              "endAddress": "TEST dropoff", "startDate": "2026-02-01T10:00"}, {"id": aid})
            r = await hr.db.referral_bookings.find_one({"csharp_auction_id": aid}, {"_id": 0, "id": 1})
            ids.append(r["id"])
        print(" ".join(ids))
    else:
        res = await hr.db.referral_bookings.delete_many({"id": {"$in": sys.argv[2:]}})
        print("deleted", res.deleted_count)
    c.close()

asyncio.run(main())
