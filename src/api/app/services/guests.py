from sqlalchemy import ColumnElement, or_

from app.models import Guest

SEARCH_MAX_LENGTH = 200


def _escape_like(text: str) -> str:
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def guest_search(query: str) -> ColumnElement[bool]:
    """Guests whose name or institution contains the query, ignoring case; % and _ are text."""
    pattern = f"%{_escape_like(query.strip())}%"
    return or_(
        Guest.full_name.ilike(pattern, escape="\\"),
        Guest.institution.ilike(pattern, escape="\\"),
    )
