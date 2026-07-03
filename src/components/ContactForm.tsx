"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { CandidateProcessTimeline } from "@/components/CandidateProcessTimeline";
import { trackEvent } from "@/lib/analytics";
import {
  candidateConsentCopy,
  candidateNextSteps,
  candidatePrivacyPath,
  candidateRetentionStatement,
} from "@/lib/candidate-trust";

type FormType = "client" | "candidate" | "job";

export function ContactForm({
  type = "client",
  jobTitle,
  jobSlug,
}: {
  type?: FormType;
  jobTitle?: string;
  jobSlug?: string;
}) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now().toString());
  const [hasTrackedStart, setHasTrackedStart] = useState(false);
  const formId = useId();
  const statusId = `${formId}-${type}-form-status`;
  const sourcePage =
    type === "job" && jobSlug
      ? `/jobs/${jobSlug}`
      : type === "candidate"
        ? "/candidates"
        : "/contact";

  function onFocusCapture() {
    if (type !== "job" || hasTrackedStart) return;
    setHasTrackedStart(true);
    trackEvent("job_application_start", {
      form_type: type,
      job_slug: jobSlug,
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("type", type);
    if (jobTitle) formData.set("jobTitle", jobTitle);
    if (jobSlug) formData.set("jobSlug", jobSlug);
    formData.set("sourcePage", sourcePage);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };
      if (!response.ok || !data.ok)
        throw new Error(data.message || "Something went wrong.");
      setStatus("success");
      setMessage(data.message || "Thanks. Your enquiry has been received.");
      trackEvent(
        type === "job"
          ? "job_application_submission"
          : type === "candidate"
            ? "candidate_enquiry_submitted"
            : "form_submission",
        {
          form_type: type,
          brief_type: String(formData.get("briefType") || ""),
          job_slug: jobSlug,
        },
      );
      form.reset();
      setStartedAt(Date.now().toString());
      setHasTrackedStart(false);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "The form could not be sent.",
      );
      trackEvent("form_error", {
        form_type: type,
        job_slug: jobSlug,
      });
    }
  }

  const candidateMode = type !== "client";

  return (
    <form
      className="contact-form"
      onSubmit={onSubmit}
      onFocusCapture={onFocusCapture}
      aria-busy={status === "loading"}
      aria-describedby={statusId}
    >
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${type}-website`}>Leave this field blank</label>
        <input
          id={`${type}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <div className="form-assurance">
        <strong>
          {candidateMode ? "Private two-minute note." : "Direct with David."}
        </strong>
        <span>
          {candidateMode
            ? "Use a profile link or a short note. CV upload stays off until private storage is ready."
            : "Share the useful context. You will get a straight reply, not a sales sequence."}
        </span>
      </div>
      {candidateMode ? (
        <div className="form-trust-panel">
          <h3>What happens next?</h3>
          <ol>
            {candidateNextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>{candidateRetentionStatement}</p>
        </div>
      ) : null}
      <div className="form-row">
        <label htmlFor={`${type}-name`}>Name</label>
        <input
          id={`${type}-name`}
          name="name"
          type="text"
          autoComplete="name"
          minLength={2}
          maxLength={80}
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor={`${type}-email`}>Email</label>
        <input
          id={`${type}-email`}
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor={`${type}-phone`}>
          Phone <span className="optional-label">optional</span>
        </label>
        <input
          id={`${type}-phone`}
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={32}
          pattern="^[+0-9\\s().-]+$"
        />
      </div>
      {type === "client" ? (
        <div className="form-row">
          <label htmlFor={`${type}-company`}>Company</label>
          <input
            id={`${type}-company`}
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={120}
          />
        </div>
      ) : null}
      {type !== "client" ? (
        <div className="form-row">
          <label htmlFor={`${type}-linkedin`}>
            LinkedIn or profile URL{" "}
            <span className="optional-label">or add a short note below</span>
          </label>
          <input
            id={`${type}-linkedin`}
            name="linkedin"
            type="url"
            placeholder="https://www.linkedin.com/in/... or portfolio URL"
            maxLength={240}
          />
          <p className="form-note">
            This can be LinkedIn, a portfolio, a personal site or another
            relevant profile. No scraping, no automatic parsing.
          </p>
        </div>
      ) : null}
      <div className="form-row">
        <label htmlFor={`${type}-brief`}>
          {type === "job" ? "Application note" : "What do you need?"}
        </label>
        <select
          id={`${type}-brief`}
          name="briefType"
          defaultValue={
            type === "candidate"
              ? "Candidate conversation"
              : "Leadership Search"
          }
        >
          <option>Leadership Search</option>
          <option>Strategic Interim</option>
          <option>Agency Recruitment</option>
          <option>Client-side Marketing Recruitment</option>
          <option>Senior Recruitment</option>
          <option>Candidate conversation</option>
          <option>Job application</option>
        </select>
      </div>
      <div className="form-row">
        <label htmlFor={`${type}-message`}>
          {candidateMode ? "Short note" : "Message"}{" "}
          {candidateMode ? (
            <span className="optional-label">
              optional if a profile link is added
            </span>
          ) : null}
        </label>
        <textarea
          id={`${type}-message`}
          name="message"
          rows={6}
          minLength={type === "client" ? 10 : undefined}
          maxLength={2000}
          placeholder={
            type === "job"
              ? "Optional if you have added a profile link. A few useful lines is plenty."
              : type === "candidate"
                ? "Optional if you have added a profile link. Tell David what you are looking for if it helps."
                : "Share the useful context behind the hire."
          }
          required={type === "client"}
        />
        {candidateMode ? (
          <p className="form-note">
            Applying should not mean a cover-letter chore. Add a profile link, a
            short note, or both.
          </p>
        ) : null}
      </div>
      <div className="form-row">
        <label htmlFor={`${type}-preferred-contact`}>
          {type === "job"
            ? "How would you prefer David to contact you about this application?"
            : type === "candidate"
              ? "How would you prefer David to contact you?"
              : "Preferred contact method"}
        </label>
        <select
          id={`${type}-preferred-contact`}
          name="preferredContactMethod"
          defaultValue="no_preference"
        >
          <option value="no_preference">No preference</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
        <p className="form-note">
          If you choose WhatsApp or phone, add a mobile number above. This is
          for this enquiry only, not marketing broadcasts.
        </p>
      </div>
      {candidateMode ? (
        <label className="consent" htmlFor={`${type}-whatsapp-consent`}>
          <input
            id={`${type}-whatsapp-consent`}
            type="checkbox"
            name="whatsappContactConsent"
            value="yes"
          />
          <span>
            If I choose WhatsApp above, David can reply by WhatsApp about this
            application or note. No broadcasts.
          </span>
        </label>
      ) : null}
      {candidateMode ? (
        <label className="consent" htmlFor={`${type}-talent-pool-consent`}>
          <input
            id={`${type}-talent-pool-consent`}
            type="checkbox"
            name="talentPoolConsent"
            value="yes"
          />
          <span>
            Keep me in mind for relevant future roles. This is optional and not
            a marketing list.
          </span>
        </label>
      ) : null}
      <label className="consent" htmlFor={`${type}-consent`}>
        <input
          id={`${type}-consent`}
          type="checkbox"
          name="consent"
          value="yes"
          required
        />
        <span>
          {candidateMode
            ? candidateConsentCopy(type)
            : "I agree to be contacted about this enquiry using the details I've provided, including WhatsApp if I select it as my preferred contact method. Nothing is shared without permission."}
        </span>
      </label>
      {candidateMode ? (
        <label
          className="consent"
          htmlFor={`${type}-privacy-notice-acknowledgement`}
        >
          <input
            id={`${type}-privacy-notice-acknowledgement`}
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
      ) : null}
      {type !== "client" ? (
        <p className="form-note">
          CV upload is intentionally not enabled until secure storage is
          configured. Add a LinkedIn URL or note and David can request the CV
          safely.{" "}
          <Link href={candidatePrivacyPath}>How candidate data is handled</Link>
          .
        </p>
      ) : null}
      <button
        className="button button-primary"
        type="submit"
        disabled={status === "loading"}
        aria-disabled={status === "loading"}
      >
        {status === "loading"
          ? "Sending..."
          : type === "job"
            ? "Start application"
            : "Send enquiry"}
      </button>
      <p
        id={statusId}
        className={`form-status ${status}`}
        role={status === "error" ? "alert" : "status"}
        aria-live="polite"
      >
        {message}
      </p>
      {status === "success" && candidateMode ? (
        <div className="form-confirmation" role="status">
          <h3>{type === "job" ? "Application received." : "Note received."}</h3>
          <p>
            David will review it directly. If it looks like a possible fit, he
            will come back to you. Your details are handled privately and you
            can ask for deletion or export at any time.
          </p>
          <div className="button-row">
            <Link className="text-link" href={candidatePrivacyPath}>
              Candidate Privacy Notice
            </Link>
            <Link className="text-link" href="/jobs">
              View live roles
            </Link>
          </div>
          <CandidateProcessTimeline
            compact
            processConfirmed="indicative"
            overview="Typical next steps after you send a note or application."
            steps={candidateNextSteps}
            expectedTimeline="David reviews candidate notes directly. If it looks relevant, he will come back to you."
            taskRequired="to_be_confirmed"
            presentationRequired="to_be_confirmed"
            feedbackExpectation="No black hole. If there is a sensible next step, David will make it clear."
            applicationReviewTimeframe="David reviews the note or application directly."
          />
        </div>
      ) : null}
    </form>
  );
}
