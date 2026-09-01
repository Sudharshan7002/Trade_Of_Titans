from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class CountryCreate(BaseModel):
    name: str
    username: str
    password: str
    money: Decimal


class CountryResponse(BaseModel):
    id: int
    name: str
    username: str
    money: Decimal

    model_config = ConfigDict(from_attributes=True)