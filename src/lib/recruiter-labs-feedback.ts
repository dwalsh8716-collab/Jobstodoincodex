import "server-only";

import { z } from "zod";
import {
  recruiterLabsDeclineReasons,
  recruiterLabsFeedbackActions,
  type RecruiterLabsFeedbackAction,
} from "./recruiter-labs-feedback-shared";
import { logAuditEvent } from "./operations/audit";
import { getOperationsBackendStatus, runPsqlJson } from "./operations/database";
import type { OperationWriteResult, OperationsBackendStatus } from "./operations/types";
import {
  getRecruiterLabsClientPortalView,
  hashRecruiterLabsClientToken,
  isRecruiterLabsFeatureEnabled,
} from "./recruiter-labs";
import { saveRecruiterLabsPortalEngagement } from "./recruiter-labs-engagement";

type RecruiterLabsEnv = Record<string, string | undefined>;

export {
  recruiterLabsDeclineReasonLabels,
  recruiterLabsDeclineReasons,
  recruiterLabsFeedbackActionLabels,
  recruiterLabsFeedbackActions,
} from "./recruiter-labs-feedback-shared";
export type { RecruiterLabsDeclineReason } from "./recruiter-labs-feedback-shared";

const feedbackStatusByAction = {
  shortlist: "shortlisted",
  interested: "interested",
  maybe: "maybe",
  decline: "declined",
  request_interview: "interview_requested",
  need_more_info: "needs_more_info",
} as const satisfies Record<RecruiterLabsFeedbackAction, string>;

const recruiterLabsFeedbackPayloadSchema = z
  .object({
    token: z.string().trim().regex(/^[A-Za-z0-9_-]{32,256}$/),
    shortlistCandidateId: z.string().uuid(),
    action: z.enum(recruiterLabsFeedbackActions),
    declineReason: z.enum(recruiterLabsDeclineReasons).optional(),
    comment: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .transform((value) => (value ? value : undefined)),
  })
  .superRefine((payload, ctx) => {
    if (payload.action === "decline" && !payload.declineReason) {
      ctx.addIssue({
        code: "custom",
        path: ["declineReason"],
        message: "Decline feedback needs a reason.",
      });
    }

    if (payload.action !== "decline" && payload.declineReason) {
      ctx.addIssue({
        code: "custom",
        path: ["declineReason"],
        message: "Decline reason only applies to declined candidates.",
      });
    }
  });

export type RecruiterLabsFeedbackPayload = z.infer<
  typeof recruiterLabsFeedbackPayloadSchema
>;

export type RecruiterLabsFeedbackReadiness = {
  portalEnabled: boolean;
  feedbackEnabled: boolean;
  databaseStatus: OperationsBackendStatus;
  ready: boolean;
};

export type RecruiterLabsFeedbackResult = OperationWriteResult & {
  status: number;
  code:
    | "ok"
    | "invalid_payload"
    | "feedback_disabled"
    | "database_unavailable"
    | "portal_access_denied"
    | "candidate_not_scoped"
    | "database_write_failed"
    | "audit_log_failed";
};

export function parseRecruiterLabsFeedbackPayload(input: unknown) {
  return recruiterLabsFeedbackPayloadSchema.safeParse(input);
}

function readinessFromEnv(
  env: RecruiterLabsEnv = process.env,
): RecruiterLabsFeedbackReadiness {
  const portalEnabled = isRecruiterLabsFeatureEnabled(
    "FEATURE_CLIENT_PRESENTATION_PORTAL",
    env,
  );
  const feedbackEnabled = isRecruiterLabsFeatureEnabled(
    "FEATURE_SHORTLIST_FEEDBACK_TRACKING",
    env,
  );
  const databaseStatus: OperationsBackendStatus =
    env === process.env
      ? getOperationsBackendStatus()
      : {
          enabled: env.OPERATIONS_DB_ENABLED === "true",
          configured: Boolean(env.DATABASE_URL),
          state:
            env.OPERATIONS_DB_ENABLED !== "true"
              ? "disabled"
              : env.DATABASE_URL
                ? "ready"
                : "missing_database_url",
          message: env.DATABASE_URL
            ? "Private operations database is configured."
            : "Private operations database is not ready.",
        };

  return {
    portalEnabled,
    feedbackEnabled,
    databaseStatus,
    ready:
      portalEnabled &&
      feedbackEnabled &&
      databaseStatus.enabled &&
      databaseStatus.configured &&
      databaseStatus.state === "ready",
  };
}

export function getRecruiterLabsFeedbackReadiness(
  env: RecruiterLabsEnv = process.env,
) {
  return readinessFromEnv(env);
}

function result(
  code: RecruiterLabsFeedbackResult["code"],
  status: number,
  reason?: string,
  id?: string,
): RecruiterLabsFeedbackResult {
  return {
    ok: code === "ok",
    required: status >= 500,
    status,
    code,
    reason,
    id,
  };
}

async function insertRecruiterLabsFeedback(
  payload: RecruiterLabsFeedbackPayload,
  tokenHash: string,
): Promise<{ id: string }> {
  return runPsqlJson<{ id: string }>(
    `
      with payload as (
        select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
      ),
      token_record as (
        select id, shortlist_id
        from recruiter_lab_client_access_tokens
        where token_hash = (select data->>'tokenHash' from payload)
          and revoked_at is null
          and expires_at > now()
        limit 1
      ),
      scoped_candidate as (
        select c.id
        from recruiter_lab_shortlist_candidates c
        join token_record t on t.shortlist_id = c.shortlist_id
        where c.id = ((select data->>'shortlistCandidateId' from payload))::uuid
        limit 1
      ),
      created_feedback as (
        insert into recruiter_lab_shortlist_feedback (
          shortlist_candidate_id,
          access_token_id,
          feedback_action,
          decline_reason,
          feedback_note,
          status_update,
          notification_required,
          metadata
        )
        select
          c.id,
          t.id,
          data->>'action',
          nullif(data->>'declineReason', ''),
          nullif(data->>'comment', ''),
          data->>'statusUpdate',
          coalesce((data->>'notificationRequired')::boolean, true),
          jsonb_build_object(
            'source', 'client_shortlist_portal',
            'declineReason', nullif(data->>'declineReason', ''),
            'statusUpdate', data->>'statusUpdate',
            'notificationRequired', coalesce((data->>'notificationRequired')::boolean, true)
          )
        from payload, token_record t, scoped_candidate c
        returning id, shortlist_candidate_id, feedback_action, decline_reason, status_update
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
          'recruiter_labs_shortlist_candidate',
          shortlist_candidate_id,
          'client_portal_feedback',
          'Client portal feedback received',
          'Feedback was submitted from the private shortlist portal.',
          jsonb_build_object(
            'feedbackAction', feedback_action,
            'declineReason', decline_reason
          )
        from created_feedback
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
          'recruiter_labs_shortlist_candidate',
          shortlist_candidate_id,
          case
            when feedback_action = 'request_interview' then 'Client requested an interview'
            when feedback_action = 'need_more_info' then 'Client needs more information'
            else 'Review client shortlist feedback'
          end,
          'Review the private portal feedback in Postgres before replying to the client.',
          case
            when feedback_action = 'request_interview' then 'urgent'
            when feedback_action in ('decline', 'need_more_info') then 'high'
            else 'normal'
          end
        from created_feedback
        returning id
      ),
      interview_request as (
        insert into recruiter_lab_interview_requests (
          shortlist_candidate_id,
          feedback_id,
          status,
          metadata
        )
        select
          shortlist_candidate_id,
          id,
          'requested',
          jsonb_build_object('source', 'client_shortlist_portal')
        from created_feedback
        where feedback_action = 'request_interview'
        returning id
      ),
      candidate_update as (
        update recruiter_lab_shortlist_candidates c
        set
          client_feedback_status = (select data->>'statusUpdate' from payload),
          latest_feedback_at = now(),
          updated_at = now()
        from created_feedback f
        where c.id = f.shortlist_candidate_id
        returning c.id
      ),
      feedback_update as (
        update recruiter_lab_shortlist_feedback f
        set
          activity_event_id = (select id from activity),
          admin_task_id = (select id from task),
          metadata = f.metadata ||
            jsonb_build_object(
              'activityEventId', (select id from activity),
              'adminTaskId', (select id from task),
              'interviewRequestId', (select id from interview_request)
            )
        from created_feedback cf
        where f.id = cf.id
        returning f.id
      )
      select json_build_object('id', id)::text from feedback_update;
    `,
    {
      ...payload,
      tokenHash,
      statusUpdate: feedbackStatusByAction[payload.action],
      notificationRequired: [
        "decline",
        "request_interview",
        "need_more_info",
      ].includes(payload.action),
    },
  );
}

export async function saveRecruiterLabsClientFeedback(
  input: unknown,
  env: RecruiterLabsEnv = process.env,
): Promise<RecruiterLabsFeedbackResult> {
  const parsed = parseRecruiterLabsFeedbackPayload(input);
  if (!parsed.success) {
    return result("invalid_payload", 400, "invalid_payload");
  }

  const readiness = getRecruiterLabsFeedbackReadiness(env);
  if (!readiness.portalEnabled || !readiness.feedbackEnabled) {
    return result("feedback_disabled", 503, "feature_flag_disabled");
  }

  if (!readiness.ready) {
    return result("database_unavailable", 503, readiness.databaseStatus.state);
  }

  const tokenHash = hashRecruiterLabsClientToken(parsed.data.token);
  if (!tokenHash) {
    return result("invalid_payload", 400, "invalid_payload");
  }

  const portalView = await getRecruiterLabsClientPortalView(
    parsed.data.token,
    env,
  );

  if (!portalView.decision.allowed || !portalView.shortlist) {
    return result("portal_access_denied", 403, portalView.decision.state);
  }

  const scopedCandidate = portalView.shortlist.candidates.some(
    (candidate) => candidate.id === parsed.data.shortlistCandidateId,
  );

  if (!scopedCandidate) {
    return result("candidate_not_scoped", 403, "candidate_not_scoped");
  }

  let writeResult: { id: string };

  try {
    writeResult = await insertRecruiterLabsFeedback(parsed.data, tokenHash);
  } catch {
    return result("database_write_failed", 500, "database_write_failed");
  }

  const auditResult = await logAuditEvent(
    {
      action: "recruiter_labs_feedback_created",
      entityType: "recruiter_labs_feedback",
      entityId: writeResult.id,
      metadata: {
        feedbackAction: parsed.data.action,
        declineReason: parsed.data.declineReason,
        shortlistCandidateId: parsed.data.shortlistCandidateId,
      },
    },
    { required: true },
  );

  if (!auditResult.ok) {
    return result("audit_log_failed", 500, auditResult.reason, writeResult.id);
  }

  await saveRecruiterLabsPortalEngagement(
    {
      token: parsed.data.token,
      shortlistCandidateId: parsed.data.shortlistCandidateId,
      eventType: "feedback_submitted",
      location: "client_feedback_form",
    },
    env,
  ).catch(() => undefined);

  return result("ok", 200, undefined, writeResult.id);
}
