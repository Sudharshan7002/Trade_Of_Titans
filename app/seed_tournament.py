"""Tournament Seeder for Trade of Titans.
Loads the official 15 countries, 10 resources, stockpiles, import objectives,
and 5 backup countries, plus admin, trading_center, and ranking accounts.
"""

import os
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models.base import Base
from app.models.country import Country
from app.models.resource import Resource
from app.models.inventory import Inventory
from app.models.import_objective import ImportObjective
from app.models.user import User
from app.models.game import Game
from app.models.round import Round
from app.models.trade import Trade
from app.models.crisis import Crisis
from app.models.final_ranking import FinalRanking
from app.core.security import hash_password

RESOURCES_DATA = [
    {"name": "Grain", "base_value": 60},
    {"name": "Livestock", "base_value": 65},
    {"name": "Textiles", "base_value": 70},
    {"name": "Timber", "base_value": 80},
    {"name": "Steel", "base_value": 90},
    {"name": "Oil", "base_value": 110},
    {"name": "Electronics", "base_value": 140},
    {"name": "Medicine", "base_value": 160},
    {"name": "Spices", "base_value": 180},
    {"name": "Gold", "base_value": 250},
]

COUNTRIES_DATA = [
    {
        "name": "USA",
        "username": "usa",
        "password": "Titan#US9482",
        "money": 402000,
        "exports": [("Grain", 3800), ("Electronics", 1500), ("Timber", 2000)],
        "imports": [("Textiles", 1800), ("Spices", 700), ("Gold", 400)],
    },
    {
        "name": "Germany",
        "username": "germany",
        "password": "Titan#DE6317",
        "money": 350000,
        "exports": [("Steel", 2200), ("Electronics", 1400), ("Medicine", 1600)],
        "imports": [("Grain", 1800), ("Timber", 1500), ("Spices", 700)],
    },
    {
        "name": "Canada",
        "username": "canada",
        "password": "Titan#CA8524",
        "money": 320000,
        "exports": [("Grain", 2400), ("Oil", 2600), ("Gold", 1000)],
        "imports": [("Livestock", 1800), ("Textiles", 1600), ("Steel", 1500)],
    },
    {
        "name": "Australia",
        "username": "australia",
        "password": "Titan#AU7193",
        "money": 362000,
        "exports": [("Grain", 2600), ("Livestock", 2800), ("Gold", 1200)],
        "imports": [("Textiles", 1400), ("Steel", 1400), ("Medicine", 1000)],
    },
    {
        "name": "India",
        "username": "india",
        "password": "Titan#IN4826",
        "money": 194000,
        "exports": [("Textiles", 3000), ("Medicine", 1700), ("Spices", 1800)],
        "imports": [("Oil", 1800), ("Electronics", 1400), ("Gold", 500)],
    },
    {
        "name": "China",
        "username": "china",
        "password": "Titan#CN9531",
        "money": 206000,
        "exports": [("Textiles", 2600), ("Steel", 2800), ("Spices", 2000)],
        "imports": [("Grain", 1800), ("Livestock", 1600), ("Oil", 2200)],
    },
    {
        "name": "Brazil",
        "username": "brazil",
        "password": "Titan#BR3749",
        "money": 413000,
        "exports": [("Grain", 3200), ("Livestock", 3000), ("Timber", 2500)],
        "imports": [("Steel", 1400), ("Electronics", 1200), ("Medicine", 900)],
    },
    {
        "name": "Russia",
        "username": "russia",
        "password": "Titan#RU8260",
        "money": 194000,
        "exports": [("Timber", 2200), ("Oil", 3000), ("Gold", 1200)],
        "imports": [("Livestock", 1200), ("Textiles", 1500), ("Medicine", 800)],
    },
    {
        "name": "Indonesia",
        "username": "indonesia",
        "password": "Titan#ID5148",
        "money": 264000,
        "exports": [("Textiles", 2400), ("Timber", 2600), ("Spices", 2000)],
        "imports": [("Livestock", 1500), ("Oil", 1600), ("Medicine", 1200)],
    },
    {
        "name": "Japan",
        "username": "japan",
        "password": "Titan#JP7392",
        "money": 255000,
        "exports": [("Steel", 2200), ("Electronics", 2300), ("Gold", 900)],
        "imports": [("Grain", 1800), ("Timber", 1200), ("Spices", 1000)],
    },
    {
        "name": "France",
        "username": "france",
        "password": "Titan#FR6285",
        "money": 386000,
        "exports": [("Grain", 2400), ("Livestock", 2800), ("Medicine", 1800)],
        "imports": [("Oil", 1800), ("Electronics", 1200), ("Spices", 700)],
    },
    {
        "name": "South Korea",
        "username": "south_korea",
        "password": "Titan#KR4916",
        "money": 204000,
        "exports": [("Steel", 2600), ("Electronics", 2300), ("Medicine", 1500)],
        "imports": [("Grain", 1500), ("Textiles", 1800), ("Livestock", 2200)],
    },
    {
        "name": "Italy",
        "username": "italy",
        "password": "Titan#IT8374",
        "money": 277500,
        "exports": [("Livestock", 2500), ("Textiles", 3000), ("Electronics", 2500)],
        "imports": [("Timber", 1200), ("Oil", 1600), ("Gold", 700)],
    },
    {
        "name": "Mexico",
        "username": "mexico",
        "password": "Titan#MX5629",
        "money": 216000,
        "exports": [("Textiles", 2800), ("Oil", 2400), ("Spices", 1800)],
        "imports": [("Timber", 1400), ("Steel", 1500), ("Gold", 800)],
    },
    {
        "name": "Saudi Arabia",
        "username": "saudi_arabia",
        "password": "Titan#SA3187",
        "money": 316000,
        "exports": [("Oil", 3000), ("Livestock", 2400), ("Steel", 2200)],
        "imports": [("Grain", 2000), ("Timber", 1200), ("Electronics", 1500)],
    },
]

STANDBY_ALPHA_DATA = {
    "name": "Standby Alpha",
    "username": "extra_alpha",
    "password": "Standby#Alpha91",
    "money": 0,
}


PRECOMPUTED_HASHES = {
    "usa": "$2b$12$Fj7t06S8WQdWRC46A9tVXONgxUPoP/u.ZBI7McPuK1z6FinB7ToM.",
    "germany": "$2b$12$vXCAqfbuHESvAabQW7Xcsug.HizqJRzF0KW26CJLxunH6AphZEfgi",
    "canada": "$2b$12$d6.QNCnOlo6Hqr26mqst6edn8Z6aXWSLF2n7SxzaPcFu6q7r7q3ze",
    "australia": "$2b$12$Och5/Ge.DAOiVugjb8kGguUlC8Vd93GRwJJIXdJiMiiYIivYySlMi",
    "india": "$2b$12$f3jOC/4UzDnJX/nwYlBf3.sOTPj9wcXGFRykn3AGlhgV3TA96YFs2",
    "china": "$2b$12$N/7l7XZCGRVOOsTMjcvie.DLl8ICkFcveuQmyw.1O7gRtWTXq8v6O",
    "brazil": "$2b$12$j59ZHJ.qftr.eZxKVBaheuSp/7BoMRd7cjPzKN2B1N.kynxlCVP9G",
    "russia": "$2b$12$Tso.zCgoJLROuo5s/dzwXegmj6jcJtPNgNI6fTntiY0jJ6P3FIgL2",
    "indonesia": "$2b$12$QBIL45cHgtHv1YAHKywGDO4ieMWBTzHKbJ6AY1vPqVVcQ8y9WwryO",
    "japan": "$2b$12$Dj0006OmWQcFKWzNBb5iTOZM53yo6n9B/jTM5S1FLawAZXVbYU8ye",
    "france": "$2b$12$30d6ZPItMmU7Bw6tP9X77udHuNq.FEdaUXIvwpMbgmEHexMgpUOny",
    "south_korea": "$2b$12$TVjSK4qpDPfhyPhUurhZVuoDYlJCFNDAxRN3X7DfD37WOs/fRpQRu",
    "italy": "$2b$12$kPQ1QNcbwsIjVSWzBdcfr.qr1JQCSxT9rWOgHRTPmj1PUez6byXQO",
    "mexico": "$2b$12$DeId3TQzC.uCfprSXCr0d.6dXTWyKmttaA0SOupkpcCCOjC0Qo0te",
    "saudi_arabia": "$2b$12$CjQ9nSpGozhRG238wF6h0.r9zapOK1PMiWgIxEsVCFp2wJKb6K/0q",
    "extra_alpha": "$2b$12$6rq3158rWot5MJl.DQYlCeUYv4PfuF4yF61lWHy/gDTmutO.3d4fO",
    "admin_admin123": "$2b$12$mphn4lHFJnSMYwG4jp0STucWkoW6uw7spMhort5ZCAQeuVUU6NpO6",
    "trading_trading123": "$2b$12$BAMQK2nQksLfV5CX/JArmO3otO8zyx1/Gs8yJqfv.k8RMmfBzbqVK",
    "ranking_ranking123": "$2b$12$oOZnsbWxXEqeKXBVj8kotumcnjMyXCUHlqo6wNZnbjyFFazbcE1TK",
    "admin_pordinno": "$2b$12$547pmw86ljA4OtFH0Gx.fuRE5PFIrpDwcGFR5zEsby0Un/.m8KRvq",
}


def get_user_hash(username: str, plain_password: str) -> str:
    if username in PRECOMPUTED_HASHES:
        return PRECOMPUTED_HASHES[username]
    if plain_password == "admin123":
        return PRECOMPUTED_HASHES["admin_admin123"]
    if plain_password == "pordinno@123":
        return PRECOMPUTED_HASHES["admin_pordinno"]
    if plain_password == "trading123":
        return PRECOMPUTED_HASHES["trading_trading123"]
    if plain_password == "ranking123":
        return PRECOMPUTED_HASHES["ranking_ranking123"]
    return hash_password(plain_password)


def seed_tournament(db: Session | None = None):
    print("Connecting to database...")
    Base.metadata.create_all(bind=engine)
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        print("Cleaning previous tournament data...")
        from sqlalchemy import text
        # Delete children before parents to satisfy PostgreSQL FK constraints without deadlocks
        db.execute(text("DELETE FROM final_rankings;"))
        db.execute(text("DELETE FROM trades;"))
        db.execute(text("DELETE FROM crises;"))
        db.execute(text("DELETE FROM import_objectives;"))
        db.execute(text("DELETE FROM inventories;"))
        db.execute(text("DELETE FROM users;"))
        db.execute(text("DELETE FROM rounds;"))
        db.execute(text("DELETE FROM countries;"))
        db.execute(text("DELETE FROM resources;"))
        db.execute(text("DELETE FROM games;"))
        db.commit()

        # 1. Operators
        admin_pass = os.getenv("ADMIN_PASSWORD", "admin123")
        tc_pass = os.getenv("TRADING_CENTER_PASSWORD", "trading123")
        rank_pass = os.getenv("RANKING_PASSWORD", "ranking123")

        operators = [
            User(username="admin", password_hash=get_user_hash("admin", admin_pass), role="admin"),
            User(username="trading_center", password_hash=get_user_hash("trading_center", tc_pass), role="trading_center"),
            User(username="ranking", password_hash=get_user_hash("ranking", rank_pass), role="ranking"),
        ]
        db.add_all(operators)
        db.commit()
        print("Default operators seeded (admin, trading_center, ranking).")

        # 2. Resources
        resource_map = {}
        for r_data in RESOURCES_DATA:
            res = Resource(name=r_data["name"], base_value=r_data["base_value"])
            db.add(res)
            db.flush()
            resource_map[res.name] = res.id
        db.commit()
        print(f"Seeded {len(resource_map)} market resources.")

        # 3. 15 Main Countries
        for c_data in COUNTRIES_DATA:
            c = Country(
                name=c_data["name"],
                username=c_data["username"],
                password=c_data["password"],
                money=c_data["money"],
            )
            db.add(c)
            db.flush()

            u = User(
                username=c_data["username"],
                password_hash=get_user_hash(c_data["username"], c_data["password"]),
                role="country",
                country_id=c.id,
            )
            db.add(u)

            # Stockpiles
            for res_name, qty in c_data["exports"]:
                res_id = resource_map.get(res_name)
                if res_id:
                    db.add(Inventory(country_id=c.id, resource_id=res_id, quantity=qty))

            # Objectives
            for res_name, req_qty in c_data["imports"]:
                res_id = resource_map.get(res_name)
                if res_id:
                    db.add(
                        ImportObjective(
                            country_id=c.id,
                            resource_id=res_id,
                            required_quantity=req_qty,
                            imported_quantity=0,
                        )
                    )

        db.commit()
        print(f"Seeded {len(COUNTRIES_DATA)} official countries with stockpiles and quotas.")

        # 4. Standby Alpha (Black Market - $0 balance, 10,000 units of all resources)
        c = Country(
            name=STANDBY_ALPHA_DATA["name"],
            username=STANDBY_ALPHA_DATA["username"],
            password=STANDBY_ALPHA_DATA["password"],
            money=STANDBY_ALPHA_DATA["money"],
        )
        db.add(c)
        db.flush()

        u = User(
            username=STANDBY_ALPHA_DATA["username"],
            password_hash=get_user_hash(STANDBY_ALPHA_DATA["username"], STANDBY_ALPHA_DATA["password"]),
            role="country",
            country_id=c.id,
        )
        db.add(u)

        # Allocate 10,000 units of every market resource
        for res_name, res_id in resource_map.items():
            db.add(Inventory(country_id=c.id, resource_id=res_id, quantity=10000))

        db.commit()
        print("Seeded Standby Alpha (Black Market) with $0 balance and 10,000 units of all 10 resources.")

        # 5. Initialize Game state
        game = Game(is_started=False, is_finished=False)
        db.add(game)
        db.commit()
        print("Game state initialized: Ready for Round 1.")

        try:
            from app.routers.resources import clear_resources_cache
            from app.routers.countries import clear_countries_cache
            clear_resources_cache()
            clear_countries_cache()
        except Exception:
            pass

        print("\nTournament data setup SUCCESSFUL!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding tournament: {e}")
        raise
    finally:
        if should_close:
            db.close()


if __name__ == "__main__":
    seed_tournament()
