"""create profiles

Revision ID: d3b81f0e7c26
Revises: a7c2e5d91f34
Create Date: 2026-11-19 10:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d3b81f0e7c26"
down_revision: str | Sequence[str] | None = "a7c2e5d91f34"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "profiles",
        sa.Column("owner_uid", sa.String(length=128), nullable=False),
        sa.Column("sender_name", sa.String(length=300), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("street", sa.String(length=300), nullable=True),
        sa.Column("postal_code", sa.String(length=20), nullable=True),
        sa.Column("city", sa.String(length=200), nullable=True),
        sa.Column("country", sa.String(length=2), nullable=False),
        sa.PrimaryKeyConstraint("owner_uid", name=op.f("pk_profiles")),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("profiles")
