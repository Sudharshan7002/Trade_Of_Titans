from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.auth import require_role

from app.models.trade import Trade
from app.models.round import Round
from app.models.user import User
from app.models.game import Game
from app.schemas.trade import TradeCreate, TradeResponse


router = APIRouter(
    prefix="/trades",
    tags=["Trades"]
)


@router.post("/", response_model=TradeResponse)
def create_trade(
    trade: TradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("country")
    )
):

    country_id = current_user.country_id

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
    # CHECK COUNTRY INVOLVEMENT
    # ---------------------------------------------------------

    if country_id not in [
        trade.import_country_id,
        trade.export_country_id
    ]:
        raise HTTPException(
            status_code=403,
            detail="You can only submit trades involving your country"
        )

    # ---------------------------------------------------------
    # BASIC VALIDATION
    # ---------------------------------------------------------

    if trade.import_country_id == trade.export_country_id:
        raise HTTPException(
            status_code=400,
            detail="Import and export countries must be different"
        )

    if trade.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    if trade.price < 0:
        raise HTTPException(
            status_code=400,
            detail="Price cannot be negative"
        )

    if trade.trade_type not in [
        "money",
        "resource"
    ]:
        raise HTTPException(
            status_code=400,
            detail="trade_type must be 'money' or 'resource'"
        )

    # ---------------------------------------------------------
    # CHECK IMPORT LIMIT
    # ---------------------------------------------------------

    if trade.import_country_id == country_id:

        existing_import = db.query(Trade).filter(
            Trade.round_id == trade.round_id,
            Trade.import_country_id == country_id,
            Trade.status.in_(["pending", "completed"])
        ).first()

        if existing_import:
            raise HTTPException(
                status_code=400,
                detail="Your country has already used its import for this round"
            )

    # ---------------------------------------------------------
    # CHECK EXPORT LIMIT
    # ---------------------------------------------------------

    if trade.export_country_id == country_id:

        existing_export = db.query(Trade).filter(
            Trade.round_id == trade.round_id,
            Trade.export_country_id == country_id,
            Trade.status.in_(["pending", "completed"])
        ).first()

        if existing_export:
            raise HTTPException(
                status_code=400,
                detail="Your country has already used its export for this round"
            )

    # ---------------------------------------------------------
    # RESOURCE TRADE VALIDATION
    # ---------------------------------------------------------

    if trade.trade_type == "resource":

        if trade.payment_resource_id is None:
            raise HTTPException(
                status_code=400,
                detail="payment_resource_id is required"
            )

        if trade.payment_quantity is None:
            raise HTTPException(
                status_code=400,
                detail="payment_quantity is required"
            )

        if trade.payment_quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="payment_quantity must be greater than zero"
            )

    # ---------------------------------------------------------
    # CREATE PENDING TRADE
    # ---------------------------------------------------------

    new_trade = Trade(
        round_id=trade.round_id,
        import_country_id=trade.import_country_id,
        export_country_id=trade.export_country_id,
        resource_id=trade.resource_id,
        quantity=trade.quantity,
        price=trade.price,
        trade_type=trade.trade_type,
        payment_resource_id=trade.payment_resource_id,
        payment_quantity=trade.payment_quantity,
        status="pending"
    )

    db.add(new_trade)
    db.commit()
    db.refresh(new_trade)

    return new_trade


# =============================================================
# ADMIN ONLY
# =============================================================

@router.get(
    "/",
    response_model=list[TradeResponse]
)
def get_all_trades(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("admin")
    )
):
    return db.query(Trade).all()


# =============================================================
# ADMIN ONLY
# =============================================================

@router.get(
    "/round/{round_id}",
    response_model=list[TradeResponse]
)
def get_round_trades(
    round_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("admin")
    )
):
    return db.query(Trade).filter(
        Trade.round_id == round_id
    ).all()


# =============================================================
# ADMIN ONLY
# =============================================================

@router.get(
    "/country/{country_id}",
    response_model=list[TradeResponse]
)
def get_country_trades(
    country_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("admin")
    )
):
    return db.query(Trade).filter(
        (Trade.import_country_id == country_id) |
        (Trade.export_country_id == country_id)
    ).all()