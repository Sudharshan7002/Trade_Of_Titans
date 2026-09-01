from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.country import Country
from app.models.inventory import Inventory
from app.models.import_objective import ImportObjective
from app.models.resource import Resource
from app.models.trade import Trade
from app.models.crisis import Crisis


IMPORT_WEIGHT = Decimal("1000")
EXPORT_WEIGHT = Decimal("1")
GOOD_TRADE_BONUS = Decimal("100")
BAD_TRADE_PENALTY = Decimal("100")


def get_resource_value(
    db: Session,
    resource_id: int,
    round_id: int | None = None
) -> Decimal:

    resource = db.get(Resource, resource_id)

    if not resource:
        return Decimal("0")

    value = Decimal(str(resource.base_value))

    if round_id is not None:
        crisis = db.query(Crisis).filter(
            Crisis.round_id == round_id,
            Crisis.resource_id == resource_id
        ).first()

        if crisis:
            value *= Decimal(str(crisis.value_modifier))

    return value


def calculate_country_score(
    db: Session,
    country_id: int,
    final_round_id: int | None = None
):

    country = db.get(Country, country_id)

    if not country:
        return None

    # =========================================================
    # WEALTH
    # =========================================================

    wealth_score = Decimal(str(country.money))

    inventories = db.query(Inventory).filter(
        Inventory.country_id == country_id
    ).all()

    for inventory in inventories:

        value = get_resource_value(
            db,
            inventory.resource_id,
            final_round_id
        )

        wealth_score += (
            Decimal(inventory.quantity) * value
        )

    # =========================================================
    # EXPORT SCORE
    # =========================================================

    exports = db.query(Trade).filter(
        Trade.export_country_id == country_id
    ).all()

    total_export_quantity = sum(
        trade.quantity
        for trade in exports
    )

    export_score = (
        Decimal(total_export_quantity)
        * EXPORT_WEIGHT
    )

    # =========================================================
    # IMPORT SCORE
    # =========================================================

    objectives = db.query(ImportObjective).filter(
        ImportObjective.country_id == country_id
    ).all()

    import_score = Decimal("0")

    for objective in objectives:

        if objective.required_quantity <= 0:
            continue

        completion = (
            Decimal(objective.imported_quantity)
            / Decimal(objective.required_quantity)
        )

        completion = min(
            completion,
            Decimal("1")
        )

        import_score += (
            completion * IMPORT_WEIGHT
        )

    # =========================================================
    # TRADE PERFORMANCE
    # =========================================================

    good_trade_bonus = Decimal("0")
    bad_trade_penalty = Decimal("0")

    trades = db.query(Trade).filter(
        (Trade.import_country_id == country_id) |
        (Trade.export_country_id == country_id)
    ).all()

    for trade in trades:

        # -----------------------------------------------------
        # MONEY TRADE
        # -----------------------------------------------------

        if trade.trade_type == "money":

            # IMPORTANT:
            # Use the crisis value from the SAME ROUND
            # in which this trade happened.
            reference_value = get_resource_value(
                db,
                trade.resource_id,
                trade.round_id
            )

            actual_price = Decimal(str(trade.price))

            if trade.import_country_id == country_id:

                if actual_price < reference_value:
                    good_trade_bonus += GOOD_TRADE_BONUS

                elif actual_price > reference_value:
                    bad_trade_penalty += BAD_TRADE_PENALTY

            elif trade.export_country_id == country_id:

                if actual_price > reference_value:
                    good_trade_bonus += GOOD_TRADE_BONUS

                elif actual_price < reference_value:
                    bad_trade_penalty += BAD_TRADE_PENALTY

        # -----------------------------------------------------
        # RESOURCE TRADE
        # -----------------------------------------------------

        elif trade.trade_type == "resource":

            if not trade.payment_resource_id:
                continue

            received_value = (
                Decimal(trade.quantity)
                * get_resource_value(
                    db,
                    trade.resource_id,
                    trade.round_id
                )
            )

            payment_value = (
                Decimal(trade.payment_quantity)
                * get_resource_value(
                    db,
                    trade.payment_resource_id,
                    trade.round_id
                )
            )

            if trade.import_country_id == country_id:

                if received_value > payment_value:
                    good_trade_bonus += GOOD_TRADE_BONUS

                elif received_value < payment_value:
                    bad_trade_penalty += BAD_TRADE_PENALTY

            elif trade.export_country_id == country_id:

                if payment_value > received_value:
                    good_trade_bonus += GOOD_TRADE_BONUS

                elif payment_value < received_value:
                    bad_trade_penalty += BAD_TRADE_PENALTY

    # =========================================================
    # FINAL SCORE
    # =========================================================

    final_score = (
        wealth_score
        + export_score
        + import_score
        + good_trade_bonus
        - bad_trade_penalty
    )

    return {
        "country_id": country.id,
        "country_name": country.name,
        "wealth_score": wealth_score,
        "export_score": export_score,
        "import_score": import_score,
        "good_trade_bonus": good_trade_bonus,
        "bad_trade_penalty": bad_trade_penalty,
        "final_score": final_score,
    }