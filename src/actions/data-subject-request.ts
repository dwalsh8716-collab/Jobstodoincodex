"use server";

import "server-only";
import {
  dataSubjectRequestMinimumCompletionTimeMs,
  dataSubjectRequestSchema,
  type DataSubjectRequestPayload,
} from "@/validations/data-subject-request";
import {
  dataSubjectRequestNeutralSuccess,
  dataSubjectRequestPath,
  dataSubjectRequestTypeOptions,
} from "@/lib/dsar";
import { saveDataSubjectRequestToOperations } from "@/lib/operations/store";
import { candidatePrivacyPath } from "@/lib/candidate-trust";
import { siteConfig } from "@/lib/site";

export type DataSubjectRequestActionResult = {
  ok: boolean;
  message: string;
  statusCode: number;
};

type RequestMeta = {
  ip?: string;
  userAgent?: string;
  now?: number;
};

const rateLimitWindowMs = 30 * 60 * 1000;
const rateLimitMax = 3;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function requestTypeLabel(value: DataSubjectRequestPayload["requestType"]) {
  return (
    dataSubjectRequestTypeOptions.find((option) => option.value === value)
      ?.label || value
  );
}

function rateLimitKey(payload: DataSubjectRequestPayload, meta?: RequestMeta) {
  return `${meta?.ip || "unknown"}:${payload.email.toLowerCase()}`;
}

function checkRateLimit(key: string, now: number) {
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return true;
  }

  if (current.count >= rateLimitMax) return false;
  current.count += 1;
  return true;
}

async function sendDataSubjectRequestEmails(
  payload: DataSubjectRequestPayload,
  recordId?: string,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from =
    process.env.CONTACT_FROM_EMAIL || "website@essentialresourcing.co.uk";

  if (!apiKey || !to) {
    return { sent: false };
  }

  async function sendEmail({
    recipient,
    subject,
    text,
  }: {
    recipient: string;
    subject: string;
    text: string;
  }) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipient,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      throw new Error("Email provider rejected the data request message.");
    }
  }

  await sendEmail({
    recipient: to,
    subject: "New data/privacy request received",
    text: [
      "A new data/privacy request has been submitted through Essential Resourcing.",
      "",
      `Request type: ${requestTypeLabel(payload.requestType)}`,
      `Requester: ${payload.name}`,
      `Email: ${payload.email}`,
      payload.phone ? `Phone: ${payload.phone}` : "",
      `Received: ${new Date().toISOString()}`,
      recordId ? `Admin record: ${siteConfig.url}/admin` : "Admin record: not stored in Postgres yet",
      "",
      "Do not export, delete or change private candidate data until identity has been checked and the request has been reviewed.",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  await sendEmail({
    recipient: payload.email,
    subject: "We've received your data request",
    text: [
      `Hi ${payload.name},`,
      "",
      "We've received your data/privacy request.",
      "",
      "If the details match records we hold, David will review the request and respond using the contact details provided.",
      "Identity verification may be needed. No sensitive data will be released, changed or deleted until the request has been checked properly.",
      "",
      `Candidate Privacy Notice: ${siteConfig.url}${candidatePrivacyPath}`,
      `Privacy request route: ${siteConfig.url}${dataSubjectRequestPath}`,
      "",
      "Essential Resourcing",
    ].join("\n"),
  });

  return { sent: true };
}

export async function submitDataSubjectRequest(
  input: unknown,
  meta: RequestMeta = {},
): Promise<DataSubjectRequestActionResult> {
  const parsed = dataSubjectRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      statusCode: 400,
      message: parsed.error.errors[0]?.message || "Please check the form.",
    };
  }

  const now = meta.now || Date.now();
  const payload = parsed.data;

  if (payload.website) {
    return {
      ok: false,
      statusCode: 400,
      message: "The request could not be sent.",
    };
  }

  if (now - payload.startedAt < dataSubjectRequestMinimumCompletionTimeMs) {
    return {
      ok: false,
      statusCode: 400,
      message: "Please take a moment and try again.",
    };
  }

  if (!checkRateLimit(rateLimitKey(payload, meta), now)) {
    return {
      ok: false,
      statusCode: 429,
      message: "Too many requests have been sent. Please try again later.",
    };
  }

  try {
    const operationsResult = await saveDataSubjectRequestToOperations(payload, {
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    if (!operationsResult.ok && operationsResult.required) {
      return {
        ok: false,
        statusCode: 502,
        message:
          "The request could not be safely saved right now. Please email David directly.",
      };
    }

    const emailResult = await sendDataSubjectRequestEmails(
      payload,
      operationsResult.id,
    ).catch((error) => {
      console.error("Data subject request email failed", {
        reason: error instanceof Error ? error.message : "unknown",
        requestType: payload.requestType,
        stored: Boolean(operationsResult.id),
      });

      return { sent: false };
    });

    if (!operationsResult.id && !emailResult.sent) {
      return {
        ok: false,
        statusCode: 503,
        message:
          "The privacy request route is not fully configured yet. Please email David directly.",
      };
    }

    return {
      ok: true,
      statusCode: 200,
      message: dataSubjectRequestNeutralSuccess,
    };
  } catch {
    console.error("Data subject request failed", {
      requestType: payload.requestType,
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
      hasRecipient: Boolean(process.env.CONTACT_TO_EMAIL),
      userAgent: meta.userAgent ? meta.userAgent.slice(0, 120) : undefined,
    });

    return {
      ok: false,
      statusCode: 502,
      message:
        "The request could not be sent right now. Please email David directly.",
    };
  }
}
