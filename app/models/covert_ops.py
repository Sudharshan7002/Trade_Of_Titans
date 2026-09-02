from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from app.models.base import Base


class CovertAction(Base):
    __tablename__ = "covert_actions"

    id = Column(Integer, primary_key=True, index=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False, index=True)
    action_type = Column(String, nullable=False)  # "sabotage" or "shield"
    round_number = Column(Integer, nullable=False, index=True)
    target_country_id = Column(Integer, ForeignKey("countries.id"), nullable=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=True)
    quantity_destroyed = Column(Integer, default=0)
    was_blocked = Column(Boolean, default=False)
    announcement_script = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
