"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { candidatePrivacyPath } from "@/lib/candidate-trust";

export function DataSubjectRequestConfirmForm({ token }: { token?: string }) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >(token ? "idle" : "error");
  const [message, setMessage] = useState(
    token ? "" : "This confirmation link could not be used.",
  );
  const formId = useId();
  const statusId = `${formId}-confirmation-status`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/data-request/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "This link could not be confirmed.");
      }

      setStatus("success");
      setMessage(data.message || "Thanks. Your email has been confirmed.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "This confirmation link could not be used.",
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
      <div className="form-assurance">
        <strong>Email confirmation.</strong>
        <span>
          This confirms the email address on the request. It does not release,
          change, delete or anonymise any candidate data.
        </span>
      </div>

      <button
        className="button button-primary"
        type="submit"
        disabled={!token || status === "loading" || status === "success"}
        aria-disabled={!token || status === "loading" || status === "success"}
      >
        {status === "loading" ? "Confirming..." : "Confirm my email"}
      </button>

      <p
        id={statusId}
        className={`form-status ${status}`}
        role={status === "error" ? "alert" : "status"}
        aria-live="polite"
      >
        {message}
      </p>

      <div className="button-row">
        <Link className="text-link" href="/candidate-privacy/request">
          Submit a new request
        </Link>
        <Link className="text-link" href={candidatePrivacyPath}>
          Candidate Privacy Notice
        </Link>
      </div>
    </form>
  );
}
