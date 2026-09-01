from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.crisis import Crisis
from app.models.round import Round
from app.models.resource import Resource
from app.models.user import User
from app.schemas.crisis import CrisisCreate, CrisisResponse
from app.core.auth import require_role

router = APIRouter(
    prefix="/crises",
    tags=["Crises"]
)


@router.post("/", response_model=CrisisResponse)
def create_crisis(
    crisis: CrisisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    round_obj = db.get(Round, crisis.round_id)

    if not round_obj:
        raise HTTPException(
            status_code=404,
            detail="Round not found"
        )

    resource = db.get(Resource, crisis.resource_id)

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    if crisis.value_modifier <= 0:
        raise HTTPException(
            status_code=400,
            detail="Value modifier must be greater than zero"
        )

    existing = db.query(Crisis).filter(
        Crisis.round_id == crisis.round_id,
        Crisis.resource_id == crisis.resource_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="This resource already has a crisis in this round"
        )

    new_crisis = Crisis(
        round_id=crisis.round_id,
        resource_id=crisis.resource_id,
        value_modifier=crisis.value_modifier
    )

    db.add(new_crisis)
    db.commit()
    db.refresh(new_crisis)

    return new_crisis


@router.get("/", response_model=list[CrisisResponse])
def get_crises(
    db: Session = Depends(get_db)
):
    return db.query(Crisis).all()


@router.get(
    "/round/{round_id}",
    response_model=list[CrisisResponse]
)
def get_round_crises(
    round_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Crisis).filter(
        Crisis.round_id == round_id
    ).all()


@router.get(
    "/round/{round_id}/resource/{resource_id}",
    response_model=CrisisResponse
)
def get_resource_crisis(
    round_id: int,
    resource_id: int,
    db: Session = Depends(get_db)
):
    crisis = db.query(Crisis).filter(
        Crisis.round_id == round_id,
        Crisis.resource_id == resource_id
    ).first()

    if not crisis:
        raise HTTPException(
            status_code=404,
            detail="No crisis for this resource in this round"
        )

    return crisis