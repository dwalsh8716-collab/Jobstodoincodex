"use client";

import { useId, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type FormType = "client" | "candidate" | "job";

export function ContactForm({
  type = "client",
  jobTitle,
}: {
  type?: FormType;
  jobTitle?: string;
}) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now().toString());
  const [hasTrackedStart, setHasTrackedStart] = useState(false);
  const formId = useId();
  const statusId = `${formId}-${type}-form-status`;

  function onFocusCapture() {
    if (type !== "job" || hasTrackedStart) return;
    setHasTrackedStart(true);
    trackEvent("job_application_start", {
      form_type: type,
      job_title: jobTitle,
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
      trackEvent(type === "job" ? "job_application_submission" : "form_submission", {
        form_type: type,
        brief_type: String(formData.get("briefType") || ""),
        job_title: jobTitle,
      });
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
        job_title: jobTitle,
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
      <div className="form-assurance">
        <strong>Direct with David.</strong>
        <span>
          Share the useful context. You will get a straight reply, not a sales
          sequence.
        </span>
      </div>
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
          <label htmlFor={`${type}-linkedin`}>LinkedIn URL</label>
          <input
            id={`${type}-linkedin`}
            name="linkedin"
            type="url"
            placeholder="https://www.linkedin.com/in/..."
            maxLength={240}
          />
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
        <label htmlFor={`${type}-message`}>Message</label>
        <textarea
          id={`${type}-message`}
          name="message"
          rows={6}
          minLength={10}
          maxLength={2000}
          required
        />
      </div>
      <label className="consent" htmlFor={`${type}-consent`}>
        <input
          id={`${type}-consent`}
          type="checkbox"
          name="consent"
          value="yes"
          required
        />
        <span>
          I agree to be contacted about this enquiry. Nothing is shared without
          permission.
        </span>
      </label>
      {type !== "client" ? (
        <p className="form-note">
          CV upload is intentionally not enabled until secure storage is
          configured. Add a LinkedIn URL or note and David can request the CV
          safely.
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
    </form>
  );
}
