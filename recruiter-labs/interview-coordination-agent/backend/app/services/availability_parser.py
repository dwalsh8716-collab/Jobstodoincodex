from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
import re
from typing import List, Optional
from zoneinfo import ZoneInfo

from app.enums import Intent


WEEKDAYS = {
    "monday": 0,
    "mon": 0,
    "tuesday": 1,
    "tues": 1,
    "tue": 1,
    "wednesday": 2,
    "weds": 2,
    "wed": 2,
    "thursday": 3,
    "thurs": 3,
    "thu": 3,
    "friday": 4,
    "fri": 4,
}


@dataclass(frozen=True)
class ParsedAvailabilityWindow:
    date: date
    start_at: datetime
    end_at: datetime
    timezone: str
    original_text: str
    interpretation: str
    confidence: float
    requires_clarification: bool = False


@dataclass(frozen=True)
class AvailabilityParseResult:
    intent: Intent
    confidence: float
    availability: List[ParsedAvailabilityWindow]
    requires_clarification: bool
    clarification_reason: Optional[str] = None


@dataclass(frozen=True)
class ParsedClock:
    hour: int
    minute: int
    suffix: Optional[str]
    raw_hour: int


class AmbiguousTimeError(ValueError):
    pass


def classify_intent(text: str) -> Intent:
    lowered = text.lower()
    cancellation_terms = [
        "cancel",
        "call it off",
        "not going ahead",
        "withdraw",
        "no longer wants to meet",
    ]
    reschedule_terms = [
        "reschedule",
        "move this",
        "move it",
        "move the interview",
        "something has come up",
        "do friday instead",
        "do another time",
        "change the time",
    ]

    if any(term in lowered for term in cancellation_terms):
        return Intent.CANCELLATION_REQUEST
    if any(term in lowered for term in reschedule_terms):
        return Intent.RESCHEDULE_REQUEST
    if any(day in lowered for day in WEEKDAYS) or "next week" in lowered or "tomorrow" in lowered:
        return Intent.AVAILABILITY_RESPONSE
    if any(term in lowered for term in ["free", "available", "can do", "works", "flexible"]):
        return Intent.AVAILABILITY_RESPONSE
    return Intent.OTHER


def _zone(timezone_name: str) -> ZoneInfo:
    try:
        return ZoneInfo(timezone_name)
    except Exception:
        return ZoneInfo("Europe/London")


def _next_weekday(reference: datetime, weekday: int) -> date:
    days_ahead = weekday - reference.weekday()
    if days_ahead < 0:
        days_ahead += 7
    return (reference + timedelta(days=days_ahead)).date()


def _next_week_dates(reference: datetime) -> List[date]:
    days_until_next_monday = (7 - reference.weekday()) % 7
    if days_until_next_monday == 0:
        days_until_next_monday = 7
    monday = (reference + timedelta(days=days_until_next_monday)).date()
    return [monday + timedelta(days=index) for index in range(5)]


def _parse_clock(
    raw: str,
    context: str,
    *,
    infer_pm_from_context: bool = False,
    reject_bare_low_hour: bool = False,
) -> ParsedClock:
    value = raw.strip().lower().replace(".", "")
    match = re.match(r"^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$", value)
    if not match:
        raise ValueError("Could not parse time")

    hour = int(match.group(1))
    raw_hour = hour
    minute = int(match.group(2) or 0)
    suffix = match.group(3)

    if suffix == "pm" and hour < 12:
        hour += 12
    elif suffix == "am" and hour == 12:
        hour = 0
    elif suffix is None and infer_pm_from_context and hour <= 7 and any(
        word in context for word in ["after", "afternoon", "lunch"]
    ):
        hour += 12
    elif suffix is None and reject_bare_low_hour and 1 <= hour <= 7:
        raise AmbiguousTimeError("Bare low-hour time needs am/pm clarification")

    if hour < 0 or hour > 23 or minute < 0 or minute > 59:
        raise ValueError("Time outside range")
    return ParsedClock(hour=hour, minute=minute, suffix=suffix, raw_hour=raw_hour)


def _parse_clock_range(start_raw: str, end_raw: str, context: str) -> tuple[ParsedClock, ParsedClock]:
    start = _parse_clock(start_raw, context, infer_pm_from_context=True)
    end = _parse_clock(end_raw, context, infer_pm_from_context=True)
    if end.suffix is None and end.hour <= start.hour and 1 <= end.raw_hour <= 7:
        end = ParsedClock(hour=end.hour + 12, minute=end.minute, suffix=end.suffix, raw_hour=end.raw_hour)
    return start, end


def _combine(day: date, hour: int, minute: int, timezone_name: str) -> datetime:
    return datetime.combine(day, time(hour, minute), tzinfo=_zone(timezone_name))


def _window(
    day: date,
    start_hour: int,
    start_minute: int,
    end_hour: int,
    end_minute: int,
    timezone_name: str,
    original_text: str,
    interpretation: str,
    confidence: float = 0.9,
) -> ParsedAvailabilityWindow:
    start = _combine(day, start_hour, start_minute, timezone_name)
    end = _combine(day, end_hour, end_minute, timezone_name)
    return ParsedAvailabilityWindow(
        date=day,
        start_at=start,
        end_at=end,
        timezone=timezone_name,
        original_text=original_text,
        interpretation=interpretation,
        confidence=confidence,
    )


class RuleBasedAvailabilityParser:
    """Phase 1 parser for common scheduling replies.

    This deliberately favours obvious interpretations and escalates vague text.
    A future OpenAI provider can sit behind the same result shape.
    """

    def parse(
        self,
        text: str,
        timezone_name: str = "Europe/London",
        reference_datetime: Optional[datetime] = None,
    ) -> AvailabilityParseResult:
        reference = reference_datetime or datetime.now(_zone(timezone_name))
        if reference.tzinfo is None:
            reference = reference.replace(tzinfo=_zone(timezone_name))

        clean_text = " ".join(text.strip().split())
        lowered = clean_text.lower()
        intent = classify_intent(clean_text)

        if intent in [Intent.RESCHEDULE_REQUEST, Intent.CANCELLATION_REQUEST]:
            return AvailabilityParseResult(
                intent=intent,
                confidence=0.94,
                availability=[],
                requires_clarification=False,
            )

        windows: List[ParsedAvailabilityWindow] = []
        unparsed_named_days: List[str] = []

        if "next week" in lowered and any(term in lowered for term in ["flexible", "free", "available", "any time"]):
            excluded_weekdays = set()
            for name, number in WEEKDAYS.items():
                if f"apart from {name}" in lowered or f"except {name}" in lowered:
                    excluded_weekdays.add(number)
            for day in _next_week_dates(reference):
                if day.weekday() not in excluded_weekdays:
                    windows.append(
                        _window(
                            day,
                            9,
                            0,
                            17,
                            30,
                            timezone_name,
                            clean_text,
                            f"Flexible on {day.isoformat()} during normal interview hours.",
                            0.86,
                        ),
                    )

        for day_name, weekday in WEEKDAYS.items():
            if not re.search(rf"\b{re.escape(day_name)}\b", lowered):
                continue

            day = _next_weekday(reference, weekday)
            day_context = self._extract_day_context(lowered, day_name)
            before_count = len(windows)

            except_match = re.search(
                r"except\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*[-–]\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)",
                day_context,
            )
            if ("any time" in day_context or "any time" in lowered or "all day" in day_context) and except_match:
                start_block, end_block = _parse_clock_range(except_match.group(1), except_match.group(2), day_context)
                if (start_block.hour, start_block.minute) > (9, 0):
                    windows.append(
                        _window(
                            day,
                            9,
                            0,
                            start_block.hour,
                            start_block.minute,
                            timezone_name,
                            clean_text,
                            f"Available on {day_name.title()} before {start_block.hour:02d}:{start_block.minute:02d}.",
                            0.88,
                        ),
                    )
                if (end_block.hour, end_block.minute) < (17, 30):
                    windows.append(
                        _window(
                            day,
                            end_block.hour,
                            end_block.minute,
                            17,
                            30,
                            timezone_name,
                            clean_text,
                            f"Available on {day_name.title()} after {end_block.hour:02d}:{end_block.minute:02d}.",
                            0.88,
                        ),
                    )
                continue

            at_match = re.search(r"\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)", day_context)
            if at_match:
                try:
                    clock = _parse_clock(at_match.group(1), day_context, reject_bare_low_hour=True)
                except AmbiguousTimeError:
                    return AvailabilityParseResult(
                        intent=Intent.AVAILABILITY_RESPONSE,
                        confidence=0.48,
                        availability=[],
                        requires_clarification=True,
                        clarification_reason="The reply gives a time without am/pm and could be misread.",
                    )
                windows.append(
                    _window(
                        day,
                        clock.hour,
                        clock.minute,
                        min(clock.hour + 1, 23),
                        clock.minute,
                        timezone_name,
                        clean_text,
                        f"Available on {day_name.title()} at {clock.hour:02d}:{clock.minute:02d}.",
                        0.91,
                    ),
                )
                continue

            after_match = re.search(
                r"\bafter\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)",
                day_context,
            )
            if after_match:
                clock = _parse_clock(after_match.group(1), day_context, infer_pm_from_context=True)
                windows.append(
                    _window(
                        day,
                        clock.hour,
                        clock.minute,
                        17,
                        30,
                        timezone_name,
                        clean_text,
                        f"Available on {day_name.title()} after {clock.hour:02d}:{clock.minute:02d}.",
                        0.9,
                    ),
                )
                continue

            if "after lunch" in day_context:
                windows.append(
                    _window(
                        day,
                        13,
                        0,
                        17,
                        30,
                        timezone_name,
                        clean_text,
                        f"Available on {day_name.title()} after lunch.",
                        0.88,
                    ),
                )
                continue

            if "morning" in day_context:
                windows.append(
                    _window(
                        day,
                        9,
                        0,
                        12,
                        0,
                        timezone_name,
                        clean_text,
                        f"Available on {day_name.title()} morning.",
                        0.9,
                    ),
                )
                continue

            if "afternoon" in day_context:
                windows.append(
                    _window(
                        day,
                        13,
                        0,
                        17,
                        30,
                        timezone_name,
                        clean_text,
                        f"Available on {day_name.title()} afternoon.",
                        0.9,
                    ),
                )
                continue

            if "any time" in day_context or "all day" in day_context or any(
                term in day_context for term in ["works", "free", "available", "can do"]
            ):
                windows.append(
                    _window(
                        day,
                        9,
                        0,
                        17,
                        30,
                        timezone_name,
                        clean_text,
                        f"Available on {day_name.title()} during normal interview hours.",
                        0.82,
                    ),
                )

            if len(windows) == before_count and not (
                f"apart from {day_name}" in lowered or f"except {day_name}" in lowered
            ):
                unparsed_named_days.append(day_name)

        if windows:
            if unparsed_named_days:
                return AvailabilityParseResult(
                    intent=Intent.AVAILABILITY_RESPONSE,
                    confidence=0.5,
                    availability=[],
                    requires_clarification=True,
                    clarification_reason=(
                        "The reply mentions a day without a clear time window, so it needs clarification."
                    ),
                )
            return AvailabilityParseResult(
                intent=Intent.AVAILABILITY_RESPONSE,
                confidence=max(window.confidence for window in windows),
                availability=windows,
                requires_clarification=False,
            )

        if intent == Intent.AVAILABILITY_RESPONSE:
            return AvailabilityParseResult(
                intent=Intent.AVAILABILITY_RESPONSE,
                confidence=0.42,
                availability=[],
                requires_clarification=True,
                clarification_reason="The reply sounds like availability, but the time window is not clear enough.",
            )

        return AvailabilityParseResult(
            intent=Intent.OTHER,
            confidence=0.3,
            availability=[],
            requires_clarification=True,
            clarification_reason="The reply does not contain clear availability.",
        )

    def _extract_day_context(self, lowered: str, day_name: str) -> str:
        start = lowered.find(day_name)
        if start == -1:
            return lowered
        next_positions = [
            lowered.find(other, start + len(day_name))
            for other in WEEKDAYS
            if other != day_name and lowered.find(other, start + len(day_name)) != -1
        ]
        end = min(next_positions) if next_positions else len(lowered)
        return lowered[start:end]
