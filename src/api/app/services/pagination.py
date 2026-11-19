from dataclasses import dataclass

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession


@dataclass(frozen=True)
class PageRequest:
    page: int
    page_size: int


async def paginate[Row](
    session: AsyncSession, statement: Select[Row], request: PageRequest
) -> tuple[list[Row], int]:
    """One page of an ordered statement and how many rows it has in all.

    The statement must end its ordering on a unique column (the id), or rows can move between pages.
    """
    total_statement = select(func.count()).select_from(statement.order_by(None).subquery())
    total = await session.scalar(total_statement) or 0
    page_statement = statement.limit(request.page_size).offset(
        (request.page - 1) * request.page_size
    )
    rows = list(await session.scalars(page_statement))
    return rows, total
