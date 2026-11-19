"""create event guests

Revision ID: f2c9d7a1e5b3
Revises: e6a14c3b8f29
Create Date: 2026-11-19 14:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f2c9d7a1e5b3"
down_revision: str | Sequence[str] | None = "e6a14c3b8f29"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "event_guests",
        sa.Column("event_id", sa.Integer(), nullable=False),
        sa.Column("guest_id", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "added",
                "generated",
                "sent",
                "accepted",
                "declined",
                name="invitationstatus",
                native_enum=False,
                length=32,
            ),
            nullable=False,
        ),
        sa.Column(
            "added_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["event_id"],
            ["events.id"],
            name=op.f("fk_event_guests_event_id_events"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["guest_id"],
            ["guests.id"],
            name=op.f("fk_event_guests_guest_id_guests"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("event_id", "guest_id", name=op.f("pk_event_guests")),
    )
    op.create_index(op.f("ix_event_guests_guest_id"), "event_guests", ["guest_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_event_guests_guest_id"), table_name="event_guests")
    op.drop_table("event_guests")
