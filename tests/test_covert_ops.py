from decimal import Decimal
from fastapi.testclient import TestClient
from app.database import engine
from app.main import app
from app.models.base import Base
from app.seed_tournament import seed_tournament


def test_covert_ops_full_lifecycle():
    Base.metadata.create_all(bind=engine)
    seed_tournament()

    with TestClient(app) as client:
        # Admin login
        admin_login = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
        assert admin_login.status_code == 200
        admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

        # Start game and Round 1
        assert client.post("/game/start", headers=admin_headers).status_code == 200
        r1 = client.post("/rounds/?round_number=1", headers=admin_headers).json()
        assert client.post(f"/rounds/{r1['id']}/start", headers=admin_headers).status_code == 200

        # Country logins
        usa_login = client.post("/auth/login", json={"username": "usa", "password": "Titan#US9482"})
        germany_login = client.post("/auth/login", json={"username": "germany", "password": "Titan#DE6317"})
        france_login = client.post("/auth/login", json={"username": "france", "password": "Titan#FR6285"})
        alpha_login = client.post("/auth/login", json={"username": "extra_alpha", "password": "Standby#Alpha91"})

        usa_headers = {"Authorization": f"Bearer {usa_login.json()['access_token']}"}
        germany_headers = {"Authorization": f"Bearer {germany_login.json()['access_token']}"}
        france_headers = {"Authorization": f"Bearer {france_login.json()['access_token']}"}
        alpha_headers = {"Authorization": f"Bearer {alpha_login.json()['access_token']}"}

        # Fetch IDs
        countries = {c["name"]: c["id"] for c in client.get("/countries/", headers=admin_headers).json()}
        resources = {r["name"]: r["id"] for r in client.get("/resources/", headers=admin_headers).json()}

        usa_id = countries["USA"]
        germany_id = countries["Germany"]
        france_id = countries["France"]
        alpha_id = countries["Standby Alpha"]
        steel_id = resources["Steel"]
        grain_id = resources["Grain"]

        # -------------------------------------------------------------
        # 1. Standby Alpha (Black Market) Exemption Test
        # -------------------------------------------------------------
        # Black Market cannot buy shield
        res_alpha_shield = client.post("/country/covert-ops/shield", headers=alpha_headers)
        assert res_alpha_shield.status_code == 400
        assert "Black Market cannot" in res_alpha_shield.json()["detail"]

        # Black Market cannot be targeted for sabotage
        res_target_alpha = client.post(
            "/country/covert-ops/sabotage",
            headers=usa_headers,
            json={"target_country_id": alpha_id, "resource_id": steel_id}
        )
        assert res_target_alpha.status_code == 400
        assert "cannot be targeted" in res_target_alpha.json()["detail"]

        # -------------------------------------------------------------
        # 2. Self-Targeting and Validation Tests
        # -------------------------------------------------------------
        # Cannot sabotage self
        res_self = client.post(
            "/country/covert-ops/sabotage",
            headers=usa_headers,
            json={"target_country_id": usa_id, "resource_id": grain_id}
        )
        assert res_self.status_code == 400
        assert "cannot sabotage your own" in res_self.json()["detail"]

        # -------------------------------------------------------------
        # 3. Successful Unshielded Sabotage: USA strikes Germany's Steel
        # -------------------------------------------------------------
        germany_dash_before = client.get("/country/dashboard", headers=germany_headers).json()
        usa_dash_before = client.get("/country/dashboard", headers=usa_headers).json()

        germany_steel_before = next(i["quantity"] for i in germany_dash_before["inventory"] if i["resource_id"] == steel_id)
        usa_money_before = Decimal(str(usa_dash_before["country"]["money"]))

        # USA launches sabotage
        res_sabotage_1 = client.post(
            "/country/covert-ops/sabotage",
            headers=usa_headers,
            json={"target_country_id": germany_id, "resource_id": steel_id}
        )
        assert res_sabotage_1.status_code == 200, res_sabotage_1.text
        sab_result = res_sabotage_1.json()
        assert sab_result["was_blocked"] is False
        assert sab_result["quantity_destroyed"] > 0

        # Verify 25% Steel burned from Germany
        expected_burn = max(1, int(germany_steel_before * 0.25))
        assert sab_result["quantity_destroyed"] == expected_burn

        germany_dash_after = client.get("/country/dashboard", headers=germany_headers).json()
        germany_steel_after = next(i["quantity"] for i in germany_dash_after["inventory"] if i["resource_id"] == steel_id)
        assert germany_steel_after == germany_steel_before - expected_burn

        # Verify USA was charged $60,000
        usa_dash_after = client.get("/country/dashboard", headers=usa_headers).json()
        assert Decimal(str(usa_dash_after["country"]["money"])) == usa_money_before - Decimal("60000.0")

        # USA can no longer sabotage (1-use tournament limit)
        res_dup_sab = client.post(
            "/country/covert-ops/sabotage",
            headers=usa_headers,
            json={"target_country_id": france_id, "resource_id": grain_id}
        )
        assert res_dup_sab.status_code == 400
        assert "already utilized" in res_dup_sab.json()["detail"]

        # -------------------------------------------------------------
        # 4. Intel Shield Deployment & Trap Test
        # -------------------------------------------------------------
        # France deploys Intel Shield ($30,000)
        france_dash_before = client.get("/country/dashboard", headers=france_headers).json()
        france_money_before = Decimal(str(france_dash_before["country"]["money"]))

        res_shield = client.post("/country/covert-ops/shield", headers=france_headers)
        assert res_shield.status_code == 200, res_shield.text
        assert res_shield.json()["success"] is True

        france_dash_after = client.get("/country/dashboard", headers=france_headers).json()
        assert Decimal(str(france_dash_after["country"]["money"])) == france_money_before - Decimal("30000.0")
        assert france_dash_after["covert_ops"]["shield_active_this_round"] is True

        # France cannot buy shield twice
        res_dup_shield = client.post("/country/covert-ops/shield", headers=france_headers)
        assert res_dup_shield.status_code == 400
        assert "already utilized" in res_dup_shield.json()["detail"]

        # Now Germany attacks shielded France (The Trap!)
        france_grain_before = next(i["quantity"] for i in france_dash_after["inventory"] if i["resource_id"] == grain_id)
        germany_money_before = Decimal(str(germany_dash_after["country"]["money"]))

        res_trap_sab = client.post(
            "/country/covert-ops/sabotage",
            headers=germany_headers,
            json={"target_country_id": france_id, "resource_id": grain_id}
        )
        assert res_trap_sab.status_code == 200, res_trap_sab.text
        trap_result = res_trap_sab.json()
        assert trap_result["was_blocked"] is True
        assert trap_result["quantity_destroyed"] == 0

        # France Grain was NOT damaged
        france_dash_final = client.get("/country/dashboard", headers=france_headers).json()
        france_grain_after = next(i["quantity"] for i in france_dash_final["inventory"] if i["resource_id"] == grain_id)
        assert france_grain_after == france_grain_before

        # Germany was charged $60,000 anyway
        germany_dash_final = client.get("/country/dashboard", headers=germany_headers).json()
        assert Decimal(str(germany_dash_final["country"]["money"])) == germany_money_before - Decimal("60000.0")

        # -------------------------------------------------------------
        # 5. Verify Admin Host Microphone Dispatches
        # -------------------------------------------------------------
        admin_dash = client.get("/admin-dashboard/", headers=admin_headers).json()
        assert "latest_covert_dispatches" in admin_dash
        dispatches = admin_dash["latest_covert_dispatches"]
        assert len(dispatches) == 2

        # The blocked attack unmasked Germany on the mic!
        blocked_dispatch = next(d for d in dispatches if d["was_blocked"] is True)
        assert "GERMANY" in blocked_dispatch["announcement_script"].upper()
        assert "FRANCE" in blocked_dispatch["announcement_script"].upper()
        assert "UNMASKED" in blocked_dispatch["announcement_script"].upper()

        # The unshielded attack kept USA anonymous
        anon_dispatch = next(d for d in dispatches if d["was_blocked"] is False)
        assert "unidentified" in anon_dispatch["announcement_script"].lower()
        assert "USA" not in anon_dispatch["announcement_script"]
