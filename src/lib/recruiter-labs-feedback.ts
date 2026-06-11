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
    interviewType: z
      .enum(["video", "phone", "in_person", "to_be_confirmed"])
      .optional(),
    locationPreference: z
      .enum(["google_meet", "phone", "physical", "to_be_confirmed"])
      .optional(),
    preferredTimes: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .transform((value) => (value ? value : undefined)),
    clientNotes: z
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

    if (
      payload.action !== "request_interview" &&
      (payload.interviewType ||
        payload.locationPreference ||
        payload.preferredTimes ||
        payload.clientNotes)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["action"],
        message: "Interview request details only apply to interview requests.",
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
  action?: RecruiterLabsFeedbackAction;
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
  action?: RecruiterLabsFeedbackAction,
): RecruiterLabsFeedbackResult {
  return {
    ok: code === "ok",
    required: status >= 500,
    status,
    code,
    reason,
    id,
    action,
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
        select id, shortlist_id, client_contact_id
        from recruiter_lab_client_access_tokens
        where token_hash = (select data->>'tokenHash' from payload)
          and revoked_at is null
          and expires_at > now()
        limit 1
      ),
      scoped_candidate as (
        select
          c.id,
          c.shortlist_id,
          c.candidate_id,
          c.application_id,
          s.client_company_id,
          t.client_contact_id
        from recruiter_lab_shortlist_candidates c
        join recruiter_lab_shortlists s on s.id = c.shortlist_id
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
          coalesce(nullif(data->>'clientNotes', ''), nullif(data->>'comment', '')),
          data->>'statusUpdate',
          coalesce((data->>'notificationRequired')::boolean, true),
          jsonb_build_object(
            'source', 'client_shortlist_portal',
            'declineReason', nullif(data->>'declineReason', ''),
            'statusUpdate', data->>'statusUpdate',
            'notificationRequired', coalesce((data->>'notificationRequired')::boolean, true),
            'interviewType', nullif(data->>'interviewType', ''),
            'locationPreference', nullif(data->>'locationPreference', ''),
            'preferredTimesSupplied', nullif(data->>'preferredTimes', '') is not null,
            'clientNotesSupplied', coalesce(nullif(data->>'clientNotes', ''), nullif(data->>'comment', '')) is not null
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
          shortlist_id,
          shortlist_candidate_id,
          candidate_id,
          application_id,
          client_company_id,
          client_contact_id,
          requested_by,
          feedback_id,
          status,
          request_source,
          interview_type,
          location_preference,
          preferred_times,
          client_notes,
          metadata
        )
        select
          c.shortlist_id,
          c.id,
          c.candidate_id,
          c.application_id,
          c.client_company_id,
          c.client_contact_id,
          c.client_contact_id,
          f.id,
          'requested',
          'client_shortlist_portal',
          coalesce(nullif(data->>'interviewType', ''), 'to_be_confirmed'),
          coalesce(nullif(data->>'locationPreference', ''), 'to_be_confirmed'),
          nullif(data->>'preferredTimes', ''),
          coalesce(nullif(data->>'clientNotes', ''), nullif(data->>'comment', '')),
          jsonb_build_object(
            'source', 'client_shortlist_portal',
            'preferredTimesSupplied', nullif(data->>'preferredTimes', '') is not null,
            'clientNotesSupplied', coalesce(nullif(data->>'clientNotes', ''), nullif(data->>'comment', '')) is not null,
            'candidateContactAutomatic', false,
            'calendarAutomatic', false
          )
        from payload, scoped_candidate c, created_feedback f
        where f.feedback_action = 'request_interview'
        returning id
      ),
      interview_activity as (
        insert into recruiter_lab_interview_request_activity (
          interview_request_id,
          activity_type,
          actor_type,
          actor_id,
          metadata
        )
        select
          id,
          'created_from_client_portal',
          'client',
          (select client_contact_id from scoped_candidate),
          jsonb_build_object(
            'source', 'client_shortlist_portal',
            'candidateContactAutomatic', false,
            'calendarAutomatic', false
          )
        from interview_request
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
              'interviewRequestId', (select id from interview_request),
              'interviewRequestActivityId', (select id from interview_activity)
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
    return result(
      "feedback_disabled",
      503,
      "feature_flag_disabled",
      undefined,
      parsed.data.action,
    );
  }

  if (!readiness.ready) {
    return result(
      "database_unavailable",
      503,
      readiness.databaseStatus.state,
      undefined,
      parsed.data.action,
    );
  }

  const tokenHash = hashRecruiterLabsClientToken(parsed.data.token);
  if (!tokenHash) {
    return result(
      "invalid_payload",
      400,
      "invalid_payload",
      undefined,
      parsed.data.action,
    );
  }

  const portalView = await getRecruiterLabsClientPortalView(
    parsed.data.token,
    env,
  );

  if (!portalView.decision.allowed || !portalView.shortlist) {
    return result(
      "portal_access_denied",
      403,
      portalView.decision.state,
      undefined,
      parsed.data.action,
    );
  }

  const scopedCandidate = portalView.shortlist.candidates.some(
    (candidate) => candidate.id === parsed.data.shortlistCandidateId,
  );

  if (!scopedCandidate) {
    return result(
      "candidate_not_scoped",
      403,
      "candidate_not_scoped",
      undefined,
      parsed.data.action,
    );
  }

  let writeResult: { id: string };

  try {
    writeResult = await insertRecruiterLabsFeedback(parsed.data, tokenHash);
  } catch {
    return result(
      "database_write_failed",
      500,
      "database_write_failed",
      undefined,
      parsed.data.action,
    );
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
    return result(
      "audit_log_failed",
      500,
      auditResult.reason,
      writeResult.id,
      parsed.data.action,
    );
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

  return result("ok", 200, undefined, writeResult.id, parsed.data.action);
}
