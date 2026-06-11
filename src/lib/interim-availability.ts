import "server-only";

import { createHash, randomBytes } from "node:crypto";
import {
  interimAvailabilityFeatureFlagName,
  interimAvailabilityPath,
  interimAvailabilityStatusLabels,
  type InterimAvailabilityStatus,
} from "@/lib/interim-availability-shared";
import {
  getOperationsBackendStatus,
  runPsqlJson,
} from "@/lib/operations/database";
import { siteConfig } from "@/lib/site";
import {
  interimAvailabilityUpdateSchema,
  type InterimAvailabilityUpdatePayload,
} from "@/validations/interim-availability";

type Env = Record<string, string | undefined>;

export type InterimAvailabilityViewState =
  | "ready"
  | "feature_disabled"
  | "backend_unavailable"
  | "invalid_token"
  | "expired"
  | "revoked";

export type InterimAvailabilityCurrent = {
  status?: InterimAvailabilityStatus | "not_confirmed" | null;
  availableFrom?: string | null;
  dayRate?: string | null;
  notes?: string | null;
  optedOutAt?: string | null;
};

export type InterimAvailabilityView = {
  state: InterimAvailabilityViewState;
  token?: string;
  current?: InterimAvailabilityCurrent | null;
};

export type InterimAvailabilityUpdateResult = {
  ok: boolean;
  statusCode: number;
  message: string;
};

export const defaultInterimAvailabilityTokenExpiryDays = 14;

export function isInterimAvailabilityToggleEnabled(env: Env = process.env) {
  return env[interimAvailabilityFeatureFlagName] === "true";
}

export function getInterimAvailabilityTokenExpiryDays(env: Env = process.env) {
  const configured = Number(env.INTERIM_AVAILABILITY_TOKEN_EXPIRY_DAYS);

  if (!Number.isFinite(configured) || configured <= 0) {
    return defaultInterimAvailabilityTokenExpiryDays;
  }

  return Math.min(Math.floor(configured), 45);
}

export function hashInterimAvailabilityToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createInterimAvailabilityToken() {
  const token = randomBytes(32).toString("base64url");

  return {
    token,
    tokenHash: hashInterimAvailabilityToken(token),
  };
}

export function buildInterimAvailabilityUrl(token: string) {
  return `${siteConfig.url}${interimAvailabilityPath}/${encodeURIComponent(
    token,
  )}`;
}

function validToken(token: string) {
  return /^[A-Za-z0-9_-]{32,200}$/.test(token);
}

export function getInterimAvailabilityToggleReadiness(env: Env = process.env) {
  const databaseStatus = getOperationsBackendStatus();
  const featureEnabled = isInterimAvailabilityToggleEnabled(env);

  return {
    featureEnabled,
    databaseStatus,
    safeForPublicListing: false,
    safeForCandidateUse: featureEnabled && databaseStatus.state === "ready",
  };
}

export async function createInterimAvailabilityMagicLink({
  candidateId,
  channel = "email",
  whatsappConsentConfirmed = false,
  env = process.env,
}: {
  candidateId: string;
  channel?: "email" | "whatsapp" | "manual";
  whatsappConsentConfirmed?: boolean;
  env?: Env;
}) {
  if (!isInterimAvailabilityToggleEnabled(env)) {
    return { ok: false, reason: "feature_disabled" as const };
  }

  if (channel === "whatsapp" && !whatsappConsentConfirmed) {
    return { ok: false, reason: "whatsapp_consent_required" as const };
  }

  const databaseStatus = getOperationsBackendStatus();
  if (!databaseStatus.enabled || !databaseStatus.configured) {
    return { ok: false, reason: "backend_unavailable" as const };
  }

  const token = createInterimAvailabilityToken();
  const expiryDays = getInterimAvailabilityTokenExpiryDays(env);

  const created = await runPsqlJson<{ id: string }>(
    `
      with payload as (
        select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
      ),
      created as (
        insert into interim_availability_tokens (
          candidate_id,
          token_hash,
          channel,
          expires_at,
          metadata
        )
        select
          (data->>'candidateId')::uuid,
          data->>'tokenHash',
          data->>'channel',
          now() + make_interval(days => coalesce((data->>'expiryDays')::int, 14)),
          jsonb_build_object(
            'source', 'interim_availability_magic_link_helper',
            'whatsappRequiresConsent', true
          )
        from payload
        returning id
      )
      select json_build_object('id', id)::text from created;
    `,
    {
      candidateId,
      tokenHash: token.tokenHash,
      channel,
      expiryDays,
    },
  );

  return {
    ok: true,
    id: created.id,
    token: token.token,
    url: buildInterimAvailabilityUrl(token.token),
  };
}

export async function getInterimAvailabilityView(
  token: string,
  env: Env = process.env,
): Promise<InterimAvailabilityView> {
  if (!isInterimAvailabilityToggleEnabled(env)) {
    return { state: "feature_disabled" };
  }

  if (!validToken(token)) {
    return { state: "invalid_token" };
  }

  const databaseStatus = getOperationsBackendStatus();
  if (!databaseStatus.enabled || !databaseStatus.configured) {
    return { state: "backend_unavailable" };
  }

  const view = await runPsqlJson<{
    state: InterimAvailabilityViewState;
    current: InterimAvailabilityCurrent | null;
  }>(
    `
      with payload as (
        select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
      ),
      matched as (
        select
          t.id,
          t.candidate_id,
          t.expires_at,
          t.revoked_at,
          a.availability_status,
          a.available_from,
          a.day_rate,
          a.notes,
          a.opted_out_at
        from interim_availability_tokens t
        left join interim_candidate_availability a on a.candidate_id = t.candidate_id
        where t.token_hash = (select data->>'tokenHash' from payload)
        limit 1
      )
      select jsonb_build_object(
        'state', case
          when not exists(select 1 from matched) then 'invalid_token'
          when exists(select 1 from matched where revoked_at is not null) then 'revoked'
          when exists(select 1 from matched where expires_at < now()) then 'expired'
          else 'ready'
        end,
        'current', (
          select jsonb_build_object(
            'status', availability_status,
            'availableFrom', available_from,
            'dayRate', day_rate,
            'notes', notes,
            'optedOutAt', opted_out_at
          )
          from matched
          where revoked_at is null and expires_at >= now()
        )
      )::text;
    `,
    { tokenHash: hashInterimAvailabilityToken(token) },
  );

  return {
    state: view.state,
    token: view.state === "ready" ? token : undefined,
    current: view.current,
  };
}

function safeFailure(message = "This availability link could not be used.") {
  return {
    ok: false,
    statusCode: 400,
    message,
  };
}

export async function submitInterimAvailabilityUpdate(
  input: unknown,
  env: Env = process.env,
): Promise<InterimAvailabilityUpdateResult> {
  if (!isInterimAvailabilityToggleEnabled(env)) {
    return safeFailure("This availability update route is not live yet.");
  }

  const parsed = interimAvailabilityUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return safeFailure(
      parsed.error.errors[0]?.message || "Please check the form.",
    );
  }

  const databaseStatus = getOperationsBackendStatus();
  if (!databaseStatus.enabled || !databaseStatus.configured) {
    return {
      ok: false,
      statusCode: 503,
      message:
        "This availability update route is not connected yet. Please message David directly.",
    };
  }

  const payload: InterimAvailabilityUpdatePayload = parsed.data;
  const finalStatus = payload.optOut ? "not_looking" : payload.status;

  try {
    const result = await runPsqlJson<{ updated: boolean }>(
      `
        with payload as (
          select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
        ),
        matched as (
          select id, candidate_id
          from interim_availability_tokens
          where token_hash = (select data->>'tokenHash' from payload)
            and expires_at >= now()
            and revoked_at is null
          limit 1
        ),
        upserted as (
          insert into interim_candidate_availability (
            candidate_id,
            availability_status,
            available_from,
            day_rate,
            notes,
            opted_out_at,
            last_updated_at,
            updated_via,
            metadata
          )
          select
            candidate_id,
            data->>'status',
            nullif(data->>'availableFrom', '')::date,
            nullif(data->>'dayRate', ''),
            nullif(data->>'notes', ''),
            case
              when coalesce((data->>'optOut')::boolean, false) then now()
              else null
            end,
            now(),
            'magic_link',
            jsonb_build_object(
              'source', 'interim_availability_magic_link',
              'noAnalytics', true
            )
          from matched, payload
          on conflict (candidate_id) do update set
            availability_status = excluded.availability_status,
            available_from = excluded.available_from,
            day_rate = excluded.day_rate,
            notes = excluded.notes,
            opted_out_at = excluded.opted_out_at,
            last_updated_at = now(),
            updated_via = 'magic_link',
            metadata = interim_candidate_availability.metadata ||
              jsonb_build_object(
                'source', 'interim_availability_magic_link',
                'noAnalytics', true
              )
          returning candidate_id, availability_status
        ),
        used_token as (
          update interim_availability_tokens t
          set last_used_at = now()
          from matched m
          where t.id = m.id
          returning t.id
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
            'candidate',
            candidate_id,
            'interim_availability_updated',
            'Interim availability updated',
            'Updated through a scoped interim availability magic link.',
            jsonb_build_object('status', availability_status)
          from upserted
          returning id
        ),
        audit as (
          insert into audit_logs (
            action,
            entity_type,
            entity_id,
            entity_label,
            after
          )
          select
            'interim_availability_updated',
            'candidate',
            candidate_id,
            'Interim availability',
            jsonb_build_object(
              'status', availability_status,
              'source', 'magic_link',
              'noPublicListing', true
            )
          from upserted
          returning id
        )
        select json_build_object(
          'updated', exists(select 1 from upserted)
        )::text;
      `,
      {
        tokenHash: hashInterimAvailabilityToken(payload.token),
        status: finalStatus,
        availableFrom:
          finalStatus === "available_from" ? payload.availableFrom : undefined,
        dayRate: payload.dayRate,
        notes: payload.notes,
        optOut: payload.optOut,
      },
    );

    if (!result.updated) return safeFailure();

    return {
      ok: true,
      statusCode: 200,
      message: `Thanks. Your interim availability is now marked as ${interimAvailabilityStatusLabels[finalStatus]}. David will use this for private interim bench planning only.`,
    };
  } catch (error) {
    console.error("Interim availability update failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });

    return {
      ok: false,
      statusCode: 502,
      message:
        "This availability update could not be saved right now. Please message David directly.",
    };
  }
}
