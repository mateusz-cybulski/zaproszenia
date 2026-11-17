from httpx import AsyncClient

from app.main import app
from app.seed import SAMPLE_GUESTS, seed_guests
from tests.conftest import USER


async def test_seeds_sample_guests_once(client: AsyncClient) -> None:
    async with app.state.sessionmaker() as session:
        assert await seed_guests(session, USER.uid) == len(SAMPLE_GUESTS)
    async with app.state.sessionmaker() as session:
        assert await seed_guests(session, USER.uid) == 0

    guests = (await client.get("/guests")).json()
    assert len(guests) == len(SAMPLE_GUESTS)
    assert {guest["verification_status"] for guest in guests} == {"pending", "verified_manual"}
    assert any(guest["full_name"] is None for guest in guests)


async def test_does_not_touch_an_owner_with_guests(client: AsyncClient) -> None:
    await client.post("/guests", json={"full_name": "Jan"})

    async with app.state.sessionmaker() as session:
        assert await seed_guests(session, USER.uid) == 0
    assert len((await client.get("/guests")).json()) == 1
