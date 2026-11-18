"""guest deleted at

Revision ID: a7c2e5d91f34
Revises: 5d3e8b1f6a92
Create Date: 2026-11-18 17:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a7c2e5d91f34"
down_revision: str | Sequence[str] | None = "5d3e8b1f6a92"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("guests", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("guests", "deleted_at")
