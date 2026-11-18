import asyncio

from app.db import create_engine_and_sessionmaker
from app.services.templates import SYSTEM_TEMPLATES, ensure_system_templates


async def main() -> None:
    engine, sessionmaker = create_engine_and_sessionmaker()
    try:
        async with sessionmaker() as session, session.begin():
            await ensure_system_templates(session)
    finally:
        await engine.dispose()
    print(f"System templates in sync: {len(SYSTEM_TEMPLATES)}")


if __name__ == "__main__":
    asyncio.run(main())
