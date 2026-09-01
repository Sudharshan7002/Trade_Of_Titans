from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Inventory(Base):
    __tablename__ = "inventories"

    id: Mapped[int] = mapped_column(primary_key=True)

    country_id: Mapped[int] = mapped_column(
        ForeignKey("countries.id"),
        nullable=False
    )

    resource_id: Mapped[int] = mapped_column(
        ForeignKey("resources.id"),
        nullable=False
    )

    quantity: Mapped[int] = mapped_column(nullable=False, default=0)

    country = relationship("Country", back_populates="inventories")
    resource = relationship("Resource", back_populates="inventories")