"""Clear game setup data while retaining administrator and trading-center logins."""

from app.database import SessionLocal
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


def reset_game_data() -> dict[str, int]:
    db = SessionLocal()
    try:
        counts = {
            "country_users": db.query(User).filter(User.role == "country").delete(synchronize_session=False),
            "final_rankings": db.query(FinalRanking).delete(synchronize_session=False),
            "crises": db.query(Crisis).delete(synchronize_session=False),
            "trades": db.query(Trade).delete(synchronize_session=False),
            "import_objectives": db.query(ImportObjective).delete(synchronize_session=False),
            "inventories": db.query(Inventory).delete(synchronize_session=False),
            "rounds": db.query(Round).delete(synchronize_session=False),
            "resources": db.query(Resource).delete(synchronize_session=False),
            "countries": db.query(Country).delete(synchronize_session=False),
        }
        for game in db.query(Game).all():
            game.is_started = False
            game.is_finished = False
        db.commit()
        return counts
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print(reset_game_data())
