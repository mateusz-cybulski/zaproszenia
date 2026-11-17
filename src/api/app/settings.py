from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # postgresql+psycopg://user:password@host:5432/database, or on Cloud Run through the
    # Cloud SQL socket: postgresql+psycopg://user:password@/database?host=/cloudsql/<instance>
    # (no host part, which pydantic's PostgresDsn rejects, so it is validated here instead).
    database_url: str
    database_pool_size: int = 5
    database_max_overflow: int = 5

    @field_validator("database_url")
    @classmethod
    def _psycopg_postgres_url(cls, value: str) -> str:
        try:
            drivername = make_url(value).drivername
        except ArgumentError as error:
            # Pydantic reports only ValueError as a validation error; anything else escapes raw.
            raise ValueError("DATABASE_URL is not a valid database URL") from error
        if drivername != "postgresql+psycopg":
            raise ValueError("DATABASE_URL must start with postgresql+psycopg://")
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
