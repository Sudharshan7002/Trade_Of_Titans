from sqlalchemy import Integer, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Round(Base):
    __tablename__ = "rounds"

    id: Mapped[int] = mapped_column(primary_key=True)

    round_number: Mapped[int] = mapped_column(
        Integer,
        unique=True,
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    duration_minutes: Mapped[int | None] = mapped_column(
        Integer,
        default=10,
        nullable=True
    )

    ends_at_timestamp: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )