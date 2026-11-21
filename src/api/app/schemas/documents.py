from typing import Literal

from pydantic import BaseModel


class DocumentRequest(BaseModel):
    # The user saw the warnings (unverified guests, incomplete sender) and goes ahead anyway.
    confirmed: bool = False


class DocumentProblem(BaseModel):
    """Why a document was not generated: 409 with this as its detail."""

    code: Literal["no_guests", "no_template", "needs_confirmation"]
    unverified: int = 0
    sender_incomplete: bool = False
