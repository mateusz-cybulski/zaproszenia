"""guest timestamps and address

Revision ID: 8d2b6f4e1c37
Revises: 3e8f0a6c52d1
Create Date: 2026-11-17 18:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "8d2b6f4e1c37"
down_revision: str | Sequence[str] | None = "3e8f0a6c52d1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "guests",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    # Existing guests were last changed no later than when they were created, as far as we know.
    op.execute("UPDATE guests SET updated_at = created_at")

    op.add_column("guests", sa.Column("street", sa.String(length=300), nullable=True))
    op.add_column("guests", sa.Column("postal_code", sa.String(length=20), nullable=True))
    op.add_column("guests", sa.Column("city", sa.String(length=200), nullable=True))
    # The default only fills existing rows; the model sets the country itself.
    op.add_column(
        "guests",
        sa.Column("country", sa.String(length=2), server_default="PL", nullable=False),
    )
    op.alter_column("guests", "country", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("guests", "country")
    op.drop_column("guests", "city")
    op.drop_column("guests", "postal_code")
    op.drop_column("guests", "street")
    op.drop_column("guests", "updated_at")
