from pydantic import BaseModel, ConfigDict


class RoundCreate(BaseModel):
    round_number: int


class RoundResponse(BaseModel):
    id: int
    round_number: int
    is_active: bool
    duration_minutes: int | None = 10
    ends_at_timestamp: float | None = None
    server_timestamp: float | None = None

    model_config = ConfigDict(from_attributes=True)