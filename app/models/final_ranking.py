from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class FinalRanking(Base):
    __tablename__ = "final_rankings"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    country_id: Mapped[int] = mapped_column(
        ForeignKey("countries.id"),
        nullable=False
    )

    country_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    final_money: Mapped[float] = mapped_column(
        Numeric(15, 2),
        nullable=False
    )

    score: Mapped[float] = mapped_column(
        Numeric(15, 2),
        nullable=False
    )

    rank: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )