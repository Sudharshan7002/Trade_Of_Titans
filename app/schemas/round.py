from pydantic import BaseModel, ConfigDict


class RoundCreate(BaseModel):
    round_number: int


class RoundResponse(BaseModel):
    id: int
    round_number: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)