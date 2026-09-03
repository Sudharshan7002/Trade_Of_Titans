"""Reset Trade of Titans to a clean local-development baseline."""

from app.core.security import hash_password
from app.database import SessionLocal, engine
from app.models.base import Base
from app.models.country import Country
from app.models.crisis import Crisis
from app.models.final_ranking import FinalRanking
from app.models.game import Game
from app.models.import_objective import ImportObjective
from app.models.inventory import Inventory
from app.models.resource import Resource
from app.models.round import Round
from app.models.trade import Trade
from app.models.user import User


import os

def get_default_users():
    default_op_pass = os.getenv("OPERATOR_PASSWORD", "pordinno@123")
    return (
        ("admin", os.getenv("ADMIN_PASSWORD", default_op_pass), "admin"),
        ("trading_center", os.getenv("TRADING_CENTER_PASSWORD", default_op_pass), "trading_center"),
        ("ranking", os.getenv("RANKING_PASSWORD", default_op_pass), "ranking"),
    )


DEFAULT_USERS = get_default_users()


def reset_local_data() -> dict[str, int]:
    """Delete gameplay data and retain only the default operator logins."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    usernames = [user[0] for user in DEFAULT_USERS]
    deleted: dict[str, int] = {}
    try:
        # Delete children before their referenced rows to work with PostgreSQL FK rules.
        for label, model in (
            ("final_rankings", FinalRanking),
            ("trades", Trade),
            ("crises", Crisis),
            ("import_objectives", ImportObjective),
            ("inventories", Inventory),
            ("rounds", Round),
            ("resources", Resource),
            ("countries", Country),
            ("games", Game),
        ):
            deleted[label] = db.query(model).delete(synchronize_session=False)

        deleted["users"] = db.query(User).filter(User.username.notin_(usernames)).delete(
            synchronize_session=False
        )

        for username, password, role in DEFAULT_USERS:
            user = db.query(User).filter(User.username == username).first()
            if user:
                user.password_hash = hash_password(password)
                user.role = role
                user.country_id = None
            else:
                db.add(User(
                    username=username,
                    password_hash=hash_password(password),
                    role=role,
                ))

        db.commit()
        return deleted
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    deleted = reset_local_data()
    print("Deleted: " + ", ".join(f"{name}={count}" for name, count in deleted.items()))
    print("Active accounts: admin, trading_center, ranking")
