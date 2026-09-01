from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ResourceCreate(BaseModel):
    name: str
    base_value: Decimal


class ResourceResponse(BaseModel):
    id: int
    name: str
    base_value: Decimal

    model_config = ConfigDict(from_attributes=True)