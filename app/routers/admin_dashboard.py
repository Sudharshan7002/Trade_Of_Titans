from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.auth import require_role

from app.models.user import User
from app.models.game import Game
from app.models.round import Round
from app.models.country import Country
from app.models.trade import Trade
from app.models.crisis import Crisis


router = APIRouter(
    prefix="/admin-dashboard",
    tags=["Admin Dashboard"]
)


@router.get("/")
def get_admin_dashboard(
    current_user: User = Depends(
        require_role("admin")
    ),
    db: Session = Depends(get_db)
):

    # ---------------------------------------------------------
    # GAME
    # ---------------------------------------------------------

    game = db.query(Game).first()

    game_data = None

    if game:
        game_data = {
            "id": game.id,
            "is_started": game.is_started,
            "is_finished": game.is_finished
        }

    # ---------------------------------------------------------
    # ACTIVE ROUND
    # ---------------------------------------------------------

    active_round = db.query(Round).filter(
        Round.is_active == True
    ).first()

    round_data = None
    crisis_data = []

    if active_round:
        import time
        round_data = {
            "id": active_round.id,
            "round_number": active_round.round_number,
            "is_active": active_round.is_active,
            "duration_minutes": getattr(active_round, "duration_minutes", 10),
            "ends_at_timestamp": getattr(active_round, "ends_at_timestamp", None),
            "server_timestamp": time.time(),
        }

        crises = db.query(Crisis).filter(
            Crisis.round_id == active_round.id
        ).all()

        for crisis in crises:
            crisis_data.append({
                "id": crisis.id,
                "resource_id": crisis.resource_id,
                "value_modifier": crisis.value_modifier
            })

    # ---------------------------------------------------------
    # COUNTRIES
    # ---------------------------------------------------------

    countries = db.query(Country).all()

    country_data = []

    for country in countries:
        country_data.append({
            "id": country.id,
            "name": country.name,
            "money": country.money
        })

    # ---------------------------------------------------------
    # PENDING TRADES
    # ---------------------------------------------------------

    pending_trades = db.query(Trade).filter(
        Trade.status == "pending"
    ).order_by(
        Trade.id.desc()
    ).all()

    pending_trade_data = []

    for trade in pending_trades:
        pending_trade_data.append({
            "id": trade.id,
            "round_id": trade.round_id,
            "import_country_id": trade.import_country_id,
            "export_country_id": trade.export_country_id,
            "resource_id": trade.resource_id,
            "quantity": trade.quantity,
            "price": trade.price,
            "trade_type": trade.trade_type,
            "payment_resource_id": trade.payment_resource_id,
            "payment_quantity": trade.payment_quantity,
            "status": trade.status
        })

    # ---------------------------------------------------------
    # RESPONSE
    # ---------------------------------------------------------

    # ---------------------------------------------------------
    # RECENT COVERT OPS DISPATCHES (HOST MIC ANNOUNCEMENTS)
    # ---------------------------------------------------------

    from app.models.covert_ops import CovertAction
    recent_covert = db.query(CovertAction).filter(
        CovertAction.action_type == "sabotage"
    ).order_by(CovertAction.created_at.desc()).limit(10).all()

    covert_dispatches = [
        {
            "id": c.id,
            "round_number": c.round_number,
            "was_blocked": c.was_blocked,
            "quantity_destroyed": c.quantity_destroyed,
            "announcement_script": c.announcement_script,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in recent_covert
    ]

    return {
        "game": game_data,
        "active_round": round_data,
        "countries": country_data,
        "crises": crisis_data,
        "pending_trades": pending_trade_data,
        "latest_covert_dispatches": covert_dispatches,
    }


@router.post("/reset-tournament")
def reset_tournament(
    current_user: User = Depends(
        require_role("admin")
    ),
    db: Session = Depends(get_db),
):
    try:
        # Expunge attached ORM instances and close session so deleting users table
        # doesn't corrupt current_user in SQLAlchemy identity map
        db.expunge_all()
        db.close()

        from app.seed_tournament import seed_tournament
        seed_tournament()
        return {"message": "Tournament database successfully reset to clean default baseline"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Reset error: {str(e)}")