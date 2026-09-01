"""Tournament Seeder for Trade of Titans.
Loads the official 15 countries, 10 resources, stockpiles, import objectives,
and 5 backup countries, plus admin, trading_center, and ranking accounts.
"""

import os
from dotenv import load_dotenv

load_dotenv()

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
        "password": "usa123",
        "money": 402000,
        "exports": [("Grain", 3800), ("Electronics", 1500), ("Timber", 2000)],
        "imports": [("Textiles", 1800), ("Spices", 700), ("Gold", 400)],
    },
    {
        "name": "Germany",
        "username": "germany",
        "password": "germany123",
        "money": 350000,
        "exports": [("Steel", 2200), ("Electronics", 1400), ("Medicine", 1600)],
        "imports": [("Grain", 1800), ("Timber", 1500), ("Spices", 700)],
    },
    {
        "name": "Canada",
        "username": "canada",
        "password": "canada123",
        "money": 320000,
        "exports": [("Grain", 2400), ("Oil", 2600), ("Gold", 1000)],
        "imports": [("Livestock", 1800), ("Textiles", 1600), ("Steel", 1500)],
    },
    {
        "name": "Australia",
        "username": "australia",
        "password": "australia123",
        "money": 362000,
        "exports": [("Grain", 2600), ("Livestock", 2800), ("Gold", 1200)],
        "imports": [("Textiles", 1400), ("Steel", 1400), ("Medicine", 1000)],
    },
    {
        "name": "India",
        "username": "india",
        "password": "india123",
        "money": 194000,
        "exports": [("Textiles", 3000), ("Medicine", 1700), ("Spices", 1800)],
        "imports": [("Oil", 1800), ("Electronics", 1400), ("Gold", 500)],
    },
    {
        "name": "China",
        "username": "china",
        "password": "china123",
        "money": 206000,
        "exports": [("Textiles", 2600), ("Steel", 2800), ("Spices", 2000)],
        "imports": [("Grain", 1800), ("Livestock", 1600), ("Oil", 2200)],
    },
    {
        "name": "Brazil",
        "username": "brazil",
        "password": "brazil123",
        "money": 413000,
        "exports": [("Grain", 3200), ("Livestock", 3000), ("Timber", 2500)],
        "imports": [("Steel", 1400), ("Electronics", 1200), ("Medicine", 900)],
    },
    {
        "name": "Russia",
        "username": "russia",
        "password": "russia123",
        "money": 194000,
        "exports": [("Timber", 2200), ("Oil", 3000), ("Gold", 1200)],
        "imports": [("Livestock", 1200), ("Textiles", 1500), ("Medicine", 800)],
    },
    {
        "name": "Indonesia",
        "username": "indonesia",
        "password": "indonesia123",
        "money": 264000,
        "exports": [("Textiles", 2400), ("Timber", 2600), ("Spices", 2000)],
        "imports": [("Livestock", 1500), ("Oil", 1600), ("Medicine", 1200)],
    },
    {
        "name": "Japan",
        "username": "japan",
        "password": "japan123",
        "money": 255000,
        "exports": [("Steel", 2200), ("Electronics", 2300), ("Gold", 900)],
        "imports": [("Grain", 1800), ("Timber", 1200), ("Spices", 1000)],
    },
    {
        "name": "France",
        "username": "france",
        "password": "france123",
        "money": 386000,
        "exports": [("Grain", 2400), ("Livestock", 2800), ("Medicine", 1800)],
        "imports": [("Oil", 1800), ("Electronics", 1200), ("Spices", 700)],
    },
    {
        "name": "South Korea",
        "username": "south_korea",
        "password": "korea123",
        "money": 204000,
        "exports": [("Steel", 2600), ("Electronics", 2300), ("Medicine", 1500)],
        "imports": [("Grain", 1500), ("Textiles", 1800), ("Livestock", 2200)],
    },
    {
        "name": "Italy",
        "username": "italy",
        "password": "italy123",
        "money": 277500,
        "exports": [("Livestock", 2500), ("Textiles", 3000), ("Electronics", 2500)],
        "imports": [("Timber", 1200), ("Oil", 1600), ("Gold", 700)],
    },
    {
        "name": "Mexico",
        "username": "mexico",
        "password": "mexico123",
        "money": 216000,
        "exports": [("Textiles", 2800), ("Oil", 2400), ("Spices", 1800)],
        "imports": [("Timber", 1400), ("Steel", 1500), ("Gold", 800)],
    },
    {
        "name": "Saudi Arabia",
        "username": "saudi_arabia",
        "password": "saudi123",
        "money": 316000,
        "exports": [("Oil", 3000), ("Livestock", 2400), ("Steel", 2200)],
        "imports": [("Grain", 2000), ("Timber", 1200), ("Electronics", 1500)],
    },
]

EXTRA_COUNTRIES_DATA = [
    {"name": "Standby Alpha", "username": "extra_alpha", "password": "extra123", "money": 300000},
    {"name": "Standby Beta", "username": "extra_beta", "password": "extra123", "money": 300000},
    {"name": "Standby Gamma", "username": "extra_gamma", "password": "extra123", "money": 300000},
    {"name": "Standby Delta", "username": "extra_delta", "password": "extra123", "money": 300000},
    {"name": "Standby Epsilon", "username": "extra_epsilon", "password": "extra123", "money": 300000},
]


def seed_tournament():
    print("Connecting to database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Cleaning previous tournament data...")
        db.query(FinalRanking).delete()
        db.query(Trade).delete()
        db.query(Crisis).delete()
        db.query(ImportObjective).delete()
        db.query(Inventory).delete()
        db.query(Round).delete()
        db.query(Country).delete()
        db.query(Resource).delete()
        db.query(Game).delete()
        db.query(User).delete()
        db.commit()

        # 1. Operators
        admin_pass = os.getenv("ADMIN_PASSWORD", "admin123")
        tc_pass = os.getenv("TRADING_CENTER_PASSWORD", "trading123")
        rank_pass = os.getenv("RANKING_PASSWORD", "ranking123")

        operators = [
            User(username="admin", password_hash=hash_password(admin_pass), role="admin"),
            User(username="trading_center", password_hash=hash_password(tc_pass), role="trading_center"),
            User(username="ranking", password_hash=hash_password(rank_pass), role="ranking"),
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
                password_hash=hash_password(c_data["password"]),
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

        # 4. 5 Standby / Extra Countries
        for extra in EXTRA_COUNTRIES_DATA:
            c = Country(
                name=extra["name"],
                username=extra["username"],
                password=extra["password"],
                money=extra["money"],
            )
            db.add(c)
            db.flush()

            u = User(
                username=extra["username"],
                password_hash=hash_password(extra["password"]),
                role="country",
                country_id=c.id,
            )
            db.add(u)

        db.commit()
        print(f"Seeded {len(EXTRA_COUNTRIES_DATA)} standby countries.")

        # 5. Initialize Game state
        game = Game(is_started=False, is_finished=False)
        db.add(game)
        db.commit()
        print("Game state initialized: Ready for Round 1.")

        print("\nTournament data setup SUCCESSFUL!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding tournament: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_tournament()
