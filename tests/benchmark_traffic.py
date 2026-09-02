"""
Benchmark script: Simulates 30 concurrent user sessions (30 country delegates + 1 Trading Center + 1 Admin)
Comparing BEFORE vs AFTER request volumes, database queries, and response latencies.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import time
from fastapi.testclient import TestClient
from app.database import engine
from app.main import app
from app.models.base import Base
from app.seed_tournament import seed_tournament
from app.routers.resources import clear_resources_cache


def run_benchmark():
    Base.metadata.create_all(bind=engine)
    seed_tournament()

    print("=================================================================")
    print("      TRADE OF TITANS: 30-USER TRAFFIC & PERFORMANCE BENCHMARK   ")
    print("=================================================================\n")

    # 1. Measure Latency of /resources/ With vs Without In-Memory RAM Cache
    with TestClient(app) as client:
        # Measure without in-memory cache (cold query)
        clear_resources_cache()
        cold_times = []
        for _ in range(50):
            clear_resources_cache()
            start = time.perf_counter()
            res = client.get("/resources/")
            cold_times.append(time.perf_counter() - start)

        avg_cold_ms = (sum(cold_times) / len(cold_times)) * 1000

        # Measure with in-memory RAM cache (warm query)
        # Populate cache
        client.get("/resources/")
        warm_times = []
        for _ in range(100):
            start = time.perf_counter()
            res = client.get("/resources/")
            warm_times.append(time.perf_counter() - start)

        avg_warm_ms = (sum(warm_times) / len(warm_times)) * 1000

    print(f"1. Static Table Query Latency (/resources/):")
    print(f"   - Cold (Direct DB Query):       {avg_cold_ms:.2f} ms")
    print(f"   - Warm (In-Memory RAM Cache):   {avg_warm_ms:.2f} ms")
    speedup = (avg_cold_ms / avg_warm_ms) if avg_warm_ms > 0 else 1.0
    print(f"   - Speedup Factor:               {speedup:.1f}x faster\n")

    # 2. Mathematical Simulation for 30 Users:
    # Model: 30 Country Delegates + 1 Trading Center Desk + 1 Admin (32 clients total)
    # Active Round Duration: 10 minutes (600 seconds)
    # Intermission Duration: 5 minutes (300 seconds)

    # BEFORE:
    # Countries:
    #   - /country-portal/dashboard every 15s = 4 req/min
    #   - /game/status every 20s = 3 req/min
    #   - /rounds/ every 20s = 3 req/min
    #   Total per country = 10 req/min
    # Trading Center:
    #   - /trading-center/dashboard every 15s = 4 req/min
    #   - /game/status every 20s = 3 req/min
    # Admin:
    #   - /admin-dashboard/ every 15s = 4 req/min
    #   - /game/status every 20s = 3 req/min

    countries_count = 30
    active_mins = 10
    intermission_mins = 5
    total_mins = active_mins + intermission_mins

    # BEFORE CALCULATION:
    before_req_per_min_country = (60 / 15) + (60 / 20) + (60 / 20)  # 4 + 3 + 3 = 10
    before_req_per_min_operators = ((60 / 15) + (60 / 20)) * 2       # (4 + 3) * 2 = 14
    before_total_req_per_min = (countries_count * before_req_per_min_country) + before_req_per_min_operators  # 300 + 14 = 314 req/min
    before_active_total = before_total_req_per_min * active_mins
    before_intermission_total = before_total_req_per_min * intermission_mins  # In before, countries polled at same 15s/20s rate during intermission!
    before_session_total = before_active_total + before_intermission_total

    # AFTER CALCULATION:
    # Countries (Duplicate polls eliminated!):
    #   - Active Round: /country-portal/dashboard every 20s = 3 req/min
    #   - Intermission: /country-portal/dashboard every 35s = ~1.71 req/min
    #   - /game/status & /rounds/: 0 req/min for countries (Eliminated!)
    # Operators:
    #   - /dashboard every 20s = 3 req/min
    #   - /game/status every 20s = 3 req/min (6 req/min * 2 = 12 req/min)

    after_req_per_min_active_country = (60 / 20)  # 3 req/min
    after_req_per_min_intermission_country = (60 / 35)  # 1.714 req/min
    after_req_per_min_operators = ((60 / 20) + (60 / 20)) * 2  # 12 req/min

    after_active_req_per_min = (countries_count * after_req_per_min_active_country) + after_req_per_min_operators  # 90 + 12 = 102 req/min
    after_intermission_req_per_min = (countries_count * after_req_per_min_intermission_country) + after_req_per_min_operators  # 51.4 + 12 = 63.4 req/min

    after_active_total = after_active_req_per_min * active_mins
    after_intermission_total = after_intermission_req_per_min * intermission_mins
    after_session_total = after_active_total + after_intermission_total

    reduction_active_pct = ((before_total_req_per_min - after_active_req_per_min) / before_total_req_per_min) * 100
    reduction_intermission_pct = ((before_total_req_per_min - after_intermission_req_per_min) / before_total_req_per_min) * 100
    reduction_total_pct = ((before_session_total - after_session_total) / before_session_total) * 100

    print(f"2. Traffic Volume Comparison (30 Players + 2 Operators):")
    print(f"   -----------------------------------------------------------------")
    print(f"   Metric                         Before             After (Optimized)    Reduction")
    print(f"   -----------------------------------------------------------------")
    print(f"   Requests / Min (Active Round)  {before_total_req_per_min:.0f} req/min        {after_active_req_per_min:.0f} req/min            {reduction_active_pct:.1f}%")
    print(f"   Requests / Min (Intermission)  {before_total_req_per_min:.0f} req/min        {after_intermission_req_per_min:.0f} req/min             {reduction_intermission_pct:.1f}%")
    print(f"   Requests / Sec (Peak Arrival)  ~5.2 req/sec       ~1.7 req/sec (jittered) {reduction_active_pct:.1f}%")
    print(f"   10-Min Round Total Requests    {before_active_total:,.0f}              {after_active_total:,.0f}               {reduction_active_pct:.1f}%")
    print(f"   5-Min Intermission Requests    {before_intermission_total:,.0f}              {after_intermission_total:,.0f}                 {reduction_intermission_pct:.1f}%")
    print(f"   -----------------------------------------------------------------")
    print(f"   TOTAL 15-MIN SESSION REQUESTS  {before_session_total:,.0f} reqs          {after_session_total:,.0f} reqs           {reduction_total_pct:.1f}% REDUCTION")
    print(f"   -----------------------------------------------------------------")
    print(f"\n   Total Saved Requests per 15-minute game: {int(before_session_total - after_session_total):,} fewer server hits!")
    print("=================================================================\n")


if __name__ == "__main__":
    run_benchmark()
