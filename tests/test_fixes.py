import pytest
from fastapi.testclient import TestClient

from app.database import engine, SessionLocal
from app.main import app
from app.models.base import Base
from app.models.country import Country
from app.models.inventory import Inventory
from app.models.resource import Resource
from app.models.round import Round
from app.seed_tournament import seed_tournament


def token_for(client: TestClient, username: str, password: str) -> dict[str, str]:
    response = client.post("/auth/login", json={"username": username, "password": password})
    assert response.status_code == 200, f"Login failed for {username}: {response.text}"
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def test_operator_logins_with_pordinno():
    """Verify that admin, trading_center, and ranking all log in with pordinno@123."""
    Base.metadata.create_all(bind=engine)
    seed_tournament()

    with TestClient(app) as client:
        for username in ("admin", "trading_center", "ranking", "ADMIN", "Trading_Center", "Ranking"):
            res = client.post("/auth/login", json={"username": username, "password": "pordinno@123"})
            assert res.status_code == 200, f"Failed to login {username} with pordinno@123: {res.text}"
            data = res.json()
            assert "access_token" in data
            assert data["role"] in ("admin", "trading_center", "ranking")


def test_barter_trade_serialization_and_deduplication():
    """Verify barter trade shows full resource & payment names, and rapid deduplication works."""
    Base.metadata.create_all(bind=engine)
    seed_tournament()

    with TestClient(app) as client:
        admin_headers = token_for(client, "admin", "pordinno@123")
        tc_headers = token_for(client, "trading_center", "pordinno@123")

        # Start game and start round 1
        client.post("/game/start", headers=admin_headers)
        r1_res = client.post("/rounds/?round_number=1", headers=admin_headers)
        r1_id = r1_res.json()["id"]
        client.post(f"/rounds/{r1_id}/start", headers=admin_headers)

        # Standby Alpha (extra_alpha) is exempt from limit and has 10000 of all resources
        db = SessionLocal()
        alpha = db.query(Country).filter(Country.username == "extra_alpha").first()
        usa = db.query(Country).filter(Country.username == "usa").first()
        grain = db.query(Resource).filter(Resource.name == "Grain").first()
        timber = db.query(Resource).filter(Resource.name == "Timber").first()
        db.close()

        # USA has Timber in exports stockpiles, swaps Timber for Grain from Standby Alpha
        barter_payload = {
            "round_id": r1_id,
            "export_country_id": alpha.id,
            "import_country_id": usa.id,
            "resource_id": grain.id,
            "quantity": 300,
            "trade_type": "resource",
            "payment_resource_id": timber.id,
            "payment_quantity": 250,
            "override_limits": True,
        }

        # 1. Execute barter trade
        trade_res = client.post("/trading-center/execute-trade", headers=tc_headers, json=barter_payload)
        assert trade_res.status_code == 200, trade_res.text
        trade_id = trade_res.json()["trade_id"]

        # 2. Verify completed trades feed in dashboard includes payment_resource_id & payment_quantity
        tc_dashboard = client.get("/trading-center/dashboard", headers=tc_headers)
        assert tc_dashboard.status_code == 200
        completed = tc_dashboard.json()["recent_completed_trades"]
        assert len(completed) >= 1
        latest_trade = next(t for t in completed if t["id"] == trade_id)

        assert latest_trade["trade_type"] == "resource"
        assert latest_trade["resource_id"] == grain.id
        assert latest_trade["resource_name"] == "Grain"
        assert latest_trade["payment_resource_id"] == timber.id
        assert latest_trade["payment_resource_name"] == "Timber"
        assert latest_trade["payment_quantity"] == 250
        assert latest_trade["quantity"] == 300

        # 3. Test Deduplication: submitting identical trade within 15 seconds returns same trade without duplicating
        dup_res = client.post("/trading-center/execute-trade", headers=tc_headers, json=barter_payload)
        assert dup_res.status_code == 200
        assert dup_res.json()["trade_id"] == trade_id
        assert "deduplicated" in dup_res.json()["message"]


def test_idempotent_trade_confirmation():
    """Verify that confirming an already completed trade returns success gracefully."""
    Base.metadata.create_all(bind=engine)
    seed_tournament()

    with TestClient(app) as client:
        admin_headers = token_for(client, "admin", "pordinno@123")
        tc_headers = token_for(client, "trading_center", "pordinno@123")
        usa_headers = token_for(client, "usa", "Titan#US9482")

        client.post("/game/start", headers=admin_headers)
        r1_res = client.post("/rounds/?round_number=1", headers=admin_headers)
        r1_id = r1_res.json()["id"]
        client.post(f"/rounds/{r1_id}/start", headers=admin_headers)

        db = SessionLocal()
        usa = db.query(Country).filter(Country.username == "usa").first()
        germany = db.query(Country).filter(Country.username == "germany").first()
        grain = db.query(Resource).filter(Resource.name == "Grain").first()
        db.close()

        # USA creates pending trade
        create_res = client.post(
            "/trades/",
            headers=usa_headers,
            json={
                "round_id": r1_id,
                "import_country_id": germany.id,
                "export_country_id": usa.id,
                "resource_id": grain.id,
                "quantity": 100,
                "price": 60,
                "trade_type": "money",
            },
        )
        assert create_res.status_code == 200
        t_id = create_res.json()["id"]

        # Confirm 1st time
        c1 = client.post(f"/trade-confirmation/{t_id}", headers=tc_headers)
        assert c1.status_code == 200

        # Confirm 2nd time (idempotent retry)
        c2 = client.post(f"/trade-confirmation/{t_id}", headers=tc_headers)
        assert c2.status_code == 200
        assert c2.json()["status"] == "completed"
