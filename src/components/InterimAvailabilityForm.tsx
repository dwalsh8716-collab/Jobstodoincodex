"use client";

import { useId, useMemo, useState } from "react";
import {
  interimAvailabilityStatusLabels,
  interimAvailabilityStatuses,
  type InterimAvailabilityStatus,
} from "@/lib/interim-availability-shared";

type CurrentAvailability = {
  status?: InterimAvailabilityStatus | "not_confirmed" | null;
  availableFrom?: string | null;
  dayRate?: string | null;
  preferredContractType?: string | null;
  sectors?: string | null;
  functions?: string | null;
  locationPreference?: string | null;
  remotePreference?: string | null;
  contactPreference?: string | null;
  notes?: string | null;
  optedOutAt?: string | null;
};

export function InterimAvailabilityForm({
  token,
  current,
}: {
  token: string;
  current?: CurrentAvailability | null;
}) {
  const initialStatus =
    current?.status && current.status !== "not_confirmed"
      ? current.status
      : "available_now";
  const [status, setStatus] =
    useState<InterimAvailabilityStatus>(initialStatus);
  const [formStatus, setFormStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const formId = useId();
  const statusId = `${formId}-interim-availability-status`;

  const currentLabel = useMemo(() => {
    if (!current?.status || current.status === "not_confirmed") {
      return "Not confirmed yet";
    }

    return interimAvailabilityStatusLabels[current.status];
  }, [current?.status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      token,
      status: formData.get("status"),
      availableFrom: formData.get("availableFrom"),
      dayRate: formData.get("dayRate"),
      preferredContractType: formData.get("preferredContractType"),
      sectors: formData.get("sectors"),
      functions: formData.get("functions"),
      locationPreference: formData.get("locationPreference"),
      remotePreference: formData.get("remotePreference"),
      contactPreference: formData.get("contactPreference"),
      notes: formData.get("notes"),
      optOut: formData.get("optOut") === "on",
    };

    try {
      const response = await fetch("/api/interim-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "This could not be saved.");
      }

      setFormStatus("success");
      setMessage(data.message || "Thanks. Your availability has been updated.");
    } catch (error) {
      setFormStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "This could not be saved right now.",
      );
    }
  }

  return (
    <form
      className="contact-form"
      onSubmit={onSubmit}
      aria-busy={formStatus === "loading"}
      aria-describedby={statusId}
    >
      <div className="form-assurance">
        <strong>Private interim bench update.</strong>
        <span>
          Current status: {currentLabel}. This page is not listed publicly and
          does not send anything to analytics.
        </span>
      </div>

      <fieldset className="form-row">
        <legend>Availability</legend>
        <div className="choice-stack">
          {interimAvailabilityStatuses.map((option) => (
            <label className="consent" key={option}>
              <input
                type="radio"
                name="status"
                value={option}
                checked={status === option}
                onChange={() => setStatus(option)}
                required
              />
              <span>{interimAvailabilityStatusLabels[option]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-row">
        <label htmlFor="interim-available-from">
          Available from <span className="optional-label">if relevant</span>
        </label>
        <input
          id="interim-available-from"
          name="availableFrom"
          type="date"
          defaultValue={current?.availableFrom || ""}
          required={status === "available_from"}
        />
      </div>

      <div className="form-row">
        <label htmlFor="interim-day-rate">
          Day rate <span className="optional-label">optional</span>
        </label>
        <input
          id="interim-day-rate"
          name="dayRate"
          type="text"
          maxLength={80}
          defaultValue={current?.dayRate || ""}
          placeholder="e.g. £700/day"
        />
      </div>

      <div className="form-row">
        <label htmlFor="interim-contract-type">
          Preferred work <span className="optional-label">optional</span>
        </label>
        <input
          id="interim-contract-type"
          name="preferredContractType"
          type="text"
          maxLength={120}
          defaultValue={current?.preferredContractType || ""}
          placeholder="e.g. interim, fractional, fixed project"
        />
      </div>

      <div className="form-row">
        <label htmlFor="interim-sectors">
          Sectors <span className="optional-label">optional</span>
        </label>
        <textarea
          id="interim-sectors"
          name="sectors"
          rows={3}
          maxLength={500}
          defaultValue={current?.sectors || ""}
          placeholder="Sectors where you have proper evidence."
        />
      </div>

      <div className="form-row">
        <label htmlFor="interim-functions">
          Functions <span className="optional-label">optional</span>
        </label>
        <textarea
          id="interim-functions"
          name="functions"
          rows={3}
          maxLength={500}
          defaultValue={current?.functions || ""}
          placeholder="Marketing, comms, digital, agency leadership, transformation..."
        />
      </div>

      <div className="form-row">
        <label htmlFor="interim-location">
          Location or travel <span className="optional-label">optional</span>
        </label>
        <input
          id="interim-location"
          name="locationPreference"
          type="text"
          maxLength={160}
          defaultValue={current?.locationPreference || ""}
          placeholder="e.g. Manchester, North West, London hybrid, UK-wide remote"
        />
      </div>

      <div className="form-row">
        <label htmlFor="interim-remote">
          Remote preference <span className="optional-label">optional</span>
        </label>
        <input
          id="interim-remote"
          name="remotePreference"
          type="text"
          maxLength={160}
          defaultValue={current?.remotePreference || ""}
          placeholder="e.g. hybrid, mostly remote, on-site for first month"
        />
      </div>

      <div className="form-row">
        <label htmlFor="interim-contact">
          Best contact route <span className="optional-label">optional</span>
        </label>
        <input
          id="interim-contact"
          name="contactPreference"
          type="text"
          maxLength={160}
          defaultValue={current?.contactPreference || ""}
          placeholder="e.g. WhatsApp first, email first, call if urgent"
        />
      </div>

      <div className="form-row">
        <label htmlFor="interim-notes">
          Notes <span className="optional-label">optional</span>
        </label>
        <textarea
          id="interim-notes"
          name="notes"
          rows={5}
          maxLength={1000}
          defaultValue={current?.notes || ""}
          placeholder="Timing, sectors, locations or anything David should know."
        />
      </div>

      <label className="consent" htmlFor="interim-opt-out">
        <input id="interim-opt-out" name="optOut" type="checkbox" />
        <span>
          Stop sending me interim availability check-ins for now. David may
          still need to keep minimal records where required.
        </span>
      </label>

      <p className="form-note">
        CV or profile uploads are not live here yet. Message David directly if
        your CV needs replacing.
      </p>

      <button
        className="button button-primary"
        type="submit"
        disabled={formStatus === "loading"}
        aria-disabled={formStatus === "loading"}
      >
        {formStatus === "loading" ? "Saving..." : "Update availability"}
      </button>

      <p
        id={statusId}
        className={`form-status ${formStatus}`}
        role={formStatus === "error" ? "alert" : "status"}
        aria-live="polite"
      >
        {message}
      </p>
    </form>
  );
}
