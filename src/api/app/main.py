from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from pydantic import BaseModel

from app.db import create_engine_and_sessionmaker
from app.routers import auth, guests


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    engine, sessionmaker = create_engine_and_sessionmaker()
    app.state.sessionmaker = sessionmaker
    yield
    await engine.dispose()


app = FastAPI(title="Zaproszenia API", lifespan=lifespan)
app.include_router(auth.router)
app.include_router(guests.router)


class HelloResponse(BaseModel):
    message: str


@app.get("/")
async def hello() -> HelloResponse:
    return HelloResponse(message="hello")
