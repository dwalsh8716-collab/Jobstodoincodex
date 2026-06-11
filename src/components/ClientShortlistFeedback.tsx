"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  recruiterLabsDeclineReasonLabels,
  recruiterLabsDeclineReasons,
  recruiterLabsFeedbackActionLabels,
  type RecruiterLabsDeclineReason,
  type RecruiterLabsFeedbackAction,
} from "@/lib/recruiter-labs-feedback-shared";
import type { RecruiterLabsPortalEngagementEvent } from "@/lib/recruiter-labs-engagement-shared";

type ClientShortlistFeedbackProps = {
  candidateId: string;
  enabled: boolean;
};

const quickActions: RecruiterLabsFeedbackAction[] = [
  "shortlist",
  "interested",
  "maybe",
  "need_more_info",
];

function tokenFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const token = parts[0] === "client" && parts[1] === "shortlist" ? parts[2] : "";
  return token || "";
}

function emitPrivateEngagement(
  eventType: RecruiterLabsPortalEngagementEvent,
  shortlistCandidateId: string,
) {
  window.dispatchEvent(
    new CustomEvent("client-shortlist-engagement", {
      detail: { eventType, shortlistCandidateId },
    }),
  );
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
  const [interviewOpen, setInterviewOpen] = useState(false);
  const declineWasOpenedRef = useRef(false);
  const interviewPanelRef = useRef<HTMLDivElement>(null);
  const declinePanelRef = useRef<HTMLDivElement>(null);
  const [declineReason, setDeclineReason] =
    useState<RecruiterLabsDeclineReason>("experience_mismatch");
  const [comment, setComment] = useState("");
  const [preferredTimes, setPreferredTimes] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [locationPreference, setLocationPreference] = useState<
    "to_be_confirmed" | "google_meet" | "phone" | "physical"
  >("to_be_confirmed");
  const disabledReason = useMemo(
    () =>
      enabled
        ? ""
        : "Feedback is staged. David needs to approve the private portal, database, audit logging and feedback flag before this can submit.",
    [enabled],
  );

  function interviewTypeFromLocationPreference() {
    if (locationPreference === "google_meet") return "video";
    if (locationPreference === "phone") return "phone";
    if (locationPreference === "physical") return "in_person";
    return "to_be_confirmed";
  }

  async function submitFeedback(
    action: RecruiterLabsFeedbackAction,
    interviewDetails?: {
      preferredTimes?: string;
      clientNotes?: string;
    },
  ) {
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
        interviewType:
          action === "request_interview"
            ? interviewTypeFromLocationPreference()
            : undefined,
        locationPreference:
          action === "request_interview" ? locationPreference : undefined,
        preferredTimes:
          action === "request_interview"
            ? interviewDetails?.preferredTimes || undefined
            : undefined,
        clientNotes:
          action === "request_interview"
            ? interviewDetails?.clientNotes || undefined
            : undefined,
      }),
    });
    const result = (await response.json()) as { message?: string };

    if (response.ok) {
      setStatus("done");
      setDeclineOpen(false);
      setInterviewOpen(false);
      setComment("");
      setPreferredTimes("");
      setClientNotes("");
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

  useEffect(() => {
    if (!interviewOpen) return;
    interviewPanelRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setInterviewOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [interviewOpen]);

  useEffect(() => {
    if (!enabled) return;

    if (declineOpen) {
      declineWasOpenedRef.current = true;
      emitPrivateEngagement("modal_opened", candidateId);
      return;
    }

    if (declineWasOpenedRef.current) {
      declineWasOpenedRef.current = false;
      emitPrivateEngagement("modal_closed", candidateId);
    }
  }, [candidateId, declineOpen, enabled]);

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
          className="button button-primary"
          disabled={!enabled || status === "sending"}
          title={disabledReason}
          type="button"
          aria-expanded={interviewOpen}
          onClick={() => setInterviewOpen((open) => !open)}
        >
          {recruiterLabsFeedbackActionLabels.request_interview}
        </button>
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

      {interviewOpen ? (
        <div
          ref={interviewPanelRef}
          aria-labelledby={`interview-request-${candidateId}`}
          aria-modal="true"
          className="client-feedback-panel"
          role="dialog"
          tabIndex={-1}
        >
          <h4 id={`interview-request-${candidateId}`}>Request interview</h4>
          <p className="meta">
            This asks David to coordinate the next step. It does not book the
            interview yet.
          </p>
          <label className="client-feedback-comment">
            <span>Preferred format</span>
            <select
              value={locationPreference}
              onChange={(event) =>
                setLocationPreference(
                  event.target.value as typeof locationPreference,
                )
              }
            >
              <option value="to_be_confirmed">Let David advise</option>
              <option value="google_meet">Google Meet</option>
              <option value="phone">Phone</option>
              <option value="physical">In person</option>
            </select>
          </label>
          <label className="client-feedback-comment">
            <span>Preferred times (optional)</span>
            <textarea
              maxLength={1000}
              value={preferredTimes}
              onChange={(event) => setPreferredTimes(event.target.value)}
            />
          </label>
          <label className="client-feedback-comment">
            <span>Notes for David (optional)</span>
            <textarea
              maxLength={1000}
              value={clientNotes}
              onChange={(event) => setClientNotes(event.target.value)}
            />
          </label>
          <div className="button-row">
            <button
              className="button button-primary"
              disabled={status === "sending"}
              type="button"
              onClick={() =>
                submitFeedback("request_interview", {
                  preferredTimes,
                  clientNotes,
                })
              }
            >
              Send request to David
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setInterviewOpen(false)}
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
