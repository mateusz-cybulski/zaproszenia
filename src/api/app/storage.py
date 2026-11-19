import asyncio
import shutil
from contextlib import suppress
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Protocol

from fastapi import Depends
from google.api_core.exceptions import NotFound
from google.cloud.storage import Client

from app.settings import get_settings


class Storage(Protocol):
    async def put(self, key: str, data: bytes, content_type: str) -> None: ...

    async def get(self, key: str) -> bytes:
        """Raises FileNotFoundError when there is no such file."""
        ...

    async def delete(self, key: str) -> None: ...

    async def delete_prefix(self, prefix: str) -> None: ...


class LocalStorage:
    def __init__(self, root: Path) -> None:
        self.root = root.resolve()

    def _path(self, key: str) -> Path:
        path = (self.root / key).resolve()
        if not path.is_relative_to(self.root):
            raise ValueError(f"Storage key outside the storage root: {key}")
        return path

    async def put(self, key: str, data: bytes, content_type: str) -> None:
        path = self._path(key)

        def write() -> None:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)

        await asyncio.to_thread(write)

    async def get(self, key: str) -> bytes:
        return await asyncio.to_thread(self._path(key).read_bytes)

    async def delete(self, key: str) -> None:
        await asyncio.to_thread(self._path(key).unlink, missing_ok=True)

    async def delete_prefix(self, prefix: str) -> None:
        path = self._path(prefix)
        if path == self.root:
            raise ValueError("Refusing to delete the whole storage root")
        await asyncio.to_thread(shutil.rmtree, path, ignore_errors=True)


class GcsStorage:
    def __init__(self, bucket_name: str) -> None:
        self.bucket = Client().bucket(bucket_name)

    async def put(self, key: str, data: bytes, content_type: str) -> None:
        blob = self.bucket.blob(key)
        await asyncio.to_thread(blob.upload_from_string, data, content_type=content_type)

    async def get(self, key: str) -> bytes:
        try:
            data: bytes = await asyncio.to_thread(self.bucket.blob(key).download_as_bytes)
        except NotFound as error:
            raise FileNotFoundError(key) from error
        return data

    async def delete(self, key: str) -> None:
        with suppress(NotFound):
            await asyncio.to_thread(self.bucket.blob(key).delete)

    async def delete_prefix(self, prefix: str) -> None:
        if not prefix.strip("/"):
            raise ValueError("Refusing to delete the whole bucket")

        def delete_all() -> None:
            for blob in self.bucket.list_blobs(prefix=prefix):
                with suppress(NotFound):
                    blob.delete()

        await asyncio.to_thread(delete_all)


@lru_cache
def get_storage() -> Storage:
    settings = get_settings()
    if settings.storage_bucket:
        return GcsStorage(settings.storage_bucket)
    if settings.local_storage_dir:
        return LocalStorage(settings.local_storage_dir)
    raise RuntimeError("Set STORAGE_BUCKET or LOCAL_STORAGE_DIR to store files")


FileStorage = Annotated[Storage, Depends(get_storage)]
