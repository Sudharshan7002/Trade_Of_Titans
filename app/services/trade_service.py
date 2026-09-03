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

    total_value = Decimal("0.0")
    if trade_type == "money":

        total_value = Decimal(str(price)) * Decimal(str(quantity))

        if importer.money < total_value:
            raise HTTPException(
                status_code=400,
                detail="Importer does not have enough money"
            )

        importer.money -= total_value

        # Calculate automatic Central Bank Export Subsidy (Spotlight Perk)
        subsidy_rate = Decimal("0.0")
        from app.core.spotlight_config import get_round_spotlight
        spotlight = get_round_spotlight(round_obj.round_number)
        if spotlight and spotlight.get("country_username") == exporter.username:
            r_num = round_obj.round_number
            # Round 1: USA +15% on Grain & Electronics
            if r_num == 1 and resource.name in ("Grain", "Electronics"):
                subsidy_rate = Decimal("0.15")
            # Round 5: India +25% on Medicine & Spices
            elif r_num == 5 and resource.name in ("Medicine", "Spices"):
                subsidy_rate = Decimal("0.25")
            # Round 9: Indonesia +30% on Spices & Textiles
            elif r_num == 9 and resource.name in ("Spices", "Textiles"):
                subsidy_rate = Decimal("0.30")
            # Round 11: France +10% on all bilateral deals
            elif r_num == 11:
                subsidy_rate = Decimal("0.10")
            # Round 13: Italy +20% on Textiles & Livestock
            elif r_num == 13 and resource.name in ("Textiles", "Livestock"):
                subsidy_rate = Decimal("0.20")

        export_payout = total_value * (Decimal("1.0") + subsidy_rate)
        exporter.money += export_payout

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
    # IMPORT OBJECTIVE & SPOTLIGHT MULTIPLIER
    # =========================================================

    effective_quantity = quantity
    if round_obj.round_number == 10 and resource.name == "Electronics":
        effective_quantity = int(quantity * 1.5)
    elif round_obj.round_number == 3 and importer.username == "canada":
        effective_quantity = int(quantity * 1.1)

    objective = db.query(
        ImportObjective
    ).filter(
        ImportObjective.country_id == import_country_id,
        ImportObjective.resource_id == resource_id
    ).first()

    if objective:
        objective.imported_quantity += effective_quantity

        if objective.imported_quantity > objective.required_quantity:
            objective.imported_quantity = objective.required_quantity

    # In barter trades, update exporter quota for the payment resource received
    if trade_type == "resource" and payment_resource_id and payment_quantity:
        exporter_objective = db.query(
            ImportObjective
        ).filter(
            ImportObjective.country_id == export_country_id,
            ImportObjective.resource_id == payment_resource_id
        ).first()

        if exporter_objective:
            exporter_objective.imported_quantity += payment_quantity
            if exporter_objective.imported_quantity > exporter_objective.required_quantity:
                exporter_objective.imported_quantity = exporter_objective.required_quantity

    # =========================================================
    # AUTOMATED SPOTLIGHT BOUNTY EVALUATION
    # =========================================================
    evaluate_and_award_bounty(db, round_obj, exporter, importer, resource, quantity)

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


def evaluate_and_award_bounty(
    db: Session,
    round_obj: Round,
    exporter: Country,
    importer: Country,
    resource: Resource,
    quantity: int,
):
    """Automatically checks if the active spotlight nation achieved their bonus mission and awards the bounty."""
    r_num = round_obj.round_number
    from app.core.spotlight_config import get_round_spotlight
    spotlight = get_round_spotlight(r_num)
    if not spotlight:
        return

    host_username = spotlight["country_username"]
    host_country = db.query(Country).filter(Country.username == host_username).first()
    if not host_country:
        return

    from app.models.spotlight_bounty import SpotlightBounty
    existing_bounty = db.query(SpotlightBounty).filter(
        SpotlightBounty.round_number == r_num,
        SpotlightBounty.country_id == host_country.id,
    ).first()
    if existing_bounty:
        return

    bounty_earned = False
    reward_text = spotlight["reward"]

    if r_num == 1 and host_username == "usa":
        # USA: Trade with any Asian or European nation
        eu_asia = {"germany", "france", "italy", "india", "china", "japan", "south_korea", "indonesia"}
        partner = importer if exporter.username == "usa" else exporter
        if partner.username in eu_asia:
            bounty_earned = True
            host_country.money += Decimal("20000.0")

    elif r_num == 2 and host_username == "germany":
        # Germany: Export Steel and Electronics in round 2
        exp_trades = db.query(Trade).filter(
            Trade.round_id == round_obj.id,
            Trade.export_country_id == host_country.id,
            Trade.status == "completed"
        ).all()
        res_ids = {t.resource_id for t in exp_trades}
        res_ids.add(resource.id)
        steel_res = db.query(Resource).filter(Resource.name == "Steel").first()
        elec_res = db.query(Resource).filter(Resource.name == "Electronics").first()
        if steel_res and elec_res and steel_res.id in res_ids and elec_res.id in res_ids:
            bounty_earned = True

    elif r_num == 3 and host_username == "canada":
        # Canada: Export deal with Australia, Italy, or France
        if exporter.username == "canada" and importer.username in ("australia", "italy", "france"):
            bounty_earned = True
            host_country.money += Decimal("15000.0")

    elif r_num == 4 and host_username == "australia":
        # Australia: Export >= 1000 Gold or Livestock
        if exporter.username == "australia" and resource.name in ("Gold", "Livestock") and quantity >= 1000:
            bounty_earned = True
            host_country.money += Decimal("20000.0")

    elif r_num == 5 and host_username == "india":
        # India: Supply Medicine or Spices to nation with < 250k balance
        if exporter.username == "india" and resource.name in ("Medicine", "Spices") and importer.money < Decimal("250000.0"):
            bounty_earned = True

    elif r_num == 6 and host_username == "china":
        # China: 2 bilateral trade deals with different continents
        if exporter.username == "china" or importer.username == "china":
            bounty_earned = True
            host_country.money += Decimal("25000.0")

    elif r_num == 7 and host_username == "brazil":
        # Brazil: Import >= 500 units -> +500 Steel
        if importer.username == "brazil" and quantity >= 500:
            bounty_earned = True
            steel_res = db.query(Resource).filter(Resource.name == "Steel").first()
            if steel_res:
                b_steel = db.query(Inventory).filter(
                    Inventory.country_id == host_country.id,
                    Inventory.resource_id == steel_res.id
                ).first()
                if b_steel:
                    b_steel.quantity += 500
                else:
                    db.add(Inventory(country_id=host_country.id, resource_id=steel_res.id, quantity=500))

    elif r_num == 8 and host_username == "russia":
        # Russia: Import Electronics or Medicine
        if importer.username == "russia" and resource.name in ("Electronics", "Medicine"):
            bounty_earned = True
            host_country.money += Decimal("25000.0")

    elif r_num == 9 and host_username == "indonesia":
        # Indonesia: Import Oil, Steel, or Timber
        if importer.username == "indonesia" and resource.name in ("Oil", "Steel", "Timber"):
            bounty_earned = True

    elif r_num == 10 and host_username == "japan":
        # Japan: Import >= 1000 Grain or Timber
        if importer.username == "japan" and resource.name in ("Grain", "Timber") and quantity >= 1000:
            bounty_earned = True

    elif r_num == 11 and host_username == "france":
        # France: Import without using Black Market
        if importer.username == "france" and exporter.username != "extra_alpha":
            bounty_earned = True
            host_country.money += Decimal("20000.0")

    elif r_num == 12 and host_username == "south_korea":
        # South Korea: Complete an import
        if importer.username == "south_korea":
            bounty_earned = True

    elif r_num == 13 and host_username == "italy":
        # Italy: Export to USA, Canada, or Mexico
        if exporter.username == "italy" and importer.username in ("usa", "canada", "mexico"):
            bounty_earned = True
            host_country.money += Decimal("15000.0")

    elif r_num == 14 and host_username == "mexico":
        # Mexico: Import Oil and Steel
        imp_trades = db.query(Trade).filter(
            Trade.round_id == round_obj.id,
            Trade.import_country_id == host_country.id,
            Trade.status == "completed"
        ).all()
        res_ids = {t.resource_id for t in imp_trades}
        res_ids.add(resource.id)
        oil_res = db.query(Resource).filter(Resource.name == "Oil").first()
        steel_res = db.query(Resource).filter(Resource.name == "Steel").first()
        if oil_res and steel_res and oil_res.id in res_ids and steel_res.id in res_ids:
            bounty_earned = True

    elif r_num == 15 and host_username == "saudi_arabia":
        # Saudi: Export >= 2000 Oil
        if exporter.username == "saudi_arabia" and resource.name == "Oil" and quantity >= 2000:
            bounty_earned = True
            host_country.money += Decimal("30000.0")

    if bounty_earned:
        db.add(SpotlightBounty(
            round_number=r_num,
            country_id=host_country.id,
            bounty_claimed=True,
            reward_description=reward_text
        ))