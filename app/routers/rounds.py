from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.round import Round
from app.models.game import Game
from app.models.user import User
from app.schemas.round import RoundResponse
from app.core.auth import require_role

router = APIRouter(
    prefix="/rounds",
    tags=["Rounds"]
)


@router.post(
    "/",
    response_model=RoundResponse
)
def create_round(
    round_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("admin")
    )
):
    game = db.query(Game).first()

    if game and game.is_finished:
        raise HTTPException(
            status_code=400,
            detail="Game has already finished"
        )

    existing_round = db.query(Round).filter(
        Round.round_number == round_number
    ).first()

    if existing_round:
        raise HTTPException(
            status_code=400,
            detail="Round number already exists"
        )

    new_round = Round(
        round_number=round_number,
        is_active=False
    )

    db.add(new_round)
    db.commit()
    db.refresh(new_round)

    return new_round


@router.get(
    "/",
    response_model=list[RoundResponse]
)
def get_rounds(
    db: Session = Depends(get_db)
):
    return db.query(Round).order_by(
        Round.round_number
    ).all()


import time

@router.post(
    "/{round_id}/start",
    response_model=RoundResponse
)
def start_round(
    round_id: int,
    duration_minutes: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("admin")
    )
):
    # ---------------------------------------------------------
    # CHECK GAME
    # ---------------------------------------------------------

    game = db.query(Game).first()

    if not game:
        raise HTTPException(
            status_code=400,
            detail="Game has not been initialized"
        )

    if game.is_finished:
        raise HTTPException(
            status_code=400,
            detail="Game has already finished"
        )

    if not game.is_started:
        raise HTTPException(
            status_code=400,
            detail="Game has not started"
        )

    # ---------------------------------------------------------
    # FIND ROUND
    # ---------------------------------------------------------

    round_obj = db.get(
        Round,
        round_id
    )

    if not round_obj:
        raise HTTPException(
            status_code=404,
            detail="Round not found"
        )

    # ---------------------------------------------------------
    # CHECK FOR ANOTHER ACTIVE ROUND
    # ---------------------------------------------------------

    active_round = db.query(Round).filter(
        Round.is_active == True
    ).first()

    if active_round:

        if active_round.id == round_id:
            raise HTTPException(
                status_code=400,
                detail="Round is already active"
            )

        raise HTTPException(
            status_code=400,
            detail="Another round is already active"
        )

    # ---------------------------------------------------------
    # START ROUND
    # ---------------------------------------------------------

    round_obj.is_active = True
    round_obj.duration_minutes = duration_minutes
    round_obj.ends_at_timestamp = time.time() + (duration_minutes * 60)

    db.commit()
    db.refresh(round_obj)

    return round_obj


@router.post(
    "/{round_id}/end",
    response_model=RoundResponse
)
def end_round(
    round_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("admin")
    )
):
    # ---------------------------------------------------------
    # CHECK GAME
    # ---------------------------------------------------------

    game = db.query(Game).first()

    if not game:
        raise HTTPException(
            status_code=400,
            detail="Game has not been initialized"
        )

    if game.is_finished:
        raise HTTPException(
            status_code=400,
            detail="Game has already finished"
        )

    # ---------------------------------------------------------
    # FIND ROUND
    # ---------------------------------------------------------

    round_obj = db.get(
        Round,
        round_id
    )

    if not round_obj:
        raise HTTPException(
            status_code=404,
            detail="Round not found"
        )

    if not round_obj.is_active:
        raise HTTPException(
            status_code=400,
            detail="Round is not active"
        )

    # ---------------------------------------------------------
    # END ROUND
    # ---------------------------------------------------------

    round_obj.is_active = False
    round_obj.ends_at_timestamp = None

    db.commit()
    db.refresh(round_obj)

    return round_obj