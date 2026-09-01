from sqlalchemy import Integer, Boolean
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