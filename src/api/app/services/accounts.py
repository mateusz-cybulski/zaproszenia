from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Event, Guest, Profile, Template
from app.storage import Storage
from app.storage_keys import user_files_prefix


async def delete_account_data(session: AsyncSession, storage: Storage, owner_uid: str) -> None:
    """Remove everything the user created: rows first, then their files."""
    async with session.begin():
        for model in (Event, Guest, Template, Profile):
            await session.execute(delete(model).where(model.owner_uid == owner_uid))
    await storage.delete_prefix(user_files_prefix(owner_uid))
