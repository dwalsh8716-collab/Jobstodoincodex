import "server-only";

import {
  getOperationsBackendStatus,
  hashPrivateValue,
  runPsqlJson,
} from "./database";
import type { OperationWriteResult } from "./types";

export const auditActions = [
  "candidate_created",
  "candidate_viewed",
  "candidate_updated",
  "candidate_deleted",
  "candidate_anonymised",
  "application_created",
  "application_viewed",
  "application_updated",
  "application_status_changed",
  "cv_uploaded",
  "cv_viewed",
  "cv_downloaded",
  "cv_deleted",
  "signed_url_generated",
  "note_created",
  "note_updated",
  "note_deleted",
  "task_created",
  "task_completed",
  "consent_created",
  "consent_updated",
  "dsar_request_created",
  "dsar_request_viewed",
  "dsar_export_generated",
  "dsar_export_downloaded",
  "dsar_deletion_approved",
  "dsar_deletion_completed",
  "admin_user_created",
  "admin_user_role_changed",
  "login_success",
  "login_failed",
  "logout",
  "operations_dashboard_viewed",
  "audit_log_viewed",
  "labs_dashboard_viewed",
  "recruiter_labs_dashboard_viewed",
  "recruiter_labs_launch_gate_reviewed",
  "recruiter_labs_access_granted",
  "recruiter_labs_access_denied",
  "recruiter_labs_candidate_shared",
  "recruiter_labs_candidate_withheld",
  "recruiter_labs_feedback_created",
  "recruiter_labs_interview_requested",
  "recruiter_labs_rollback_started",
] as const;

export type AuditAction = (typeof auditActions)[number];

export const auditEntityTypes = [
  "candidate",
  "application",
  "cv_file",
  "note",
  "task",
  "consent_record",
  "data_subject_request",
  "admin_user",
  "auth_session",
  "admin_dashboard",
  "labs_dashboard",
  "recruiter_labs_dashboard",
  "recruiter_labs_launch_gate",
  "recruiter_labs_shortlist",
  "recruiter_labs_shortlist_candidate",
  "recruiter_labs_access_token",
  "recruiter_labs_feedback",
  "recruiter_labs_interview_request",
  "audit_log",
  "enquiry",
] as const;

export type AuditEntityType = (typeof auditEntityTypes)[number];

type AuditActor = {
  id?: string;
  email?: string;
  role?: string;
};

type AuditRequestMeta = {
  ip?: string;
  userAgent?: string;
};

export type AuditEventInput = {
  actor?: AuditActor;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  entityLabel?: string;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
};

export type AuditLogSummary = {
  id: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityLabel?: string;
  metadata: unknown;
  createdAt: string;
};

export type AuditLogFilters = {
  entityType?: string;
  action?: string;
  actor?: string;
  entityId?: string;
};

export type AuditLogOverview = {
  status: ReturnType<typeof getOperationsBackendStatus>;
  totalCount: number;
  latest: AuditLogSummary[];
};

const sensitiveKeyPattern =
  /(password|secret|token|accessToken|refreshToken|authorization|cookie|cvText|cvContent|fileContent|signedUrl|storageKey|rawCv|rawFile)/i;
const piiHeavyKeyPattern =
  /^(message|notes|note|coverMessage|description|completionNotes)$/i;

export function sanitiseAuditValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => sanitiseAuditValue(item));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
        if (sensitiveKeyPattern.test(key)) return [key, "[redacted]"];
        if (piiHeavyKeyPattern.test(key)) return [key, "[not logged]"];
        return [key, sanitiseAuditValue(entry)];
      }),
    );
  }

  if (typeof value === "string" && value.length > 500) {
    return `${value.slice(0, 500)}...`;
  }

  return value;
}

export async function logAuditEvent(
  input: AuditEventInput,
  options: { required?: boolean; meta?: AuditRequestMeta } = {},
): Promise<OperationWriteResult> {
  const status = getOperationsBackendStatus();
  const required = Boolean(options.required);

  if (!status.enabled) {
    return { ok: true, required: false, reason: status.state };
  }

  if (!status.configured) {
    return { ok: false, required, reason: status.state };
  }

  const record = {
    actorId: input.actor?.id,
    actorEmail: input.actor?.email,
    actorRole: input.actor?.role,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    entityLabel: input.entityLabel,
    before: sanitiseAuditValue(input.before),
    after: sanitiseAuditValue(input.after),
    metadata: sanitiseAuditValue(input.metadata || {}),
    ipHash: hashPrivateValue(options.meta?.ip),
    userAgentHash: hashPrivateValue(options.meta?.userAgent),
  };

  try {
    const result = await runPsqlJson<{ id: string }>(
      `
        with payload as (
          select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
        ),
        created as (
          insert into audit_logs (
            actor_id,
            actor_email,
            actor_role,
            action,
            entity_type,
            entity_id,
            entity_label,
            before,
            after,
            metadata,
            ip_hash,
            user_agent_hash
          )
          select
            nullif(data->>'actorId', '')::uuid,
            nullif(data->>'actorEmail', ''),
            nullif(data->>'actorRole', ''),
            data->>'action',
            data->>'entityType',
            nullif(data->>'entityId', '')::uuid,
            nullif(data->>'entityLabel', ''),
            coalesce(data->'before', 'null'::jsonb),
            coalesce(data->'after', 'null'::jsonb),
            coalesce(data->'metadata', '{}'::jsonb),
            nullif(data->>'ipHash', ''),
            nullif(data->>'userAgentHash', '')
          from payload
          returning id
        )
        select json_build_object('id', created.id)::text from created;
      `,
      record,
    );

    return { ok: true, required, id: result.id };
  } catch (error) {
    console.error("Audit log write failed", {
      reason: error instanceof Error ? error.message : "unknown",
      action: input.action,
      entityType: input.entityType,
    });

    return { ok: false, required, reason: "audit_log_write_failed" };
  }
}

export async function getAuditLogOverview(
  filters: AuditLogFilters = {},
): Promise<AuditLogOverview> {
  const status = getOperationsBackendStatus();

  if (!status.enabled || !status.configured) {
    return {
      status,
      totalCount: 0,
      latest: [],
    };
  }

  try {
    return await runPsqlJson<AuditLogOverview>(
      `
        with payload as (
          select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
        ),
        filtered as (
          select *
          from audit_logs, payload
          where (
            coalesce(nullif(payload.data->>'entityType', ''), '') = ''
            or audit_logs.entity_type = payload.data->>'entityType'
          )
          and (
            coalesce(nullif(payload.data->>'action', ''), '') = ''
            or audit_logs.action = payload.data->>'action'
          )
          and (
            coalesce(nullif(payload.data->>'actor', ''), '') = ''
            or audit_logs.actor_email ilike '%' || payload.data->>'actor' || '%'
          )
          and (
            coalesce(nullif(payload.data->>'entityId', ''), '') = ''
            or audit_logs.entity_id::text = payload.data->>'entityId'
          )
        )
        select json_build_object(
          'status', json_build_object(
            'enabled', true,
            'configured', true,
            'state', 'ready',
            'message', 'Private operations database is connected.'
          ),
          'totalCount', (select count(*)::int from filtered),
          'latest', coalesce((
            select json_agg(row_to_json(latest))
            from (
              select
                id::text,
                actor_email as "actorEmail",
                actor_role as "actorRole",
                action,
                entity_type as "entityType",
                entity_id::text as "entityId",
                entity_label as "entityLabel",
                metadata,
                created_at as "createdAt"
              from filtered
              order by created_at desc
              limit 100
            ) latest
          ), '[]'::json)
        )::text;
      `,
      filters,
    );
  } catch (error) {
    console.error("Audit log overview failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });

    return {
      status: {
        ...status,
        state: "unavailable",
        message:
          "Private operations database is configured, but audit logs could not be read. Check Railway logs, psql and migrations.",
      },
      totalCount: 0,
      latest: [],
    };
  }
}
