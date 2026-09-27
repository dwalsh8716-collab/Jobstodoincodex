from datetime import datetime
from zoneinfo import ZoneInfo

from app.enums import Intent
from app.services.availability_parser import RuleBasedAvailabilityParser


def test_extracts_common_client_availability() -> None:
    parser = RuleBasedAvailabilityParser()
    result = parser.parse(
        "Tuesday after 2 or Wednesday morning.",
        "Europe/London",
        datetime(2026, 8, 17, 9, 0, tzinfo=ZoneInfo("Europe/London")),
    )

    assert result.intent == Intent.AVAILABILITY_RESPONSE
    assert result.requires_clarification is False
    assert len(result.availability) == 2

    tuesday = result.availability[0]
    assert tuesday.date.isoformat() == "2026-08-18"
    assert tuesday.start_at.hour == 14
    assert tuesday.end_at.hour == 17

    wednesday = result.availability[1]
    assert wednesday.date.isoformat() == "2026-08-19"
    assert wednesday.start_at.hour == 9
    assert wednesday.end_at.hour == 12


def test_ambiguous_availability_is_not_guessed() -> None:
    parser = RuleBasedAvailabilityParser()
    result = parser.parse(
        "Could maybe do later next week.",
        "Europe/London",
        datetime(2026, 8, 17, 9, 0, tzinfo=ZoneInfo("Europe/London")),
    )

    assert result.requires_clarification is True
    assert result.availability == []
    assert result.confidence < 0.82


def test_reschedule_intent_is_detected() -> None:
    parser = RuleBasedAvailabilityParser()
    result = parser.parse("Sorry, something has come up. Can we move this?", "Europe/London")

    assert result.intent == Intent.RESCHEDULE_REQUEST
    assert result.requires_clarification is False


def test_cancellation_intent_is_detected() -> None:
    parser = RuleBasedAvailabilityParser()
    result = parser.parse("We need to cancel this interview, unfortunately.", "Europe/London")

    assert result.intent == Intent.CANCELLATION_REQUEST
    assert result.requires_clarification is False


def test_minutes_are_preserved_for_specific_times() -> None:
    parser = RuleBasedAvailabilityParser()
    result = parser.parse(
        "Wednesday at 10:30.",
        "Europe/London",
        datetime(2026, 8, 17, 9, 0, tzinfo=ZoneInfo("Europe/London")),
    )

    assert result.requires_clarification is False
    window = result.availability[0]
    assert window.start_at.hour == 10
    assert window.start_at.minute == 30
    assert window.end_at.hour == 11
    assert window.end_at.minute == 30


def test_minutes_are_preserved_for_after_times() -> None:
    parser = RuleBasedAvailabilityParser()
    result = parser.parse(
        "Wednesday after 10:30.",
        "Europe/London",
        datetime(2026, 8, 17, 9, 0, tzinfo=ZoneInfo("Europe/London")),
    )

    assert result.requires_clarification is False
    window = result.availability[0]
    assert window.start_at.hour == 10
    assert window.start_at.minute == 30
    assert window.end_at.hour == 17
    assert window.end_at.minute == 30


def test_bare_low_hour_at_time_requires_clarification() -> None:
    parser = RuleBasedAvailabilityParser()
    result = parser.parse(
        "Thursday at 4.",
        "Europe/London",
        datetime(2026, 8, 17, 9, 0, tzinfo=ZoneInfo("Europe/London")),
    )

    assert result.requires_clarification is True
    assert result.availability == []


def test_common_uk_weekday_abbreviations_are_supported() -> None:
    parser = RuleBasedAvailabilityParser()
    result = parser.parse(
        "Tues afternoon works.",
        "Europe/London",
        datetime(2026, 8, 17, 9, 0, tzinfo=ZoneInfo("Europe/London")),
    )

    assert result.requires_clarification is False
    assert result.availability[0].date.isoformat() == "2026-08-18"
    assert result.availability[0].start_at.hour == 13


def test_any_time_except_range_creates_windows_around_exclusion() -> None:
    parser = RuleBasedAvailabilityParser()
    result = parser.parse(
        "Any time Wednesday except 12-2.",
        "Europe/London",
        datetime(2026, 8, 17, 9, 0, tzinfo=ZoneInfo("Europe/London")),
    )

    assert result.requires_clarification is False
    assert len(result.availability) == 2
    assert result.availability[0].start_at.hour == 9
    assert result.availability[0].end_at.hour == 12
    assert result.availability[1].start_at.hour == 14
    assert result.availability[1].end_at.hour == 17


def test_partially_qualified_multi_day_reply_is_not_silently_partially_parsed() -> None:
    parser = RuleBasedAvailabilityParser()
    result = parser.parse(
        "Tuesday or Wednesday morning.",
        "Europe/London",
        datetime(2026, 8, 17, 9, 0, tzinfo=ZoneInfo("Europe/London")),
    )

    assert result.requires_clarification is True
    assert result.availability == []
