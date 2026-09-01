"""Multi-User Concurrency & Load Simulation for Trade of Titans.
Simulates 18 concurrent users (15 countries + Admin + Trading Center + Ranking)
actively querying and interacting with the backend API.
"""

import asyncio
import time
import sys
import os
import httpx
from datetime import datetime

# Default server URL (can be overridden via command line or env)
SERVER_URL = os.getenv("SERVER_URL", "http://127.0.0.1:8000")
if len(sys.argv) > 1 and sys.argv[1].startswith("http"):
    SERVER_URL = sys.argv[1].rstrip("/")

ADMIN_PASS = os.getenv("ADMIN_PASSWORD", "admin123")
TC_PASS = os.getenv("TRADING_CENTER_PASSWORD", "trading123")
RANKING_PASS = os.getenv("RANKING_PASSWORD", "ranking123")

VIRTUAL_USERS = [
    {"username": "admin", "password": ADMIN_PASS, "role": "admin"},
    {"username": "trading_center", "password": TC_PASS, "role": "trading_center"},
    {"username": "ranking", "password": RANKING_PASS, "role": "ranking"},
    {"username": "usa", "password": "usa123", "role": "country"},
    {"username": "germany", "password": "germany123", "role": "country"},
    {"username": "canada", "password": "canada123", "role": "country"},
    {"username": "australia", "password": "australia123", "role": "country"},
    {"username": "india", "password": "india123", "role": "country"},
    {"username": "china", "password": "china123", "role": "country"},
    {"username": "brazil", "password": "brazil123", "role": "country"},
    {"username": "russia", "password": "russia123", "role": "country"},
    {"username": "indonesia", "password": "indonesia123", "role": "country"},
    {"username": "japan", "password": "japan123", "role": "country"},
    {"username": "france", "password": "france123", "role": "country"},
    {"username": "south_korea", "password": "korea123", "role": "country"},
    {"username": "italy", "password": "italy123", "role": "country"},
    {"username": "mexico", "password": "mexico123", "role": "country"},
    {"username": "saudi_arabia", "password": "saudi123", "role": "country"},
]

latencies = []
status_counts = {}
user_metrics = {}


async def login_user(client: httpx.AsyncClient, user: dict) -> str | None:
    t0 = time.perf_counter()
    try:
        res = await client.post(
            f"{SERVER_URL}/auth/login",
            json={"username": user["username"], "password": user["password"]},
            timeout=10.0,
        )
        latency = (time.perf_counter() - t0) * 1000
        latencies.append(latency)
        status_counts[res.status_code] = status_counts.get(res.status_code, 0) + 1

        if res.status_code == 200:
            return res.json().get("access_token")
        else:
            print(f"Login failed for {user['username']}: HTTP {res.status_code}")
            return None
    except Exception as e:
        status_counts["error"] = status_counts.get("error", 0) + 1
        print(f"Login error for {user['username']}: {e}")
        return None


async def simulate_user(user: dict, stop_event: asyncio.Event):
    username = user["username"]
    role = user["role"]
    user_metrics[username] = {"requests": 0, "errors": 0, "latencies": []}

    async with httpx.AsyncClient(timeout=10.0) as client:
        token = await login_user(client, user)
        if not token:
            user_metrics[username]["errors"] += 1
            return

        headers = {"Authorization": f"Bearer {token}"}

        # Simulation loop
        while not stop_event.is_set():
            t0 = time.perf_counter()
            try:
                if role == "country":
                    # Country checks dashboard and round status
                    res = await client.get(f"{SERVER_URL}/country/dashboard", headers=headers)
                elif role == "admin":
                    # Admin checks overview
                    res = await client.get(f"{SERVER_URL}/admin-dashboard/", headers=headers)
                elif role == "trading_center":
                    # Trading center checks queue
                    res = await client.get(f"{SERVER_URL}/trading-center/dashboard", headers=headers)
                elif role == "ranking":
                    # Ranking checks standings
                    res = await client.get(f"{SERVER_URL}/rankings/", headers=headers)
                else:
                    res = await client.get(f"{SERVER_URL}/game/status", headers=headers)

                latency = (time.perf_counter() - t0) * 1000
                latencies.append(latency)
                user_metrics[username]["latencies"].append(latency)
                user_metrics[username]["requests"] += 1
                status_counts[res.status_code] = status_counts.get(res.status_code, 0) + 1

            except Exception as e:
                user_metrics[username]["errors"] += 1
                status_counts["error"] = status_counts.get("error", 0) + 1

            # Wait 2-3 seconds between polling actions per user (much faster than production 15s to stress test!)
            await asyncio.sleep(2.5)


async def run_simulation():
    print("================================================================")
    print(f"  TRADE OF TITANS - CONCURRENCY SIMULATION LOAD TEST")
    print(f"  Target: {SERVER_URL}")
    print(f"  Concurrent Virtual Users: {len(VIRTUAL_USERS)}")
    print(f"  Roles: 1 Admin, 1 Trading Desk, 1 Rankings, 15 Countries")
    print(f"  Duration: {DURATION_SECONDS} seconds (stress rate: 2.5s polling)")
    print("================================================================\n")

    # First test server reachability
    async with httpx.AsyncClient(timeout=5.0) as check_client:
        try:
            r = await check_client.get(f"{SERVER_URL}/")
            if r.status_code != 200:
                print(f"Warning: Server returned status {r.status_code}")
        except Exception as e:
            print(f"Connection Error: Could not reach {SERVER_URL}: {e}")
            print("Please make sure your server is running (e.g. uvicorn app.main:app --reload) before testing.")
            return

    stop_event = asyncio.Event()
    start_time = time.time()

    # Launch all 18 virtual user tasks concurrently
    tasks = [simulate_user(user, stop_event) for user in VIRTUAL_USERS]

    print(f"Starting {len(VIRTUAL_USERS)} concurrent virtual user sessions...")
    sim_task = asyncio.gather(*tasks)

    # Let the simulation run for DURATION_SECONDS
    for remaining in range(DURATION_SECONDS, 0, -5):
        print(f"  [Progress] Simulating load... {remaining}s remaining")
        await asyncio.sleep(min(5, remaining))

    stop_event.set()
    await sim_task
    total_time = time.time() - start_time

    # Calculate statistics
    total_reqs = len(latencies)
    success_reqs = status_counts.get(200, 0)
    error_reqs = total_reqs - success_reqs
    avg_latency = sum(latencies) / total_reqs if total_reqs else 0
    sorted_latencies = sorted(latencies) if latencies else [0]
    p50 = sorted_latencies[int(len(sorted_latencies) * 0.50)]
    p95 = sorted_latencies[int(len(sorted_latencies) * 0.95)]
    min_lat = sorted_latencies[0]
    max_lat = sorted_latencies[-1]
    rps = total_reqs / total_time if total_time else 0

    print("\n================================================================")
    print("  SIMULATION RESULTS & PERFORMANCE REPORT")
    print("================================================================")
    print(f"  Total Simulated Users     : {len(VIRTUAL_USERS)}")
    print(f"  Total Requests Processed  : {total_reqs}")
    print(f"  Successful (HTTP 200 OK)  : {success_reqs} ({success_reqs/total_reqs*100:.1f}%)" if total_reqs else "0")
    print(f"  Failed / Errored Requests : {error_reqs}")
    print(f"  Throughput (RPS)          : {rps:.2f} req/sec")
    print("----------------------------------------------------------------")
    print(f"  Average Response Latency  : {avg_latency:.2f} ms")
    print(f"  Median Latency (p50)      : {p50:.2f} ms")
    print(f"  95th Percentile (p95)     : {p95:.2f} ms")
    print(f"  Fastest Response          : {min_lat:.2f} ms")
    print(f"  Slowest Response          : {max_lat:.2f} ms")
    print("================================================================")

    if error_reqs == 0 and avg_latency < 250:
        print("  VERDICT: EXCELLENT! System handles 15+ concurrent users with ease.")
    elif error_reqs == 0:
        print("  VERDICT: STABLE (No errors, but check network latency).")
    else:
        print("  VERDICT: REVIEW REQUIRED (Some requests failed).")
    print("================================================================\n")


if __name__ == "__main__":
    asyncio.run(run_simulation())
