from typing import Any

from fastapi import APIRouter, HTTPException, Response, status

from app.auth import CurrentUser
from app.db import Session
from app.dependencies import OwnEvent
from app.models import TemplateKind
from app.schemas.documents import DocumentRequest
from app.services.documents import DocumentProblemError, event_document
from app.storage import FileStorage

router = APIRouter(prefix="/events/{event_id}/documents", tags=["events"])

PDF_RESPONSE: dict[int | str, dict[str, Any]] = {200: {"content": {"application/pdf": {}}}}


# POST, not GET: generating invitations changes the guests' status.
@router.post("/{kind}", response_class=Response, responses=PDF_RESPONSE)
async def generate_document(
    event: OwnEvent,
    kind: TemplateKind,
    payload: DocumentRequest,
    session: Session,
    user: CurrentUser,
    storage: FileStorage,
) -> Response:
    """Invitations or envelopes for every guest on the event's list, as one PDF to print."""
    try:
        pdf = await event_document(
            session, storage, event, kind, user.uid, confirmed=payload.confirmed
        )
    except DocumentProblemError as error:
        raise HTTPException(status.HTTP_409_CONFLICT, error.problem.model_dump()) from None
    return Response(pdf, media_type="application/pdf", headers={"Cache-Control": "no-store"})
