"""Fleet company's own reservations (stored in MongoDB)."""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/fleet/my-bookings", tags=["fleet-my-bookings"])


def get_db(request: Request):
    return request.app.state.db


def get_company_id(request: Request) -> str:
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(401, "Non authentifie")
    import base64, json
    try:
        payload = token.split(".")[1]
        payload += "=" * (4 - len(payload) % 4)
        data = json.loads(base64.b64decode(payload))
        return data.get("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", "")
    except Exception:
        raise HTTPException(401, "Token invalide")


class CreateBookingRequest(BaseModel):
    type: str  # transfer, dispo, excursion
    date: str
    time: str
    # Transfer fields
    passengers: Optional[int] = None
    passengerName: Optional[str] = None
    clientName: Optional[str] = None
    flightNumber: Optional[str] = None
    pickupAddress: Optional[str] = None
    dropoffAddress: Optional[str] = None
    # Dispo fields
    hours: Optional[int] = None
    vehicleModel: Optional[str] = None
    # Excursion fields
    tourName: Optional[str] = None
    guideName: Optional[str] = None
    # Common
    price: Optional[float] = None
    comment: Optional[str] = None


class AssignDriverRequest(BaseModel):
    driverId: str
    driverName: str


@router.post("")
async def create_booking(data: CreateBookingRequest, request: Request):
    db = get_db(request)
    company_id = get_company_id(request)

    if data.type not in ("transfer", "dispo", "excursion"):
        raise HTTPException(400, "Type invalide")

    booking = {
        "id": str(uuid.uuid4()),
        "companyId": company_id,
        "type": data.type,
        "date": data.date,
        "time": data.time,
        "status": "new",
        "driver": None,
        "sentToZont": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    if data.type == "transfer":
        if not data.pickupAddress or not data.dropoffAddress:
            raise HTTPException(400, "Adresses requises pour un transfert")
        booking.update({
            "passengers": data.passengers or 1,
            "passengerName": data.passengerName or "",
            "clientName": data.clientName or "",
            "flightNumber": data.flightNumber or "",
            "pickupAddress": data.pickupAddress,
            "dropoffAddress": data.dropoffAddress,
        })
    elif data.type == "dispo":
        if not data.hours:
            raise HTTPException(400, "Nombre d'heures requis")
        booking.update({
            "hours": data.hours,
            "vehicleModel": data.vehicleModel or "",
            "clientName": data.clientName or "",
            "flightNumber": data.flightNumber or "",
        })
    elif data.type == "excursion":
        if not data.pickupAddress:
            raise HTTPException(400, "Adresse requise")
        booking.update({
            "hours": data.hours or 1,
            "vehicleModel": data.vehicleModel or "",
            "pickupAddress": data.pickupAddress,
            "tourName": data.tourName or "",
            "guideName": data.guideName or "",
            "clientName": data.clientName or "",
        })

    booking["price"] = data.price or 0
    booking["comment"] = data.comment or ""

    await db.fleet_reservations.insert_one(booking)
    booking.pop("_id", None)
    return booking


@router.get("")
async def list_bookings(request: Request, type: str = "", status: str = ""):
    db = get_db(request)
    company_id = get_company_id(request)

    query = {"companyId": company_id}
    if type:
        query["type"] = type
    if status:
        query["status"] = status

    cursor = db.fleet_reservations.find(query, {"_id": 0}).sort("createdAt", -1)
    return await cursor.to_list(200)


@router.get("/{booking_id}")
async def get_booking(booking_id: str, request: Request):
    db = get_db(request)
    company_id = get_company_id(request)
    doc = await db.fleet_reservations.find_one(
        {"id": booking_id, "companyId": company_id}, {"_id": 0}
    )
    if not doc:
        raise HTTPException(404, "Reservation introuvable")
    return doc


@router.put("/{booking_id}/assign")
async def assign_driver(booking_id: str, data: AssignDriverRequest, request: Request):
    db = get_db(request)
    company_id = get_company_id(request)
    result = await db.fleet_reservations.update_one(
        {"id": booking_id, "companyId": company_id},
        {"$set": {
            "driver": {"id": data.driverId, "name": data.driverName},
            "status": "assigned",
        }},
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Reservation introuvable")
    return {"success": True, "message": "Chauffeur affecte"}


@router.put("/{booking_id}/unassign")
async def unassign_driver(booking_id: str, request: Request):
    db = get_db(request)
    company_id = get_company_id(request)
    result = await db.fleet_reservations.update_one(
        {"id": booking_id, "companyId": company_id},
        {"$set": {"driver": None, "status": "new"}},
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Reservation introuvable")
    return {"success": True, "message": "Chauffeur retire"}


@router.put("/{booking_id}/send-to-zont")
async def send_to_zont(booking_id: str, request: Request):
    db = get_db(request)
    company_id = get_company_id(request)
    result = await db.fleet_reservations.update_one(
        {"id": booking_id, "companyId": company_id},
        {"$set": {"sentToZont": True, "status": "sent_to_zont"}},
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Reservation introuvable")
    return {"success": True, "message": "Envoye vers Zont"}


@router.put("/{booking_id}/cancel")
async def cancel_booking(booking_id: str, request: Request):
    db = get_db(request)
    company_id = get_company_id(request)
    result = await db.fleet_reservations.update_one(
        {"id": booking_id, "companyId": company_id},
        {"$set": {"status": "cancelled"}},
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Reservation introuvable")
    return {"success": True, "message": "Reservation annulee"}


@router.delete("/{booking_id}")
async def delete_booking(booking_id: str, request: Request):
    db = get_db(request)
    company_id = get_company_id(request)
    result = await db.fleet_reservations.delete_one(
        {"id": booking_id, "companyId": company_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(404, "Reservation introuvable")
    return {"success": True, "message": "Reservation supprimee"}
