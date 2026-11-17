"""Sample guests for local development: `python -m app.seed [owner_uid]`.

compose runs it after the migrations. It adds the guests only when the owner has none yet,
so restarts and a list you have edited stay untouched. The default owner is the local
DEV_AUTH_USER account, the one the API signs every local request in as.
"""

import asyncio
import os
import sys
from datetime import UTC, datetime

from sqlalchemy import exists, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import create_engine_and_sessionmaker
from app.models import Guest, VerificationStatus
from app.settings import get_settings

SAMPLE_GUESTS: tuple[dict[str, str | None], ...] = (
    {
        "full_name": "Anna Kowalska",
        "position": "Dyrektor",
        "institution": "Muzeum Narodowe w Krakowie",
        "salutation": "Szanowna Pani Dyrektor",
        "street": "al. 3 Maja 1",
        "postal_code": "30-062",
        "city": "Kraków",
    },
    {
        "full_name": "prof. dr hab. Jan Nowak",
        "position": "Rektor",
        "institution": "Uniwersytet Warszawski",
        "salutation": "Jego Magnificencja Rektor",
        "street": "ul. Krakowskie Przedmieście 26/28",
        "postal_code": "00-927",
        "city": "Warszawa",
    },
    {
        "full_name": "Piotr Wiśniewski",
        "position": "Prezydent Miasta",
        "institution": "Urząd Miasta Gdańska",
        "salutation": "Szanowny Panie Prezydencie",
        "street": "ul. Nowe Ogrody 8/12",
        "postal_code": "80-803",
        "city": "Gdańsk",
    },
    {
        "full_name": "Katarzyna Zielińska",
        "position": "Redaktor naczelna",
        "institution": "Gazeta Lokalna",
        "salutation": "Szanowna Pani Redaktor",
    },
    {
        "full_name": "Tomasz Lewandowski",
        "position": None,
        "institution": None,
        "salutation": "Szanowny Panie",
    },
    {
        # The whole institution is invited, not a person.
        "full_name": None,
        "position": None,
        "institution": "Redakcja Radia Kraków",
        "salutation": "Szanowni Państwo",
        "street": "al. Słowackiego 22",
        "postal_code": "30-007",
        "city": "Kraków",
    },
)


def default_owner_uid() -> str:
    dev_user = get_settings().dev_auth_user
    if not dev_user:
        raise SystemExit("DEV_AUTH_USER is not set: pass the owner's uid as an argument.")
    return f"dev:{dev_user}"  # the uid app.auth gives the DEV_AUTH_USER account


async def seed_guests(session: AsyncSession, owner_uid: str) -> int:
    """Adds the sample guests to an owner without guests; returns how many were added."""
    async with session.begin():
        if await session.scalar(select(exists().where(Guest.owner_uid == owner_uid))):
            return 0
        guests = [Guest(owner_uid=owner_uid, **data) for data in SAMPLE_GUESTS]
        # One verified guest, so the list shows more than one status.
        guests[0].verification_status = VerificationStatus.VERIFIED_MANUAL
        guests[0].verified_at = datetime.now(UTC)
        session.add_all(guests)
    return len(guests)


async def main(owner_uid: str) -> None:
    engine, sessionmaker = create_engine_and_sessionmaker()
    try:
        async with sessionmaker() as session:
            added = await seed_guests(session, owner_uid)
    finally:
        await engine.dispose()
    print(f"Sample guests for {owner_uid}: " + (f"added {added}" if added else "already present"))


if __name__ == "__main__":
    # Cloud Run sets K_SERVICE: sample data never goes to a real database.
    if os.environ.get("K_SERVICE"):
        raise SystemExit("app.seed is for local development only.")
    asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else default_owner_uid()))
