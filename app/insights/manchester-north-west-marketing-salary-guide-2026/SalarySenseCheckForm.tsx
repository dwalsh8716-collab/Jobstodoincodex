"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { candidatePrivacyPath } from "@/lib/candidate-trust";
import { trackEvent } from "@/lib/analytics";
import styles from "./salary-guide.module.css";

const sourcePage =
  "/insights/manchester-north-west-marketing-salary-guide-2026";

export function SalarySenseCheckForm() {
  const id = useId();
  const [startedAt, setStartedAt] = useState(() => Date.now().toString());
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [purpose, setPurpose] = useState<"personal" | "hiring" | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const role = String(data.get("role") || "").trim();
    const salary = String(data.get("salary") || "").trim();
    const note = String(data.get("note") || "").trim();
    const isPersonal = data.get("salaryPurpose") === "personal";

    data.delete("role");
    data.delete("salary");
    data.delete("note");
    data.delete("salaryPurpose");
    data.set("type", isPersonal ? "candidate" : "client");
    data.set(
      "briefType",
      isPersonal ? "Personal salary sense-check" : "Hiring salary sense-check",
    );
    data.set("sourcePage", sourcePage);
    data.set(
      "message",
      [
        "Salary sense-check enquiry",
        `Role/title: ${role}`,
        `${isPersonal ? "Current salary/rate" : "Hiring salary/budget"}: ${salary}`,
        note ? `Additional context: ${note}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: data,
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "The form could not be sent.");
      }

      setStatus("success");
      setMessage(result.message || "Thanks. David has your details.");
      trackEvent("form_submission", { form_type: "salary_sense_check" });
      form.reset();
      setPurpose(null);
      setStartedAt(Date.now().toString());
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "The form could not be sent.",
      );
      trackEvent("form_error", { form_type: "salary_sense_check" });
    }
  }

  return (
    <form
      className={styles.senseCheckForm}
      onSubmit={onSubmit}
      aria-busy={status === "loading"}
      aria-labelledby="salary-sense-check-heading"
      aria-describedby="salary-sense-check-intro"
    >
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Leave this field blank</label>
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className={styles.senseCheckFields}>
        <fieldset className={styles.senseCheckPurpose}>
          <legend>What are you checking?</legend>
          <div className="choice-stack">
            <label className="consent">
              <input
                type="radio"
                name="salaryPurpose"
                value="personal"
                checked={purpose === "personal"}
                onChange={() => setPurpose("personal")}
                required
              />
              <span>My own salary or package</span>
            </label>
            <label className="consent">
              <input
                type="radio"
                name="salaryPurpose"
                value="hiring"
                checked={purpose === "hiring"}
                onChange={() => setPurpose("hiring")}
                required
              />
              <span>A salary for someone I’m hiring</span>
            </label>
          </div>
        </fieldset>
        <div className="form-row">
          <label htmlFor={`${id}-name`}>Name</label>
          <input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={80}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor={`${id}-email`}>Email</label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor={`${id}-role`}>
            {purpose === "personal" ? "Your role or title" : "Role or title"}
          </label>
          <input id={`${id}-role`} name="role" maxLength={120} required />
        </div>
        <div className="form-row">
          <label htmlFor={`${id}-salary`}>
            {purpose === "personal"
              ? "Your current salary or rate"
              : purpose === "hiring"
                ? "Proposed salary or budget"
                : "Salary or budget"}
          </label>
          <input
            id={`${id}-salary`}
            name="salary"
            maxLength={100}
            placeholder="For example, £120,000 per year"
            required
          />
        </div>
        <div className={`form-row ${styles.senseCheckFull}`}>
          <label htmlFor={`${id}-note`}>
            Anything else? <span className="optional-label">Optional</span>
          </label>
          <textarea
            id={`${id}-note`}
            name="note"
            rows={3}
            maxLength={1400}
            placeholder={
              purpose === "personal"
                ? "Remit, bonus, pension, equity or anything else that matters."
                : purpose === "hiring"
                  ? "Brief, responsibilities, location or anything else that matters."
                  : undefined
            }
          />
        </div>
      </div>
      <label className="consent" htmlFor={`${id}-consent`}>
        <input
          id={`${id}-consent`}
          name="consent"
          type="checkbox"
          value="yes"
          required
        />
        <span>
          Essential Resourcing will use these details to reply to your enquiry.
          See the <Link href="/privacy-policy">Privacy Policy</Link>.
        </span>
      </label>
      {purpose === "personal" ? (
        <label className="consent" htmlFor={`${id}-candidate-privacy`}>
          <input
            id={`${id}-candidate-privacy`}
            name="privacyNoticeAcknowledgement"
            type="checkbox"
            value="yes"
            required
          />
          <span>
            I have read the{" "}
            <Link href={candidatePrivacyPath}>Candidate Privacy Notice</Link>.
            This question does not add me to the talent pool.
          </span>
        </label>
      ) : null}
      <div className={styles.senseCheckSubmit}>
        <button
          className="button button-primary"
          type="submit"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Sending..." : "Send to David"}
        </button>
        <p
          className={`form-status ${status}`}
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {message}
        </p>
      </div>
    </form>
  );
}
