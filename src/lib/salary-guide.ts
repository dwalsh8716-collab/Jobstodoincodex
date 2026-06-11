import "server-only";

import { createHash } from "node:crypto";
import {
  salaryGuideLeadSchema,
  salaryGuideMinimumCompletionTimeMs,
  type SalaryGuideLeadPayload,
} from "@/validations/salary-guide";
import {
  getOperationsBackendStatus,
  hashPrivateValue,
  runPsqlJson,
} from "./operations/database";
import type { OperationsBackendStatus } from "./operations/types";

type SalaryGuideEnv = Record<string, string | undefined>;
type RequestMeta = {
  ip?: string;
  userAgent?: string;
  now?: number;
};

export const salaryGuideConfig = {
  path: "/salary-guides",
  thanksPath: "/salary-guides/thanks",
  slug: "senior-marketing-salary-guide",
  title: "Senior Marketing Salary Guide",
  description:
    "A practical salary guide for senior marketing, communications and digital hiring conversations.",
} as const;

export type SalaryGuideLeadCaptureStatus = {
  featureEnabled: boolean;
  databaseStatus: OperationsBackendStatus;
  ready: boolean;
  emailConfigured: boolean;
  downloadUrlConfigured: boolean;
  noIndex: boolean;
};

export type SalaryGuideLeadResult = {
  ok: boolean;
  statusCode: number;
  code:
    | "ok"
    | "invalid_payload"
    | "spam"
    | "too_fast"
    | "rate_limited"
    | "feature_disabled"
    | "database_unavailable"
    | "database_write_failed"
    | "email_delivery_pending";
  message: string;
};

const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMax = 4;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function operationsStatusFromEnv(
  env: SalaryGuideEnv = process.env,
): OperationsBackendStatus {
  if (env === process.env) return getOperationsBackendStatus();

  const enabled = env.OPERATIONS_DB_ENABLED === "true";
  const configured = Boolean(env.DATABASE_URL);

  if (!enabled) {
    return {
      enabled,
      configured,
      state: "disabled",
      message:
        "Private operations database is staged but not enabled. Set OPERATIONS_DB_ENABLED=true after Railway Postgres is ready.",
    };
  }

  if (!configured) {
    return {
      enabled,
      configured,
      state: "missing_database_url",
      message:
        "OPERATIONS_DB_ENABLED is true, but DATABASE_URL is missing.",
    };
  }

  return {
    enabled,
    configured,
    state: "ready",
    message: "Private operations database is configured.",
  };
}

function normaliseDownloadUrl(env: SalaryGuideEnv = process.env) {
  const value = env.SALARY_GUIDE_DOWNLOAD_URL;
  if (!value) return "";

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

export function getSalaryGuideLeadCaptureStatus(
  env: SalaryGuideEnv = process.env,
): SalaryGuideLeadCaptureStatus {
  const featureEnabled = env.FEATURE_SALARY_GUIDE_GATE === "true";
  const databaseStatus = operationsStatusFromEnv(env);
  const downloadUrlConfigured = Boolean(normaliseDownloadUrl(env));
  const emailConfigured = Boolean(
    env.RESEND_API_KEY && env.CONTACT_FROM_EMAIL && env.CONTACT_TO_EMAIL,
  );

  return {
    featureEnabled,
    databaseStatus,
    ready:
      featureEnabled &&
      databaseStatus.enabled &&
      databaseStatus.configured &&
      databaseStatus.state === "ready",
    emailConfigured,
    downloadUrlConfigured,
    noIndex: !featureEnabled,
  };
}

function rateLimitKey(payload: SalaryGuideLeadPayload, meta: RequestMeta) {
  return createHash("sha256")
    .update(`${meta.ip || "unknown"}:${payload.email.toLowerCase()}`)
    .digest("hex");
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

async function saveSalaryGuideLeadToOperations(
  payload: SalaryGuideLeadPayload,
  meta: RequestMeta,
) {
  return runPsqlJson<{ id: string }>(
    `
      with payload as (
        select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
      ),
      created as (
        insert into salary_guide_leads (
          guide_slug,
          guide_title,
          name,
          company,
          email,
          job_title,
          phone,
          hiring_interest,
          consent_to_contact,
          marketing_consent,
          lead_source,
          delivery_status,
          ip_hash,
          user_agent_hash,
          metadata
        )
        select
          data->>'guideSlug',
          data->>'guideTitle',
          data->>'name',
          data->>'company',
          data->>'email',
          nullif(data->>'jobTitle', ''),
          nullif(data->>'phone', ''),
          data->>'hiringInterest',
          coalesce((data->>'consentToContact')::boolean, false),
          coalesce((data->>'marketingConsent')::boolean, false),
          'salary_guide_landing_page',
          'pending',
          nullif(data->>'ipHash', ''),
          nullif(data->>'userAgentHash', ''),
          jsonb_build_object(
            'privacyPolicyPath', '/privacy-policy',
            'downloadUrlConfigured', coalesce((data->>'downloadUrlConfigured')::boolean, false)
          )
        from payload
        returning id, marketing_consent
      ),
      activity as (
        insert into activities (
          entity_type,
          entity_id,
          activity_type,
          title,
          description,
          metadata
        )
        select
          'salary_guide_lead',
          id,
          'salary_guide_lead_created',
          'Salary guide request received',
          'A salary guide lead was captured from the website.',
          jsonb_build_object('hiringInterest', (select data->>'hiringInterest' from payload))
        from created
        returning id
      ),
      task as (
        insert into tasks (
          entity_type,
          entity_id,
          title,
          description,
          priority
        )
        select
          'salary_guide_lead',
          id,
          'Follow up salary guide lead',
          'Review the salary guide request and follow up if email delivery is not configured.',
          'high'
        from created
        returning id
      ),
      contact_consent as (
        insert into consent_records (
          entity_type,
          entity_id,
          consent_type,
          status,
          source,
          privacy_notice_version,
          ip_hash,
          user_agent_hash
        )
        select
          'salary_guide_lead',
          created.id,
          'contact',
          'granted',
          'salary_guide_landing_page',
          'salary-guide-lead-v1',
          nullif(payload.data->>'ipHash', ''),
          nullif(payload.data->>'userAgentHash', '')
        from created, payload
        returning id
      ),
      marketing_consent as (
        insert into consent_records (
          entity_type,
          entity_id,
          consent_type,
          status,
          source,
          privacy_notice_version,
          ip_hash,
          user_agent_hash
        )
        select
          'salary_guide_lead',
          created.id,
          'marketing',
          'granted',
          'salary_guide_landing_page',
          'salary-guide-lead-v1',
          nullif(payload.data->>'ipHash', ''),
          nullif(payload.data->>'userAgentHash', '')
        from created, payload
        where created.marketing_consent = true
        returning id
      )
      select json_build_object('id', created.id)::text from created;
    `,
    {
      ...payload,
      guideTitle: salaryGuideConfig.title,
      consentToContact: payload.consentToContact === "yes",
      marketingConsent: payload.marketingConsent === "yes",
      ipHash: hashPrivateValue(meta.ip),
      userAgentHash: hashPrivateValue(meta.userAgent),
      downloadUrlConfigured: Boolean(normaliseDownloadUrl()),
    },
  );
}

async function updateSalaryGuideLeadDeliveryStatus({
  id,
  status,
  provider,
  downloadUrlSent,
}: {
  id: string;
  status: "sent" | "manual_follow_up" | "failed";
  provider?: string;
  downloadUrlSent: boolean;
}) {
  await runPsqlJson<{ id: string }>(
    `
      with payload as (
        select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
      )
      update salary_guide_leads
      set
        delivery_status = data->>'status',
        email_delivery_provider = nullif(data->>'provider', ''),
        download_url_sent = coalesce((data->>'downloadUrlSent')::boolean, false),
        updated_at = now()
      from payload
      where id = (data->>'id')::uuid
      returning json_build_object('id', salary_guide_leads.id)::text;
    `,
    { id, status, provider, downloadUrlSent },
  );
}

async function sendSalaryGuideEmails(payload: SalaryGuideLeadPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from =
    process.env.CONTACT_FROM_EMAIL || "website@essentialresourcing.co.uk";
  const downloadUrl = normaliseDownloadUrl();

  if (!apiKey || !to) {
    return { sentToLead: false, notifiedDavid: false, provider: undefined };
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
      throw new Error("Email provider rejected the message.");
    }
  }

  await sendEmail({
    recipient: to,
    subject: `Salary guide request from ${payload.name}`,
    text: [
      `Name: ${payload.name}`,
      `Company: ${payload.company}`,
      `Email: ${payload.email}`,
      payload.phone ? `Phone: ${payload.phone}` : "",
      payload.jobTitle ? `Job title: ${payload.jobTitle}` : "",
      `Hiring interest: ${payload.hiringInterest}`,
      `Marketing consent: ${payload.marketingConsent === "yes" ? "yes" : "no"}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  if (downloadUrl) {
    await sendEmail({
      recipient: payload.email,
      subject: `${salaryGuideConfig.title} from Essential Resourcing`,
      text: [
        `Hi ${payload.name},`,
        "",
        "Thanks for requesting the salary guide.",
        "",
        `Download link: ${downloadUrl}`,
        "",
        "Use it as a starting point, not gospel. Salary only makes sense with role scope, seniority, location, hybrid pattern and decision rights.",
        "",
        "If you want to sense-check a live brief, reply to this email and David will pick it up.",
        "",
        "Essential Resourcing",
      ].join("\n"),
    });
  }

  return {
    sentToLead: Boolean(downloadUrl),
    notifiedDavid: true,
    provider: "resend",
  };
}

function salaryGuideResult(
  code: SalaryGuideLeadResult["code"],
  statusCode: number,
  message: string,
): SalaryGuideLeadResult {
  return {
    ok: code === "ok" || code === "email_delivery_pending",
    statusCode,
    code,
    message,
  };
}

export async function submitSalaryGuideLead(
  input: unknown,
  meta: RequestMeta = {},
): Promise<SalaryGuideLeadResult> {
  const parsed = salaryGuideLeadSchema.safeParse(input);

  if (!parsed.success) {
    return salaryGuideResult(
      "invalid_payload",
      400,
      parsed.error.errors[0]?.message || "Please check the form.",
    );
  }

  const payload = parsed.data;
  const now = meta.now || Date.now();

  if (payload.website) {
    return salaryGuideResult("spam", 400, "The form could not be sent.");
  }

  if (now - payload.startedAt < salaryGuideMinimumCompletionTimeMs) {
    return salaryGuideResult(
      "too_fast",
      400,
      "Please take a moment and try again.",
    );
  }

  if (!checkRateLimit(rateLimitKey(payload, meta), now)) {
    return salaryGuideResult(
      "rate_limited",
      429,
      "Too many requests have been sent. Please try again later.",
    );
  }

  const status = getSalaryGuideLeadCaptureStatus();
  if (!status.featureEnabled) {
    return salaryGuideResult(
      "feature_disabled",
      503,
      "Salary guide requests are not live yet. Message David directly if you need salary advice.",
    );
  }

  if (!status.ready) {
    return salaryGuideResult(
      "database_unavailable",
      503,
      "Salary guide requests are not connected yet. Please email David directly.",
    );
  }

  let saved: { id: string };

  try {
    saved = await saveSalaryGuideLeadToOperations(payload, meta);
  } catch (error) {
    console.error("Salary guide lead write failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });

    return salaryGuideResult(
      "database_write_failed",
      502,
      "The guide request could not be saved right now. Please email David directly.",
    );
  }

  try {
    const delivery = await sendSalaryGuideEmails(payload);
    const deliveryStatus = delivery.sentToLead ? "sent" : "manual_follow_up";

    await updateSalaryGuideLeadDeliveryStatus({
      id: saved.id,
      status: deliveryStatus,
      provider: delivery.provider,
      downloadUrlSent: delivery.sentToLead,
    });

    if (!delivery.sentToLead) {
      return salaryGuideResult(
        "email_delivery_pending",
        200,
        "Thanks. Your request has been received. David will follow up directly while guide delivery is being configured.",
      );
    }

    return salaryGuideResult(
      "ok",
      200,
      "Thanks. The guide link has been sent.",
    );
  } catch (error) {
    console.error("Salary guide email delivery failed", {
      reason: error instanceof Error ? error.message : "unknown",
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
      hasDownloadUrl: Boolean(normaliseDownloadUrl()),
    });

    await updateSalaryGuideLeadDeliveryStatus({
      id: saved.id,
      status: "failed",
      provider: "resend",
      downloadUrlSent: false,
    }).catch(() => undefined);

    return salaryGuideResult(
      "email_delivery_pending",
      200,
      "Thanks. Your request has been received. David will follow up directly.",
    );
  }
}
