from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel
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
from app.models.resource import Resource
from app.models.covert_ops import CovertAction


class SabotageRequest(BaseModel):
    target_country_id: int
    resource_id: int


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
        import time
        active_round_data = {
            "id": active_round.id,
            "round_number": active_round.round_number,
            "is_active": active_round.is_active,
            "duration_minutes": getattr(active_round, "duration_minutes", 10),
            "ends_at_timestamp": getattr(active_round, "ends_at_timestamp", None),
            "server_timestamp": time.time(),
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
    # ROUND SPOTLIGHT & TRADE ELIGIBILITY
    # ---------------------------------------------------------

    from app.core.spotlight_config import get_round_spotlight
    spotlight_data = None
    max_exports = 1
    max_imports = 1

    if active_round:
        spotlight = get_round_spotlight(active_round.round_number)
        if spotlight:
            is_host = (spotlight.get("country_username") == country.username)
            from app.models.spotlight_bounty import SpotlightBounty
            bounty_claimed = db.query(SpotlightBounty).filter(
                SpotlightBounty.round_number == active_round.round_number,
                SpotlightBounty.country_id == country.id
            ).first() is not None

            spotlight_data = {
                **spotlight,
                "is_host": is_host,
                "bounty_claimed": bounty_claimed,
            }
            if is_host:
                max_exports = spotlight.get("max_exports", 1)
                max_imports = spotlight.get("max_imports", 1)

    export_count = 0
    import_count = 0
    if active_round:
        export_count = db.query(Trade).filter(
            Trade.round_id == active_round.id,
            Trade.export_country_id == country.id,
            Trade.status == "completed"
        ).count()
        import_count = db.query(Trade).filter(
            Trade.round_id == active_round.id,
            Trade.import_country_id == country.id,
            Trade.status == "completed"
        ).count()

    is_black_market = (country.username == "extra_alpha")
    trade_eligibility = {
        "can_export": is_black_market or (export_count < max_exports),
        "can_import": is_black_market or (import_count < max_imports),
        "exported": export_count >= max_exports,
        "imported": import_count >= max_imports,
        "export_count": export_count,
        "import_count": import_count,
        "max_exports": max_exports,
        "max_imports": max_imports,
        "is_black_market": is_black_market,
    }

    # ---------------------------------------------------------
    # COVERT OPERATIONS TELEMETRY (1-USE PER TOURNAMENT)
    # ---------------------------------------------------------

    sabotage_record = db.query(CovertAction).filter(
        CovertAction.country_id == country.id,
        CovertAction.action_type == "sabotage"
    ).first()

    shield_record = db.query(CovertAction).filter(
        CovertAction.country_id == country.id,
        CovertAction.action_type == "shield"
    ).first()

    shield_active_this_round = False
    if active_round and shield_record and shield_record.round_number == active_round.round_number:
        shield_active_this_round = True

    covert_ops = {
        "can_sabotage": not is_black_market and (sabotage_record is None) and (active_round is not None),
        "can_buy_shield": not is_black_market and (shield_record is None) and (active_round is not None),
        "sabotage_used": sabotage_record is not None,
        "shield_used": shield_record is not None,
        "shield_active_this_round": shield_active_this_round,
    }

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

        "trades": trade_data,

        "trade_eligibility": trade_eligibility,

        "spotlight": spotlight_data,

        "covert_ops": covert_ops,
    }


# =============================================================
# COVERT OPERATIONS ENDPOINTS (BLACK MARKET SERVICES)
# =============================================================

@router.post("/covert-ops/shield")
def activate_intel_shield(
    current_user: User = Depends(require_role("country")),
    db: Session = Depends(get_db),
):
    """Activates the one-time National Intel Shield ($30,000) for the active round."""
    country = db.get(Country, current_user.country_id)
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")

    if country.username == "extra_alpha":
        raise HTTPException(status_code=400, detail="Black Market cannot activate an Intel Shield")

    active_round = db.query(Round).filter(Round.is_active == True).first()
    if not active_round:
        raise HTTPException(status_code=400, detail="Intel Shield can only be purchased during an active round")

    existing_shield = db.query(CovertAction).filter(
        CovertAction.country_id == country.id,
        CovertAction.action_type == "shield",
    ).first()
    if existing_shield:
        raise HTTPException(status_code=400, detail="You have already utilized your National Intel Shield for this tournament")

    SHIELD_COST = Decimal("30000.0")
    if country.money < SHIELD_COST:
        raise HTTPException(status_code=400, detail=f"Insufficient treasury funds ($30,000 required, current: ${float(country.money):,.0f})")

    country.money -= SHIELD_COST

    action = CovertAction(
        country_id=country.id,
        action_type="shield",
        round_number=active_round.round_number,
        created_at=datetime.utcnow(),
    )
    db.add(action)
    db.commit()

    return {
        "success": True,
        "message": f"National Intel Shield successfully deployed for Round {active_round.round_number}!",
        "remaining_money": float(country.money),
    }


@router.post("/covert-ops/sabotage")
def launch_covert_sabotage(
    payload: SabotageRequest,
    current_user: User = Depends(require_role("country")),
    db: Session = Depends(get_db),
):
    """Executes the one-time Black Market Sabotage Strike ($60,000). Burns 25% of target resource unless shielded."""
    country = db.get(Country, current_user.country_id)
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")

    if country.username == "extra_alpha":
        raise HTTPException(status_code=400, detail="Black Market cannot launch Sabotage strikes")

    active_round = db.query(Round).filter(Round.is_active == True).first()
    if not active_round:
        raise HTTPException(status_code=400, detail="Covert strikes can only be executed during an active round")

    existing_sabotage = db.query(CovertAction).filter(
        CovertAction.country_id == country.id,
        CovertAction.action_type == "sabotage",
    ).first()
    if existing_sabotage:
        raise HTTPException(status_code=400, detail="You have already utilized your Black Market Sabotage strike for this tournament")

    SABOTAGE_COST = Decimal("60000.0")
    if country.money < SABOTAGE_COST:
        raise HTTPException(status_code=400, detail=f"Insufficient treasury funds ($60,000 required, current: ${float(country.money):,.0f})")

    if payload.target_country_id == country.id:
        raise HTTPException(status_code=400, detail="You cannot sabotage your own nation")

    target = db.get(Country, payload.target_country_id)
    if not target:
        raise HTTPException(status_code=404, detail="Target nation not found")

    if target.username == "extra_alpha":
        raise HTTPException(status_code=400, detail="Standby Alpha (Black Market) cannot be targeted")

    resource = db.get(Resource, payload.resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Target resource not found")

    target_inv = db.query(Inventory).filter(
        Inventory.country_id == target.id,
        Inventory.resource_id == resource.id,
    ).first()
    if not target_inv or target_inv.quantity <= 0:
        raise HTTPException(status_code=400, detail=f"{target.name} does not hold any {resource.name} in their stockpile to sabotage")

    # Deduct $60,000 from attacker
    country.money -= SABOTAGE_COST

    # Check if target has an active Intel Shield in this round
    active_target_shield = db.query(CovertAction).filter(
        CovertAction.country_id == target.id,
        CovertAction.action_type == "shield",
        CovertAction.round_number == active_round.round_number,
    ).first()

    if active_target_shield:
        # THE TRAP SPRUNG! Strike deflected, attacker unmasked!
        was_blocked = True
        quantity_destroyed = 0
        announcement_script = (
            f"🚨 ATTENTION DELEGATES — INTERNATIONAL SCANDAL! "
            f"Counter-intelligence operatives in {target.name} have just intercepted a foreign strike team attacking their {resource.name} depots! "
            f"The rogue state funding the attack was caught red-handed and has been UNMASKED as: {country.name.upper()}! "
            f"{country.name}'s $60,000 Black Market contract has been confiscated by the UN Tribunal!"
        )
    else:
        # SUCCESSFUL STRIKE! 25% burned, attacker completely anonymous!
        was_blocked = False
        quantity_destroyed = max(1, int(target_inv.quantity * 0.25))
        target_inv.quantity -= quantity_destroyed
        announcement_script = (
            f"🚨 ATTENTION DELEGATES — BREAKING EMERGENCY! "
            f"A coordinated strike has devastated the primary {resource.name} storage facilities in {target.name}! "
            f"Over {quantity_destroyed:,} units of {resource.name} were destroyed in an act of deliberate sabotage! "
            f"The perpetrators remain unidentified at this hour."
        )

    action = CovertAction(
        country_id=country.id,
        action_type="sabotage",
        round_number=active_round.round_number,
        target_country_id=target.id,
        resource_id=resource.id,
        quantity_destroyed=quantity_destroyed,
        was_blocked=was_blocked,
        announcement_script=announcement_script,
        created_at=datetime.utcnow(),
    )
    db.add(action)
    db.commit()

    return {
        "success": True,
        "was_blocked": was_blocked,
        "quantity_destroyed": quantity_destroyed,
        "message": "Operation executed. Monitor the Host microphone for incoming dispatches.",
        "remaining_money": float(country.money),
    }