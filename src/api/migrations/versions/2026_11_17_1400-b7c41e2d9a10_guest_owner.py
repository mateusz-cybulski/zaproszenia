"""guest owner

Revision ID: b7c41e2d9a10
Revises: 56695e4a541e
Create Date: 2026-11-17 14:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b7c41e2d9a10"
down_revision: str | Sequence[str] | None = "56695e4a541e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # Guests created before accounts existed get an empty owner, which no account has, so
    # nobody sees them. Assign them with: UPDATE guests SET owner_uid = '<uid>' WHERE owner_uid = ''
    op.add_column(
        "guests",
        sa.Column("owner_uid", sa.String(length=128), nullable=False, server_default=""),
    )
    op.alter_column("guests", "owner_uid", server_default=None)
    op.create_index(op.f("ix_guests_owner_uid"), "guests", ["owner_uid"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_guests_owner_uid"), table_name="guests")
    op.drop_column("guests", "owner_uid")
