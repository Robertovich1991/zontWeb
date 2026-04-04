from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from datetime import datetime, timezone
import jwt
import os
import io
import csv
from passlib.context import CryptContext

router = APIRouter(prefix="/api/hotel", tags=["hotel-portal"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("JWT_SECRET", "zont-admin-secret-key-2025")


class HotelLogin(BaseModel):
    email: str
    password: str


async def require_hotel_user(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Token requis")
    try:
        payload = jwt.decode(auth[7:], SECRET_KEY, algorithms=["HS256"])
        if payload.get("role") != "hotel_admin":
            raise HTTPException(403, "Acces refuse")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expire")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Token invalide")


@router.post("/auth/login")
async def hotel_login(data: HotelLogin, request: Request):
    db = request.app.state.db
    user = await db.hotel_users.find_one({"email": data.email.lower().strip()}, {"_id": 0})
    if not user or not pwd_context.verify(data.password, user["password_hash"]):
        raise HTTPException(401, "Email ou mot de passe incorrect")
    token = jwt.encode(
        {"sub": user["id"], "email": user["email"], "hotel_id": user["hotel_id"],
         "role": "hotel_admin", "name": user.get("name", "")},
        SECRET_KEY, algorithm="HS256"
    )
    hotel = await db.hotels.find_one({"id": user["hotel_id"]}, {"_id": 0, "name": 1, "city": 1})
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user.get("name", ""), "hotel_id": user["hotel_id"]},
        "hotel": {"name": hotel.get("name", ""), "city": hotel.get("city", "")} if hotel else {},
    }


@router.get("/profile")
async def hotel_profile(request: Request):
    payload = await require_hotel_user(request)
    db = request.app.state.db
    hotel = await db.hotels.find_one({"id": payload["hotel_id"]}, {"_id": 0})
    if not hotel:
        raise HTTPException(404, "Hotel introuvable")
    return hotel


@router.get("/dashboard")
async def hotel_dashboard(request: Request):
    payload = await require_hotel_user(request)
    db = request.app.state.db
    hotel_id = payload["hotel_id"]
    hotel = await db.hotels.find_one({"id": hotel_id}, {"_id": 0})
    if not hotel:
        raise HTTPException(404, "Hotel introuvable")

    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    prev_month = now.replace(day=1)
    prev_month_start = prev_month.replace(month=prev_month.month - 1 if prev_month.month > 1 else 12, year=prev_month.year if prev_month.month > 1 else prev_month.year - 1).isoformat()

    bookings_today = await db.hotel_bookings.count_documents({"hotel_id": hotel_id, "created_at": {"$gte": today_start}})
    bookings_month = await db.hotel_bookings.count_documents({"hotel_id": hotel_id, "created_at": {"$gte": month_start}})
    bookings_prev_month = await db.hotel_bookings.count_documents({"hotel_id": hotel_id, "created_at": {"$gte": prev_month_start, "$lt": month_start}})

    completed_filter = {"hotel_id": hotel_id, "status": {"$in": ["completed", "confirmed", "assigned"]}}

    # Total stats
    total_agg = await db.hotel_bookings.aggregate([
        {"$match": completed_filter},
        {"$group": {"_id": None, "revenue": {"$sum": "$total_price"}, "count": {"$sum": 1}}},
    ]).to_list(1)
    total = total_agg[0] if total_agg else {"revenue": 0, "count": 0}

    # Monthly revenue
    month_agg = await db.hotel_bookings.aggregate([
        {"$match": {**completed_filter, "created_at": {"$gte": month_start}}},
        {"$group": {"_id": None, "revenue": {"$sum": "$total_price"}}},
    ]).to_list(1)
    month_rev = month_agg[0]["revenue"] if month_agg else 0

    prev_agg = await db.hotel_bookings.aggregate([
        {"$match": {**completed_filter, "created_at": {"$gte": prev_month_start, "$lt": month_start}}},
        {"$group": {"_id": None, "revenue": {"$sum": "$total_price"}}},
    ]).to_list(1)
    prev_rev = prev_agg[0]["revenue"] if prev_agg else 0

    evolution = round(((month_rev - prev_rev) / prev_rev * 100) if prev_rev > 0 else 0, 1)

    rate = hotel.get("commission_rate", 0)
    total_commission = round(total["revenue"] * rate / 100, 2)
    month_commission = round(month_rev * rate / 100, 2)

    # Kiosks
    kiosks = await db.kiosks.find({"hotel_id": hotel_id}, {"_id": 0}).to_list(50)

    # Monthly chart (last 6 months)
    monthly_chart = await db.hotel_bookings.aggregate([
        {"$match": completed_filter},
        {"$addFields": {"month": {"$substr": ["$created_at", 0, 7]}}},
        {"$group": {"_id": "$month", "revenue": {"$sum": "$total_price"}, "count": {"$sum": 1}}},
        {"$sort": {"_id": -1}},
        {"$limit": 6},
    ]).to_list(6)

    return {
        "hotel_name": hotel.get("name", ""),
        "hotel_city": hotel.get("city", ""),
        "commission_rate": rate,
        "bookings_today": bookings_today,
        "bookings_month": bookings_month,
        "bookings_prev_month": bookings_prev_month,
        "total_revenue": round(total["revenue"], 2),
        "total_bookings": total["count"],
        "total_commission": total_commission,
        "month_revenue": round(month_rev, 2),
        "month_commission": month_commission,
        "prev_month_revenue": round(prev_rev, 2),
        "evolution_percent": evolution,
        "kiosks": kiosks,
        "monthly_chart": list(reversed(monthly_chart)),
    }


@router.get("/bookings")
async def hotel_bookings(request: Request):
    payload = await require_hotel_user(request)
    db = request.app.state.db
    hotel_id = payload["hotel_id"]
    hotel = await db.hotels.find_one({"id": hotel_id}, {"_id": 0, "commission_rate": 1, "zont_commission_rate": 1})
    rate_h = hotel.get("commission_rate", 0) if hotel else 0
    rate_z = hotel.get("zont_commission_rate", 0) if hotel else 0

    bookings = await db.hotel_bookings.find({"hotel_id": hotel_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for b in bookings:
        price = b.get("total_price", 0)
        b["hotel_commission"] = round(price * rate_h / 100, 2)
        b["zont_commission"] = round(price * rate_z / 100, 2)
        b["driver_amount"] = round(price - b["hotel_commission"] - b["zont_commission"], 2)
    return bookings


@router.get("/bookings/export")
async def hotel_bookings_export(request: Request):
    # Support token via query param (for window.open downloads)
    token = request.query_params.get("token")
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            if payload.get("role") != "hotel_admin":
                raise HTTPException(403, "Acces refuse")
        except jwt.InvalidTokenError:
            raise HTTPException(401, "Token invalide")
    else:
        payload = await require_hotel_user(request)
    db = request.app.state.db
    hotel_id = payload["hotel_id"]
    hotel = await db.hotels.find_one({"id": hotel_id}, {"_id": 0, "name": 1, "commission_rate": 1})
    rate = hotel.get("commission_rate", 0) if hotel else 0

    bookings = await db.hotel_bookings.find({"hotel_id": hotel_id}, {"_id": 0}).sort("created_at", -1).to_list(500)

    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow(["ID", "Date", "Heure", "Client", "Service", "Depart", "Arrivee", "Vehicule", "Prix (EUR)", "Commission Hotel (EUR)", "Statut"])
    for b in bookings:
        comm = round(b.get("total_price", 0) * rate / 100, 2)
        writer.writerow([
            b.get("id"), b.get("ride_date"), b.get("ride_time"), b.get("client_name"),
            b.get("service_type"), b.get("pickup_address"), b.get("dropoff_address"),
            b.get("vehicle_type"), b.get("total_price"), comm, b.get("status"),
        ])

    output.seek(0)
    hotel_name = hotel.get("name", "hotel").replace(" ", "_")
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=reservations_{hotel_name}.csv"},
    )


@router.get("/invoices")
async def hotel_invoices(request: Request):
    payload = await require_hotel_user(request)
    db = request.app.state.db
    hotel_id = payload["hotel_id"]
    invoices = await db.hotel_invoices.find({"hotel_id": hotel_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return invoices


@router.get("/invoices/{invoice_id}/download")
async def download_invoice(invoice_id: str, request: Request):
    token = request.query_params.get("token")
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            if payload.get("role") != "hotel_admin":
                raise HTTPException(403, "Acces refuse")
        except jwt.InvalidTokenError:
            raise HTTPException(401, "Token invalide")
    else:
        payload = await require_hotel_user(request)

    db = request.app.state.db
    invoice = await db.hotel_invoices.find_one(
        {"id": invoice_id, "hotel_id": payload["hotel_id"]}, {"_id": 0}
    )
    if not invoice:
        raise HTTPException(404, "Facture introuvable")

    hotel = await db.hotels.find_one({"id": payload["hotel_id"]}, {"_id": 0, "name": 1, "address": 1, "city": 1, "postal_code": 1, "contact_email": 1})

    output = io.StringIO()
    output.write("=" * 60 + "\n")
    output.write(f"  FACTURE DE COMMISSION - {invoice['id']}\n")
    output.write("=" * 60 + "\n\n")
    output.write("  Emetteur: Zont.cab\n")
    output.write(f"  Date: {invoice['created_at'][:10]}\n")
    output.write(f"  Echeance: {invoice['due_date']}\n")
    output.write(f"  Statut: {'PAYEE' if invoice['status'] == 'paid' else 'EN ATTENTE'}\n\n")
    output.write("-" * 60 + "\n")
    output.write(f"  Hotel: {invoice['hotel_name']}\n")
    if hotel:
        output.write(f"  Adresse: {hotel.get('address', '')}, {hotel.get('postal_code', '')} {hotel.get('city', '')}\n")
        output.write(f"  Email: {hotel.get('contact_email', '')}\n")
    output.write("-" * 60 + "\n\n")
    output.write(f"  Periode: {invoice['period']}\n")
    output.write(f"  Nombre de reservations: {invoice['bookings_count']}\n")
    output.write(f"  Chiffre d'affaires genere: {invoice['total_revenue']:.2f} EUR\n\n")
    output.write(f"  Taux de commission hotel: {invoice['commission_rate']}%\n")
    output.write(f"  MONTANT COMMISSION HOTEL: {invoice['commission_amount']:.2f} EUR\n\n")
    output.write(f"  Taux commission Zont: {invoice['zont_commission_rate']}%\n")
    output.write(f"  Commission Zont: {invoice['zont_commission_amount']:.2f} EUR\n")
    output.write(f"  Montant chauffeur: {invoice['driver_amount']:.2f} EUR\n\n")
    if invoice.get("paid_at"):
        output.write("-" * 60 + "\n")
        output.write(f"  Paye le: {invoice['paid_at'][:10]}\n")
        output.write(f"  Mode: {invoice.get('payment_method', '-')}\n")
        output.write(f"  Reference: {invoice.get('payment_reference', '-')}\n")
    output.write("\n" + "=" * 60 + "\n")
    output.write("  Merci pour votre partenariat - Zont.cab\n")
    output.write("=" * 60 + "\n")

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename=facture_{invoice['id']}.txt"},
    )
