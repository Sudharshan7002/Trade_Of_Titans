from pydantic import BaseModel


class TradeConfirmation(BaseModel):
    trade_id: int