"""Performance audit script - measures time per step for fleet endpoints."""
import asyncio
import httpx
import time
import json
import base64

API_URL = "https://fleet-dispatch-41.preview.emergentagent.com"
CSHARP_API = "https://api.zont.cab"
CREDS = {"username": "Nandetiri1@gmail.com", "password": "12345678"}

results = []

def log(label, elapsed, detail=""):
    ms = round(elapsed * 1000)
    results.append({"step": label, "ms": ms, "detail": detail})
    print(f"  [{ms:>6}ms] {label} {detail}")

async def measure_csharp_direct(token):
    """Measure raw C# API response times."""
    print("\n=== MESURE DIRECTE API C# ===")
    endpoints = [
        ("/api/Driver/company/getdriver", "GET drivers"),
        ("/api/Auction/company/auctions?count=100&pageNumber=1&isDescending=true", "GET auctions list"),
        ("/api/Trip/driver?count=200&pageNumber=1", "GET trips"),
        ("/api/Auction/company/auctions/15", "GET auction detail (single)"),
    ]
    for path, label in endpoints:
        # Each call = new client (current behavior)
        t0 = time.perf_counter()
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(f"{CSHARP_API}{path}", headers={"Authorization": f"Bearer {token}"})
        elapsed = time.perf_counter() - t0
        size = len(resp.content) if resp.status_code == 200 else 0
        log(f"C# {label}", elapsed, f"status={resp.status_code} size={size}B")

    # Measure N individual auction detail calls (simulating scan)
    print("\n=== SCAN ENCHERES (35 appels individuels) ===")
    t0 = time.perf_counter()
    tasks = []
    async with httpx.AsyncClient(timeout=15.0) as client:  # SHARED client
        for aid in range(10, 45):
            tasks.append(client.get(f"{CSHARP_API}/api/Auction/company/auctions/{aid}", 
                                    headers={"Authorization": f"Bearer {token}"}))
        responses = await asyncio.gather(*tasks, return_exceptions=True)
    elapsed = time.perf_counter() - t0
    ok_count = sum(1 for r in responses if not isinstance(r, Exception) and r.status_code == 200)
    log("Scan 35 auctions (shared client)", elapsed, f"success={ok_count}/35")

    # Same but with INDIVIDUAL clients (current behavior)
    t0 = time.perf_counter()
    async def single_call(aid):
        async with httpx.AsyncClient(timeout=15.0) as c:
            return await c.get(f"{CSHARP_API}/api/Auction/company/auctions/{aid}",
                               headers={"Authorization": f"Bearer {token}"})
    tasks2 = [single_call(aid) for aid in range(10, 45)]
    responses2 = await asyncio.gather(*tasks2, return_exceptions=True)
    elapsed2 = time.perf_counter() - t0
    ok_count2 = sum(1 for r in responses2 if not isinstance(r, Exception) and r.status_code == 200)
    log("Scan 35 auctions (individual clients)", elapsed2, f"success={ok_count2}/35")

async def measure_planning_endpoint(token):
    """Measure the full planning endpoint."""
    print("\n=== ENDPOINT /api/fleet/planning ===")
    for view in ["day", "week", "month"]:
        t0 = time.perf_counter()
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.get(f"{API_URL}/api/fleet/planning?date=2026-03-19&view={view}",
                                    headers={"Authorization": f"Bearer {token}"})
        elapsed = time.perf_counter() - t0
        size = len(resp.content) if resp.status_code == 200 else 0
        data = resp.json() if resp.status_code == 200 else {}
        drivers = len(data.get("drivers", []))
        events = sum(len(d.get("events", [])) for d in data.get("drivers", []))
        unassigned = len(data.get("unassigned", []))
        log(f"Planning view={view}", elapsed, f"status={resp.status_code} size={size}B drivers={drivers} events={events} unassigned={unassigned}")

async def measure_other_endpoints(token):
    """Measure other fleet endpoints."""
    print("\n=== AUTRES ENDPOINTS ===")
    endpoints = [
        (f"{API_URL}/api/fleet/drivers", "GET /fleet/drivers"),
        (f"{API_URL}/api/fleet/vehicles", "GET /fleet/vehicles"),
        (f"{API_URL}/api/fleet/bookings?count=20&pageNumber=1", "GET /fleet/bookings"),
        (f"{API_URL}/api/fleet/my-bookings", "GET /fleet/my-bookings"),
    ]
    for url, label in endpoints:
        t0 = time.perf_counter()
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.get(url, headers={"Authorization": f"Bearer {token}"})
        elapsed = time.perf_counter() - t0
        size = len(resp.content) if resp.status_code == 200 else 0
        log(label, elapsed, f"status={resp.status_code} size={size}B")

async def measure_sequential_vs_parallel(token):
    """Show the cost of sequential vs parallel for the 3 main C# calls in planning."""
    print("\n=== SEQUENTIEL vs PARALLELE (3 appels C# du planning) ===")
    paths = [
        "/api/Driver/company/getdriver",
        "/api/Auction/company/auctions?count=100&pageNumber=1&isDescending=true",
        "/api/Trip/driver?count=200&pageNumber=1",
    ]
    
    # Sequential
    t0 = time.perf_counter()
    for path in paths:
        async with httpx.AsyncClient(timeout=15.0) as client:
            await client.get(f"{CSHARP_API}{path}", headers={"Authorization": f"Bearer {token}"})
    elapsed_seq = time.perf_counter() - t0
    log("3 calls SEQUENTIAL", elapsed_seq)

    # Parallel with shared client
    t0 = time.perf_counter()
    async with httpx.AsyncClient(timeout=15.0) as client:
        tasks = [client.get(f"{CSHARP_API}{path}", headers={"Authorization": f"Bearer {token}"}) for path in paths]
        await asyncio.gather(*tasks)
    elapsed_par = time.perf_counter() - t0
    log("3 calls PARALLEL (shared client)", elapsed_par)
    
    saved = round((elapsed_seq - elapsed_par) * 1000)
    print(f"\n  >>> GAIN PARALLELE: {saved}ms economises")

async def main():
    print("=" * 60)
    print("AUDIT DE PERFORMANCE - Fleet Management Backend")
    print("=" * 60)

    # Login
    t0 = time.perf_counter()
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(f"{API_URL}/api/fleet/auth/login", json=CREDS)
    login_time = time.perf_counter() - t0
    data = resp.json()
    token = data.get("accessToken", "")
    log("LOGIN", login_time)

    if not token:
        print("ERREUR: Login echoue")
        return

    await measure_csharp_direct(token)
    await measure_sequential_vs_parallel(token)
    await measure_planning_endpoint(token)
    await measure_other_endpoints(token)

    # Summary
    print("\n" + "=" * 60)
    print("RESUME - TOP 10 PLUS LENTS")
    print("=" * 60)
    sorted_results = sorted(results, key=lambda x: x["ms"], reverse=True)
    for i, r in enumerate(sorted_results[:10], 1):
        print(f"  {i}. [{r['ms']:>6}ms] {r['step']} {r['detail']}")

asyncio.run(main())
