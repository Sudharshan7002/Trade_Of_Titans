"""add final rankings

Revision ID: 0249e9df1f5d
Revises: abfc4608fc0c
Create Date: 2026-08-22 10:58:28.557141
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0249e9df1f5d"
down_revision: Union[str, Sequence[str], None] = "abfc4608fc0c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.create_table(
        "final_rankings",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "country_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "country_name",
            sa.String(length=100),
            nullable=False
        ),

        sa.Column(
            "final_money",
            sa.Numeric(15, 2),
            nullable=False
        ),

        sa.Column(
            "score",
            sa.Numeric(15, 2),
            nullable=False
        ),

        sa.Column(
            "rank",
            sa.Integer(),
            nullable=False
        ),

        sa.ForeignKeyConstraint(
            ["country_id"],
            ["countries.id"]
        ),

        sa.PrimaryKeyConstraint(
            "id"
        )
    )


def downgrade() -> None:

    op.drop_table("final_rankings")