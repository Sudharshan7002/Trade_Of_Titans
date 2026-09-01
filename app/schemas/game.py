from pydantic import BaseModel, ConfigDict


class GameResponse(BaseModel):
    id: int
    is_started: bool
    is_finished: bool

    model_config = ConfigDict(from_attributes=True)