from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.country import Country
from app.models.user import User
from app.core.auth import require_role
from app.core.security import hash_password
from app.schemas.country import CountryCreate, CountryResponse

router = APIRouter(prefix="/countries", tags=["Countries"])


@router.post("/", response_model=CountryResponse)
def create_country(
    country: CountryCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role("admin")),
):
    existing = db.query(Country).filter(
        (Country.name == country.name) |
        (Country.username == country.username)
    ).first()

    existing_user = db.query(User).filter(User.username == country.username).first()

    if existing or existing_user:
        raise HTTPException(
            status_code=400,
            detail="Country name or username already exists"
        )

    password_hash = hash_password(country.password)
    new_country = Country(
        name=country.name,
        username=country.username,
        password=password_hash,
        money=country.money
    )

    db.add(new_country)
    db.flush()

    db.add(User(
        username=country.username,
        password_hash=password_hash,
        role="country",
        country_id=new_country.id,
    ))
    db.commit()
    db.refresh(new_country)

    return new_country


@router.get("/", response_model=list[CountryResponse])
def get_countries(db: Session = Depends(get_db)):
    return db.query(Country).all()


@router.get("/{country_id}", response_model=CountryResponse)
def get_country(country_id: int, db: Session = Depends(get_db)):
    country = db.get(Country, country_id)

    if not country:
        raise HTTPException(
            status_code=404,
            detail="Country not found"
        )

    return country
