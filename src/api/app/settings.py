import os
from functools import lru_cache
from pathlib import Path

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Not PostgresDsn: it rejects the Cloud SQL socket form without a host part
    # (postgresql+psycopg://user:password@/database?host=/cloudsql/<instance>).
    database_url: str
    database_pool_size: int = 5
    database_max_overflow: int = 5

    # Identity Platform allows session cookies of up to 14 days.
    session_days: int = Field(default=7, ge=1, le=14)
    # Every request is signed in as this email, without Google (local development only).
    dev_auth_user: str | None = None

    # Cloud Run gets STORAGE_BUCKET from Terraform; local development keeps files in a directory.
    storage_bucket: str | None = None
    local_storage_dir: Path | None = None

    # Cloud Run gets GOOGLE_CLOUD_PROJECT from Terraform; locally the ADC's quota project is used.
    google_cloud_project: str | None = None
    gemini_model: str = "gemini-3.8-flash"
    gemini_location: str = "global"
    # From Secret Manager on Cloud Run; locally optional, without it addresses are not geocoded.
    geocoding_api_key: SecretStr | None = None

    @field_validator("dev_auth_user")
    @classmethod
    def _no_dev_auth_on_cloud_run(cls, value: str | None) -> str | None:
        # Cloud Run sets K_SERVICE; a leaked dev setting must never open production.
        if value and os.environ.get("K_SERVICE"):
            raise ValueError("DEV_AUTH_USER must not be set on Cloud Run")
        return value or None

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
