from pydantic import BaseModel, ConfigDict


class CrisisCreate(BaseModel):
    round_id: int
    resource_id: int
    value_modifier: float


class CrisisResponse(BaseModel):
    id: int
    round_id: int
    resource_id: int
    value_modifier: float

    model_config = ConfigDict(from_attributes=True)