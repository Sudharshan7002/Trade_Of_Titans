from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.game import Game
from app.models.round import Round
from app.models.user import User
from app.models.final_ranking import FinalRanking
from app.schemas.game import GameResponse
from app.services.ranking_service import calculate_rankings
from app.core.auth import require_role


router = APIRouter(
    prefix="/game",
    tags=["Game Control"]
)


@router.post("/start", response_model=GameResponse)
def start_game(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("admin")
    )
):
    game = db.query(Game).first()

    if not game:
        game = Game(
            is_started=True,
            is_finished=False
        )

        db.add(game)

    else:

        if game.is_finished:
            raise HTTPException(
                status_code=400,
                detail="Game has already finished"
            )

        game.is_started = True

    db.commit()
    db.refresh(game)

    return game


@router.post("/end")
def end_game(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("admin")
    )
):
    game = db.query(Game).first()

    if not game:
        raise HTTPException(
            status_code=404,
            detail="Game does not exist"
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
    # MAKE SURE NO ROUND IS CURRENTLY ACTIVE
    # ---------------------------------------------------------

    active_round = db.query(Round).filter(
        Round.is_active == True
    ).first()

    if active_round:
        raise HTTPException(
            status_code=400,
            detail="Cannot end game while a round is active"
        )

    # ---------------------------------------------------------
    # CALCULATE FINAL RANKINGS
    # ---------------------------------------------------------

    rankings = calculate_rankings(db)

    # ---------------------------------------------------------
    # SAVE FINAL RANKINGS
    # ---------------------------------------------------------

    for ranking in rankings:

        final_ranking = FinalRanking(
            country_id=ranking["country_id"],
            country_name=ranking["country_name"],
            final_money=ranking["money"],
            score=ranking["score"],
            rank=ranking["rank"]
        )

        db.add(final_ranking)

    # ---------------------------------------------------------
    # FINISH GAME
    # ---------------------------------------------------------

    game.is_started = False
    game.is_finished = True

    db.commit()

    winner = rankings[0] if rankings else None

    return {
        "message": "Game finished",
        "winner": winner,
        "rankings": rankings
    }


@router.post("/reset", response_model=GameResponse)
def reset_game(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Prepare the current game record for a new tournament.

    Countries, resources, inventories, and rounds are retained. Final rankings are
    deleted because they belong to the concluded tournament being reopened.
    """
    game = db.query(Game).first()
    if not game:
        game = Game(is_started=False, is_finished=False)
        db.add(game)
    else:
        db.query(FinalRanking).delete()
        db.query(Round).filter(Round.is_active == True).update({Round.is_active: False})
        game.is_started = False
        game.is_finished = False

    db.commit()
    db.refresh(game)
    return game


@router.get(
    "/status",
    response_model=GameResponse
)
def get_game_status(
    db: Session = Depends(get_db)
):
    game = db.query(Game).first()

    if not game:
        game = Game(is_started=False, is_finished=False)
        db.add(game)
        db.commit()
        db.refresh(game)

    return game
