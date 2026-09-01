from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Crisis(Base):
    __tablename__ = "crises"

    id: Mapped[int] = mapped_column(primary_key=True)

    round_id: Mapped[int] = mapped_column(
        ForeignKey("rounds.id"),
        nullable=False
    )

    resource_id: Mapped[int] = mapped_column(
        ForeignKey("resources.id"),
        nullable=False
    )

    value_modifier: Mapped[float] = mapped_column(
        Numeric(5, 2),
        nullable=False
    )

    resource = relationship(
        "Resource",
        back_populates="crises"
    )