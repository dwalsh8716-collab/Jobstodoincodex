"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  salaryGuideHiringInterestLabels,
  salaryGuideHiringInterests,
} from "@/lib/salary-guide-shared";

type SalaryGuideLeadFormProps = {
  enabled: boolean;
  guideSlug: string;
};

export function SalaryGuideLeadForm({
  enabled,
  guideSlug,
}: SalaryGuideLeadFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now().toString());
  const formId = useId();
  const statusId = `${formId}-salary-guide-status`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("guideSlug", guideSlug);

    try {
      const response = await fetch("/api/salary-guide", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        redirectTo?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "The guide request could not be sent.");
      }

      setStatus("success");
      setMessage(data.message || "Thanks. Your request has been received.");
      trackEvent("salary_guide_lead", {
        form_type: "salary_guide",
        guide_slug: guideSlug,
      });
      form.reset();
      setStartedAt(Date.now().toString());
      router.push(data.redirectTo || "/salary-guides/thanks");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "The guide request could not be sent.",
      );
      trackEvent("form_error", {
        form_type: "salary_guide",
        guide_slug: guideSlug,
      });
    }
  }

  return (
    <form
      aria-busy={status === "loading"}
      aria-describedby={statusId}
      className="contact-form"
      onSubmit={onSubmit}
    >
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="salary-guide-website">Leave this field blank</label>
        <input
          autoComplete="off"
          id="salary-guide-website"
          name="website"
          tabIndex={-1}
          type="text"
        />
      </div>
      <input name="startedAt" type="hidden" value={startedAt} />
      <input name="guideSlug" type="hidden" value={guideSlug} />
      <div className="form-assurance">
        <strong>Useful salary context. No spam.</strong>
        <span>
          David will use this to understand what you are planning. Marketing
          consent is separate and never pre-ticked.
        </span>
      </div>
      {!enabled ? (
        <div className="form-trust-panel">
          <h3>Not live yet</h3>
          <p>
            The salary guide request flow is staged. It needs Railway Postgres,
            email delivery and David approval before launch.
          </p>
        </div>
      ) : null}
      <div className="form-row">
        <label htmlFor="salary-guide-name">Name</label>
        <input
          autoComplete="name"
          disabled={!enabled}
          id="salary-guide-name"
          maxLength={80}
          minLength={2}
          name="name"
          required
          type="text"
        />
      </div>
      <div className="form-row">
        <label htmlFor="salary-guide-company">Company</label>
        <input
          autoComplete="organization"
          disabled={!enabled}
          id="salary-guide-company"
          maxLength={120}
          minLength={2}
          name="company"
          required
          type="text"
        />
      </div>
      <div className="form-row">
        <label htmlFor="salary-guide-email">Email</label>
        <input
          autoComplete="email"
          disabled={!enabled}
          id="salary-guide-email"
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </div>
      <div className="form-row">
        <label htmlFor="salary-guide-job-title">
          Job title <span className="optional-label">optional</span>
        </label>
        <input
          autoComplete="organization-title"
          disabled={!enabled}
          id="salary-guide-job-title"
          maxLength={160}
          name="jobTitle"
          type="text"
        />
      </div>
      <div className="form-row">
        <label htmlFor="salary-guide-phone">
          Phone <span className="optional-label">optional</span>
        </label>
        <input
          autoComplete="tel"
          disabled={!enabled}
          id="salary-guide-phone"
          maxLength={32}
          name="phone"
          pattern="^[+0-9\\s().-]+$"
          type="tel"
        />
      </div>
      <div className="form-row">
        <label htmlFor="salary-guide-interest">Hiring interest</label>
        <select
          defaultValue=""
          disabled={!enabled}
          id="salary-guide-interest"
          name="hiringInterest"
          required
        >
          <option value="" disabled>
            Choose the closest fit
          </option>
          {salaryGuideHiringInterests.map((interest) => (
            <option key={interest} value={interest}>
              {salaryGuideHiringInterestLabels[interest]}
            </option>
          ))}
        </select>
      </div>
      <label className="consent" htmlFor="salary-guide-contact-consent">
        <input
          disabled={!enabled}
          id="salary-guide-contact-consent"
          name="consentToContact"
          required
          type="checkbox"
          value="yes"
        />
        <span>
          I agree to be contacted about this salary guide request. Read the{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </span>
      </label>
      <label className="consent" htmlFor="salary-guide-marketing-consent">
        <input
          disabled={!enabled}
          id="salary-guide-marketing-consent"
          name="marketingConsent"
          type="checkbox"
          value="yes"
        />
        <span>
          Send me occasional hiring and market notes. Optional. Not required for
          the guide.
        </span>
      </label>
      <button
        className="button button-primary"
        disabled={!enabled || status === "loading"}
        type="submit"
      >
        Request the salary guide
      </button>
      <p
        aria-live="polite"
        className={`form-status ${status}`}
        id={statusId}
        role={status === "error" ? "alert" : "status"}
      >
        {message}
      </p>
    </form>
  );
}
