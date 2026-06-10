"use client";

import { useState } from "react";

type FormType = "client" | "candidate" | "job";

export function ContactForm({ type = "client", jobTitle }: { type?: FormType; jobTitle?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

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
        body: formData
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) throw new Error(data.message || "Something went wrong.");
      setStatus("success");
      setMessage(data.message || "Thanks. Your enquiry has been received.");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "The form could not be sent.");
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${type}-website`}>Leave this field blank</label>
        <input id={`${type}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form-assurance">
        <strong>Direct with David.</strong>
        <span>Share the useful context. You will get a straight reply, not a sales sequence.</span>
      </div>
      <div className="form-row">
        <label htmlFor={`${type}-name`}>Name</label>
        <input id={`${type}-name`} name="name" type="text" autoComplete="name" required />
      </div>
      <div className="form-row">
        <label htmlFor={`${type}-email`}>Email</label>
        <input id={`${type}-email`} name="email" type="email" autoComplete="email" required />
      </div>
      <div className="form-row">
        <label htmlFor={`${type}-phone`}>Phone <span className="optional-label">optional</span></label>
        <input id={`${type}-phone`} name="phone" type="tel" autoComplete="tel" />
      </div>
      {type === "client" ? (
        <div className="form-row">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" type="text" autoComplete="organization" />
        </div>
      ) : null}
      {type !== "client" ? (
        <div className="form-row">
          <label htmlFor="linkedin">LinkedIn URL</label>
          <input id="linkedin" name="linkedin" type="url" placeholder="https://www.linkedin.com/in/..." />
        </div>
      ) : null}
      <div className="form-row">
        <label htmlFor={`${type}-brief`}>{type === "job" ? "Application note" : "What do you need?"}</label>
        <select id={`${type}-brief`} name="briefType" defaultValue={type === "candidate" ? "Candidate conversation" : "Leadership Search"}>
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
        <textarea id={`${type}-message`} name="message" rows={6} required />
      </div>
      <label className="consent" htmlFor={`${type}-consent`}>
        <input id={`${type}-consent`} type="checkbox" name="consent" value="yes" required />
        <span>I agree to be contacted about this enquiry. Nothing is shared without permission.</span>
      </label>
      {type !== "client" ? (
        <p className="form-note">
          CV upload is intentionally not enabled until secure storage is configured. Add a LinkedIn URL or note and David can request the CV safely.
        </p>
      ) : null}
      <button className="button button-primary" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : type === "job" ? "Start application" : "Send enquiry"}
      </button>
      <p className={`form-status ${status}`} role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
