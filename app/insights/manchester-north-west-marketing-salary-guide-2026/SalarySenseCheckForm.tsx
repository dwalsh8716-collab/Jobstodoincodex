"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import styles from "./salary-guide.module.css";

const sourcePage = "/insights/manchester-north-west-marketing-salary-guide-2026";

export function SalarySenseCheckForm() {
  const id = useId();
  const [startedAt, setStartedAt] = useState(() => Date.now().toString());
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const role = String(data.get("role") || "").trim();
    const salary = String(data.get("salary") || "").trim();
    const note = String(data.get("note") || "").trim();

    data.delete("role");
    data.delete("salary");
    data.delete("note");
    data.set("type", "client");
    data.set("briefType", "Salary sense-check");
    data.set("sourcePage", sourcePage);
    data.set(
      "message",
      [`Salary sense-check enquiry`, `Role/title: ${role}`, `Salary/budget: ${salary}`, note ? `Additional context: ${note}` : ""]
        .filter(Boolean)
        .join("\n"),
    );

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/contact", { method: "POST", body: data });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "The form could not be sent.");
      }

      setStatus("success");
      setMessage(result.message || "Thanks. David has your details.");
      trackEvent("form_submission", { form_type: "salary_sense_check" });
      form.reset();
      setStartedAt(Date.now().toString());
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "The form could not be sent.");
      trackEvent("form_error", { form_type: "salary_sense_check" });
    }
  }

  return (
    <form className={styles.senseCheckForm} onSubmit={onSubmit} aria-busy={status === "loading"} aria-labelledby="salary-sense-check-heading" aria-describedby="salary-sense-check-intro">
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Leave this field blank</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className={styles.senseCheckFields}>
        <div className="form-row">
          <label htmlFor={`${id}-name`}>Name</label>
          <input id={`${id}-name`} name="name" autoComplete="name" minLength={2} maxLength={80} required />
        </div>
        <div className="form-row">
          <label htmlFor={`${id}-email`}>Email</label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" maxLength={254} required />
        </div>
        <div className="form-row">
          <label htmlFor={`${id}-role`}>Role or title</label>
          <input id={`${id}-role`} name="role" maxLength={120} required />
        </div>
        <div className="form-row">
          <label htmlFor={`${id}-salary`}>Salary or budget</label>
          <input id={`${id}-salary`} name="salary" maxLength={100} placeholder="For example, £65,000" required />
        </div>
        <div className={`form-row ${styles.senseCheckFull}`}>
          <label htmlFor={`${id}-note`}>Anything else? <span className="optional-label">Optional</span></label>
          <textarea id={`${id}-note`} name="note" rows={3} maxLength={1400} />
        </div>
      </div>
      <label className="consent" htmlFor={`${id}-consent`}>
        <input id={`${id}-consent`} name="consent" type="checkbox" value="yes" required />
        <span>
          Essential Resourcing will use these details to reply to your enquiry. See the{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </span>
      </label>
      <div className={styles.senseCheckSubmit}>
        <button className="button button-primary" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Sending..." : "Send to David"}
        </button>
        <p className={`form-status ${status}`} role={status === "error" ? "alert" : "status"} aria-live="polite">
          {message}
        </p>
      </div>
    </form>
  );
}
