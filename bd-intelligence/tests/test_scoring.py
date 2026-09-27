from src.scoring import score_company


def test_high_intent_manchester_agency_signal_scores_strongly() -> None:
    company = {
        "id": 1,
        "name": "North Star Digital",
        "sector": "Digital agency",
        "location": "Manchester",
    }
    signals = [
        {
            "signal_title": "Head of Performance role live",
            "signal_text": "Paid Media Director role reposted after a new client win.",
            "signal_type": "hiring",
        }
    ]
    contacts = [
        {
            "first_name": "Sarah",
            "last_name": "Turner",
            "job_title": "Managing Director",
            "relationship_type": "existing CRM relationship",
        }
    ]

    result = score_company(company, signals, contacts)

    assert result["total_score"] == 100
    labels = [item["label"] for item in result["score_breakdown"]]
    assert "Target sector match" in labels
    assert "Hiring manager/decision-maker identified" in labels


def test_weak_outside_market_without_contact_is_deprioritised() -> None:
    company = {
        "id": 2,
        "name": "Far Away Manufacturing",
        "sector": "Manufacturing",
        "location": "Sydney",
    }
    result = score_company(company, [], [])

    assert result["total_score"] == 0
    labels = [item["label"] for item in result["score_breakdown"]]
    assert "Weak relevance" in labels
    assert "No useful contact found" in labels

