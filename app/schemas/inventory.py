from pydantic import BaseModel, ConfigDict


class InventoryCreate(BaseModel):
    country_id: int
    resource_id: int
    quantity: int


class InventoryResponse(BaseModel):
    id: int
    country_id: int
    resource_id: int
    quantity: int

    model_config = ConfigDict(from_attributes=True)