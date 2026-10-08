"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { maxCandidateNoteLength } from "@/lib/candidate-application-constraints";
import {
  candidateConsentCopy,
  candidatePrivacyPath,
  candidateRetentionStatement,
} from "@/lib/candidate-trust";
import { siteConfig } from "@/lib/site";

type CandidateApplicationDropFormProps = {
  type: "candidate" | "job";
  jobTitle?: string;
  jobSlug?: string;
  canSubmitCandidateNote: boolean;
  canAcceptCvUploads: boolean;
  disabledMessage: string;
};

export function CandidateApplicationDropForm({
  type,
  jobTitle,
  jobSlug,
  canSubmitCandidateNote,
  canAcceptCvUploads,
  disabledMessage,
}: CandidateApplicationDropFormProps) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [noteLength, setNoteLength] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now().toString());
  const [hasTrackedStart, setHasTrackedStart] = useState(false);
  const formId = useId();
  const statusId = `${formId}-${type}-cv-form-status`;
  const sendFailureMessage =
    type === "job"
      ? "The application could not be sent."
      : "Your details could not be sent.";
  const sourcePage =
    type === "job" && jobSlug ? `/jobs/${jobSlug}` : "/candidates";

  function onFocusCapture() {
    if (hasTrackedStart) return;
    setHasTrackedStart(true);
    trackEvent(type === "job" ? "job_application_start" : "cta_click", {
      form_type: type,
      job_slug: jobSlug,
      location: "candidate_application_drop",
      cta_text: "CV upload form started",
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    setReference("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("type", type);
    formData.set("sourcePage", sourcePage);
    if (type === "job") {
      const params = new URLSearchParams(window.location.search);
      for (const key of ["utm_source", "utm_medium", "utm_campaign"] as const) {
        const value = params.get(key);
        if (value) formData.set(key, value.slice(0, 80));
      }
      if (document.referrer) {
        try {
          formData.set(
            "referrerHost",
            new URL(document.referrer).hostname.slice(0, 100),
          );
        } catch {
          // The referrer is optional; never interrupt an application for it.
        }
      }
    }
    if (jobTitle) formData.set("jobTitle", jobTitle);
    if (jobSlug) formData.set("jobSlug", jobSlug);

    try {
      const response = await fetch("/api/candidate-application-drop", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        reference?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.message || sendFailureMessage);
      }

      setStatus("success");
      setMessage(
        data.message ||
          "Thanks. Your details have gone privately to David for review.",
      );
      setReference(data.reference || "");
      trackEvent("cv_upload_submission", {
        form_type: type,
        job_slug: jobSlug,
      });
      form.reset();
      setNoteLength(0);
      setStartedAt(Date.now().toString());
      setHasTrackedStart(false);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : sendFailureMessage);
      trackEvent("form_error", {
        form_type: type,
        job_slug: jobSlug,
        location: "candidate_application_drop",
      });
    }
  }

  return (
    <form
      className="contact-form"
      onSubmit={onSubmit}
      onFocusCapture={onFocusCapture}
      aria-busy={status === "loading"}
      aria-describedby={statusId}
    >
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${type}-cv-website`}>Leave this field blank</label>
        <input
          id={`${type}-cv-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <input type="hidden" name="type" value={type} />
      {jobTitle ? (
        <input type="hidden" name="jobTitle" value={jobTitle} />
      ) : null}
      {jobSlug ? <input type="hidden" name="jobSlug" value={jobSlug} /> : null}

      <div className="form-assurance">
        <strong>
          {type === "job" ? "Apply privately." : "Send details privately."}
        </strong>
        <span>
          {canAcceptCvUploads
            ? "Add a LinkedIn/profile URL, a short note or a CV. CV files are delivered to David through Resend and kept in private storage for manual review."
            : "Add a LinkedIn/profile URL and a short note. That’s enough to start a sensible conversation."}
        </span>
      </div>

      <div className="form-row">
        <label htmlFor={`${type}-cv-name`}>Name</label>
        <input
          id={`${type}-cv-name`}
          name="name"
          type="text"
          autoComplete="name"
          minLength={2}
          maxLength={80}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor={`${type}-cv-email`}>Email</label>
        <input
          id={`${type}-cv-email`}
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor={`${type}-cv-phone`}>
          Mobile <span className="optional-label">optional</span>
        </label>
        <input
          id={`${type}-cv-phone`}
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={32}
          pattern="^[+0-9\\s().-]+$"
        />
      </div>

      {canAcceptCvUploads ? (
        <div className="form-row">
          <label htmlFor={`${type}-cv-file`}>
            CV file <span className="optional-label">optional</span>
          </label>
          <div className="candidate-dropzone">
            <input
              id={`${type}-cv-file`}
              name="cvFile"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              disabled={status === "loading"}
            />
            <p>PDF, DOC or DOCX only. Maximum file size 10MB.</p>
            <span className="candidate-upload-status">Private upload live</span>
          </div>
        </div>
      ) : null}

      <div className="form-row">
        <label htmlFor={`${type}-cv-linkedin`}>
          LinkedIn or profile URL{" "}
          <span className="optional-label">optional</span>
        </label>
        <input
          id={`${type}-cv-linkedin`}
          name="linkedin"
          type="url"
          placeholder="https://www.linkedin.com/in/..."
          maxLength={240}
        />
      </div>

      <div className="form-row">
        <label htmlFor={`${type}-cv-note`}>
          Short note <span className="optional-label">optional</span>
        </label>
        <textarea
          id={`${type}-cv-note`}
          name="note"
          rows={5}
          maxLength={maxCandidateNoteLength}
          aria-describedby={`${type}-cv-note-count`}
          onChange={(event) => setNoteLength(event.currentTarget.value.length)}
          placeholder={
            type === "job"
              ? "A few useful lines about why the role caught your eye is plenty."
              : "Tell David what you're doing now and what you might want next."
          }
        />
        <p id={`${type}-cv-note-count`} className="form-note">
          {noteLength.toLocaleString("en-GB")} /{" "}
          {maxCandidateNoteLength.toLocaleString("en-GB")} characters
        </p>
      </div>

      <div className="form-row">
        <label htmlFor={`${type}-cv-preferred-contact`}>
          Preferred contact method
        </label>
        <select
          id={`${type}-cv-preferred-contact`}
          name="preferredContactMethod"
          defaultValue="no_preference"
        >
          <option value="no_preference">No preference</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
        <p className="form-note">
          If you choose WhatsApp or phone, add a mobile number above.
        </p>
      </div>

      <label className="consent" htmlFor={`${type}-cv-whatsapp-consent`}>
        <input
          id={`${type}-cv-whatsapp-consent`}
          type="checkbox"
          name="whatsappContactConsent"
          value="yes"
        />
        <span>
          If I choose WhatsApp above, David can reply by WhatsApp about this
          enquiry. No broadcasts.
        </span>
      </label>

      <label className="consent" htmlFor={`${type}-cv-talent-pool-consent`}>
        <input
          id={`${type}-cv-talent-pool-consent`}
          type="checkbox"
          name="talentPoolConsent"
          value="yes"
        />
        <span>
          Keep me in mind for relevant future roles. This is optional and
          isn&apos;t a marketing list.
        </span>
      </label>

      <label className="consent" htmlFor={`${type}-cv-consent`}>
        <input
          id={`${type}-cv-consent`}
          type="checkbox"
          name="consent"
          value="yes"
          required
        />
        <span>{candidateConsentCopy(type)}</span>
      </label>

      <label
        className="consent"
        htmlFor={`${type}-cv-privacy-notice-acknowledgement`}
      >
        <input
          id={`${type}-cv-privacy-notice-acknowledgement`}
          type="checkbox"
          name="privacyNoticeAcknowledgement"
          value="yes"
          required
        />
        <span>
          I have read the{" "}
          <Link href={candidatePrivacyPath}>Candidate Privacy Notice</Link>.
        </span>
      </label>

      {!canSubmitCandidateNote ? (
        <p className="form-status error" role="alert">
          {disabledMessage}
        </p>
      ) : null}

      <button
        className="button button-primary"
        type="submit"
        disabled={!canSubmitCandidateNote || status === "loading"}
        aria-disabled={!canSubmitCandidateNote || status === "loading"}
      >
        {status === "loading"
          ? "Sending..."
          : type === "job"
            ? "Send application"
            : "Send confidential note"}
      </button>

      <p
        id={statusId}
        className={`form-status ${status}`}
        role={status === "error" ? "alert" : "status"}
        aria-live="polite"
      >
        {message}
        {reference ? ` Reference: ${reference}.` : ""}
      </p>
      {status === "error" ? (
        <p className="form-note">
          Still having trouble? Email David your note and CV directly at{" "}
          <a
            href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(jobTitle ? `Application: ${jobTitle}` : "Candidate enquiry")}`}
          >
            {siteConfig.email}
          </a>
          .
        </p>
      ) : null}

      {status === "success" ? (
        <div className="form-confirmation" role="status">
          <h3>{type === "job" ? "Application received." : "Note received."}</h3>
          <p>
            David will review it directly. Your details stay private and you can
            ask for deletion or export at any time.
          </p>
          <p className="form-note">{candidateRetentionStatement}</p>
        </div>
      ) : null}
    </form>
  );
}
