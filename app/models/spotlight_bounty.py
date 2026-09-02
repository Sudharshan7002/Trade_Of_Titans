from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.models.base import Base


class SpotlightBounty(Base):
    __tablename__ = "spotlight_bounties"

    id = Column(Integer, primary_key=True, index=True)
    round_number = Column(Integer, nullable=False)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    bounty_claimed = Column(Boolean, default=True)
    reward_description = Column(String, nullable=False)
