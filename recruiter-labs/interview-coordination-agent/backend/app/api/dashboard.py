from datetime import datetime, time, timedelta, timezone
from typing import List
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.api.interviews import to_list_item
from app.database import get_db
from app.enums import InterviewState
from app.models import CalendarEvent, Interview, Message, WorkflowEvent
from app.schemas import DashboardResponse, WorkflowEventOut
from app.security import require_user


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _states(*states: InterviewState) -> List[str]:
    return [state.value for state in states]


@router.get("", response_model=DashboardResponse)
def dashboard(
    db: Session = Depends(get_db),
    user_email: str = Depends(require_user),
) -> DashboardResponse:
    del user_email
    london = ZoneInfo("Europe/London")
    today_local = datetime.now(london).date()
    today_start = datetime.combine(today_local, time.min, tzinfo=london).astimezone(timezone.utc)
    today_end = today_start + timedelta(days=1)
    upcoming_end = today_start + timedelta(days=14)

    base_query = db.query(Interview).options(
        joinedload(Interview.candidate),
        joinedload(Interview.client_contact),
        joinedload(Interview.company),
        joinedload(Interview.job),
    )

    today = (
        base_query.filter(Interview.scheduled_start_at >= today_start, Interview.scheduled_start_at < today_end)
        .order_by(Interview.scheduled_start_at)
        .limit(12)
        .all()
    )
    awaiting = (
        base_query.filter(
            Interview.state.in_(
                _states(
                    InterviewState.AWAITING_BOTH,
                    InterviewState.AWAITING_CANDIDATE_AVAILABILITY,
                    InterviewState.AWAITING_CLIENT_AVAILABILITY,
                ),
            ),
        )
        .order_by(Interview.updated_at.desc())
        .limit(12)
        .all()
    )
    approval = (
        base_query.filter(Interview.state == InterviewState.AWAITING_RECRUITER_APPROVAL.value)
        .order_by(Interview.updated_at.desc())
        .limit(12)
        .all()
    )
    upcoming = (
        base_query.filter(
            Interview.state == InterviewState.SCHEDULED.value,
            Interview.scheduled_start_at >= today_start,
            Interview.scheduled_start_at < upcoming_end,
        )
        .order_by(Interview.scheduled_start_at)
        .limit(24)
        .all()
    )
    reschedules = (
        base_query.filter(Interview.state == InterviewState.RESCHEDULE_REQUESTED.value)
        .order_by(Interview.updated_at.desc())
        .limit(12)
        .all()
    )
    completed = (
        base_query.filter(Interview.state.in_(_states(InterviewState.COMPLETED, InterviewState.FEEDBACK_PENDING)))
        .order_by(Interview.updated_at.desc())
        .limit(12)
        .all()
    )
    failed_message_interview_ids = [
        row[0]
        for row in db.query(Message.interview_id)
        .filter(Message.status == "failed")
        .distinct()
        .limit(50)
        .all()
    ]
    failed_calendar_interview_ids = [
        row[0]
        for row in db.query(CalendarEvent.interview_id)
        .filter(CalendarEvent.status == "failed")
        .distinct()
        .limit(50)
        .all()
    ]
    alert_ids = set(failed_message_interview_ids + failed_calendar_interview_ids)
    error_workflows = db.query(Interview).filter(Interview.state == InterviewState.ERROR.value).count()
    alert_ids.update(row[0] for row in db.query(Interview.id).filter(Interview.state == InterviewState.ERROR.value).limit(50).all())
    alerts = (
        base_query.filter(Interview.id.in_(alert_ids)).order_by(Interview.updated_at.desc()).limit(12).all()
        if alert_ids
        else []
    )
    events = db.query(WorkflowEvent).order_by(WorkflowEvent.created_at.desc()).limit(30).all()
    failed_messages = db.query(Message).filter(Message.status == "failed").count()
    failed_calendar_events = db.query(CalendarEvent).filter(CalendarEvent.status == "failed").count()
    operational_alerts = failed_messages + failed_calendar_events + error_workflows

    return DashboardResponse(
        counts={
            "new_interview": 1,
            "today": len(today),
            "awaiting_responses": len(awaiting),
            "needs_approval": len(approval),
            "upcoming": len(upcoming),
            "reschedule_requests": len(reschedules),
            "completed": len(completed),
            "operational_alerts": operational_alerts,
            "failed_messages": failed_messages,
            "failed_calendar_events": failed_calendar_events,
            "error_workflows": error_workflows,
        },
        today=[to_list_item(interview) for interview in today],
        awaiting_responses=[to_list_item(interview) for interview in awaiting],
        needs_approval=[to_list_item(interview) for interview in approval],
        upcoming=[to_list_item(interview) for interview in upcoming],
        reschedule_requests=[to_list_item(interview) for interview in reschedules],
        completed=[to_list_item(interview) for interview in completed],
        operational_alerts=[to_list_item(interview) for interview in alerts],
        activity_log=[
            WorkflowEventOut(
                id=event.id,
                event_type=event.event_type,
                from_state=event.from_state,
                to_state=event.to_state,
                actor_type=event.actor_type,
                actor_id=event.actor_id,
                metadata_json=event.metadata_json or {},
                created_at=event.created_at,
            )
            for event in events
        ],
    )
