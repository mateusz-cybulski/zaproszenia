import re

import pytest
from pydantic import ValidationError

from app.settings import Settings


@pytest.mark.parametrize(
    "url",
    [
        "postgresql+psycopg://api:api@localhost:5432/api",
        "postgresql+psycopg://api:secret@/api?host=/cloudsql/project:europe-west1:db",
        "postgresql+psycopg://user:pass@ep-x.eu-central-1.aws.neon.tech/neondb?sslmode=require",
    ],
)
def test_accepts_psycopg_urls(url: str) -> None:
    assert Settings(database_url=url).database_url == url


@pytest.mark.parametrize(
    ("url", "message"),
    [
        ("postgresql://api:api@localhost/api", "must start with postgresql+psycopg://"),
        ("not a url", "not a valid database URL"),
    ],
)
def test_rejects_other_urls_with_a_validation_error(url: str, message: str) -> None:
    with pytest.raises(ValidationError, match=re.escape(message)):
        Settings(database_url=url)
