from sqlalchemy import ForeignKey, Numeric, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Trade(Base):
    __tablename__ = "trades"

    id: Mapped[int] = mapped_column(primary_key=True)

    round_id: Mapped[int] = mapped_column(
        ForeignKey("rounds.id"),
        nullable=False
    )

    import_country_id: Mapped[int] = mapped_column(
        ForeignKey("countries.id"),
        nullable=False
    )

    export_country_id: Mapped[int] = mapped_column(
        ForeignKey("countries.id"),
        nullable=False
    )

    resource_id: Mapped[int] = mapped_column(
        ForeignKey("resources.id"),
        nullable=False
    )

    payment_resource_id: Mapped[int | None] = mapped_column(
        ForeignKey("resources.id"),
        nullable=True
    )

    payment_quantity: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    price: Mapped[float] = mapped_column(
        Numeric(15, 2),
        nullable=False
    )

    trade_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False
    )

    resource = relationship(
        "Resource",
        foreign_keys=[resource_id],
        back_populates="trades"
    )

    payment_resource = relationship(
        "Resource",
        foreign_keys=[payment_resource_id]
    )