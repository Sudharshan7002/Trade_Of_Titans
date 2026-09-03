from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.auth import require_role

from app.models.user import User
from app.models.trade import Trade
from app.models.round import Round
from app.models.game import Game

from app.services.trade_service import execute_trade


router = APIRouter(
    prefix="/trade-confirmation",
    tags=["Trade Confirmation"]
)


@router.post("/{trade_id}")
def confirm_trade(
    trade_id: int,
    current_user: User = Depends(
        require_role("trading_center")
    ),
    db: Session = Depends(get_db)
):

    # ---------------------------------------------------------
    # CHECK GAME STATUS
    # ---------------------------------------------------------

    game = db.query(Game).first()

    if not game:
        raise HTTPException(
            status_code=400,
            detail="Game has not been initialized"
        )

    if game.is_finished:
        raise HTTPException(
            status_code=400,
            detail="Game has already finished"
        )

    if not game.is_started:
        raise HTTPException(
            status_code=400,
            detail="Game is not active"
        )

    # ---------------------------------------------------------
    # FIND TRADE
    # ---------------------------------------------------------

    trade = db.get(
        Trade,
        trade_id
    )

    if not trade:
        raise HTTPException(
            status_code=404,
            detail="Trade not found"
        )

    # ---------------------------------------------------------
    # TRADE MUST BE PENDING (OR IDEMPOTENTLY COMPLETED)
    # ---------------------------------------------------------

    if trade.status == "completed":
        return {
            "message": "Trade already confirmed and executed",
            "trade_id": trade.id,
            "status": trade.status
        }

    if trade.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Trade is already {trade.status}"
        )

    # ---------------------------------------------------------
    # CHECK ROUND
    # ---------------------------------------------------------

    round_obj = db.get(
        Round,
        trade.round_id
    )

    if not round_obj:
        raise HTTPException(
            status_code=404,
            detail="Round not found"
        )

    if not round_obj.is_active:
        raise HTTPException(
            status_code=400,
            detail="Round is not active"
        )

    # ---------------------------------------------------------
    # EXECUTE TRADE
    # ---------------------------------------------------------

    execute_trade(
        db=db,
        round_id=trade.round_id,
        import_country_id=trade.import_country_id,
        export_country_id=trade.export_country_id,
        resource_id=trade.resource_id,
        quantity=trade.quantity,
        price=trade.price,
        trade_type=trade.trade_type,
        payment_resource_id=trade.payment_resource_id,
        payment_quantity=trade.payment_quantity,
        existing_trade=trade
    )

    # ---------------------------------------------------------
    # RESPONSE
    # ---------------------------------------------------------

    return {
        "message": "Trade confirmed and executed",
        "trade_id": trade.id,
        "status": trade.status
    }