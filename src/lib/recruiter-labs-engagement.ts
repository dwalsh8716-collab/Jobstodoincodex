import "server-only";

import { z } from "zod";
import { getOperationsBackendStatus, runPsqlJson } from "./operations/database";
import type { OperationWriteResult, OperationsBackendStatus } from "./operations/types";
import {
  getRecruiterLabsClientPortalView,
  hashRecruiterLabsClientToken,
  isRecruiterLabsClientPortalFeatureEnabled,
  isRecruiterLabsFeatureEnabled,
} from "./recruiter-labs";
import {
  recruiterLabsPortalEngagementEvents,
  type RecruiterLabsPortalEngagementEvent,
} from "./recruiter-labs-engagement-shared";

type RecruiterLabsEnv = Record<string, string | undefined>;

const candidateScopedEvents = new Set<RecruiterLabsPortalEngagementEvent>([
  "candidate_card_viewed",
  "candidate_profile_expanded",
  "candidate_profile_opened",
  "candidate_profile_collapsed",
  "modal_opened",
  "modal_closed",
  "candidate_profile_dwell_time",
  "cv_viewed",
  "cv_downloaded",
  "feedback_submitted",
  "candidate_shortlisted",
  "candidate_declined",
  "interview_requested",
  "need_more_info_clicked",
]);

const dwellEvents = new Set<RecruiterLabsPortalEngagementEvent>([
  "dwell_ping",
  "candidate_profile_dwell_time",
]);

const recruiterLabsEngagementPayloadSchema = z
  .object({
    token: z.string().trim().regex(/^[A-Za-z0-9_-]{32,256}$/),
    shortlistCandidateId: z.string().uuid().optional(),
    eventType: z.enum(recruiterLabsPortalEngagementEvents),
    dwellMilliseconds: z.number().int().min(5000).max(1_800_000).optional(),
    location: z
      .string()
      .trim()
      .max(80)
      .regex(/^[a-z0-9_-]+$/i)
      .optional(),
  })
  .superRefine((payload, ctx) => {
    if (
      candidateScopedEvents.has(payload.eventType) &&
      !payload.shortlistCandidateId
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["shortlistCandidateId"],
        message: "This engagement event needs a scoped shortlist candidate.",
      });
    }

    if (dwellEvents.has(payload.eventType) && !payload.dwellMilliseconds) {
      ctx.addIssue({
        code: "custom",
        path: ["dwellMilliseconds"],
        message: "Dwell events need a duration.",
      });
    }

    if (!dwellEvents.has(payload.eventType) && payload.dwellMilliseconds) {
      ctx.addIssue({
        code: "custom",
        path: ["dwellMilliseconds"],
        message: "Dwell duration only applies to dwell events.",
      });
    }
  });

export type RecruiterLabsEngagementPayload = z.infer<
  typeof recruiterLabsEngagementPayloadSchema
>;

export type RecruiterLabsEngagementReadiness = {
  portalEnabled: boolean;
  feedbackTrackingEnabled: boolean;
  databaseStatus: OperationsBackendStatus;
  ready: boolean;
};

export type RecruiterLabsEngagementResult = OperationWriteResult & {
  status: number;
  code:
    | "ok"
    | "duplicate_ignored"
    | "invalid_payload"
    | "tracking_disabled"
    | "database_unavailable"
    | "portal_access_denied"
    | "candidate_not_scoped"
    | "database_write_failed";
};

export {
  recruiterLabsPortalEngagementEventLabels,
  recruiterLabsPortalEngagementEvents,
} from "./recruiter-labs-engagement-shared";

export function parseRecruiterLabsEngagementPayload(input: unknown) {
  return recruiterLabsEngagementPayloadSchema.safeParse(input);
}

function readinessFromEnv(
  env: RecruiterLabsEnv = process.env,
): RecruiterLabsEngagementReadiness {
  const portalEnabled = isRecruiterLabsClientPortalFeatureEnabled(env);
  const feedbackTrackingEnabled = isRecruiterLabsFeatureEnabled(
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
    feedbackTrackingEnabled,
    databaseStatus,
    ready:
      portalEnabled &&
      feedbackTrackingEnabled &&
      databaseStatus.enabled &&
      databaseStatus.configured &&
      databaseStatus.state === "ready",
  };
}

export function getRecruiterLabsEngagementReadiness(
  env: RecruiterLabsEnv = process.env,
) {
  return readinessFromEnv(env);
}

function result(
  code: RecruiterLabsEngagementResult["code"],
  status: number,
  reason?: string,
  id?: string,
): RecruiterLabsEngagementResult {
  return {
    ok: code === "ok" || code === "duplicate_ignored",
    required: status >= 500,
    status,
    code,
    reason,
    id,
  };
}

function dedupeSecondsForEvent(eventType: RecruiterLabsPortalEngagementEvent) {
  if (eventType === "shortlist_opened") return 60;
  if (eventType === "shortlist_viewed") return 60;
  if (
    eventType === "dwell_ping" ||
    eventType === "candidate_profile_dwell_time"
  ) {
    return 20;
  }
  if (eventType === "feedback_submitted") return 30;
  if (eventType === "interview_requested") return 30;
  return 15;
}

async function insertRecruiterLabsEngagementEvent(
  payload: RecruiterLabsEngagementPayload,
  tokenHash: string,
): Promise<{ id?: string; stored: boolean }> {
  return runPsqlJson<{ id?: string; stored: boolean }>(
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
        where nullif((select data->>'shortlistCandidateId' from payload), '') is not null
          and c.id = nullif((select data->>'shortlistCandidateId' from payload), '')::uuid
        limit 1
      ),
      candidate_gate as (
        select
          nullif((select data->>'shortlistCandidateId' from payload), '') is null
          or exists(select 1 from scoped_candidate) as allowed
      ),
      inserted as (
        insert into recruiter_lab_portal_engagement_events (
          shortlist_id,
          shortlist_candidate_id,
          access_token_id,
          event_type,
          dwell_milliseconds,
          metadata
        )
        select
          t.shortlist_id,
          (select id from scoped_candidate),
          t.id,
          data->>'eventType',
          nullif(data->>'dwellMilliseconds', '')::integer,
          jsonb_strip_nulls(jsonb_build_object(
            'source', 'client_shortlist_portal',
            'location', nullif(data->>'location', ''),
            'privacyBoundary', 'private_postgres_only',
            'qualitySignal', false
          ))
        from payload, token_record t
        where (select allowed from candidate_gate)
          and not exists (
            select 1
            from recruiter_lab_portal_engagement_events e
            where e.access_token_id = t.id
              and e.event_type = data->>'eventType'
              and e.shortlist_candidate_id is not distinct from (select id from scoped_candidate)
              and e.created_at > now() - (((data->>'dedupeSeconds')::integer) * interval '1 second')
          )
        returning id, shortlist_candidate_id, event_type, dwell_milliseconds
      ),
      candidate_update as (
        update recruiter_lab_shortlist_candidates c
        set
          latest_engagement_at = now(),
          total_dwell_seconds = total_dwell_seconds +
            case
              when (select event_type from inserted limit 1) in ('dwell_ping', 'candidate_profile_dwell_time')
              then ceil(coalesce((select dwell_milliseconds from inserted limit 1), 0) / 1000.0)::integer
              else 0
            end,
          profile_expand_count = profile_expand_count +
            case when (select event_type from inserted limit 1) in ('candidate_profile_expanded', 'candidate_profile_opened') then 1 else 0 end,
          candidate_card_view_count = candidate_card_view_count +
            case when (select event_type from inserted limit 1) = 'candidate_card_viewed' then 1 else 0 end,
          cv_view_count = cv_view_count +
            case when (select event_type from inserted limit 1) = 'cv_viewed' then 1 else 0 end,
          cv_download_count = cv_download_count +
            case when (select event_type from inserted limit 1) = 'cv_downloaded' then 1 else 0 end,
          feedback_submit_count = feedback_submit_count +
            case when (select event_type from inserted limit 1) = 'feedback_submitted' then 1 else 0 end,
          interview_request_count = interview_request_count +
            case when (select event_type from inserted limit 1) = 'interview_requested' then 1 else 0 end,
          need_more_info_count = need_more_info_count +
            case when (select event_type from inserted limit 1) = 'need_more_info_clicked' then 1 else 0 end,
          decline_count = decline_count +
            case when (select event_type from inserted limit 1) = 'candidate_declined' then 1 else 0 end,
          updated_at = now()
        where c.id = (select shortlist_candidate_id from inserted limit 1)
        returning c.id
      ),
      shortlist_update as (
        update recruiter_lab_shortlists s
        set
          last_client_opened_at = case
            when (select event_type from inserted limit 1) in ('shortlist_opened', 'shortlist_viewed')
            then now()
            else s.last_client_opened_at
          end,
          last_client_engagement_at = now(),
          updated_at = now()
        where s.id = (select shortlist_id from token_record limit 1)
          and exists(select 1 from inserted)
        returning s.id
      )
      select json_build_object(
        'id', (select id::text from inserted limit 1),
        'stored', exists(select 1 from inserted)
      )::text;
    `,
    {
      ...payload,
      tokenHash,
      dedupeSeconds: dedupeSecondsForEvent(payload.eventType),
    },
  );
}

export async function saveRecruiterLabsPortalEngagement(
  input: unknown,
  env: RecruiterLabsEnv = process.env,
): Promise<RecruiterLabsEngagementResult> {
  const parsed = parseRecruiterLabsEngagementPayload(input);
  if (!parsed.success) {
    return result("invalid_payload", 400, "invalid_payload");
  }

  const readiness = getRecruiterLabsEngagementReadiness(env);
  if (!readiness.portalEnabled || !readiness.feedbackTrackingEnabled) {
    return result("tracking_disabled", 503, "feature_flag_disabled");
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

  if (parsed.data.shortlistCandidateId) {
    const scopedCandidate = portalView.shortlist.candidates.some(
      (candidate) => candidate.id === parsed.data.shortlistCandidateId,
    );

    if (!scopedCandidate) {
      return result("candidate_not_scoped", 403, "candidate_not_scoped");
    }
  }

  let writeResult: { id?: string; stored: boolean };

  try {
    writeResult = await insertRecruiterLabsEngagementEvent(
      parsed.data,
      tokenHash,
    );
  } catch {
    return result("database_write_failed", 500, "database_write_failed");
  }

  if (!writeResult.stored) {
    return result("duplicate_ignored", 202, "duplicate_ignored");
  }

  return result("ok", 200, undefined, writeResult.id);
}
