"""template pdf key

Revision ID: 5d3e8b1f6a92
Revises: c41a7e9d2b58
Create Date: 2026-11-18 14:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "5d3e8b1f6a92"
down_revision: str | Sequence[str] | None = "c41a7e9d2b58"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("templates", sa.Column("pdf_key", sa.String(length=500), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("templates", "pdf_key")
