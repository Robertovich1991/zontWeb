"""Fleet Planning - Aggregates Zont + Company bookings for driver timeline.
Optimized: parallel C# calls, shared client, caching, reduced scan range.
Includes AI delay-risk scoring with Google Distance Matrix (real-time traffic)."""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import asyncio
import logging
import os
import time as _time
import httpx
import math

from routes.fleet_shared import (
    get_token, get_company_id, get_db, csharp_get,
    parse_csharp_date, estimate_end_time, scan_auctions,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/fleet/planning", tags=["fleet-planning"])

GOOGLE_MAPS_KEY = os.environ.get("GOOGLE_MAPS_KEY", "")

# ── ETA Cache (avoid repeated Distance Matrix calls) ─────────────────
# Key: "origin_lat,origin_lng|dest_address" -> {eta_seconds, fetched_at}
_eta_cache: dict[str, dict] = {}
ETA_CACHE_TTL = 300  # 5 min default


def _get_cached_eta(origin: str, dest: str, ttl: int = ETA_CACHE_TTL):
    key = f"{origin}|{dest}"
    entry = _eta_cache.get(key)
    if entry and (_time.time() - entry["fetched_at"]) < ttl:
        return entry
    return None


def _set_eta_cache(origin: str, dest: str, data: dict):
    key = f"{origin}|{dest}"
    _eta_cache[key] = {**data, "fetched_at": _time.time()}
    if len(_eta_cache) > 500:
        cutoff = _time.time() - ETA_CACHE_TTL * 2
        expired = [k for k, v in _eta_cache.items() if v["fetched_at"] < cutoff]
        for k in expired:
            del _eta_cache[k]


async def get_eta_from_google(origin_lat: float, origin_lng: float, dest_address: str) -> dict | None:
    """Call Google Distance Matrix API with real-time traffic."""
    if not GOOGLE_MAPS_KEY:
        return None
    origin_str = f"{origin_lat},{origin_lng}"
    cached = _get_cached_eta(origin_str, dest_address)
    if cached:
        return cached

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://maps.googleapis.com/maps/api/distancematrix/json",
                params={
                    "origins": origin_str,
                    "destinations": dest_address,
                    "departure_time": "now",
                    "key": GOOGLE_MAPS_KEY,
                },
            )
            data = resp.json()
            if data.get("status") != "OK":
                return None
            el = data["rows"][0]["elements"][0]
            if el.get("status") != "OK":
                return None
            result = {
                "eta_seconds": el.get("duration_in_traffic", el.get("duration", {})).get("value", 0),
                "eta_text": el.get("duration_in_traffic", el.get("duration", {})).get("text", ""),
                "distance_m": el.get("distance", {}).get("value", 0),
                "distance_text": el.get("distance", {}).get("text", ""),
            }
            _set_eta_cache(origin_str, dest_address, result)
            return result
    except Exception as e:
        logger.warning(f"Google Distance Matrix error: {e}")
        return None


def _haversine_km(lat1, lng1, lat2, lng2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLng = math.radians(lng2 - lng1)
    a = math.sin(dLat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("")
async def get_planning(request: Request, date: str = "", view: str = "day"):
    token = get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)
    return await _build_planning(token, company_id, db, date, view)


async def _build_planning(token: str, company_id: str, db, date: str, view: str = "day"):
    """Internal: build planning data (reusable by delay-risk endpoint)."""

    # Parse target date
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d") if date else datetime.now()
    except ValueError:
        target_date = datetime.now()

    if view == "month":
        import calendar
        year, month = target_date.year, target_date.month
        _, last_day = calendar.monthrange(year, month)
        date_start = f"{year}-{str(month).zfill(2)}-01"
        date_end = f"{year}-{str(month).zfill(2)}-{str(last_day).zfill(2)}"
    elif view == "week":
        start_of_week = target_date - timedelta(days=target_date.weekday())
        date_start = start_of_week.strftime("%Y-%m-%d")
        date_end = (start_of_week + timedelta(days=6)).strftime("%Y-%m-%d")
    else:
        date_start = target_date.strftime("%Y-%m-%d")
        date_end = date_start

    # ── PHASE 1: Parallel fetch (drivers + auctions + trips + MongoDB) ──
    mongo_assigned_query = {
        "companyId": company_id,
        "driver": {"$ne": None},
        "date": {"$gte": date_start, "$lte": date_end},
    }
    mongo_unassigned_query = {
        "companyId": company_id,
        "$or": [{"driver": None}, {"driver": {"$exists": False}}],
        "date": {"$gte": date_start, "$lte": date_end},
        "status": {"$nin": ["cancelled", "completed"]},
    }
    rest_days_query = {
        "companyId": company_id,
        "date": {"$gte": date_start, "$lte": date_end},
    }

    # Launch ALL data fetches in parallel
    (
        drivers_raw,
        zont_bookings,
        zont_trips,
        company_assigned_raw,
        company_unassigned_raw,
        rest_days_raw,
        local_drivers_raw,
    ) = await asyncio.gather(
        csharp_get("/api/Driver/company/getdriver", token),
        csharp_get("/api/Auction/company/auctions?count=100&pageNumber=1&isDescending=true", token),
        csharp_get("/api/Trip/driver?count=200&pageNumber=1", token),
        db.fleet_reservations.find(mongo_assigned_query, {"_id": 0}).to_list(500),
        db.fleet_reservations.find(mongo_unassigned_query, {"_id": 0}).to_list(500),
        db.driver_rest_days.find(rest_days_query, {"_id": 0}).to_list(500),
        db.local_drivers.find({"companyId": company_id, "active": True}, {"_id": 0}).to_list(200),
    )

    # ── Parse drivers (C# + local) ──
    drivers = []
    driver_ids = set()
    for d in (drivers_raw if isinstance(drivers_raw, list) else []):
        did = d.get("id", "")
        drivers.append({
            "id": did,
            "firstName": d.get("firstName", ""),
            "lastName": d.get("lastName", ""),
            "isActivated": d.get("isActivated", False),
            "isOnline": d.get("isOnline", False),
            "phone": d.get("phoneNumber", ""),
        })
        driver_ids.add(did)
    # Add local drivers (from sheet import)
    for d in (local_drivers_raw if isinstance(local_drivers_raw, list) else []):
        did = d.get("id", "")
        if did and did not in driver_ids:
            drivers.append({
                "id": did,
                "firstName": d.get("firstName", ""),
                "lastName": d.get("lastName", ""),
                "isActivated": True,
                "isOnline": False,
                "phone": d.get("phone", ""),
                "isLocal": True,
            })
            driver_ids.add(did)

    # ── Parse Zont auctions (assigned to drivers) ──
    zont_events = []
    known_auction_ids = set()
    for a in (zont_bookings if isinstance(zont_bookings, list) else []):
        aid = a.get("id")
        if aid:
            known_auction_ids.add(aid)
        if not a.get("driver"):
            continue
        start_dt = parse_csharp_date(a.get("startDate"))
        if not start_dt:
            continue
        booking_date = start_dt.strftime("%Y-%m-%d")
        if booking_date < date_start or booking_date > date_end:
            continue
        end_dt = parse_csharp_date(a.get("endDate")) or estimate_end_time(start_dt)
        zont_events.append({
            "id": f"zont-{aid}",
            "driverId": a["driver"].get("id", ""),
            "source": "zont",
            "type": (a.get("tripType") or "Transfer"),
            "status": a.get("status", ""),
            "startTime": start_dt.strftime("%Y-%m-%dT%H:%M"),
            "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
            "pickupAddress": a.get("startAddress", ""),
            "dropoffAddress": a.get("endAddress", ""),
            "clientName": "",
            "price": a.get("totalAmount", 0),
        })

    # ── PHASE 2: Scan for hidden auctions ──
    # Also collect IDs from trips to help determine scan range
    for t in (zont_trips if isinstance(zont_trips, list) else []):
        tid = t.get("auctionId") or t.get("id")
        if tid and isinstance(tid, int):
            known_auction_ids.add(tid)
    extra_auctions = await scan_auctions(token, company_id, known_auction_ids)
    seen_event_ids = {e["id"] for e in zont_events}
    for a in extra_auctions:
        eid = f"zont-{a.get('id')}"
        if eid in seen_event_ids:
            continue
        if not a.get("driver"):
            continue  # Unassigned handled below
        start_dt = parse_csharp_date(a.get("startDate"))
        if not start_dt:
            continue
        booking_date = start_dt.strftime("%Y-%m-%d")
        if booking_date < date_start or booking_date > date_end:
            continue
        end_dt = parse_csharp_date(a.get("endDate")) or estimate_end_time(start_dt)
        driver = a.get("driver") or {}
        zont_events.append({
            "id": eid,
            "driverId": driver.get("id", ""),
            "source": "zont",
            "type": (a.get("tripType") or "Transfer"),
            "status": a.get("status", ""),
            "startTime": start_dt.strftime("%Y-%m-%dT%H:%M"),
            "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
            "pickupAddress": a.get("startAddress", ""),
            "dropoffAddress": a.get("endAddress", ""),
            "clientName": "",
            "price": a.get("totalAmount", 0),
        })
        seen_event_ids.add(eid)

    # ── Parse Zont completed trips ──
    for t in (zont_trips if isinstance(zont_trips, list) else []):
        trip_driver = t.get("driver") or {}
        if not trip_driver.get("id"):
            continue
        start_dt = parse_csharp_date(t.get("startDate"))
        if not start_dt:
            continue
        trip_date = start_dt.strftime("%Y-%m-%d")
        if trip_date < date_start or trip_date > date_end:
            continue
        end_dt = parse_csharp_date(t.get("endDate"))
        if not end_dt or (end_dt and end_dt.year <= 1):
            end_dt = estimate_end_time(start_dt)
        trip_id = f"zont-trip-{t.get('id')}"
        if trip_id in seen_event_ids:
            continue
        creator = t.get("creator") or {}
        client_name = f"{creator.get('firstName', '')} {creator.get('lastName', '')}".strip()
        zont_events.append({
            "id": trip_id,
            "driverId": trip_driver.get("id", ""),
            "source": "zont",
            "type": t.get("carType") or "Transfer",
            "status": t.get("status", ""),
            "startTime": start_dt.strftime("%Y-%m-%dT%H:%M"),
            "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
            "pickupAddress": t.get("startAddress", ""),
            "dropoffAddress": t.get("endAddress", ""),
            "clientName": client_name,
            "price": t.get("totalAmount", 0),
        })

    # ── Parse company bookings (MongoDB - already fetched) ──
    company_events = []
    for b in company_assigned_raw:
        time_str = b.get("time", "00:00")
        start_dt = parse_csharp_date(f"{b['date']}T{time_str}")
        if not start_dt:
            continue
        hours = b.get("hours", 0)
        end_dt = start_dt + timedelta(hours=hours) if hours and hours > 0 else estimate_end_time(start_dt, b.get("type", "transfer"))
        company_events.append({
            "id": f"company-{b.get('id', '')}",
            "driverId": b.get("driver", {}).get("id", ""),
            "source": "company",
            "type": b.get("type", "transfer"),
            "status": b.get("status", ""),
            "startTime": start_dt.strftime("%Y-%m-%dT%H:%M"),
            "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
            "pickupAddress": b.get("pickupAddress", ""),
            "dropoffAddress": b.get("dropoffAddress", ""),
            "clientName": b.get("clientName", ""),
            "price": b.get("price", 0),
        })

    # ── Unassigned bookings ──
    unassigned_bookings = []
    for b in company_unassigned_raw:
        time_str = b.get("time", "00:00")
        start_dt = parse_csharp_date(f"{b['date']}T{time_str}")
        hours = b.get("hours", 0)
        end_dt = None
        if start_dt:
            end_dt = start_dt + timedelta(hours=hours) if hours and hours > 0 else estimate_end_time(start_dt, b.get("type", "transfer"))
        unassigned_bookings.append({
            "id": b.get("id", ""),
            "source": "company",
            "type": b.get("type", "transfer"),
            "status": b.get("status", "new"),
            "date": b.get("date", ""),
            "time": time_str,
            "startTime": start_dt.strftime("%Y-%m-%dT%H:%M") if start_dt else "",
            "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
            "pickupAddress": b.get("pickupAddress", ""),
            "dropoffAddress": b.get("dropoffAddress", ""),
            "clientName": b.get("clientName", ""),
            "passengerName": b.get("passengerName", ""),
            "flightNumber": b.get("flightNumber", ""),
            "passengers": b.get("passengers", 0),
            "hours": hours,
            "price": b.get("price", 0),
            "comment": b.get("comment", ""),
        })

    # Add unassigned Zont auctions
    for a in extra_auctions:
        if a.get("driver"):
            continue
        start_dt = parse_csharp_date(a.get("startDate"))
        if not start_dt:
            continue
        booking_date = start_dt.strftime("%Y-%m-%d")
        if booking_date < date_start or booking_date > date_end:
            continue
        end_dt = parse_csharp_date(a.get("endDate")) or estimate_end_time(start_dt)
        client = a.get("client") or {}
        client_name = f"{client.get('firstName', '')} {client.get('lastName', '')}".strip()
        unassigned_bookings.append({
            "id": f"zont-{a.get('id')}",
            "source": "zont",
            "type": a.get("tripType") or a.get("carType") or "Transfer",
            "status": a.get("status", ""),
            "date": booking_date,
            "time": start_dt.strftime("%H:%M"),
            "startTime": start_dt.strftime("%Y-%m-%dT%H:%M"),
            "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
            "pickupAddress": a.get("startAddress", ""),
            "dropoffAddress": a.get("endAddress", ""),
            "clientName": client_name,
            "passengerName": "",
            "flightNumber": "",
            "passengers": a.get("passengerCount", 0),
            "hours": 0,
            "price": a.get("totalAmount", 0),
            "comment": a.get("additionalComments", ""),
            "auctionId": a.get("id"),
        })

    unassigned_bookings.sort(key=lambda x: x.get("time", ""))

    # ── Build planning per driver ──
    all_events = zont_events + company_events
    now_str = datetime.now().strftime("%Y-%m-%dT%H:%M")
    planning = []
    for driver in drivers:
        driver_events = [e for e in all_events if e["driverId"] == driver["id"]]
        driver_events.sort(key=lambda e: e["startTime"])
        is_busy = any(e["startTime"] <= now_str <= e["endTime"] for e in driver_events if e["endTime"])

        if not driver["isActivated"]:
            status = "offline"
        elif is_busy:
            status = "busy"
        else:
            status = "available"

        planning.append({**driver, "status": status, "events": driver_events})

    # ── Rest days (already fetched) ──
    rest_days = {}
    for rd in rest_days_raw:
        did = rd.get("driverId", "")
        if did not in rest_days:
            rest_days[did] = []
        rest_days[did].append(rd.get("date", ""))
    for p in planning:
        p["restDays"] = rest_days.get(p["id"], [])

    return {
        "dateStart": date_start,
        "dateEnd": date_end,
        "view": view,
        "drivers": planning,
        "unassigned": unassigned_bookings,
    }


# ── Delay Risk AI Scoring ─────────────────────────────────────────────

RISK_BUFFER_MINUTES = 15  # configurable margin


def _adaptive_cache_ttl(minutes_until: float) -> int:
    """Cache TTL based on time until mission: farther = longer cache."""
    if minutes_until >= 60:
        return 1800   # 30 min
    elif minutes_until >= 20:
        return 600    # 10 min
    else:
        return 300    # 5 min


@router.get("/delay-risk")
async def get_delay_risk(request: Request, date: str = ""):
    """Calculate delay risk scores for all future events on a given date.
    Uses Google Distance Matrix for real-time ETA with traffic."""
    token = get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    # Fetch planning data for the day
    planning = await _build_planning(token, company_id, db, date, "day")

    # Fetch GPS devices and positions for this company
    gps_devices_list, gps_positions_list = await asyncio.gather(
        db.gps_devices.find({"companyId": company_id}, {"_id": 0}).to_list(100),
        db.gps_positions.find(
            {"imei": {"$exists": True}}, {"_id": 0}
        ).to_list(200),
    )

    # Build position lookup by IMEI
    gps_positions = {p["imei"]: p for p in gps_positions_list}

    # Map drivers to GPS positions by driverName match
    driver_gps = {}
    for device in gps_devices_list:
        dn = (device.get("driverName") or "").strip().lower()
        pos = gps_positions.get(device["imei"])
        if pos:
            entry = {
                **pos,
                "imei": device["imei"],
                "vehicleName": device.get("vehicleName", ""),
                "licensePlate": device.get("licensePlate", ""),
            }
            if dn:
                driver_gps[dn] = entry
            # Also store by IMEI for fallback
            driver_gps[f"imei:{device['imei']}"] = entry

    # If only one GPS device, use it as fallback for all drivers
    single_gps = None
    if len(gps_devices_list) == 1 and gps_positions:
        imei = gps_devices_list[0]["imei"]
        if imei in gps_positions:
            single_gps = {
                **gps_positions[imei],
                "imei": imei,
                "vehicleName": gps_devices_list[0].get("vehicleName", ""),
                "licensePlate": gps_devices_list[0].get("licensePlate", ""),
            }

    now = datetime.now()
    now_utc = datetime.now(timezone.utc)
    risks = {}
    eta_tasks = []  # Collect async ETA calls

    for driver in planning.get("drivers", []):
        events = driver.get("events", [])
        driver_name_key = f"{driver.get('firstName', '')} {driver.get('lastName', '')}".strip().lower()
        gps = driver_gps.get(driver_name_key) or single_gps

        for i, event in enumerate(events):
            try:
                start_time = datetime.strptime(event["startTime"], "%Y-%m-%dT%H:%M")
            except (ValueError, KeyError):
                continue

            minutes_until = (start_time - now).total_seconds() / 60

            # For past events today, skip them
            if minutes_until < -60:
                continue

            # Analyse all events of the selected day (not just 2h window)
            # The 2h window only applies to GPS ETA checks (real-time)
            is_imminent = 0 < minutes_until <= 120

            score = 0
            reasons = []
            margin_minutes = None
            eta_data = None
            gps_active = False

            # ── Previous mission overlap (+40) ──
            prev_end_time = None
            if i > 0:
                prev = events[i - 1]
                try:
                    prev_end_time = datetime.strptime(prev["endTime"], "%Y-%m-%dT%H:%M") if prev.get("endTime") else None
                except ValueError:
                    prev_end_time = None

            if prev_end_time and prev_end_time > start_time:
                overlap_min = int((prev_end_time - start_time).total_seconds() / 60)
                score += 40
                reasons.append(f"Le chauffeur termine une course {overlap_min} min apres le debut de la suivante")

            # ── Margin between events ──
            if prev_end_time and prev_end_time <= start_time:
                margin_minutes = (start_time - prev_end_time).total_seconds() / 60

                # +10 if margin < 10 min
                if margin_minutes < 10:
                    score += 10
                    reasons.append(f"Marge de seulement {int(margin_minutes)} min entre les missions")

            # ── GPS inactive > 10 min (+20) — only for imminent events ──
            if is_imminent:
                if gps:
                    gps_ts = gps.get("timestamp")
                    if gps_ts:
                        try:
                            gps_time = datetime.fromisoformat(gps_ts.replace("Z", "+00:00"))
                            gps_age_min = (now_utc - gps_time).total_seconds() / 60
                            if gps_age_min > 10:
                                score += 20
                                reasons.append(f"Le GPS est inactif depuis {int(gps_age_min)} minutes")
                            else:
                                gps_active = True
                        except Exception:
                            score += 20
                            reasons.append("Impossible de lire le timestamp GPS")
                    else:
                        score += 20
                        reasons.append("Pas de timestamp GPS disponible")
                else:
                    score += 20
                    reasons.append("Aucun traceur GPS associe a ce chauffeur")

            # ── No driver assigned (+15) ──
            if not event.get("driverId"):
                score += 15
                reasons.append("Chauffeur non assigne a cette mission")

            # ── ETA vs margin: Google Distance Matrix (+25) — only for imminent ──
            pickup_address = event.get("pickupAddress", "")
            has_gps_position = gps and gps.get("lat") and gps.get("lng")
            if is_imminent and has_gps_position and pickup_address:
                cache_ttl = _adaptive_cache_ttl(minutes_until)
                cached_eta = _get_cached_eta(
                    f"{gps['lat']},{gps['lng']}", pickup_address, ttl=cache_ttl
                )
                if cached_eta:
                    eta_data = cached_eta
                else:
                    # Schedule async call
                    eta_tasks.append({
                        "event_id": event["id"],
                        "lat": gps["lat"],
                        "lng": gps["lng"],
                        "address": pickup_address,
                    })

            # Store preliminary risk (ETA will be added after batch calls)
            risks[event["id"]] = {
                "score": score,
                "reasons": reasons,
                "marginMinutes": int(margin_minutes) if margin_minutes is not None else None,
                "etaMinutes": None,
                "etaText": None,
                "distanceText": None,
                "gpsActive": gps_active,
                "minutesUntil": int(minutes_until),
                "_pending_eta": eta_data,
            }

    # ── Batch ETA calls (max 5 concurrent) ──
    async def fetch_eta(task):
        return task["event_id"], await get_eta_from_google(
            task["lat"], task["lng"], task["address"]
        )

    if eta_tasks:
        sem = asyncio.Semaphore(5)

        async def limited_fetch(t):
            async with sem:
                return await fetch_eta(t)

        results = await asyncio.gather(*[limited_fetch(t) for t in eta_tasks])
        for event_id, eta_result in results:
            if event_id in risks and eta_result:
                risks[event_id]["_pending_eta"] = eta_result

    # ── Apply ETA scoring ──
    for event_id, risk in risks.items():
        eta = risk.pop("_pending_eta", None)
        if eta and eta.get("eta_seconds"):
            eta_min = eta["eta_seconds"] / 60
            risk["etaMinutes"] = int(eta_min)
            risk["etaText"] = eta.get("eta_text", "")
            risk["distanceText"] = eta.get("distance_text", "")

            remaining = risk["minutesUntil"]
            margin = risk["marginMinutes"]
            effective_margin = margin if margin is not None else remaining

            if eta_min > effective_margin:
                risk["score"] += 25
                is_airport = any(
                    kw in (risk.get("_addr", "") or "").lower()
                    for kw in ["aeroport", "cdg", "orly", "beauvais", "airport"]
                )
                if is_airport:
                    risk["reasons"].append(
                        f"Marge insuffisante pour un transfert aeroport (ETA {int(eta_min)} min, marge {int(effective_margin)} min)"
                    )
                else:
                    risk["reasons"].append(
                        f"Le vehicule est a {risk['etaText']} du point de depart (marge {int(effective_margin)} min)"
                    )
            elif eta_min > effective_margin - RISK_BUFFER_MINUTES:
                risk["reasons"].append(
                    f"ETA {risk['etaText']} - marge correcte mais limitee ({int(effective_margin)} min)"
                )
        elif not risk["gpsActive"] and risk["marginMinutes"] is not None:
            # No GPS but tight margin → penalize
            if risk["marginMinutes"] < RISK_BUFFER_MINUTES:
                risk["score"] += 25
                risk["reasons"].append(
                    f"Marge de {int(risk['marginMinutes'])} min sans suivi GPS actif"
                )

        # Clamp score
        risk["score"] = min(risk["score"], 100)

        # Status
        s = risk["score"]
        if s <= 39:
            risk["status"] = "on_time"
            risk["label"] = "A l'heure"
        elif s <= 69:
            risk["status"] = "tight"
            risk["label"] = "Timing serre"
        else:
            risk["status"] = "at_risk"
            risk["label"] = "Risque de retard"

    # Also mark unassigned events
    for b in planning.get("unassigned", []):
        bid = b.get("id", "")
        if bid:
            risks[bid] = {
                "score": 15,
                "status": "on_time",
                "label": "A l'heure",
                "reasons": ["Chauffeur non assigne a cette mission"],
                "marginMinutes": None,
                "etaMinutes": None,
                "etaText": None,
                "distanceText": None,
                "gpsActive": False,
                "minutesUntil": None,
            }

    return {"risks": risks, "date": date, "bufferMinutes": RISK_BUFFER_MINUTES}


class ConflictCheckRequest(BaseModel):
    driverId: str
    startTime: str
    endTime: str
    excludeBookingId: str = ""


@router.post("/check-conflict")
async def check_conflict(data: ConflictCheckRequest, request: Request):
    token = get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    try:
        new_start = datetime.strptime(data.startTime, "%Y-%m-%dT%H:%M")
        new_end = datetime.strptime(data.endTime, "%Y-%m-%dT%H:%M")
    except ValueError:
        raise HTTPException(400, "Format date invalide (YYYY-MM-DDTHH:MM)")

    date_str = new_start.strftime("%Y-%m-%d")

    # Parallel: check Zont + company bookings
    zont_task = csharp_get(
        "/api/Auction/company/auctions?count=100&pageNumber=1&isDescending=true", token
    )
    company_task = db.fleet_reservations.find(
        {"companyId": company_id, "driver.id": data.driverId, "date": date_str, "status": {"$nin": ["cancelled"]}},
        {"_id": 0},
    ).to_list(100)

    zont_bookings, company_bookings = await asyncio.gather(zont_task, company_task)

    for a in (zont_bookings if isinstance(zont_bookings, list) else []):
        if not a.get("driver") or a["driver"].get("id") != data.driverId:
            continue
        if data.excludeBookingId and f"zont-{a.get('id')}" == data.excludeBookingId:
            continue
        start_dt = parse_csharp_date(a.get("startDate"))
        if not start_dt:
            continue
        end_dt = parse_csharp_date(a.get("endDate")) or estimate_end_time(start_dt)
        if start_dt < new_end and end_dt > new_start:
            return {
                "conflict": True,
                "message": "Ce chauffeur est deja occupe sur ce creneau (reservation Zont)",
                "conflictWith": {
                    "id": f"zont-{a.get('id')}",
                    "startTime": start_dt.strftime("%Y-%m-%dT%H:%M"),
                    "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
                },
            }

    for b in company_bookings:
        if data.excludeBookingId and f"company-{b.get('id')}" == data.excludeBookingId:
            continue
        time_str = b.get("time", "00:00")
        start_dt = parse_csharp_date(f"{b['date']}T{time_str}")
        if not start_dt:
            continue
        hours = b.get("hours", 0)
        end_dt = start_dt + timedelta(hours=hours) if hours > 0 else estimate_end_time(start_dt, b.get("type"))
        if start_dt < new_end and end_dt > new_start:
            return {
                "conflict": True,
                "message": "Ce chauffeur est deja occupe sur ce creneau (reservation societe)",
                "conflictWith": {
                    "id": f"company-{b.get('id')}",
                    "startTime": start_dt.strftime("%Y-%m-%dT%H:%M"),
                    "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
                },
            }

    return {"conflict": False, "message": "Chauffeur disponible"}


# ─── Rest Days ───

class RestDayRequest(BaseModel):
    driverId: str
    date: str  # YYYY-MM-DD


@router.post("/rest-day")
async def add_rest_day(data: RestDayRequest, request: Request):
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    await db.driver_rest_days.update_one(
        {"companyId": company_id, "driverId": data.driverId, "date": data.date},
        {"$set": {"companyId": company_id, "driverId": data.driverId, "date": data.date}},
        upsert=True,
    )
    return {"success": True, "date": data.date}


@router.delete("/rest-day")
async def remove_rest_day(request: Request, driverId: str = "", date: str = ""):
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    await db.driver_rest_days.delete_one(
        {"companyId": company_id, "driverId": driverId, "date": date}
    )
    return {"success": True}
