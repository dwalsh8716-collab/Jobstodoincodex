import "server-only";

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promisify } from "node:util";
import type { ContactFormPayload } from "@/validations/contact";
import { candidatePrivacyNoticeVersion } from "@/lib/candidate-trust";
import type {
  OperationsBackendStatus,
  OperationsOverview,
  OperationWriteResult,
} from "./types";

type RequestMeta = {
  ip?: string;
  userAgent?: string;
};

const execFileAsync = promisify(execFile);
const commandTimeoutMs = 15_000;

function operationsEnabled() {
  return process.env.OPERATIONS_DB_ENABLED === "true";
}

export function getOperationsBackendStatus(): OperationsBackendStatus {
  const enabled = operationsEnabled();
  const configured = Boolean(process.env.DATABASE_URL);

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

function hashPrivateValue(value?: string) {
  const salt = process.env.OPERATIONS_PRIVACY_SALT || process.env.CMS_GATE_SECRET;
  if (!value || !salt) return undefined;
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

function toBase64Json(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

async function runPsqlJson<T>(sql: string, payload?: unknown): Promise<T> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is missing.");

  const args = [
    "--dbname",
    databaseUrl,
    "--set",
    "ON_ERROR_STOP=1",
    "--tuples-only",
    "--no-align",
    "--quiet",
  ];

  if (payload !== undefined) {
    args.push("--set", `payload=${toBase64Json(payload)}`);
  }

  args.push("--command", sql);

  const { stdout } = await execFileAsync("psql", args, {
    timeout: commandTimeoutMs,
    maxBuffer: 1024 * 1024,
  });

  const trimmed = stdout.trim();
  if (!trimmed) throw new Error("Database returned no data.");
  return JSON.parse(trimmed) as T;
}

export async function saveContactEnquiryToOperations(
  payload: ContactFormPayload,
  meta: RequestMeta = {},
): Promise<OperationWriteResult> {
  const status = getOperationsBackendStatus();
  const required = status.enabled;

  if (!status.enabled) {
    return { ok: true, required: false, reason: status.state };
  }

  if (!status.configured) {
    return { ok: false, required, reason: status.state };
  }

  const record = {
    source: "website_contact_form",
    enquiryType: payload.type,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    company: payload.company,
    jobTitle: payload.jobTitle,
    message: payload.message,
    serviceInterest: payload.briefType,
    preferredContactMethod: payload.phone ? "phone_or_email" : "email",
    consentToContact: payload.consent === "yes",
    marketingConsent: false,
    priority: payload.type === "client" ? "high" : "normal",
    ipHash: hashPrivateValue(meta.ip),
    userAgentHash: hashPrivateValue(meta.userAgent),
    privacyNoticeVersion:
      payload.type === "client"
        ? "operations-foundation-v1"
        : candidatePrivacyNoticeVersion,
  };

  try {
    const result = await runPsqlJson<{ id: string }>(
      `
        with payload as (
          select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
        ),
        created as (
          insert into enquiries (
            source,
            enquiry_type,
            name,
            email,
            phone,
            company,
            job_title,
            message,
            service_interest,
            preferred_contact_method,
            consent_to_contact,
            marketing_consent,
            priority,
            metadata
          )
          select
            data->>'source',
            data->>'enquiryType',
            data->>'name',
            data->>'email',
            nullif(data->>'phone', ''),
            nullif(data->>'company', ''),
            nullif(data->>'jobTitle', ''),
            data->>'message',
            nullif(data->>'serviceInterest', ''),
            nullif(data->>'preferredContactMethod', ''),
            coalesce((data->>'consentToContact')::boolean, false),
            coalesce((data->>'marketingConsent')::boolean, false),
            coalesce(nullif(data->>'priority', ''), 'normal'),
            jsonb_build_object(
              'privacyNoticeVersion', data->>'privacyNoticeVersion'
            )
          from payload
          returning id
        ),
        activity as (
          insert into activities (
            entity_type,
            entity_id,
            activity_type,
            title,
            description
          )
          select
            'enquiry',
            id,
            'enquiry_created',
            'Website enquiry received',
            'Created from the Essential Resourcing contact form.'
          from created
          returning id
        ),
        consent as (
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
            'enquiry',
            created.id,
            'contact',
            'granted',
            'website_contact_form',
            payload.data->>'privacyNoticeVersion',
            nullif(payload.data->>'ipHash', ''),
            nullif(payload.data->>'userAgentHash', '')
          from created, payload
          returning id
        )
        select json_build_object('id', created.id)::text from created;
      `,
      record,
    );

    return { ok: true, required, id: result.id };
  } catch (error) {
    console.error("Operations database write failed", {
      reason: error instanceof Error ? error.message : "unknown",
      enquiryType: payload.type,
    });

    return { ok: false, required, reason: "database_write_failed" };
  }
}

export async function getOperationsOverview(): Promise<OperationsOverview> {
  const status = getOperationsBackendStatus();

  if (!status.enabled || !status.configured) {
    return {
      status,
      enquiryCount: 0,
      newEnquiryCount: 0,
      candidateCount: 0,
      applicationCount: 0,
      openTaskCount: 0,
      latestEnquiries: [],
    };
  }

  try {
    return await runPsqlJson<OperationsOverview>(`
      select json_build_object(
        'status', json_build_object(
          'enabled', true,
          'configured', true,
          'state', 'ready',
          'message', 'Private operations database is connected.'
        ),
        'enquiryCount', (select count(*)::int from enquiries),
        'newEnquiryCount', (select count(*)::int from enquiries where status = 'new'),
        'candidateCount', (select count(*)::int from candidates),
        'applicationCount', (select count(*)::int from applications),
        'openTaskCount', (select count(*)::int from tasks where status in ('open', 'in_progress', 'waiting')),
        'latestEnquiries', coalesce((
          select json_agg(row_to_json(latest))
          from (
            select
              id::text,
              name,
              enquiry_type as "enquiryType",
              service_interest as "serviceInterest",
              status,
              priority,
              created_at as "createdAt"
            from enquiries
            order by created_at desc
            limit 8
          ) latest
        ), '[]'::json)
      )::text;
    `);
  } catch (error) {
    console.error("Operations database overview failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });

    return {
      status: {
        ...status,
        state: "unavailable",
        message:
          "Private operations database is configured, but the app could not read it. Check Railway logs, psql and migrations.",
      },
      enquiryCount: 0,
      newEnquiryCount: 0,
      candidateCount: 0,
      applicationCount: 0,
      openTaskCount: 0,
      latestEnquiries: [],
    };
  }
}
