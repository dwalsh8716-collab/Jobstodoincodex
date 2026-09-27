from __future__ import annotations

from datetime import date

import streamlit as st

from src.daily_digest import build_digest
from src.database import (
    connect,
    get_company_bundle,
    get_latest_outreach,
    get_top_leads,
    initialize_database,
    insert_interaction,
)
from src.models import LEAD_STATUSES
from src.outreach_generator import generate_outreach
from src.scoring import explain_breakdown, score_all


st.set_page_config(page_title="Essential Resourcing BD", layout="wide")

initialize_database()

st.title("BD signals")

with st.sidebar:
    st.header("Filters")
    min_score = st.slider("Minimum score", 0, 100, 0, 5)
    sector = st.text_input("Sector contains")
    location = st.text_input("Location contains")
    status = st.selectbox("Status", [""] + list(LEAD_STATUSES), format_func=lambda value: value or "Any")
    limit = st.slider("Lead count", 5, 50, 10, 5)
    if st.button("Generate scores"):
        count = score_all()
        st.success(f"Scored {count} companies")


with connect() as conn:
    leads = get_top_leads(
        conn,
        limit=limit,
        min_score=min_score,
        sector=sector,
        location=location,
        status=status,
    )

top_score = leads[0]["total_score"] if leads else 0
col1, col2, col3 = st.columns(3)
col1.metric("Top leads", len(leads))
col2.metric("Best score", top_score)
col3.metric("Needs review", sum(1 for lead in leads if (lead.get("current_status") or "New") == "New"))

tab_leads, tab_digest = st.tabs(["Leads", "Daily digest"])

with tab_digest:
    st.text_area("Digest", build_digest(limit=10), height=520)

with tab_leads:
    if not leads:
        st.info("No scored leads yet. Load sample data or import CSVs, then generate scores.")

    for lead in leads:
        with st.container(border=True):
            header_left, header_right = st.columns([3, 1])
            header_left.subheader(f"{lead['name']} - {lead['total_score']}/100")
            header_right.caption(lead.get("current_status") or "New")

            st.write(lead.get("ai_summary") or "No summary yet.")
            st.write(f"Signal: {lead.get('signal_title') or 'No signal stored'}")
            if lead.get("suggested_action"):
                st.write(f"Next action: {lead['suggested_action']}")

            with st.expander("Score breakdown"):
                for label, points, reason in explain_breakdown(lead.get("score_breakdown_json") or "[]"):
                    st.write(f"{points:+} - {label}: {reason}")

            with connect() as conn:
                bundle = get_company_bundle(conn, lead["id"])
                contacts = bundle["contacts"]

            contact_options = {0: "No contact selected"}
            contact_options.update(
                {
                    contact["id"]: (
                        f"{contact.get('first_name', '')} {contact.get('last_name', '')}"
                        f" - {contact.get('job_title', '')}"
                    ).strip()
                    for contact in contacts
                }
            )
            contact_id = st.selectbox(
                "Suggested contact",
                list(contact_options.keys()),
                format_func=lambda key: contact_options[key],
                key=f"contact-{lead['id']}",
            )

            status_col, follow_col, action_col = st.columns([1, 1, 2])
            new_status = status_col.selectbox(
                "Status",
                list(LEAD_STATUSES),
                index=list(LEAD_STATUSES).index(lead.get("current_status") or "New")
                if (lead.get("current_status") or "New") in LEAD_STATUSES
                else 0,
                key=f"status-{lead['id']}",
            )
            follow_up = follow_col.date_input(
                "Follow-up date",
                value=None,
                key=f"follow-{lead['id']}",
            )

            if action_col.button("Save status", key=f"save-status-{lead['id']}"):
                with connect() as conn:
                    insert_interaction(
                        conn,
                        {
                            "company_id": lead["id"],
                            "contact_id": contact_id or None,
                            "status": new_status,
                            "follow_up_date": follow_up.isoformat()
                            if isinstance(follow_up, date)
                            else "",
                            "notes": "Dashboard update",
                        },
                    )
                    conn.commit()
                st.success("Status saved")

            button_cols = st.columns(5)
            if button_cols[0].button("LinkedIn", key=f"li-{lead['id']}"):
                generate_outreach(
                    lead["id"],
                    "linkedin_connection",
                    contact_id=contact_id or None,
                    use_ai=True,
                )
                st.success("LinkedIn draft created")
            if button_cols[1].button("Email", key=f"email-{lead['id']}"):
                generate_outreach(
                    lead["id"],
                    "email",
                    contact_id=contact_id or None,
                    use_ai=True,
                )
                st.success("Email draft created")
            if button_cols[2].button("Copy message", key=f"copy-{lead['id']}"):
                with connect() as conn:
                    latest = get_latest_outreach(conn, lead["id"])
                if latest:
                    st.text_area(
                        "Message",
                        (f"Subject: {latest['subject_line']}\n\n" if latest.get("subject_line") else "")
                        + latest["body"],
                        height=180,
                        key=f"message-{lead['id']}",
                    )
                else:
                    st.warning("Generate a message first.")
            if button_cols[3].button("Contacted", key=f"contacted-{lead['id']}"):
                with connect() as conn:
                    insert_interaction(
                        conn,
                        {
                            "company_id": lead["id"],
                            "contact_id": contact_id or None,
                            "status": "Contacted",
                            "notes": "Marked contacted from dashboard",
                        },
                    )
                    conn.commit()
                st.success("Marked contacted")
            if button_cols[4].button("Dismiss", key=f"dismiss-{lead['id']}"):
                with connect() as conn:
                    insert_interaction(
                        conn,
                        {
                            "company_id": lead["id"],
                            "contact_id": contact_id or None,
                            "status": "Not relevant",
                            "notes": "Dismissed from dashboard",
                        },
                    )
                    conn.commit()
                st.success("Dismissed")

