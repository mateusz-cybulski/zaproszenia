"""create events

Revision ID: e6a14c3b8f29
Revises: d3b81f0e7c26
Create Date: 2026-11-19 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e6a14c3b8f29"
down_revision: str | Sequence[str] | None = "d3b81f0e7c26"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_uid", sa.String(length=128), nullable=False),
        sa.Column("name", sa.String(length=300), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("timezone", sa.String(length=64), nullable=False),
        sa.Column("venue_name", sa.String(length=300), nullable=True),
        sa.Column("invitation_text", sa.Text(), nullable=True),
        sa.Column("invitation_template_id", sa.Integer(), nullable=True),
        sa.Column("envelope_template_id", sa.Integer(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
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
        sa.ForeignKeyConstraint(
            ["envelope_template_id"],
            ["templates.id"],
            name=op.f("fk_events_envelope_template_id_templates"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["invitation_template_id"],
            ["templates.id"],
            name=op.f("fk_events_invitation_template_id_templates"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_events")),
    )
    op.create_index(op.f("ix_events_owner_uid"), "events", ["owner_uid"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_events_owner_uid"), table_name="events")
    op.drop_table("events")
