import time
from decimal import Decimal
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.auth import require_role

from app.models.user import User
from app.models.trade import Trade
from app.models.round import Round
from app.models.crisis import Crisis
from app.models.country import Country
from app.services.trade_service import execute_trade


router = APIRouter(
    prefix="/trading-center",
    tags=["Trading Center"]
)


@router.get("/round")
def get_active_round(
    current_user: User = Depends(
        require_role("trading_center")
    ),
    db: Session = Depends(get_db)
):
    active_round = db.query(Round).filter(
        Round.is_active == True
    ).first()

    if not active_round:
        return {
            "detail": "No active round"
        }

    return active_round


@router.get("/trades")
def get_trades(
    current_user: User = Depends(
        require_role("trading_center")
    ),
    db: Session = Depends(get_db)
):
    return db.query(Trade).order_by(
        Trade.id.desc()
    ).all()


@router.get("/dashboard")
def get_trading_center_dashboard(
    current_user: User = Depends(
        require_role("trading_center")
    ),
    db: Session = Depends(get_db)
):

    # ---------------------------------------------------------
    # ACTIVE ROUND
    # ---------------------------------------------------------

    active_round = db.query(Round).filter(
        Round.is_active == True
    ).first()

    round_data = None
    crisis_data = []
    if active_round:
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
    # PENDING TRADES
    # ---------------------------------------------------------

    pending_trades = db.query(Trade).filter(
        Trade.status == "pending"
    ).order_by(
        Trade.id.asc()
    ).all()

    pending_trade_data = []

    for trade in pending_trades:

        import_country = db.get(
            Country,
            trade.import_country_id
        )

        export_country = db.get(
            Country,
            trade.export_country_id
        )

        pending_trade_data.append({
            "id": trade.id,
            "round_id": trade.round_id,
            "import_country_id": trade.import_country_id,
            "import_country_name": (
                import_country.name
                if import_country else None
            ),
            "export_country_id": trade.export_country_id,
            "export_country_name": (
                export_country.name
                if export_country else None
            ),
            "resource_id": trade.resource_id,
            "quantity": trade.quantity,
            "price": trade.price,
            "trade_type": trade.trade_type,
            "payment_resource_id": trade.payment_resource_id,
            "payment_quantity": trade.payment_quantity,
            "status": trade.status
        })

    # ---------------------------------------------------------
    # RECENT COMPLETED TRADES
    # ---------------------------------------------------------

    completed_trades = db.query(Trade).filter(
        Trade.status == "completed"
    ).order_by(
        Trade.id.desc()
    ).limit(20).all()

    completed_trade_data = []

    for trade in completed_trades:

        completed_trade_data.append({
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

    from app.models.inventory import Inventory
    from app.models.import_objective import ImportObjective
    from collections import defaultdict

    all_countries = db.query(Country).all()
    all_inventories = db.query(Inventory).filter(Inventory.quantity > 0).all()
    all_objectives = db.query(ImportObjective).all()

    from app.core.spotlight_config import get_round_spotlight
    spotlight_data = None
    if active_round:
        spotlight_data = get_round_spotlight(active_round.round_number)

    # Track how many exports/imports each country completed this round
    export_counts = defaultdict(int)
    import_counts = defaultdict(int)
    if active_round:
        round_trades = db.query(Trade).filter(
            Trade.round_id == active_round.id,
            Trade.status == "completed"
        ).all()
        for t in round_trades:
            export_counts[t.export_country_id] += 1
            import_counts[t.import_country_id] += 1

    inv_map = defaultdict(list)
    for inv in all_inventories:
        inv_map[inv.country_id].append({"resource_id": inv.resource_id, "quantity": inv.quantity})

    obj_map = defaultdict(list)
    for obj in all_objectives:
        obj_map[obj.country_id].append({
            "resource_id": obj.resource_id,
            "required_quantity": obj.required_quantity,
            "imported_quantity": obj.imported_quantity,
        })

    countries_intel = {}
    for country in all_countries:
        is_black_market = (country.username == "extra_alpha")
        country_max_exports = 1
        country_max_imports = 1
        if spotlight_data and spotlight_data.get("country_username") == country.username:
            country_max_exports = spotlight_data.get("max_exports", 1)
            country_max_imports = spotlight_data.get("max_imports", 1)

        exp_count = export_counts[country.id]
        imp_count = import_counts[country.id]

        countries_intel[country.id] = {
            "money": float(country.money),
            "stockpiles": inv_map.get(country.id, []),
            "objectives": obj_map.get(country.id, []),
            "trade_eligibility": {
                "can_export": is_black_market or (exp_count < country_max_exports),
                "can_import": is_black_market or (imp_count < country_max_imports),
                "exported": exp_count >= country_max_exports,
                "imported": imp_count >= country_max_imports,
                "export_count": exp_count,
                "import_count": imp_count,
                "max_exports": country_max_exports,
                "max_imports": country_max_imports,
                "is_black_market": is_black_market,
            }
        }

    return {
        "active_round": round_data,
        "crises": crisis_data,
        "pending_trades": pending_trade_data,
        "recent_completed_trades": completed_trade_data,
        "countries_intel": countries_intel,
        "spotlight": spotlight_data,
    }


class DirectTradeCreate(BaseModel):
    round_id: int
    export_country_id: int
    import_country_id: int
    resource_id: int
    quantity: int
    price: Decimal = Decimal("0")
    trade_type: str = "money"
    payment_resource_id: int | None = None
    payment_quantity: int | None = None
    override_limits: bool = False


@router.post("/execute-trade")
def execute_direct_trade(
    data: DirectTradeCreate,
    current_user: User = Depends(
        require_role("trading_center")
    ),
    db: Session = Depends(get_db)
):
    trade = execute_trade(
        db=db,
        round_id=data.round_id,
        import_country_id=data.import_country_id,
        export_country_id=data.export_country_id,
        resource_id=data.resource_id,
        quantity=data.quantity,
        price=data.price,
        trade_type=data.trade_type,
        payment_resource_id=data.payment_resource_id,
        payment_quantity=data.payment_quantity,
        override_limits=data.override_limits,
    )

    return {
        "message": "Trade successfully executed",
        "trade_id": trade.id,
        "status": trade.status
    }