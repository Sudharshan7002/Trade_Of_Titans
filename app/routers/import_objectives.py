from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.import_objective import ImportObjective
from app.models.user import User
from app.core.auth import require_role
from app.schemas.import_objective import (
    ImportObjectiveCreate,
    ImportObjectiveResponse
)

router = APIRouter(
    prefix="/import-objectives",
    tags=["Import Objectives"]
)


@router.post("/", response_model=ImportObjectiveResponse)
def create_import_objective(
    objective: ImportObjectiveCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role("admin")),
):
    existing = db.query(ImportObjective).filter(
        ImportObjective.country_id == objective.country_id,
        ImportObjective.resource_id == objective.resource_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Import objective already exists"
        )

    new_objective = ImportObjective(
        country_id=objective.country_id,
        resource_id=objective.resource_id,
        required_quantity=objective.required_quantity
    )

    db.add(new_objective)
    db.commit()
    db.refresh(new_objective)

    return new_objective


@router.get("/", response_model=list[ImportObjectiveResponse])
def get_import_objectives(
    db: Session = Depends(get_db)
):
    return db.query(ImportObjective).all()


@router.get(
    "/country/{country_id}",
    response_model=list[ImportObjectiveResponse]
)
def get_country_objectives(
    country_id: int,
    db: Session = Depends(get_db)
):
    return db.query(ImportObjective).filter(
        ImportObjective.country_id == country_id
    ).all()
