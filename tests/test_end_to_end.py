from fastapi.testclient import TestClient

from app.core.security import hash_password
from app.database import SessionLocal, engine
from app.main import app
from app.models.base import Base
from app.models.user import User


def token_for(client: TestClient, username: str, password: str) -> dict[str, str]:
    response = client.post("/auth/login", json={"username": username, "password": password})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def test_admin_country_trade_confirmation_flow():
    Base.metadata.create_all(bind=engine)

    with TestClient(app) as client:
        admin_headers = token_for(client, "admin", "admin123")
        assert client.post("/game/start", headers=admin_headers).status_code == 200

        assert client.post("/game/end", headers=admin_headers).status_code == 200
        reset = client.post("/game/reset", headers=admin_headers)
        assert reset.status_code == 200
        assert reset.json() == {"id": 1, "is_started": False, "is_finished": False}
        assert client.post("/game/start", headers=admin_headers).status_code == 200

        country_one = client.post(
            "/countries/",
            headers=admin_headers,
            json={"name": "Aurora", "username": "aurora", "password": "aurora-password", "money": 1000},
        )
        country_two = client.post(
            "/countries/",
            headers=admin_headers,
            json={"name": "Borealis", "username": "borealis", "password": "borealis-password", "money": 1000},
        )
        assert country_one.status_code == country_two.status_code == 200
        aurora_id, borealis_id = country_one.json()["id"], country_two.json()["id"]

        resource = client.post("/resources/", headers=admin_headers, json={"name": "Titanium", "base_value": 25})
        assert resource.status_code == 200, resource.text
        resource_id = resource.json()["id"]
        assert client.post("/inventory/", headers=admin_headers, json={"country_id": borealis_id, "resource_id": resource_id, "quantity": 10}).status_code == 200

        created_round = client.post("/rounds/?round_number=1", headers=admin_headers)
        assert created_round.status_code == 200, created_round.text
        assert client.post(f"/rounds/{created_round.json()['id']}/start", headers=admin_headers).status_code == 200

        aurora_headers = token_for(client, "aurora", "aurora-password")
        trade = client.post(
            "/trades/",
            headers=aurora_headers,
            json={
                "round_id": created_round.json()["id"],
                "import_country_id": aurora_id,
                "export_country_id": borealis_id,
                "resource_id": resource_id,
                "quantity": 4,
                "price": 30,
                "trade_type": "money",
            },
        )
        assert trade.status_code == 200, trade.text
        assert trade.json()["status"] == "pending"

        db = SessionLocal()
        db.add(User(username="center", password_hash=hash_password("center-password"), role="trading_center"))
        db.commit()
        db.close()
        center_headers = token_for(client, "center", "center-password")
        confirmed = client.post(f"/trade-confirmation/{trade.json()['id']}", headers=center_headers)
        assert confirmed.status_code == 200, confirmed.text
        assert confirmed.json()["status"] == "completed"

        dashboard = client.get("/country/dashboard", headers=aurora_headers)
        assert dashboard.status_code == 200, dashboard.text
        assert dashboard.json()["country"]["money"] == 880.0
        assert dashboard.json()["inventory"] == [{"resource_id": resource_id, "quantity": 4}]
        assert dashboard.json()["trades"][0]["status"] == "completed"

        # Verify admin dashboard no longer contains rankings (request optimization)
        admin_dashboard = client.get("/admin-dashboard/", headers=admin_headers)
        assert admin_dashboard.status_code == 200
        assert "rankings" not in admin_dashboard.json()

        # Verify ranking user (auto-bootstrapped by lifespan) and verify rankings access
        ranking_headers = token_for(client, "ranking", "ranking123")
        rankings_res = client.get("/rankings/", headers=ranking_headers)
        assert rankings_res.status_code == 200
        assert "rankings" in rankings_res.json()

        # Non-ranking / non-admin user (e.g. country) should be forbidden
        forbidden_rankings = client.get("/rankings/", headers=aurora_headers)
        assert forbidden_rankings.status_code == 403

        # Test direct trade execution by trading center (money trade)
        # Borealis sells remaining 6 titanium to Aurora for price 20 each
        direct_money_trade = client.post(
            "/trading-center/execute-trade",
            headers=center_headers,
            json={
                "round_id": created_round.json()["id"],
                "import_country_id": aurora_id,
                "export_country_id": borealis_id,
                "resource_id": resource_id,
                "quantity": 2,
                "price": 20,
                "trade_type": "money"
            }
        )
        assert direct_money_trade.status_code == 200, direct_money_trade.text
        assert direct_money_trade.json()["status"] == "completed"

        # Verify balances after direct money trade
        # Aurora had 880, paid 2 * 20 = 40 => 840
        aurora_dash2 = client.get("/country/dashboard", headers=aurora_headers)
        assert aurora_dash2.json()["country"]["money"] == 840.0

