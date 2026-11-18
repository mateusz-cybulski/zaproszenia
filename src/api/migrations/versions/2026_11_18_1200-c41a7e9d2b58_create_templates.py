"""create templates

Revision ID: c41a7e9d2b58
Revises: 8d2b6f4e1c37
Create Date: 2026-11-18 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "c41a7e9d2b58"
down_revision: str | Sequence[str] | None = "8d2b6f4e1c37"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "templates",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_uid", sa.String(length=128), nullable=True),
        sa.Column("system_key", sa.String(length=100), nullable=True),
        sa.Column(
            "kind",
            sa.Enum(
                "invitation",
                "envelope",
                name="templatekind",
                native_enum=False,
                length=32,
            ),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("pages", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("fields", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
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
        sa.CheckConstraint(
            "(owner_uid IS NULL) <> (system_key IS NULL)",
            name=op.f("ck_templates_owner_or_system"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_templates")),
        sa.UniqueConstraint("system_key", name=op.f("uq_templates_system_key")),
    )
    op.create_index(op.f("ix_templates_owner_uid"), "templates", ["owner_uid"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_templates_owner_uid"), table_name="templates")
    op.drop_table("templates")
