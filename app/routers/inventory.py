from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventory import Inventory
from app.models.user import User
from app.core.auth import require_role
from app.schemas.inventory import InventoryCreate, InventoryResponse

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.post("/", response_model=InventoryResponse)
def create_inventory(
    inventory: InventoryCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role("admin")),
):
    existing = db.query(Inventory).filter(
        Inventory.country_id == inventory.country_id,
        Inventory.resource_id == inventory.resource_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Inventory already exists for this country and resource"
        )

    new_inventory = Inventory(
        country_id=inventory.country_id,
        resource_id=inventory.resource_id,
        quantity=inventory.quantity
    )

    db.add(new_inventory)
    db.commit()
    db.refresh(new_inventory)

    return new_inventory


@router.get("/", response_model=list[InventoryResponse])
def get_inventory(db: Session = Depends(get_db)):
    return db.query(Inventory).all()


@router.get("/country/{country_id}", response_model=list[InventoryResponse])
def get_country_inventory(
    country_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Inventory).filter(
        Inventory.country_id == country_id
    ).all()
