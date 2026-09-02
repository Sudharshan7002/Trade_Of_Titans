from fastapi.testclient import TestClient
from app.database import engine
from app.main import app
from app.models.base import Base
from app.seed_tournament import seed_tournament
from app.core.spotlight_config import get_round_spotlight, SPOTLIGHT_SCHEDULE


def test_spotlight_schedule_coverage():
    # Verify exactly 15 rounds are covered
    assert len(SPOTLIGHT_SCHEDULE) == 15
    # Verify Standby Alpha / Black Market is not in spotlight
    for r_num, data in SPOTLIGHT_SCHEDULE.items():
        assert data["country_username"] != "extra_alpha"
        assert "Standby Alpha" not in data["country_name"]


def test_spotlight_telemetry_and_double_export():
    Base.metadata.create_all(bind=engine)
    seed_tournament()

    with TestClient(app) as client:
        admin_login = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
        assert admin_login.status_code == 200
        admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

        # Start game
        assert client.post("/game/start", headers=admin_headers).status_code == 200

        # Create Round 1 and Round 2
        r1 = client.post("/rounds/?round_number=1", headers=admin_headers).json()
        r2 = client.post("/rounds/?round_number=2", headers=admin_headers).json()

        # Start Round 1
        assert client.post(f"/rounds/{r1['id']}/start", headers=admin_headers).status_code == 200

        # Login as USA (Spotlight country for Round 1)
        usa_login = client.post("/auth/login", json={"username": "usa", "password": "Titan#US9482"})
        assert usa_login.status_code == 200
        usa_headers = {"Authorization": f"Bearer {usa_login.json()['access_token']}"}

        # Check USA country dashboard
        usa_dash = client.get("/country/dashboard", headers=usa_headers).json()
        assert usa_dash["spotlight"] is not None
        assert usa_dash["spotlight"]["country_name"] == "USA"
        assert usa_dash["spotlight"]["title"] == "Petrodollar Hegemony"
        assert usa_dash["spotlight"]["is_host"] is True

        # Login as Germany (Not the host in Round 1)
        germany_login = client.post("/auth/login", json={"username": "germany", "password": "Titan#DE6317"})
        germany_headers = {"Authorization": f"Bearer {germany_login.json()['access_token']}"}
        germany_dash = client.get("/country/dashboard", headers=germany_headers).json()
        assert germany_dash["spotlight"]["is_host"] is False
        assert germany_dash["spotlight"]["country_name"] == "USA"

        tc_login = client.post("/auth/login", json={"username": "trading_center", "password": "trading123"})
        tc_headers = {"Authorization": f"Bearer {tc_login.json()['access_token']}"}

        countries = {c["name"]: c["id"] for c in client.get("/countries/", headers=admin_headers).json()}
        resources = {r["name"]: r["id"] for r in client.get("/resources/", headers=admin_headers).json()}

        usa_id = countries["USA"]
        germany_id = countries["Germany"]
        grain_id = resources["Grain"]

        # USA exports 100 Grain to Germany at $20/unit ($2,000 total deal)
        trade_r1 = client.post(
            "/trading-center/execute-trade",
            headers=tc_headers,
            json={
                "round_id": r1["id"],
                "export_country_id": usa_id,
                "import_country_id": germany_id,
                "resource_id": grain_id,
                "quantity": 100,
                "price": 20.0,
                "trade_type": "money"
            }
        )
        assert trade_r1.status_code == 200, trade_r1.text

        # Germany pays exactly $2,000 (from $350,000 down to $348,000)
        germany_after = client.get("/country/dashboard", headers=germany_headers).json()
        assert germany_after["country"]["money"] == 348000.0

        # USA receives: $2,000 + 15% subsidy ($300) + $20,000 bounty = $402,000 + $22,300 = $424,300!
        usa_after = client.get("/country/dashboard", headers=usa_headers).json()
        assert usa_after["country"]["money"] == 424300.0
        assert usa_after["spotlight"]["bounty_claimed"] is True

        # End Round 1
        assert client.post(f"/rounds/{r1['id']}/end", headers=admin_headers).status_code == 200

        # Now start Round 2 (Germany is Spotlight with max_exports = 2!)
        assert client.post(f"/rounds/{r2['id']}/start", headers=admin_headers).status_code == 200

        tc_login = client.post("/auth/login", json={"username": "trading_center", "password": "trading123"})
        tc_headers = {"Authorization": f"Bearer {tc_login.json()['access_token']}"}

        # Fetch IDs
        countries = {c["name"]: c["id"] for c in client.get("/countries/", headers=admin_headers).json()}
        resources = {r["name"]: r["id"] for r in client.get("/resources/", headers=admin_headers).json()}

        germany_id = countries["Germany"]
        france_id = countries["France"]
        italy_id = countries["Italy"]
        steel_id = resources["Steel"]
        elec_id = resources["Electronics"]

        # Germany Export 1: Germany exports Steel to France in Round 2 -> must SUCCEED
        trade_1 = client.post(
            "/trading-center/execute-trade",
            headers=tc_headers,
            json={
                "round_id": r2["id"],
                "export_country_id": germany_id,
                "import_country_id": france_id,
                "resource_id": steel_id,
                "quantity": 100,
                "price": 90.0,
                "trade_type": "money"
            }
        )
        assert trade_1.status_code == 200, trade_1.text

        # Germany Export 2 (Spotlight Perk active!): Germany exports Electronics to Italy in Round 2 -> must SUCCEED!
        trade_2 = client.post(
            "/trading-center/execute-trade",
            headers=tc_headers,
            json={
                "round_id": r2["id"],
                "export_country_id": germany_id,
                "import_country_id": italy_id,
                "resource_id": elec_id,
                "quantity": 50,
                "price": 140.0,
                "trade_type": "money"
            }
        )
        assert trade_2.status_code == 200, trade_2.text

        # Germany Export 3: Attempting a 3rd export -> MUST FAIL (exceeded max_exports = 2)
        trade_3 = client.post(
            "/trading-center/execute-trade",
            headers=tc_headers,
            json={
                "round_id": r2["id"],
                "export_country_id": germany_id,
                "import_country_id": countries["Canada"],
                "resource_id": elec_id,
                "quantity": 50,
                "price": 140.0,
                "trade_type": "money"
            }
        )
        assert trade_3.status_code == 400
        assert "used all allowed exports" in trade_3.json()["detail"]
