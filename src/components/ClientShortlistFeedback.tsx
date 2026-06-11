"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  recruiterLabsDeclineReasonLabels,
  recruiterLabsDeclineReasons,
  recruiterLabsFeedbackActionLabels,
  type RecruiterLabsDeclineReason,
  type RecruiterLabsFeedbackAction,
} from "@/lib/recruiter-labs-feedback-shared";

type ClientShortlistFeedbackProps = {
  candidateId: string;
  enabled: boolean;
};

const quickActions: RecruiterLabsFeedbackAction[] = [
  "shortlist",
  "interested",
  "maybe",
  "request_interview",
  "need_more_info",
];

function tokenFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const token = parts[0] === "client" && parts[1] === "shortlist" ? parts[2] : "";
  return token || "";
}

export function ClientShortlistFeedback({
  candidateId,
  enabled,
}: ClientShortlistFeedbackProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [declineOpen, setDeclineOpen] = useState(false);
  const declinePanelRef = useRef<HTMLDivElement>(null);
  const [declineReason, setDeclineReason] =
    useState<RecruiterLabsDeclineReason>("experience_mismatch");
  const [comment, setComment] = useState("");
  const disabledReason = useMemo(
    () =>
      enabled
        ? ""
        : "Feedback is staged. David needs to approve the private portal, database, audit logging and feedback flag before this can submit.",
    [enabled],
  );

  async function submitFeedback(action: RecruiterLabsFeedbackAction) {
    if (!enabled || status === "sending") return;

    setStatus("sending");
    setMessage("");

    const response = await fetch("/api/client-shortlist-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: tokenFromPath(),
        shortlistCandidateId: candidateId,
        action,
        declineReason: action === "decline" ? declineReason : undefined,
        comment: comment || undefined,
      }),
    });
    const result = (await response.json()) as { message?: string };

    if (response.ok) {
      setStatus("done");
      setDeclineOpen(false);
      setComment("");
      setMessage(result.message || "Feedback received.");
      return;
    }

    setStatus("error");
    setMessage(result.message || "Feedback could not be sent.");
  }

  useEffect(() => {
    if (!declineOpen) return;
    declinePanelRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setDeclineOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [declineOpen]);

  return (
    <div className="client-feedback-actions">
      <div className="button-row">
        {quickActions.map((action) => (
          <button
            className={`button ${
              action === "request_interview" ? "button-primary" : "button-secondary"
            }`}
            disabled={!enabled || status === "sending"}
            key={action}
            title={disabledReason}
            type="button"
            onClick={() => submitFeedback(action)}
          >
            {recruiterLabsFeedbackActionLabels[action]}
          </button>
        ))}
        <button
          className="button button-secondary"
          disabled={!enabled || status === "sending"}
          title={disabledReason}
          type="button"
          aria-expanded={declineOpen}
          onClick={() => setDeclineOpen((open) => !open)}
        >
          {recruiterLabsFeedbackActionLabels.decline}
        </button>
      </div>

      {declineOpen ? (
        <div
          ref={declinePanelRef}
          aria-labelledby={`decline-feedback-${candidateId}`}
          aria-modal="true"
          className="client-feedback-panel"
          role="dialog"
          tabIndex={-1}
        >
          <h4 id={`decline-feedback-${candidateId}`}>Why decline?</h4>
          <div className="client-feedback-reasons">
            {recruiterLabsDeclineReasons.map((reason) => (
              <label key={reason}>
                <input
                  checked={declineReason === reason}
                  name={`decline-reason-${candidateId}`}
                  type="radio"
                  value={reason}
                  onChange={() => setDeclineReason(reason)}
                />
                <span>{recruiterLabsDeclineReasonLabels[reason]}</span>
              </label>
            ))}
          </div>
          <label className="client-feedback-comment">
            <span>Optional comment</span>
            <textarea
              maxLength={1000}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </label>
          <div className="button-row">
            <button
              className="button button-primary"
              disabled={status === "sending"}
              type="button"
              onClick={() => submitFeedback("decline")}
            >
              Save decline reason
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setDeclineOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {message ? (
        <p
          className="meta"
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}

      {!enabled ? <p className="meta">{disabledReason}</p> : null}
    </div>
  );
}
