from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.auth import require_role

from app.models.user import User
from app.models.country import Country
from app.models.inventory import Inventory
from app.models.import_objective import ImportObjective
from app.models.trade import Trade
from app.models.round import Round
from app.models.crisis import Crisis


router = APIRouter(
    prefix="/country",
    tags=["Country Portal"]
)


@router.get("/me")
def get_my_country(
    current_user: User = Depends(
        require_role("country")
    ),
    db: Session = Depends(get_db)
):
    country = db.get(
        Country,
        current_user.country_id
    )

    if not country:
        raise HTTPException(
            status_code=404,
            detail="Country not found"
        )

    return {
        "id": country.id,
        "name": country.name,
        "money": country.money
    }


@router.get("/inventory")
def get_my_inventory(
    current_user: User = Depends(
        require_role("country")
    ),
    db: Session = Depends(get_db)
):
    return db.query(Inventory).filter(
        Inventory.country_id == current_user.country_id
    ).all()


@router.get("/objectives")
def get_my_objectives(
    current_user: User = Depends(
        require_role("country")
    ),
    db: Session = Depends(get_db)
):
    return db.query(ImportObjective).filter(
        ImportObjective.country_id == current_user.country_id
    ).all()


@router.get("/trades")
def get_my_trades(
    current_user: User = Depends(
        require_role("country")
    ),
    db: Session = Depends(get_db)
):
    return db.query(Trade).filter(
        (Trade.import_country_id == current_user.country_id) |
        (Trade.export_country_id == current_user.country_id)
    ).order_by(
        Trade.id.desc()
    ).all()


@router.get("/dashboard")
def get_country_dashboard(
    current_user: User = Depends(
        require_role("country")
    ),
    db: Session = Depends(get_db)
):

    # ---------------------------------------------------------
    # COUNTRY
    # ---------------------------------------------------------

    country = db.get(
        Country,
        current_user.country_id
    )

    if not country:
        raise HTTPException(
            status_code=404,
            detail="Country not found"
        )

    # ---------------------------------------------------------
    # INVENTORY
    # ---------------------------------------------------------

    inventories = db.query(Inventory).filter(
        Inventory.country_id == country.id
    ).all()

    inventory_data = []

    for inventory in inventories:
        inventory_data.append({
            "resource_id": inventory.resource_id,
            "quantity": inventory.quantity
        })

    # ---------------------------------------------------------
    # OBJECTIVES
    # ---------------------------------------------------------

    objectives = db.query(ImportObjective).filter(
        ImportObjective.country_id == country.id
    ).all()

    objective_data = []

    for objective in objectives:
        objective_data.append({
            "resource_id": objective.resource_id,
            "required_quantity": objective.required_quantity,
            "imported_quantity": objective.imported_quantity
        })

    # ---------------------------------------------------------
    # ACTIVE ROUND
    # ---------------------------------------------------------

    active_round = db.query(Round).filter(
        Round.is_active == True
    ).first()

    active_round_data = None
    crisis_data = []

    if active_round:

        active_round_data = {
            "id": active_round.id,
            "round_number": active_round.round_number
        }

        # -----------------------------------------------------
        # CRISES
        # -----------------------------------------------------

        crises = db.query(Crisis).filter(
            Crisis.round_id == active_round.id
        ).all()

        for crisis in crises:
            crisis_data.append({
                "resource_id": crisis.resource_id,
                "value_modifier": crisis.value_modifier
            })

    # ---------------------------------------------------------
    # TRADES
    # ---------------------------------------------------------

    trades = db.query(Trade).filter(
        (Trade.import_country_id == country.id) |
        (Trade.export_country_id == country.id)
    ).order_by(
        Trade.id.desc()
    ).all()

    trade_data = []

    for trade in trades:
        trade_data.append({
            "id": trade.id,
            "round_id": trade.round_id,
            "import_country_id": trade.import_country_id,
            "export_country_id": trade.export_country_id,
            "resource_id": trade.resource_id,
            "quantity": trade.quantity,
            "price": trade.price,
            "trade_type": trade.trade_type,
            "status": trade.status
        })

    # ---------------------------------------------------------
    # FINAL RESPONSE
    # ---------------------------------------------------------

    return {
        "country": {
            "id": country.id,
            "name": country.name,
            "money": country.money
        },

        "active_round": active_round_data,

        "inventory": inventory_data,

        "objectives": objective_data,

        "crises": crisis_data,

        "trades": trade_data
    }