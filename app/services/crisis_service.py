import random
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.crisis import Crisis
from app.models.resource import Resource
from app.models.round import Round


def generate_crisis(
    db: Session,
    round_id: int
):
    # Check round
    round_obj = db.get(Round, round_id)

    if not round_obj:
        raise HTTPException(
            status_code=404,
            detail="Round not found"
        )

    # Make sure a crisis doesn't already exist
    existing = db.query(Crisis).filter(
        Crisis.round_id == round_id
    ).first()

    if existing:
        return existing

    # Get all resources
    resources = db.query(Resource).all()

    if not resources:
        raise HTTPException(
            status_code=400,
            detail="No resources exist"
        )

    # Random resource
    resource = random.choice(resources)

    # Random modifier: 0.70 to 1.30
    modifier = Decimal(
        str(round(random.uniform(0.70, 1.30), 2))
    )

    crisis = Crisis(
        round_id=round_id,
        resource_id=resource.id,
        value_modifier=modifier
    )

    db.add(crisis)
    db.commit()
    db.refresh(crisis)

    return crisis