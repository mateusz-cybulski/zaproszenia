from pydantic import BaseModel

DEFAULT_PAGE_SIZE = 100
MAX_PAGE_SIZE = 500


class Page[Item](BaseModel):
    items: list[Item]
    total: int
    page: int
    page_size: int
