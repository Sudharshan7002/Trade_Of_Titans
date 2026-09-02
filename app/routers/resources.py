from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.resource import Resource
from app.models.user import User
from app.core.auth import require_role
from app.schemas.resource import ResourceCreate, ResourceResponse

router = APIRouter(prefix="/resources", tags=["Resources"])

_CACHED_RESOURCES = None


def clear_resources_cache():
    global _CACHED_RESOURCES
    _CACHED_RESOURCES = None


@router.post("/", response_model=ResourceResponse)
def create_resource(
    resource: ResourceCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role("admin")),
):
    existing = db.query(Resource).filter(
        Resource.name == resource.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Resource already exists"
        )

    new_resource = Resource(
        name=resource.name,
        base_value=resource.base_value
    )

    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    clear_resources_cache()

    return new_resource


@router.get("/", response_model=list[ResourceResponse])
def get_resources(db: Session = Depends(get_db)):
    global _CACHED_RESOURCES
    if _CACHED_RESOURCES is not None:
        return _CACHED_RESOURCES
    resources = db.query(Resource).all()
    _CACHED_RESOURCES = [ResourceResponse.model_validate(r) for r in resources]
    return _CACHED_RESOURCES


@router.get("/{resource_id}", response_model=ResourceResponse)
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db)
):
    resource = db.get(Resource, resource_id)

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    return resource
