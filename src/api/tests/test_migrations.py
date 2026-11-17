from alembic import command
from alembic.config import Config

from tests.conftest import API_ROOT


def test_migrations_match_models() -> None:
    """The migrated test database (see conftest) has no drift from app.models."""
    command.check(Config(str(API_ROOT / "alembic.ini")))
