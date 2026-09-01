from sqlalchemy import String, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Country(Base):
    __tablename__ = "countries"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    money: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)

    inventories = relationship("Inventory", back_populates="country")
    import_objectives = relationship("ImportObjective", back_populates="country")