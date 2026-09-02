from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.country import Country
from app.models.inventory import Inventory
from app.models.import_objective import ImportObjective
from app.models.resource import Resource
from app.models.round import Round
from app.models.trade import Trade


def execute_trade(
    db: Session,
    round_id: int,
    import_country_id: int,
    export_country_id: int,
    resource_id: int,
    quantity: int,
    price: Decimal,
    trade_type: str,
    payment_resource_id: int | None = None,
    payment_quantity: int | None = None,
    existing_trade: Trade | None = None,
    override_limits: bool = False,
):
    # ---------- BASIC VALIDATION ----------

    if import_country_id == export_country_id:
        raise HTTPException(
            status_code=400,
            detail="Import and export countries must be different"
        )

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    if price < 0:
        raise HTTPException(
            status_code=400,
            detail="Price cannot be negative"
        )

    if trade_type not in ["money", "resource"]:
        raise HTTPException(
            status_code=400,
            detail="trade_type must be 'money' or 'resource'"
        )

    # ---------- CHECK ROUND ----------

    round_obj = db.get(Round, round_id)

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

    # ---------- CHECK COUNTRIES ----------

    importer = db.get(Country, import_country_id)
    exporter = db.get(Country, export_country_id)

    if not importer or not exporter:
        raise HTTPException(
            status_code=404,
            detail="Country not found"
        )

    # ---------- CHECK ROUND TRADE LIMITS (1 IMPORT & 1 EXPORT PER ROUND) ----------
    if not override_limits:
        from app.core.spotlight_config import get_round_spotlight
        spotlight = get_round_spotlight(round_obj.round_number)

        max_exports = 1
        if spotlight and spotlight.get("country_username") == exporter.username:
            max_exports = spotlight.get("max_exports", 1)

        max_imports = 1
        if spotlight and spotlight.get("country_username") == importer.username:
            max_imports = spotlight.get("max_imports", 1)

        # Exporter limit check (Standby Alpha / extra_alpha is exempt)
        if exporter.username != "extra_alpha":
            existing_export_query = db.query(Trade).filter(
                Trade.round_id == round_id,
                Trade.export_country_id == export_country_id,
                Trade.status == "completed",
            )
            if existing_trade:
                existing_export_query = existing_export_query.filter(Trade.id != existing_trade.id)
            if existing_export_query.count() >= max_exports:
                raise HTTPException(
                    status_code=400,
                    detail=f"{exporter.name} has already used all allowed exports ({max_exports}) in Round {round_obj.round_number}"
                )

        # Importer limit check (Standby Alpha / extra_alpha is exempt)
        if importer.username != "extra_alpha":
            existing_import_query = db.query(Trade).filter(
                Trade.round_id == round_id,
                Trade.import_country_id == import_country_id,
                Trade.status == "completed",
            )
            if existing_trade:
                existing_import_query = existing_import_query.filter(Trade.id != existing_trade.id)
            if existing_import_query.count() >= max_imports:
                raise HTTPException(
                    status_code=400,
                    detail=f"{importer.name} has already used all allowed imports ({max_imports}) in Round {round_obj.round_number}"
                )

    # ---------- CHECK RESOURCE ----------

    resource = db.get(Resource, resource_id)

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    # ---------- CHECK EXPORTER INVENTORY ----------

    exporter_inventory = db.query(Inventory).filter(
        Inventory.country_id == export_country_id,
        Inventory.resource_id == resource_id
    ).first()

    if not exporter_inventory:
        raise HTTPException(
            status_code=400,
            detail="Exporter does not own this resource"
        )

    if exporter_inventory.quantity < quantity:
        raise HTTPException(
            status_code=400,
            detail="Exporter does not have enough quantity"
        )

    # =========================================================
    # MONEY TRADE
    # =========================================================

    if trade_type == "money":

        total_value = price * quantity

        if importer.money < total_value:
            raise HTTPException(
                status_code=400,
                detail="Importer does not have enough money"
            )

        importer.money -= total_value
        exporter.money += total_value

    # =========================================================
    # RESOURCE TRADE
    # =========================================================

    elif trade_type == "resource":

        if payment_resource_id is None:
            raise HTTPException(
                status_code=400,
                detail="payment_resource_id is required"
            )

        if payment_quantity is None or payment_quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="payment_quantity must be greater than zero"
            )

        if payment_resource_id == resource_id:
            raise HTTPException(
                status_code=400,
                detail="Payment resource must be different"
            )

        payment_resource = db.get(
            Resource,
            payment_resource_id
        )

        if not payment_resource:
            raise HTTPException(
                status_code=404,
                detail="Payment resource not found"
            )

        importer_payment_inventory = db.query(
            Inventory
        ).filter(
            Inventory.country_id == import_country_id,
            Inventory.resource_id == payment_resource_id
        ).first()

        if not importer_payment_inventory:
            raise HTTPException(
                status_code=400,
                detail="Importer does not own the payment resource"
            )

        if importer_payment_inventory.quantity < payment_quantity:
            raise HTTPException(
                status_code=400,
                detail="Importer does not have enough payment resource"
            )

        importer_payment_inventory.quantity -= payment_quantity

        exporter_payment_inventory = db.query(
            Inventory
        ).filter(
            Inventory.country_id == export_country_id,
            Inventory.resource_id == payment_resource_id
        ).first()

        if exporter_payment_inventory:
            exporter_payment_inventory.quantity += payment_quantity
        else:
            exporter_payment_inventory = Inventory(
                country_id=export_country_id,
                resource_id=payment_resource_id,
                quantity=payment_quantity
            )

            db.add(exporter_payment_inventory)

    # =========================================================
    # TRANSFER MAIN RESOURCE
    # =========================================================

    exporter_inventory.quantity -= quantity

    importer_inventory = db.query(
        Inventory
    ).filter(
        Inventory.country_id == import_country_id,
        Inventory.resource_id == resource_id
    ).first()

    if importer_inventory:
        importer_inventory.quantity += quantity
    else:
        importer_inventory = Inventory(
            country_id=import_country_id,
            resource_id=resource_id,
            quantity=quantity
        )

        db.add(importer_inventory)

    # =========================================================
    # IMPORT OBJECTIVE
    # =========================================================

    objective = db.query(
        ImportObjective
    ).filter(
        ImportObjective.country_id == import_country_id,
        ImportObjective.resource_id == resource_id
    ).first()

    if objective:
        objective.imported_quantity += quantity

        if objective.imported_quantity > objective.required_quantity:
            objective.imported_quantity = objective.required_quantity

    # =========================================================
    # TRADE RECORD
    # =========================================================

    if existing_trade:
        trade = existing_trade
        trade.status = "completed"
    else:
        trade = Trade(
            round_id=round_id,
            import_country_id=import_country_id,
            export_country_id=export_country_id,
            resource_id=resource_id,
            quantity=quantity,
            price=price,
            trade_type=trade_type,
            payment_resource_id=payment_resource_id,
            payment_quantity=payment_quantity,
            status="completed"
        )

        db.add(trade)

    db.commit()
    db.refresh(trade)

    return trade