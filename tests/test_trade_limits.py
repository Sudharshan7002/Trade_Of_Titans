from fastapi.testclient import TestClient
from app.database import engine
from app.main import app
from app.models.base import Base
from app.seed_tournament import seed_tournament


def test_round_trade_limits_and_black_market():
    Base.metadata.create_all(bind=engine)
    seed_tournament()

    with TestClient(app) as client:
        # Login as trading center
        login_res = client.post("/auth/login", json={"username": "trading_center", "password": "trading123"})
        assert login_res.status_code == 200, login_res.text
        tc_token = login_res.json()["access_token"]
        tc_headers = {"Authorization": f"Bearer {tc_token}"}

        # Start Round 1 as admin
        admin_login = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
        assert admin_login.status_code == 200
        admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

        # Start Game
        assert client.post("/game/start", headers=admin_headers).status_code == 200

        # Create and start round 1
        created_round = client.post("/rounds/?round_number=1", headers=admin_headers)
        assert created_round.status_code == 200, created_round.text
        r1_id = created_round.json()["id"]

        start_round_res = client.post(f"/rounds/{r1_id}/start", headers=admin_headers)
        assert start_round_res.status_code == 200, start_round_res.text

        # Fetch dashboard to get active round and country IDs
        dashboard_res = client.get("/trading-center/dashboard", headers=tc_headers)
        assert dashboard_res.status_code == 200
        dash_data = dashboard_res.json()
        round_id = dash_data["active_round"]["id"]

        # Fetch countries list
        countries_res = client.get("/countries/", headers=admin_headers)
        assert countries_res.status_code == 200
        countries = {c["name"]: c["id"] for c in countries_res.json()}

        usa_id = countries["USA"]
        germany_id = countries["Germany"]
        france_id = countries["France"]
        alpha_id = countries["Standby Alpha"]

        # Fetch resources
        resources_res = client.get("/resources/", headers=admin_headers)
        assert resources_res.status_code == 200
        resources = {r["name"]: r["id"] for r in resources_res.json()}
        grain_id = resources["Grain"]
        timber_id = resources["Timber"]

        # 1. First trade: USA exports Grain to Germany -> must succeed
        trade_1 = client.post(
            "/trading-center/execute-trade",
            headers=tc_headers,
            json={
                "round_id": round_id,
                "export_country_id": usa_id,
                "import_country_id": germany_id,
                "resource_id": grain_id,
                "quantity": 100,
                "price": 20.0,
                "trade_type": "money"
            }
        )
        assert trade_1.status_code == 200, trade_1.text

        # 2. Second trade: USA attempts to export Timber to France -> MUST FAIL (USA already exported)
        trade_2 = client.post(
            "/trading-center/execute-trade",
            headers=tc_headers,
            json={
                "round_id": round_id,
                "export_country_id": usa_id,
                "import_country_id": france_id,
                "resource_id": timber_id,
                "quantity": 50,
                "price": 65.0,
                "trade_type": "money"
            }
        )
        assert trade_2.status_code == 400
        assert "already exported" in trade_2.json()["detail"]

        # 3. Third trade: France attempts to export Timber to Germany -> MUST FAIL (Germany already imported)
        trade_3 = client.post(
            "/trading-center/execute-trade",
            headers=tc_headers,
            json={
                "round_id": round_id,
                "export_country_id": france_id,
                "import_country_id": germany_id,
                "resource_id": timber_id,
                "quantity": 50,
                "price": 65.0,
                "trade_type": "money"
            }
        )
        assert trade_3.status_code == 400
        assert "already imported" in trade_3.json()["detail"]

        # 4. Black Market (Standby Alpha) Exemption: Alpha can export to France
        trade_4 = client.post(
            "/trading-center/execute-trade",
            headers=tc_headers,
            json={
                "round_id": round_id,
                "export_country_id": alpha_id,
                "import_country_id": france_id,
                "resource_id": grain_id,
                "quantity": 100,
                "price": 20.0,
                "trade_type": "money"
            }
        )
        assert trade_4.status_code == 200, trade_4.text

        # 5. Black Market can export again in the same round without limit
        trade_5 = client.post(
            "/trading-center/execute-trade",
            headers=tc_headers,
            json={
                "round_id": round_id,
                "export_country_id": alpha_id,
                "import_country_id": usa_id,  # USA hasn't imported yet, so USA is eligible to import!
                "resource_id": timber_id,
                "quantity": 50,
                "price": 65.0,
                "trade_type": "money"
            }
        )
        assert trade_5.status_code == 200, trade_5.text

        # 6. Referee Override: USA attempts second export with override_limits=True -> MUST SUCCEED
        trade_override = client.post(
            "/trading-center/execute-trade",
            headers=tc_headers,
            json={
                "round_id": round_id,
                "export_country_id": usa_id,
                "import_country_id": countries["Brazil"],
                "resource_id": timber_id,
                "quantity": 25,
                "price": 65.0,
                "trade_type": "money",
                "override_limits": True
            }
        )
        assert trade_override.status_code == 200, trade_override.text
