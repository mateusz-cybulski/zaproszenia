"""guest recipient and verification

Revision ID: 3e8f0a6c52d1
Revises: b7c41e2d9a10
Create Date: 2026-11-17 16:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "3e8f0a6c52d1"
down_revision: str | Sequence[str] | None = "b7c41e2d9a10"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "guests",
        "name",
        new_column_name="full_name",
        type_=sa.String(length=300),
        existing_type=sa.String(length=200),
        nullable=True,
    )
    op.drop_column("guests", "email")
    op.add_column("guests", sa.Column("position", sa.String(length=300), nullable=True))
    op.add_column("guests", sa.Column("institution", sa.String(length=300), nullable=True))
    op.add_column("guests", sa.Column("salutation", sa.String(length=300), nullable=True))
    op.add_column(
        "guests", sa.Column("declension", postgresql.JSONB(astext_type=sa.Text()), nullable=True)
    )
    # Existing guests start unverified; the default lives in the model, not in the database.
    op.add_column(
        "guests",
        sa.Column(
            "verification_status",
            sa.Enum(
                "pending",
                "verified_ai",
                "verified_manual",
                "needs_review",
                "failed",
                name="verificationstatus",
                native_enum=False,
                length=32,
            ),
            nullable=False,
            server_default="pending",
        ),
    )
    op.alter_column("guests", "verification_status", server_default=None)
    op.add_column(
        "guests",
        sa.Column("verification_result", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.add_column("guests", sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True))
    op.create_check_constraint(
        op.f("ck_guests_recipient_present"),
        "guests",
        "full_name IS NOT NULL OR institution IS NOT NULL",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f("ck_guests_recipient_present"), "guests", type_="check")
    # Guests invited as an institution only have no name to go back to.
    op.execute("UPDATE guests SET full_name = left(coalesce(full_name, institution), 200)")
    op.drop_column("guests", "verified_at")
    op.drop_column("guests", "verification_result")
    op.drop_column("guests", "verification_status")
    op.drop_column("guests", "declension")
    op.drop_column("guests", "salutation")
    op.drop_column("guests", "institution")
    op.drop_column("guests", "position")
    op.add_column("guests", sa.Column("email", sa.String(length=320), nullable=True))
    op.alter_column(
        "guests",
        "full_name",
        new_column_name="name",
        type_=sa.String(length=200),
        existing_type=sa.String(length=300),
        nullable=False,
    )
