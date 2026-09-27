from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session, joinedload

from app.config import get_settings
from app.database import get_db
from app.models import AvailabilityLink, Interview
from app.schemas import (
    PublicAvailabilityInfo,
    PublicAvailabilitySubmit,
    PublicAvailabilitySubmitResponse,
)
from app.services.availability_links import find_active_availability_link
from app.services.workflow import WorkflowService
from app.security import client_key, enforce_rate_limit


router = APIRouter(prefix="/api/public/availability", tags=["public-availability"])


def _load_link(db: Session, token: str) -> AvailabilityLink:
    link = find_active_availability_link(db, get_settings(), token)
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This availability link has expired or is invalid.")
    link = (
        db.query(AvailabilityLink)
        .options(
            joinedload(AvailabilityLink.interview).joinedload(Interview.candidate),
            joinedload(AvailabilityLink.interview).joinedload(Interview.client_contact),
            joinedload(AvailabilityLink.interview).joinedload(Interview.company),
            joinedload(AvailabilityLink.interview).joinedload(Interview.job),
            joinedload(AvailabilityLink.participant),
        )
        .filter(AvailabilityLink.id == link.id)
        .one()
    )
    return link


def _dt(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


@router.get("/{token}", response_model=PublicAvailabilityInfo)
def availability_info(token: str, request: Request, db: Session = Depends(get_db)) -> PublicAvailabilityInfo:
    settings = get_settings()
    enforce_rate_limit(f"{client_key(request, 'public_availability')}:{token[:8]}", settings.public_rate_limit_attempts, 15 * 60)
    link = _load_link(db, token)
    interview = link.interview
    return PublicAvailabilityInfo(
        participant_name=link.participant.name,
        participant_type=link.participant_type,
        candidate_name=interview.candidate.full_name,
        client_name=interview.client_contact.full_name,
        company_name=interview.company.name,
        job_title=interview.job.title,
        stage=interview.stage,
        duration_minutes=interview.duration_minutes,
        timezone=link.participant.timezone,
        expires_at=_dt(link.expires_at) or link.expires_at,
        submitted_at=_dt(link.submitted_at),
    )


@router.post("/{token}", response_model=PublicAvailabilitySubmitResponse)
def submit_availability(
    token: str,
    payload: PublicAvailabilitySubmit,
    request: Request,
    db: Session = Depends(get_db),
) -> PublicAvailabilitySubmitResponse:
    settings = get_settings()
    enforce_rate_limit(f"{client_key(request, 'public_availability_submit')}:{token[:8]}", settings.public_rate_limit_attempts, 15 * 60)
    link = _load_link(db, token)
    interview = link.interview
    participant = link.participant
    windows = [window.model_dump() for window in payload.windows]

    try:
        WorkflowService().submit_structured_availability(db, interview, participant, windows, payload.notes)
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    link.submitted_at = datetime.now(timezone.utc)
    link.status = "submitted"
    db.add(link)
    db.commit()
    db.refresh(interview)
    return PublicAvailabilitySubmitResponse(
        ok=True,
        state=interview.state,
        message="Thanks, that's come through. David will get it coordinated.",
    )
