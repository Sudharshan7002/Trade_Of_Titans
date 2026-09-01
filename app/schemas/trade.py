from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class TradeCreate(BaseModel):
    round_id: int
    import_country_id: int
    export_country_id: int
    resource_id: int
    quantity: int
    price: Decimal
    trade_type: str

    payment_resource_id: int | None = None
    payment_quantity: int | None = None


class TradeResponse(BaseModel):
    id: int
    round_id: int
    import_country_id: int
    export_country_id: int

    resource_id: int
    quantity: int
    price: Decimal
    trade_type: str

    payment_resource_id: int | None
    payment_quantity: int | None

    status: str

    model_config = ConfigDict(
        from_attributes=True
    )