from sqlalchemy import Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Game(Base):
    __tablename__ = "games"

    id: Mapped[int] = mapped_column(primary_key=True)

    is_started: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    is_finished: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )