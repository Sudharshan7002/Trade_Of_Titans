from sqlalchemy.orm import Session

from app.models.country import Country
from app.services.scoring_service import calculate_country_score


def calculate_rankings(db: Session):

    countries = db.query(Country).all()

    rankings = []

    for country in countries:

        score_data = calculate_country_score(db, country.id)
        score = float(score_data["final_score"]) if score_data else 0.0

        rankings.append({
            "country_id": country.id,
            "country_name": country.name,
            "money": country.money,
            "score": score
        })

    rankings.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    for position, ranking in enumerate(
        rankings,
        start=1
    ):
        ranking["rank"] = position

    return rankings
