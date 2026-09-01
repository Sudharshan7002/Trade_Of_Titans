from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.auth import require_role
from app.models.user import User
from app.models.import_objective import ImportObjective
from app.models.country import Country
from app.models.resource import Resource

router = APIRouter(
    prefix="/objectives",
    tags=["Import Objectives"]
)


@router.post("/")
def create_objective(
    country_id: int,
    resource_id: int,
    required_quantity: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    if required_quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Required quantity must be greater than zero"
        )

    country = db.get(Country, country_id)

    if not country:
        raise HTTPException(
            status_code=404,
            detail="Country not found"
        )

    resource = db.get(Resource, resource_id)

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    objective = ImportObjective(
        country_id=country_id,
        resource_id=resource_id,
        required_quantity=required_quantity,
        imported_quantity=0
    )

    db.add(objective)
    db.commit()
    db.refresh(objective)

    return objective


@router.get("/")
def get_all_objectives(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    return db.query(ImportObjective).all()


@router.get("/country/{country_id}")
def get_country_objectives(
    country_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    return db.query(ImportObjective).filter(
        ImportObjective.country_id == country_id
    ).all()