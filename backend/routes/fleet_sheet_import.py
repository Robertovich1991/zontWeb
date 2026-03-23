"""Fleet Planning - Google Sheets Import
Reads planning data from a Google Sheet (CSV export) and imports into fleet_reservations.
READ-ONLY access to the sheet. Never writes to Google Sheets."""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from datetime import datetime
import httpx
import csv
import io
import re
import uuid
import logging

from routes.fleet_shared import get_token, get_company_id, get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/fleet/planning/sheet", tags=["fleet-sheet-import"])

# French month mapping
FR_MONTHS = {
    "janvier": 1, "février": 2, "fevrier": 2, "mars": 3, "avril": 4,
    "mai": 5, "juin": 6, "juillet": 7, "août": 8, "aout": 8,
    "septembre": 9, "octobre": 10, "novembre": 11, "décembre": 12, "decembre": 12,
}


def parse_fr_date(raw: str) -> str | None:
    """Parse '1 février 2026' -> '2026-02-01'."""
    raw = raw.strip().lower()
    if not raw:
        return None
    # Try "1 février 2026"
    parts = raw.split()
    if len(parts) == 3:
        try:
            day = int(parts[0])
            month = FR_MONTHS.get(parts[1])
            year = int(parts[2])
            if month:
                return f"{year}-{month:02d}-{day:02d}"
        except ValueError:
            pass
    # Try ISO format
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", raw)
    if m:
        return m.group(0)
    return None


def parse_time(raw: str) -> str:
    """Parse time: '06:05', '07:25/06:59' (take adjusted), '07;43' (fix typo)."""
    raw = raw.strip().replace(";", ":")
    if "/" in raw:
        parts = raw.split("/")
        return parts[-1].strip()  # Take the adjusted time
    return raw


def parse_addresses(raw: str) -> tuple[str, str]:
    """Split 'pickup ---/----/-- dropoff' into (pickup, dropoff)."""
    for sep in ["----", "---", "--"]:
        if sep in raw:
            parts = raw.split(sep, 1)
            return parts[0].strip(), parts[1].strip()
    return raw.strip(), ""


def parse_client(raw: str) -> dict:
    """Extract name, pax count, phone from client info."""
    raw = raw.strip().replace("\t", " ").replace("\n", " ")
    # Extract pax count
    pax_match = re.search(r"\((\d+)\s*(?:pax|PAX)\)", raw)
    pax = int(pax_match.group(1)) if pax_match else 1
    # Extract phone
    phone_match = re.search(r"(\+[\d\s\-()]{7,20})", raw)
    phone = phone_match.group(1).strip() if phone_match else ""
    # Extract name (everything before the first parenthesis or phone)
    name = raw
    for marker in ["(", "+", "MobileContact"]:
        idx = name.find(marker)
        if idx > 0:
            name = name[:idx]
    name = re.sub(r"\s+", " ", name).strip().strip(":").strip()
    return {"name": name, "pax": pax, "phone": phone}


def parse_price(raw: str) -> float:
    """Parse price: '94,80 €', '92.98', '120paid', '104,4+10cash'."""
    raw = raw.strip().replace("€", "").replace(" ", "")
    if not raw:
        return 0.0
    # Handle "104,4+10cash"
    raw = re.sub(r"\+.*$", "", raw)
    raw = re.sub(r"[a-zA-Z]", "", raw)
    raw = raw.replace(",", ".")
    try:
        return float(raw)
    except ValueError:
        return 0.0


# ── Known real driver names (normalized lowercase) ──
KNOWN_DRIVERS = {
    "karen", "armen", "lucien", "sargis", "suleyman", "hamlet", "vardan",
    "mohand", "mohamed", "paul", "valentin", "steven", "arshak", "lalili",
    "jean claude", "mk", "drai omar", "valenin", "rdv",
}

# Words that indicate the "driver" cell is actually a note, not a name
DRIVER_NOISE_KEYWORDS = [
    "cancel", "refund", "reschedul", "wrong", "update", "wpov", "wpuma",
    "verjin", "pickup", "uzum", "infon", "suitcase", "luggage", "carry on",
    "car seat", "child seat", "pieces", "corini", "sister", "shnorhavorel",
    "confirmation", "harcrel", "poxecin", "grel", "chen ekel", "van",
    "product", "minivan",
]


def normalize_driver_name(raw: str) -> str | None:
    """Clean driver name from sheet. Returns None if not a real driver."""
    if not raw:
        return None
    raw = raw.strip()
    low = raw.lower()

    # Check for noise keywords
    for kw in DRIVER_NOISE_KEYWORDS:
        if kw in low:
            return None

    # Strip suffixes like "+1h", "+2h", "+30euro cash", "(jam u kes...)"
    cleaned = re.sub(r"\s*\+.*$", "", raw).strip()
    cleaned = re.sub(r"\s*\(.*\)$", "", cleaned).strip()
    cleaned = re.sub(r"\s*@.*$", "", cleaned).strip()
    cleaned = re.sub(r"\s+\d+\s*EUR.*$", "", cleaned, flags=re.IGNORECASE).strip()

    if not cleaned or len(cleaned) < 2:
        return None

    # Check if it looks like a real name (short, no special chars, in known list or capitalized)
    if cleaned.lower() in KNOWN_DRIVERS:
        return cleaned.title() if cleaned.islower() else cleaned
    # If it's a short capitalized word (likely a name), accept it
    if len(cleaned.split()) <= 2 and len(cleaned) <= 20 and cleaned[0].isupper():
        return cleaned
    # Reject anything else
    return None


def parse_code(code: str) -> dict:
    """Parse code like DEP-2, ARR-6, DEPGAR-2, ARRGAR-2, TRADIS-3."""
    code = code.strip().upper()
    pax_from_code = 0
    mission_type = "transfer"

    m = re.match(r"(DEPGAR|ARRGAR|TRADIS|DEP|ARR)-?(\d*)", code)
    if m:
        prefix = m.group(1)
        if m.group(2):
            pax_from_code = int(m.group(2))
        if prefix == "DEP":
            mission_type = "depart_aeroport"
        elif prefix == "ARR":
            mission_type = "arrivee_aeroport"
        elif prefix == "DEPGAR":
            mission_type = "depart_gare"
        elif prefix == "ARRGAR":
            mission_type = "arrivee_gare"
        elif prefix == "TRADIS":
            mission_type = "transfer"
    return {"type": mission_type, "pax_from_code": pax_from_code}


def parse_sheet_row(row: list[str], current_date: str | None) -> dict | None:
    """Parse a single row from the Google Sheet into a booking dict."""
    if len(row) < 9:
        return None

    date_raw = row[0].strip()
    time_raw = row[1].strip()
    code_raw = row[2].strip()
    addr_raw = row[3].strip()
    client_raw = row[4].strip()
    source = row[5].strip()
    ref = row[6].strip()
    price_raw = row[7].strip()
    driver = row[8].strip()
    remarks = row[9].strip() if len(row) > 9 else ""
    additional = row[10].strip() if len(row) > 10 else ""

    # Detect date (may be empty if same day continues)
    date = parse_fr_date(date_raw) if date_raw else current_date
    if not date:
        return None

    # Skip note/separator rows (no time or code)
    if not time_raw or not code_raw:
        return None

    time = parse_time(time_raw)
    if not re.match(r"\d{1,2}:\d{2}", time):
        return None

    pickup, dropoff = parse_addresses(addr_raw)
    client = parse_client(client_raw)
    code_info = parse_code(code_raw)
    price = parse_price(price_raw)

    # Use pax from client info, fallback to code
    pax = client["pax"] if client["pax"] > 1 else code_info["pax_from_code"] or 1

    return {
        "date": date,
        "time": time,
        "type": code_info["type"],
        "code": code_raw,
        "pickupAddress": pickup,
        "dropoffAddress": dropoff,
        "clientName": client["name"],
        "clientPhone": client["phone"],
        "passengers": pax,
        "source": source,
        "reference": ref,
        "price": price,
        "driverName": driver,
        "remarks": remarks,
        "additional": additional,
        "originalTime": row[1].strip(),
    }


class SheetConfig(BaseModel):
    sheetUrl: str
    dateFilter: str = ""  # optional: only import specific date


@router.post("/preview")
async def preview_sheet(request: Request, config: SheetConfig):
    """Fetch Google Sheet data and return parsed preview (READ-ONLY)."""
    get_token(request)

    # Extract sheet ID and gid from URL
    m = re.search(r"/d/([a-zA-Z0-9_-]+)", config.sheetUrl)
    if not m:
        raise HTTPException(400, "URL Google Sheet invalide")
    sheet_id = m.group(1)

    gid_match = re.search(r"gid=(\d+)", config.sheetUrl)
    gid = gid_match.group(1) if gid_match else "0"

    # Fetch CSV (READ-ONLY)
    csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}"
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.get(csv_url)
            if resp.status_code != 200:
                raise HTTPException(400, "Impossible de lire le Google Sheet. Verifiez le partage (Tous les utilisateurs disposant du lien).")
            csv_text = resp.text
    except httpx.HTTPError as e:
        raise HTTPException(500, f"Erreur connexion Google: {e}")

    # Parse CSV
    reader = csv.reader(io.StringIO(csv_text))
    rows = list(reader)
    if len(rows) < 2:
        raise HTTPException(400, "Le sheet est vide")

    # Skip header row
    bookings = []
    current_date = None
    skipped = 0

    for i, row in enumerate(rows[1:], start=2):
        # Update current_date if this row has a date
        date_raw = row[0].strip() if row else ""
        if date_raw:
            d = parse_fr_date(date_raw)
            if d:
                current_date = d

        parsed = parse_sheet_row(row, current_date)
        if not parsed:
            skipped += 1
            continue

        # Date filter
        if config.dateFilter and parsed["date"] != config.dateFilter:
            continue

        parsed["rowNumber"] = i
        bookings.append(parsed)

    # Get unique dates
    dates = sorted(set(b["date"] for b in bookings))
    drivers = sorted(set(b["driverName"] for b in bookings if b["driverName"]))

    return {
        "bookings": bookings,
        "totalRows": len(rows) - 1,
        "parsedCount": len(bookings),
        "skippedRows": skipped,
        "dates": dates,
        "drivers": drivers,
        "sheetId": sheet_id,
    }


@router.post("/import")
async def import_from_sheet(request: Request):
    """Import parsed bookings into fleet_reservations (bulk insert)."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)
    body = await request.json()
    bookings = body.get("bookings", [])

    if not bookings:
        raise HTTPException(400, "Aucune mission a importer")

    # Get existing references to avoid duplicates
    existing_refs = set()
    cursor = db.fleet_reservations.find(
        {"companyId": company_id, "sheetRef": {"$exists": True}},
        {"_id": 0, "sheetRef": 1}
    )
    async for doc in cursor:
        existing_refs.add(doc.get("sheetRef", ""))

    # Build local driver map (name -> id)
    local_drivers = {}
    async for d in db.local_drivers.find({"companyId": company_id}, {"_id": 0}):
        local_drivers[d.get("firstName", "").lower()] = d

    imported = 0
    duplicates = 0
    drivers_created = 0
    skipped_cancelled = 0
    now = datetime.utcnow().isoformat()
    bulk_docs = []
    BATCH_SIZE = 500

    for b in bookings:
        sheet_ref = f"{b['date']}_{b['time']}_{b.get('reference', '')}_{b.get('driverName', '')}"
        if sheet_ref in existing_refs:
            duplicates += 1
            continue

        # Normalize driver name (filter out notes/cancelled)
        raw_driver = (b.get("driverName") or "").strip()
        clean_driver = normalize_driver_name(raw_driver)

        # Skip rows where driver column says "cancelled"/"refunded"
        if raw_driver and not clean_driver:
            low = raw_driver.lower()
            if any(kw in low for kw in ["cancel", "refund"]):
                skipped_cancelled += 1
                existing_refs.add(sheet_ref)
                continue

        # Auto-assign driver by name
        driver_data = None
        if clean_driver:
            key = clean_driver.lower()
            if key not in local_drivers:
                driver_id = str(uuid.uuid4())
                driver_doc = {
                    "id": driver_id,
                    "companyId": company_id,
                    "firstName": clean_driver,
                    "lastName": "",
                    "phone": "",
                    "active": True,
                    "isLocal": True,
                    "createdAt": now,
                }
                await db.local_drivers.insert_one(driver_doc)
                local_drivers[key] = driver_doc
                drivers_created += 1
                logger.info(f"Created local driver: {clean_driver} ({driver_id})")
            driver_data = {"id": local_drivers[key]["id"], "name": clean_driver}

        doc = {
            "id": str(uuid.uuid4()),
            "companyId": company_id,
            "type": b.get("type", "transfer"),
            "date": b["date"],
            "time": b["time"],
            "status": "confirmed",
            "driver": driver_data,
            "pickupAddress": b.get("pickupAddress", ""),
            "dropoffAddress": b.get("dropoffAddress", ""),
            "clientName": b.get("clientName", ""),
            "clientPhone": b.get("clientPhone", ""),
            "passengers": b.get("passengers", 1),
            "price": b.get("price", 0),
            "hours": 0,
            "comment": " | ".join(filter(None, [
                b.get("source", ""),
                b.get("reference", ""),
                b.get("remarks", ""),
                b.get("additional", ""),
            ])),
            "sentToZont": False,
            "sheetRef": sheet_ref,
            "sheetCode": b.get("code", ""),
            "sheetSource": b.get("source", ""),
            "sheetReference": b.get("reference", ""),
            "sheetDriverName": raw_driver,
            "createdAt": now,
            "importedAt": now,
        }
        bulk_docs.append(doc)
        existing_refs.add(sheet_ref)
        imported += 1

        # Bulk insert in batches
        if len(bulk_docs) >= BATCH_SIZE:
            await db.fleet_reservations.insert_many(bulk_docs)
            bulk_docs = []

    # Insert remaining
    if bulk_docs:
        await db.fleet_reservations.insert_many(bulk_docs)

    return {
        "success": True,
        "imported": imported,
        "duplicates": duplicates,
        "driversCreated": drivers_created,
        "skippedCancelled": skipped_cancelled,
        "total": len(bookings),
    }


@router.post("/bulk-import")
async def bulk_import_from_sheet(request: Request, config: SheetConfig):
    """Server-side: fetch sheet + import all in one call (avoids large payloads)."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    # Reuse preview logic to fetch and parse
    m = re.search(r"/d/([a-zA-Z0-9_-]+)", config.sheetUrl)
    if not m:
        raise HTTPException(400, "URL Google Sheet invalide")
    sheet_id = m.group(1)
    gid_match = re.search(r"gid=(\d+)", config.sheetUrl)
    gid = gid_match.group(1) if gid_match else "0"

    csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}"
    try:
        async with httpx.AsyncClient(timeout=60, follow_redirects=True) as client:
            resp = await client.get(csv_url)
            if resp.status_code != 200:
                raise HTTPException(400, "Impossible de lire le Google Sheet.")
            csv_text = resp.text
    except httpx.HTTPError as e:
        raise HTTPException(500, f"Erreur connexion Google: {e}")

    reader = csv.reader(io.StringIO(csv_text))
    rows = list(reader)
    if len(rows) < 2:
        raise HTTPException(400, "Le sheet est vide")

    # Parse all rows
    bookings = []
    current_date = None
    for i, row in enumerate(rows[1:], start=2):
        date_raw = row[0].strip() if row else ""
        if date_raw:
            d = parse_fr_date(date_raw)
            if d:
                current_date = d
        parsed = parse_sheet_row(row, current_date)
        if not parsed:
            continue
        if config.dateFilter and parsed["date"] != config.dateFilter:
            continue
        bookings.append(parsed)

    if not bookings:
        raise HTTPException(400, "Aucune mission trouvee dans le sheet")

    # Get existing refs
    existing_refs = set()
    cursor = db.fleet_reservations.find(
        {"companyId": company_id, "sheetRef": {"$exists": True}},
        {"_id": 0, "sheetRef": 1}
    )
    async for doc in cursor:
        existing_refs.add(doc.get("sheetRef", ""))

    # Build local driver map
    local_drivers = {}
    async for d in db.local_drivers.find({"companyId": company_id}, {"_id": 0}):
        local_drivers[d.get("firstName", "").lower()] = d

    imported = 0
    duplicates = 0
    drivers_created = 0
    skipped_cancelled = 0
    now = datetime.utcnow().isoformat()
    bulk_docs = []
    BATCH_SIZE = 500

    for b in bookings:
        sheet_ref = f"{b['date']}_{b['time']}_{b.get('reference', '')}_{b.get('driverName', '')}"
        if sheet_ref in existing_refs:
            duplicates += 1
            continue

        raw_driver = (b.get("driverName") or "").strip()
        clean_driver = normalize_driver_name(raw_driver)

        if raw_driver and not clean_driver:
            low = raw_driver.lower()
            if any(kw in low for kw in ["cancel", "refund"]):
                skipped_cancelled += 1
                existing_refs.add(sheet_ref)
                continue

        driver_data = None
        if clean_driver:
            key = clean_driver.lower()
            if key not in local_drivers:
                driver_id = str(uuid.uuid4())
                driver_doc = {
                    "id": driver_id,
                    "companyId": company_id,
                    "firstName": clean_driver,
                    "lastName": "",
                    "phone": "",
                    "active": True,
                    "isLocal": True,
                    "createdAt": now,
                }
                await db.local_drivers.insert_one(driver_doc)
                local_drivers[key] = driver_doc
                drivers_created += 1

            driver_data = {"id": local_drivers[key]["id"], "name": clean_driver}

        doc = {
            "id": str(uuid.uuid4()),
            "companyId": company_id,
            "type": b.get("type", "transfer"),
            "date": b["date"],
            "time": b["time"],
            "status": "confirmed",
            "driver": driver_data,
            "pickupAddress": b.get("pickupAddress", ""),
            "dropoffAddress": b.get("dropoffAddress", ""),
            "clientName": b.get("clientName", ""),
            "clientPhone": b.get("clientPhone", ""),
            "passengers": b.get("passengers", 1),
            "price": b.get("price", 0),
            "hours": 0,
            "comment": " | ".join(filter(None, [
                b.get("source", ""),
                b.get("reference", ""),
                b.get("remarks", ""),
                b.get("additional", ""),
            ])),
            "sentToZont": False,
            "sheetRef": sheet_ref,
            "sheetCode": b.get("code", ""),
            "sheetSource": b.get("source", ""),
            "sheetReference": b.get("reference", ""),
            "sheetDriverName": raw_driver,
            "createdAt": now,
            "importedAt": now,
        }
        bulk_docs.append(doc)
        existing_refs.add(sheet_ref)
        imported += 1

        if len(bulk_docs) >= BATCH_SIZE:
            await db.fleet_reservations.insert_many(bulk_docs)
            bulk_docs = []

    if bulk_docs:
        await db.fleet_reservations.insert_many(bulk_docs)

    # Get stats
    dates = sorted(set(b["date"] for b in bookings))
    drivers = sorted(set(normalize_driver_name(b.get("driverName", "")) or "" for b in bookings))
    drivers = [d for d in drivers if d]

    return {
        "success": True,
        "imported": imported,
        "duplicates": duplicates,
        "driversCreated": drivers_created,
        "skippedCancelled": skipped_cancelled,
        "total": len(bookings),
        "dateRange": {"first": dates[0] if dates else "", "last": dates[-1] if dates else ""},
        "driversFound": drivers,
    }
