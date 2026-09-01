from pydantic import BaseModel, ConfigDict


class ImportObjectiveCreate(BaseModel):
    country_id: int
    resource_id: int
    required_quantity: int


class ImportObjectiveResponse(BaseModel):
    id: int
    country_id: int
    resource_id: int
    required_quantity: int
    imported_quantity: int

    model_config = ConfigDict(from_attributes=True)