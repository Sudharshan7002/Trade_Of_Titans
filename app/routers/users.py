from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.country import Country
from app.core.security import hash_password
from app.core.auth import get_current_user
from app.schemas.user import UserCreate

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)
optional_security = HTTPBearer(auto_error=False)


@router.post("/")
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_security),
):
    has_users = db.query(User.id).first() is not None
    if has_users:
        if credentials is None:
            raise HTTPException(status_code=401, detail="Administrator authentication required")
        if get_current_user(credentials, db).role != "admin":
            raise HTTPException(status_code=403, detail="Administrator role required")
    elif user_data.role != "admin":
        raise HTTPException(status_code=400, detail="The first user must be an administrator")

    if user_data.role not in [
        "country",
        "trading_center",
        "admin",
        "ranking"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    existing = db.query(User).filter(
        User.username == user_data.username
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    if user_data.role == "country" and user_data.country_id is None:
        raise HTTPException(
            status_code=400,
            detail="Country users require country_id"
        )

    if user_data.country_id is not None and not db.get(Country, user_data.country_id):
        raise HTTPException(
            status_code=404,
            detail="Country not found"
        )

    if user_data.role != "country":
        user_data.country_id = None

    new_user = User(
        username=user_data.username,
        password_hash=hash_password(user_data.password),
        role=user_data.role,
        country_id=user_data.country_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "username": new_user.username,
        "role": new_user.role,
        "country_id": new_user.country_id
    }
