"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  dataSubjectRequestNeutralSuccess,
  dataSubjectRequestTypeOptions,
} from "@/lib/dsar";
import {
  candidatePrivacyPath,
  candidateRetentionStatement,
} from "@/lib/candidate-trust";

export function DataSubjectRequestForm() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now().toString());
  const formId = useId();
  const statusId = `${formId}-data-request-status`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/data-request", {
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
      setMessage(data.message || dataSubjectRequestNeutralSuccess);
      form.reset();
      setStartedAt(Date.now().toString());
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "The request could not be sent.",
      );
    }
  }

  return (
    <form
      className="contact-form"
      onSubmit={onSubmit}
      aria-busy={status === "loading"}
      aria-describedby={statusId}
    >
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="data-request-website">Leave this field blank</label>
        <input
          id="data-request-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />

      <div className="form-assurance">
        <strong>Privacy request.</strong>
        <span>
          This does not look up your record on the public website. David reviews
          the request first and may need to verify identity.
        </span>
      </div>

      <div className="form-trust-panel">
        <h3>What this form will not do</h3>
        <ol>
          <li>It will not confirm whether your email exists in the database.</li>
          <li>It will not export private data without identity checks.</li>
          <li>It will not delete records without admin review.</li>
        </ol>
        <p>{candidateRetentionStatement}</p>
      </div>

      <div className="form-row">
        <label htmlFor="data-request-name">Name</label>
        <input
          id="data-request-name"
          name="name"
          type="text"
          autoComplete="name"
          minLength={2}
          maxLength={80}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="data-request-email">Email</label>
        <input
          id="data-request-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="data-request-phone">
          Phone <span className="optional-label">optional</span>
        </label>
        <input
          id="data-request-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={32}
          pattern="^[+0-9\\s().-]+$"
        />
      </div>

      <div className="form-row">
        <label htmlFor="data-request-type">Request type</label>
        <select
          id="data-request-type"
          name="requestType"
          defaultValue="access_export"
          required
        >
          {dataSubjectRequestTypeOptions.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="data-request-message">Details</label>
        <textarea
          id="data-request-message"
          name="message"
          rows={6}
          minLength={10}
          maxLength={2000}
          required
        />
        <p className="form-note">
          Add enough context for David to understand the request. Do not upload
          documents or include passwords.
        </p>
      </div>

      <label className="consent" htmlFor="data-request-authority">
        <input
          id="data-request-authority"
          type="checkbox"
          name="confirmAuthority"
          value="yes"
          required
        />
        <span>
          I confirm this request is about me, or I have authority to make it. I
          understand identity checks may be needed before any data is released,
          changed or deleted.
        </span>
      </label>

      <label className="consent" htmlFor="data-request-privacy">
        <input
          id="data-request-privacy"
          type="checkbox"
          name="privacyNotice"
          value="yes"
          required
        />
        <span>
          I have read the{" "}
          <Link href={candidatePrivacyPath}>Candidate Privacy Notice</Link> and{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </span>
      </label>

      <button
        className="button button-primary"
        type="submit"
        disabled={status === "loading"}
        aria-disabled={status === "loading"}
      >
        {status === "loading" ? "Sending..." : "Send privacy request"}
      </button>

      <p
        id={statusId}
        className={`form-status ${status}`}
        role={status === "error" ? "alert" : "status"}
        aria-live="polite"
      >
        {message}
      </p>

      {status === "success" ? (
        <div className="form-confirmation" role="status">
          <h3>Request received.</h3>
          <p>
            If the details match records Essential Resourcing holds, David will
            review the request and come back using the contact details provided.
          </p>
          <div className="button-row">
            <Link className="text-link" href={candidatePrivacyPath}>
              Candidate Privacy Notice
            </Link>
            <Link className="text-link" href="/privacy-policy">
              Privacy Policy
            </Link>
          </div>
        </div>
      ) : null}
    </form>
  );
}
