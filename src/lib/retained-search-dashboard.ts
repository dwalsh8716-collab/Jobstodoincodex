import "server-only";

import { getOperationsBackendStatus, runPsqlJson } from "./operations/database";
import type { OperationsBackendStatus } from "./operations/types";
import {
  hashRecruiterLabsClientToken,
  isRecruiterLabsFeatureEnabled,
} from "./recruiter-labs";

type RetainedSearchDashboardEnv = Record<string, string | undefined>;

export const retainedSearchDashboardFeatureFlag =
  "FEATURE_RETAINED_SEARCH_DASHBOARD" as const;
export const retainedSearchDashboardRoute = "/client/retained-search/[token]";

export type RetainedSearchDashboardState =
  | "active"
  | "invalid"
  | "expired"
  | "revoked"
  | "feature_disabled"
  | "backend_unavailable"
  | "dashboard_not_ready";

export type RetainedSearchDashboardMetrics = {
  totalMapped: number;
  totalApproached: number;
  totalResponded: number;
  totalScreened: number;
  totalRejected: number;
  totalShortlisted: number;
  interviewStageCount: number;
};

export type RetainedSearchTimelineItem = {
  label: string;
  date?: string;
  detail?: string;
};

export type RetainedSearchDashboardPresentation = {
  id: string;
  title: string;
  roleContext?: string;
  marketNotes?: string;
  salaryRateReality?: string;
  blockers?: string;
  nextActions?: string;
  processTimeline: RetainedSearchTimelineItem[];
  metrics: RetainedSearchDashboardMetrics;
  latestPipelineEventOn?: string | null;
  expiresAt?: string | null;
  clientVisibleAt?: string | null;
};

export type RetainedSearchDashboardDecision = {
  allowed: boolean;
  state: RetainedSearchDashboardState;
  reason?: string;
  expiresAt?: string | null;
};

export type RetainedSearchDashboardStatus = {
  route: typeof retainedSearchDashboardRoute;
  featureEnabled: boolean;
  databaseStatus: OperationsBackendStatus;
  canReadPrivateData: boolean;
};

export type RetainedSearchDashboardView = {
  decision: RetainedSearchDashboardDecision;
  status: RetainedSearchDashboardStatus;
  dashboard: RetainedSearchDashboardPresentation | null;
};

type RetainedSearchDashboardQueryResult = {
  access: {
    expiresAt?: string | null;
    revokedAt?: string | null;
  } | null;
  dashboard: {
    id: string;
    title: string;
    status: string;
    roleContext?: string | null;
    marketNotes?: string | null;
    salaryRateReality?: string | null;
    blockers?: string | null;
    nextActions?: string | null;
    processTimeline?: unknown;
    clientVisibleAt?: string | null;
    expiresAt?: string | null;
    revokedAt?: string | null;
  } | null;
  metrics: Partial<Record<keyof RetainedSearchDashboardMetrics, number>> & {
    latestPipelineEventOn?: string | null;
  };
};

function dateFrom(value: Date | string | null | undefined) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function safeString(value: unknown, maxLength = 900) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function numberFrom(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function timelineFromValue(value: unknown): RetainedSearchTimelineItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return undefined;
      const entry = item as Record<string, unknown>;
      const label = safeString(entry.label || entry.title, 120);
      if (!label) return undefined;

      const timelineItem: RetainedSearchTimelineItem = { label };
      const date = safeString(entry.date, 40);
      const detail = safeString(entry.detail || entry.description, 240);

      if (date) timelineItem.date = date;
      if (detail) timelineItem.detail = detail;

      return timelineItem;
    })
    .filter((item): item is RetainedSearchTimelineItem => Boolean(item))
    .slice(0, 12);
}

function operationsStatusFromEnv(
  env: RetainedSearchDashboardEnv,
): OperationsBackendStatus {
  if (env === process.env) return getOperationsBackendStatus();

  const enabled = env.OPERATIONS_DB_ENABLED === "true";
  const configured = Boolean(env.DATABASE_URL);

  return {
    enabled,
    configured,
    state: !enabled ? "disabled" : configured ? "ready" : "missing_database_url",
    message: configured
      ? "Private operations database is configured."
      : "Private operations database is not ready.",
  };
}

export function getRetainedSearchDashboardStatus(
  env: RetainedSearchDashboardEnv = process.env,
): RetainedSearchDashboardStatus {
  const featureEnabled = isRecruiterLabsFeatureEnabled(
    retainedSearchDashboardFeatureFlag,
    env,
  );
  const databaseStatus = operationsStatusFromEnv(env);

  return {
    route: retainedSearchDashboardRoute,
    featureEnabled,
    databaseStatus,
    canReadPrivateData:
      featureEnabled &&
      databaseStatus.enabled &&
      databaseStatus.configured &&
      databaseStatus.state === "ready",
  };
}

function inactiveView(
  status: RetainedSearchDashboardStatus,
  decision: RetainedSearchDashboardDecision,
): RetainedSearchDashboardView {
  return {
    decision,
    status,
    dashboard: null,
  };
}

function activeAccessDecision(input: {
  expiresAt?: string | null;
  revokedAt?: string | null;
}): RetainedSearchDashboardDecision {
  const now = new Date();
  const expiresAt = dateFrom(input.expiresAt);

  if (!expiresAt) {
    return { allowed: false, state: "invalid", reason: "missing_expiry" };
  }

  if (dateFrom(input.revokedAt)) {
    return {
      allowed: false,
      state: "revoked",
      reason: "access_revoked",
      expiresAt: expiresAt.toISOString(),
    };
  }

  if (expiresAt <= now) {
    return {
      allowed: false,
      state: "expired",
      reason: "access_expired",
      expiresAt: expiresAt.toISOString(),
    };
  }

  return {
    allowed: true,
    state: "active",
    expiresAt: expiresAt.toISOString(),
  };
}

function dashboardSafeForClient(dashboard: {
  status: string;
  clientVisibleAt?: string | null;
  revokedAt?: string | null;
}) {
  const visibleStatus =
    dashboard.status === "private_preview" || dashboard.status === "sent";

  return (
    visibleStatus &&
    Boolean(dateFrom(dashboard.clientVisibleAt)) &&
    !dateFrom(dashboard.revokedAt)
  );
}

async function getRetainedSearchDashboardData(
  tokenHash: string,
): Promise<RetainedSearchDashboardQueryResult> {
  return runPsqlJson<RetainedSearchDashboardQueryResult>(
    `
      with payload as (
        select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
      ),
      matched_token as (
        select
          t.expires_at,
          t.revoked_at,
          d.id::text,
          d.title,
          d.status,
          d.role_context,
          d.market_notes,
          d.salary_rate_reality,
          d.blockers,
          d.next_actions,
          d.process_timeline,
          d.client_visible_at,
          d.expires_at as dashboard_expires_at,
          d.revoked_at as dashboard_revoked_at
        from recruiter_lab_retained_search_dashboard_access_tokens t
        join recruiter_lab_retained_search_dashboards d on d.id = t.dashboard_id
        where t.token_hash = (select data->>'tokenHash' from payload)
        limit 1
      )
      select coalesce(
        (
          select jsonb_build_object(
            'access', jsonb_build_object(
              'expiresAt', mt.expires_at,
              'revokedAt', mt.revoked_at
            ),
            'dashboard', jsonb_build_object(
              'id', mt.id,
              'title', mt.title,
              'status', mt.status,
              'roleContext', mt.role_context,
              'marketNotes', mt.market_notes,
              'salaryRateReality', mt.salary_rate_reality,
              'blockers', mt.blockers,
              'nextActions', mt.next_actions,
              'processTimeline', mt.process_timeline,
              'clientVisibleAt', mt.client_visible_at,
              'expiresAt', mt.dashboard_expires_at,
              'revokedAt', mt.dashboard_revoked_at
            ),
            'metrics', jsonb_build_object(
              'totalMapped', coalesce(m.total_mapped, 0),
              'totalApproached', coalesce(m.total_approached, 0),
              'totalResponded', coalesce(m.total_responded, 0),
              'totalScreened', coalesce(m.total_screened, 0),
              'totalRejected', coalesce(m.total_rejected, 0),
              'totalShortlisted', coalesce(m.total_shortlisted, 0),
              'interviewStageCount', coalesce(m.interview_stage_count, 0),
              'latestPipelineEventOn', m.latest_pipeline_event_on
            )
          )
          from matched_token mt
          left join recruiter_lab_retained_search_dashboard_metric_totals m
            on m.dashboard_id = mt.id::uuid
        ),
        '{"access": null, "dashboard": null, "metrics": {}}'::jsonb
      )
    `,
    { tokenHash },
  );
}

export async function getRetainedSearchDashboardView(
  rawToken?: string | null,
  env: RetainedSearchDashboardEnv = process.env,
): Promise<RetainedSearchDashboardView> {
  const status = getRetainedSearchDashboardStatus(env);
  const tokenHash = hashRecruiterLabsClientToken(rawToken);

  if (!tokenHash) {
    return inactiveView(status, {
      allowed: false,
      state: "invalid",
      reason: "missing_or_invalid_token",
    });
  }

  if (!status.featureEnabled) {
    return inactiveView(status, {
      allowed: false,
      state: "feature_disabled",
      reason: "feature_disabled",
    });
  }

  if (!status.canReadPrivateData) {
    return inactiveView(status, {
      allowed: false,
      state: "backend_unavailable",
      reason: status.databaseStatus.state,
    });
  }

  let data: RetainedSearchDashboardQueryResult;

  try {
    data = await getRetainedSearchDashboardData(tokenHash);
  } catch {
    return inactiveView(status, {
      allowed: false,
      state: "backend_unavailable",
      reason: "private_database_lookup_failed",
    });
  }

  if (!data.access || !data.dashboard) {
    return inactiveView(status, {
      allowed: false,
      state: "invalid",
      reason: "dashboard_not_found",
    });
  }

  const accessDecision = activeAccessDecision(data.access);
  if (!accessDecision.allowed) {
    return inactiveView(status, accessDecision);
  }

  if (!dashboardSafeForClient(data.dashboard)) {
    return inactiveView(status, {
      allowed: false,
      state: "dashboard_not_ready",
      reason: "dashboard_not_ready",
      expiresAt: accessDecision.expiresAt,
    });
  }

  return {
    decision: accessDecision,
    status,
    dashboard: {
      id: data.dashboard.id,
      title: data.dashboard.title,
      roleContext: safeString(data.dashboard.roleContext),
      marketNotes: safeString(data.dashboard.marketNotes),
      salaryRateReality: safeString(data.dashboard.salaryRateReality),
      blockers: safeString(data.dashboard.blockers),
      nextActions: safeString(data.dashboard.nextActions),
      processTimeline: timelineFromValue(data.dashboard.processTimeline),
      metrics: {
        totalMapped: numberFrom(data.metrics.totalMapped),
        totalApproached: numberFrom(data.metrics.totalApproached),
        totalResponded: numberFrom(data.metrics.totalResponded),
        totalScreened: numberFrom(data.metrics.totalScreened),
        totalRejected: numberFrom(data.metrics.totalRejected),
        totalShortlisted: numberFrom(data.metrics.totalShortlisted),
        interviewStageCount: numberFrom(data.metrics.interviewStageCount),
      },
      latestPipelineEventOn: data.metrics.latestPipelineEventOn,
      expiresAt: data.dashboard.expiresAt || accessDecision.expiresAt,
      clientVisibleAt: data.dashboard.clientVisibleAt,
    },
  };
}
