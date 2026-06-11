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
import {
  buildDataSubjectRequestVerificationUrl,
  createDataSubjectRequestVerificationToken,
  getDataSubjectRequestVerificationTokenHours,
  hashDataSubjectRequestVerificationToken,
} from "@/lib/dsar-verification";
import {
  getOperationsBackendStatus,
  saveDataSubjectRequestToOperations,
  verifyDataSubjectRequestEmailToken,
} from "@/lib/operations/store";
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

function getDataSubjectRequestEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const adminTo = process.env.CONTACT_TO_EMAIL;
  const from =
    process.env.CONTACT_FROM_EMAIL || "website@essentialresourcing.co.uk";

  return {
    apiKey,
    adminTo,
    from,
    configured: Boolean(apiKey && adminTo),
  };
}

type DataSubjectRequestEmailDetails = {
  name: string;
  email: string;
  phone?: string | null;
  requestType: DataSubjectRequestPayload["requestType"];
};

function emailDetailsFromPayload(
  payload: DataSubjectRequestPayload,
): DataSubjectRequestEmailDetails {
  return {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    requestType: payload.requestType,
  };
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
  const { apiKey, from } = getDataSubjectRequestEmailConfig();

  if (!apiKey) {
    return { sent: false };
  }

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

  return { sent: true };
}

async function sendDataSubjectRequestAdminEmail({
  details,
  recordId,
  emailVerified,
}: {
  details: DataSubjectRequestEmailDetails;
  recordId?: string;
  emailVerified: boolean;
}) {
  const { adminTo, configured } = getDataSubjectRequestEmailConfig();

  if (!configured || !adminTo) {
    return { sent: false };
  }

  return sendEmail({
    recipient: adminTo,
    subject: emailVerified
      ? "Verified data/privacy request ready for review"
      : "New data/privacy request received",
    text: [
      "A new data/privacy request has been submitted through Essential Resourcing.",
      "",
      `Request type: ${requestTypeLabel(details.requestType)}`,
      `Requester: ${details.name}`,
      `Email: ${details.email}`,
      details.phone ? `Phone: ${details.phone}` : "",
      `Email verified: ${emailVerified ? "yes" : "not yet"}`,
      `Received: ${new Date().toISOString()}`,
      recordId
        ? `Admin record: ${siteConfig.url}/admin`
        : "Admin record: not stored in Postgres yet",
      "",
      "Do not export, delete or change private candidate data until identity has been checked and the request has been reviewed.",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

async function sendDataSubjectRequestManualEmails(
  payload: DataSubjectRequestPayload,
  recordId?: string,
) {
  const { configured } = getDataSubjectRequestEmailConfig();

  if (!configured) {
    return { sent: false };
  }

  const adminEmail = await sendDataSubjectRequestAdminEmail({
    details: emailDetailsFromPayload(payload),
    recordId,
    emailVerified: false,
  });

  const requesterEmail = await sendEmail({
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

  return { sent: Boolean(adminEmail.sent || requesterEmail.sent) };
}

async function sendDataSubjectRequestVerificationEmail({
  payload,
  verificationUrl,
}: {
  payload: DataSubjectRequestPayload;
  verificationUrl: string;
}) {
  const { configured } = getDataSubjectRequestEmailConfig();

  if (!configured) {
    return { sent: false };
  }

  return sendEmail({
    recipient: payload.email,
    subject: "Confirm your Essential Resourcing data request",
    text: [
      `Hi ${payload.name},`,
      "",
      "Please confirm this data/privacy request came from you.",
      "",
      verificationUrl,
      "",
      "This confirms your email address only. It does not mean any data will be exported, changed, deleted or anonymised automatically.",
      "David still reviews the request before any action is taken.",
      "",
      `Candidate Privacy Notice: ${siteConfig.url}${candidatePrivacyPath}`,
      "",
      "Essential Resourcing",
    ].join("\n"),
  });
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
    const operationsStatus = getOperationsBackendStatus();
    const emailConfig = getDataSubjectRequestEmailConfig();
    const useEmailVerification =
      operationsStatus.enabled &&
      operationsStatus.configured &&
      emailConfig.configured;
    const verificationToken = useEmailVerification
      ? createDataSubjectRequestVerificationToken()
      : undefined;
    const verificationRequestedAt = new Date(now);
    const verificationExpiresAt = new Date(
      now + getDataSubjectRequestVerificationTokenHours() * 60 * 60 * 1000,
    );
    const verificationUrl = verificationToken
      ? buildDataSubjectRequestVerificationUrl(verificationToken.token)
      : undefined;
    const operationsResult = await saveDataSubjectRequestToOperations(payload, {
      ip: meta.ip,
      userAgent: meta.userAgent,
      emailVerification: verificationToken
        ? {
            tokenHash: verificationToken.tokenHash,
            requestedAt: verificationRequestedAt,
            expiresAt: verificationExpiresAt,
          }
        : undefined,
    });

    if (!operationsResult.ok && operationsResult.required) {
      return {
        ok: false,
        statusCode: 502,
        message:
          "The request could not be safely saved right now. Please email David directly.",
      };
    }

    const emailResult =
      verificationUrl && operationsResult.id
        ? await sendDataSubjectRequestVerificationEmail({
            payload,
            verificationUrl,
          }).catch((error) => {
            console.error("Data subject request verification email failed", {
              reason: error instanceof Error ? error.message : "unknown",
              requestType: payload.requestType,
              stored: Boolean(operationsResult.id),
            });

            return { sent: false };
          })
        : await sendDataSubjectRequestManualEmails(
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

    if (verificationUrl && operationsResult.id && !emailResult.sent) {
      return {
        ok: false,
        statusCode: 502,
        message:
          "The confirmation email could not be sent right now. Please email David directly.",
      };
    }

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

export async function confirmDataSubjectRequestEmail(
  token: unknown,
): Promise<DataSubjectRequestActionResult> {
  const cleanedToken = typeof token === "string" ? token.trim() : "";

  if (!/^[A-Za-z0-9_-]{32,200}$/.test(cleanedToken)) {
    return {
      ok: false,
      statusCode: 400,
      message:
        "This confirmation link could not be used. Please submit a new request or email David directly.",
    };
  }

  const result = await verifyDataSubjectRequestEmailToken(
    hashDataSubjectRequestVerificationToken(cleanedToken),
  );

  if (!result.ok || !result.request) {
    return {
      ok: false,
      statusCode: result.reason === "backend_unavailable" ? 503 : 400,
      message:
        "This confirmation link could not be used. Please submit a new request or email David directly.",
    };
  }

  await sendDataSubjectRequestAdminEmail({
    details: {
      name: result.request.requesterName,
      email: result.request.requesterEmail,
      phone: result.request.requesterPhone,
      requestType: result.request.requestType,
    },
    recordId: result.request.id,
    emailVerified: true,
  }).catch((error) => {
    console.error("Data subject request verified admin email failed", {
      reason: error instanceof Error ? error.message : "unknown",
      requestType: result.request?.requestType,
    });

    return { sent: false };
  });

  return {
    ok: true,
    statusCode: 200,
    message:
      "Thanks. Your email has been confirmed. David will now review the request before any data is released, changed or deleted.",
  };
}
