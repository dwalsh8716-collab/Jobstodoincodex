from dataclasses import dataclass
from datetime import datetime, time, timedelta, timezone
from typing import Iterable, List, Optional, Sequence
from zoneinfo import ZoneInfo


@dataclass(frozen=True)
class SchedulingWindow:
    start_at: datetime
    end_at: datetime
    timezone: str
    participant_type: str
    confidence: float
    source_id: str


@dataclass(frozen=True)
class SlotOption:
    start_at: datetime
    end_at: datetime
    timezone: str
    score: float
    reasons: List[str]

    def as_dict(self) -> dict:
        return {
            "start_at": self.start_at.astimezone(timezone.utc).isoformat(),
            "end_at": self.end_at.astimezone(timezone.utc).isoformat(),
            "timezone": self.timezone,
            "score": self.score,
            "reasons": self.reasons,
        }


def _zone(timezone_name: str) -> ZoneInfo:
    try:
        return ZoneInfo(timezone_name)
    except Exception:
        return ZoneInfo("Europe/London")


def _aware_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _ceil_to_interval(value: datetime, minutes: int) -> datetime:
    value = value.replace(second=0, microsecond=0)
    remainder = value.minute % minutes
    if remainder:
        value = value + timedelta(minutes=minutes - remainder)
    return value


def _parse_hhmm(value: str) -> time:
    hour, minute = value.split(":")
    return time(int(hour), int(minute))


def _inside_scheduling_hours(
    start_at: datetime,
    end_at: datetime,
    timezone_name: str,
    schedule_start: str,
    schedule_end: str,
) -> bool:
    local_start = start_at.astimezone(_zone(timezone_name))
    local_end = end_at.astimezone(_zone(timezone_name))
    if local_start.weekday() > 4 or local_end.weekday() > 4:
        return False
    return _parse_hhmm(schedule_start) <= local_start.time() and local_end.time() <= _parse_hhmm(schedule_end)


def _conflicts(start_at: datetime, end_at: datetime, busy_windows: Sequence[SchedulingWindow]) -> bool:
    for busy in busy_windows:
        busy_start = _aware_utc(busy.start_at)
        busy_end = _aware_utc(busy.end_at)
        if start_at < busy_end and end_at > busy_start:
            return True
    return False


def find_top_slots(
    candidate_windows: Iterable[SchedulingWindow],
    client_windows: Iterable[SchedulingWindow],
    duration_minutes: int,
    display_timezone: str = "Europe/London",
    schedule_start: str = "09:00",
    schedule_end: str = "17:30",
    recruiter_busy: Sequence[SchedulingWindow] = (),
    interviewer_busy: Sequence[SchedulingWindow] = (),
    limit: int = 3,
    earliest_start: Optional[datetime] = None,
) -> List[SlotOption]:
    options: List[SlotOption] = []
    duration = timedelta(minutes=duration_minutes)
    step = timedelta(minutes=15)
    earliest = _aware_utc(earliest_start or datetime.now(timezone.utc))

    for candidate in candidate_windows:
        for client in client_windows:
            overlap_start = max(_aware_utc(candidate.start_at), _aware_utc(client.start_at))
            overlap_end = min(_aware_utc(candidate.end_at), _aware_utc(client.end_at))
            cursor = _ceil_to_interval(overlap_start, 15)

            while cursor + duration <= overlap_end:
                slot_end = cursor + duration
                if cursor >= earliest and _inside_scheduling_hours(
                    cursor,
                    slot_end,
                    display_timezone,
                    schedule_start,
                    schedule_end,
                ):
                    if not _conflicts(cursor, slot_end, recruiter_busy) and not _conflicts(
                        cursor,
                        slot_end,
                        interviewer_busy,
                    ):
                        confidence = min(candidate.confidence, client.confidence)
                        waiting_penalty = max((cursor - datetime.now(timezone.utc)).total_seconds(), 0) / 86400
                        score = round(100 + confidence * 10 - waiting_penalty, 3)
                        options.append(
                            SlotOption(
                                start_at=cursor,
                                end_at=slot_end,
                                timezone=display_timezone,
                                score=score,
                                reasons=[
                                    "Earliest workable overlap.",
                                    "Candidate and client availability both cover this slot.",
                                    "No required attendee conflict found.",
                                ],
                            ),
                        )
                cursor = cursor + step

    deduped = {}
    for option in options:
        key = (option.start_at.isoformat(), option.end_at.isoformat())
        if key not in deduped or option.score > deduped[key].score:
            deduped[key] = option

    return sorted(deduped.values(), key=lambda option: (option.start_at, -option.score))[:limit]
