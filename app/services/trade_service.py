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