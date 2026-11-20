from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.db import create_engine_and_sessionmaker
from app.routers import auth, event_guests, events, guests, me, templates
from app.storage import StoredFileMissingError


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    engine, sessionmaker = create_engine_and_sessionmaker()
    app.state.sessionmaker = sessionmaker
    yield
    await engine.dispose()


app = FastAPI(title="Zaproszenia API", lifespan=lifespan)
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(event_guests.router)
app.include_router(guests.router)
app.include_router(me.router)
app.include_router(templates.router)


@app.exception_handler(StoredFileMissingError)
async def stored_file_missing(_request: Request, _error: StoredFileMissingError) -> JSONResponse:
    return JSONResponse(
        {"detail": "Plik szablonu zniknął. Wgraj szablon ponownie."},
        status_code=status.HTTP_409_CONFLICT,
    )


class HelloResponse(BaseModel):
    message: str


@app.get("/")
async def hello() -> HelloResponse:
    return HelloResponse(message="hello")
