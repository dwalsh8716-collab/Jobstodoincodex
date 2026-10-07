"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import { salaryGuideEmailSchema } from "@/validations/salary-guide-email";
import styles from "./salary-product.module.css";

export function SalaryGuideEmail({
  position,
  copyLink,
}: {
  position: "top" | "bottom";
  copyLink: () => void;
}) {
  const id = useId();
  const pending = useRef(false);
  const started = useRef(false);
  const requestId = useRef("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [startedAt] = useState(Date.now);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || status === "success") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!requestId.current) requestId.current = crypto.randomUUID();
    const input = {
      name: data.get("name"),
      email: data.get("email"),
      website: data.get("website"),
      startedAt,
      requestId: requestId.current,
    };
    const parsed = salaryGuideEmailSchema.safeParse(input);
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ||
          "Please check your name and email address.",
      );
      const field = String(parsed.error.issues[0]?.path[0]);
      (form.elements.namedItem(field) as HTMLInputElement | null)?.focus();
      return;
    }
    pending.current = true;
    setStatus("loading");
    setError("");
    trackEvent("salary_guide_email_submitted", { location: position });
    try {
      const res = await fetch("/api/salary-guide/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = (await res.json()) as { ok?: boolean };
      if (!res.ok || !result.ok) throw new Error("not sent");
      setStatus("success");
      form.reset();
      trackEvent("salary_guide_email_success", { location: position });
    } catch {
      setStatus("error");
      setError(
        "That hasn't gone through for some reason. Try again, or just copy the link instead.",
      );
      trackEvent("salary_guide_email_error", { location: position });
    } finally {
      pending.current = false;
    }
  }

  return (
    <div
      className={styles.emailPanel}
      data-clarity-mask="true"
      data-hj-suppress
    >
      <h3 id={`${id}-heading`}>Want this in your inbox?</h3>
      {status === "success" ? (
        <div role="status">
          <p>
            <strong>Done. Check your inbox 👍</strong>
          </p>
          <p>
            I&apos;ve sent you the live guide, so you&apos;ve always got the
            latest version rather than a PDF that&apos;ll be out of date the
            second I change something.
          </p>
          <button className={styles.textButton} onClick={copyLink}>
            Copy link
          </button>
        </div>
      ) : (
        <>
          <p>
            {position === "top"
              ? "The guide is deliberately ungated, but if you want me to send you the link so you've got it for later, I'll obviously need your email address 😂"
              : "Everything on this page is deliberately ungated. No email address required. But if you want the guide in your inbox so you can keep it, forward it on or find it again without trawling through my website, I'll need to know where to send it. Fair deal, I reckon 😂"}
          </p>
          <form
            onSubmit={submit}
            aria-labelledby={`${id}-heading`}
            aria-busy={status === "loading"}
            onFocus={() => {
              if (!started.current) {
                started.current = true;
                trackEvent("salary_guide_email_started", {
                  location: position,
                });
              }
            }}
          >
            <div className="honeypot" aria-hidden="true">
              <label htmlFor={`${id}-website`}>Leave blank</label>
              <input
                id={`${id}-website`}
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <div className={styles.emailFields}>
              <div className="form-row">
                <label htmlFor={`${id}-name`}>Name</label>
                <input
                  id={`${id}-name`}
                  name="name"
                  autoComplete="name"
                  aria-describedby={`${id}-privacy ${id}-error`}
                  maxLength={80}
                  required
                  onChange={() => {
                    requestId.current = "";
                  }}
                />
              </div>
              <div className="form-row">
                <label htmlFor={`${id}-email`}>Email</label>
                <input
                  id={`${id}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-describedby={`${id}-privacy ${id}-error`}
                  maxLength={254}
                  required
                  onChange={() => {
                    requestId.current = "";
                  }}
                />
              </div>
            </div>
            <p id={`${id}-privacy`} className={styles.help}>
              Essential Resourcing will use these details to send you this
              guide, not to subscribe you to marketing. See the{" "}
              <Link href="/privacy-policy">Privacy Policy</Link>.
            </p>
            <button
              className="button button-primary"
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Sending..." : "Email me the guide"}
            </button>
            <div className={styles.emailStatus}>
              <p id={`${id}-error`} role="alert">
                {error}
              </p>
              {status === "error" && (
                <button
                  className={styles.textButton}
                  type="button"
                  onClick={copyLink}
                >
                  Copy link instead
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </div>
  );
}
