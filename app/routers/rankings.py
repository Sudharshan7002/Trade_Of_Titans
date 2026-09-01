from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.auth import require_role

from app.models.user import User
from app.models.game import Game
from app.models.final_ranking import FinalRanking

from app.services.ranking_service import calculate_rankings


router = APIRouter(
    prefix="/rankings",
    tags=["Rankings"]
)


@router.get("/")
def get_rankings(
    current_user: User = Depends(
        require_role("ranking", "admin")
    ),
    db: Session = Depends(get_db)
):
    rankings = calculate_rankings(db)

    return {
        "rankings": rankings
    }


@router.get("/final")
def get_final_rankings(
    current_user: User = Depends(
        require_role("ranking", "admin")
    ),
    db: Session = Depends(get_db)
):
    final_rankings = db.query(
        FinalRanking
    ).order_by(
        FinalRanking.rank
    ).all()

    return final_rankings