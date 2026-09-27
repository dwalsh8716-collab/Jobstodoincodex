from datetime import datetime
from zoneinfo import ZoneInfo

from app.services.availability_parser import RuleBasedAvailabilityParser
from app.services.scheduling import SchedulingWindow, find_top_slots


def _windows(text: str):
    parser = RuleBasedAvailabilityParser()
    result = parser.parse(
        text,
        "Europe/London",
        datetime(2026, 8, 17, 9, 0, tzinfo=ZoneInfo("Europe/London")),
    )
    return [
        SchedulingWindow(
            start_at=window.start_at,
            end_at=window.end_at,
            timezone=window.timezone,
            participant_type="candidate",
            confidence=window.confidence,
            source_id="test",
        )
        for window in result.availability
    ]


def test_expected_overlap_is_tuesday_after_1500_local() -> None:
    client = _windows("Tuesday after 2 or Wednesday morning.")
    candidate = _windows("Tuesday works any time after 3.")

    slots = find_top_slots(
        candidate,
        client,
        45,
        display_timezone="Europe/London",
        earliest_start=datetime(2026, 8, 17, 9, 0, tzinfo=ZoneInfo("UTC")),
    )

    assert slots
    first_local = slots[0].start_at.astimezone(ZoneInfo("Europe/London"))
    assert first_local.date().isoformat() == "2026-08-18"
    assert first_local.hour == 15
    assert slots[0].end_at.astimezone(ZoneInfo("Europe/London")).hour == 15
    assert slots[0].end_at.astimezone(ZoneInfo("Europe/London")).minute == 45


def test_no_overlap_returns_no_slots() -> None:
    client = _windows("Tuesday morning.")
    candidate = _windows("Tuesday after 3.")

    slots = find_top_slots(
        candidate,
        client,
        45,
        display_timezone="Europe/London",
        earliest_start=datetime(2026, 8, 17, 9, 0, tzinfo=ZoneInfo("UTC")),
    )

    assert slots == []


def test_british_summer_time_converts_to_utc_correctly() -> None:
    parser = RuleBasedAvailabilityParser()
    result = parser.parse(
        "Monday after 2.",
        "Europe/London",
        datetime(2026, 5, 31, 9, 0, tzinfo=ZoneInfo("Europe/London")),
    )

    assert result.availability[0].start_at.isoformat().endswith("+01:00")
    assert result.availability[0].start_at.astimezone(ZoneInfo("UTC")).hour == 13
