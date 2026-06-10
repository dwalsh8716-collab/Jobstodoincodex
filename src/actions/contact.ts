"use server";

import "server-only";
import {
  contactFormSchema,
  minimumCompletionTimeMs,
  type ContactFormPayload,
} from "@/validations/contact";
import { saveContactEnquiryToOperations } from "@/lib/operations/store";

export type ContactActionResult = {
  ok: boolean;
  message: string;
  statusCode: number;
};

type RequestMeta = {
  ip?: string;
  userAgent?: string;
  now?: number;
};

const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMax = 5;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function rateLimitKey(payload: ContactFormPayload, meta?: RequestMeta) {
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

async function sendWithResend(payload: ContactFormPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from =
    process.env.CONTACT_FROM_EMAIL || "website@essentialresourcing.co.uk";

  if (!apiKey || !to) {
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
      to,
      subject: `Essential Resourcing ${payload.type} enquiry from ${payload.name}`,
      text: [
        `Type: ${payload.type}`,
        payload.jobTitle ? `Job: ${payload.jobTitle}` : "",
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        payload.phone ? `Phone: ${payload.phone}` : "",
        payload.company ? `Company: ${payload.company}` : "",
        payload.linkedin ? `LinkedIn: ${payload.linkedin}` : "",
        `Brief type: ${payload.briefType}`,
        "",
        payload.message,
      ]
        .filter(Boolean)
        .join("\n"),
    }),
  });

  if (!response.ok) {
    throw new Error("Email provider rejected the message.");
  }

  return { sent: true };
}

export async function submitContactEnquiry(
  input: unknown,
  meta: RequestMeta = {},
): Promise<ContactActionResult> {
  const parsed = contactFormSchema.safeParse(input);

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
      message: "The form could not be sent.",
    };
  }

  if (now - payload.startedAt < minimumCompletionTimeMs) {
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
      message: "Too many enquiries have been sent. Please try again later.",
    };
  }

  try {
    const operationsResult = await saveContactEnquiryToOperations(payload, {
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    if (!operationsResult.ok && operationsResult.required) {
      return {
        ok: false,
        statusCode: 502,
        message:
          "The form could not be saved right now. Please email David directly.",
      };
    }

    const result = await sendWithResend(payload);
    return {
      ok: true,
      statusCode: 200,
      message: operationsResult.id
        ? "Thanks. Your enquiry has been received."
        : result.sent
          ? "Thanks. Your enquiry has been sent."
          : "Thanks. Your enquiry has been validated. Email delivery still needs to be configured before launch.",
    };
  } catch {
    console.error("Contact form delivery failed", {
      type: payload.type,
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
      hasRecipient: Boolean(process.env.CONTACT_TO_EMAIL),
      userAgent: meta.userAgent ? meta.userAgent.slice(0, 120) : undefined,
    });

    return {
      ok: false,
      statusCode: 502,
      message:
        "The form could not be sent right now. Please email David directly.",
    };
  }
}
