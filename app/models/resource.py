from sqlalchemy import String, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    base_value: Mapped[float] = mapped_column(
        Numeric(15, 2),
        nullable=False
    )

    inventories = relationship(
        "Inventory",
        back_populates="resource"
    )

    import_objectives = relationship(
        "ImportObjective",
        back_populates="resource"
    )

    crises = relationship(
        "Crisis",
        back_populates="resource"
    )

    trades = relationship(
        "Trade",
        foreign_keys="Trade.resource_id",
        back_populates="resource"
    )