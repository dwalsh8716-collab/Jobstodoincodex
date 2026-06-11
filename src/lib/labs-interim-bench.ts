import "server-only";

import {
  getInterimAvailabilityToggleReadiness,
  getInterimAvailabilityTokenExpiryDays,
} from "./interim-availability";
import { interimAvailabilityPath } from "./interim-availability-shared";
import { getOperationsBackendStatus } from "./operations/database";
import type { OperationsBackendStatus } from "./operations/types";

type LabsInterimBenchEnv = Record<string, string | undefined>;

export type LabsInterimBenchStatus = {
  benchFeatureEnabled: boolean;
  availabilityToggleEnabled: boolean;
  databaseStatus: OperationsBackendStatus;
  readyForAdminPreview: boolean;
  readyForCandidateUpdates: boolean;
  safeForPublicListing: false;
  adminRoute: string;
  candidateRoute: string;
  tokenExpiryDays: number;
};

export const labsInterimBenchAdminRoute = "/admin/labs/interim-bench";

export const labsInterimBenchRoles = [
  {
    role: "David/admin",
    access: "Full private bench overview and follow-up tasks.",
  },
  {
    role: "Interim candidate",
    access: "Can update only their own availability through a scoped magic link.",
  },
  {
    role: "Reviewer/viewer",
    access: "Future read-only admin view. No candidate self-service access.",
  },
] as const;

export const labsInterimBenchMetricDefinitions = [
  "available now",
  "available within 2 weeks",
  "available within 1 month",
  "rate bands",
  "specialisms",
  "updated recently",
  "stale profiles",
  "consent expiring",
  "possible match to active briefs",
] as const;

export const labsInterimBenchPrivacyRules = [
  "No public talent database.",
  "No exposed profiles.",
  "Candidates can update only their own scoped record.",
  "CV upload stays blocked until private storage and malware scanning are ready.",
  "WhatsApp links require explicit WhatsApp preference/consent.",
  "Retention and consent review remain launch blockers.",
] as const;

function databaseStatusFromEnv(
  env: LabsInterimBenchEnv = process.env,
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

export function getLabsInterimBenchStatus(
  env: LabsInterimBenchEnv = process.env,
): LabsInterimBenchStatus {
  const databaseStatus = databaseStatusFromEnv(env);
  const benchFeatureEnabled = env.FEATURE_INTERIM_BENCH_PORTAL === "true";
  const availabilityReadiness = getInterimAvailabilityToggleReadiness(env);
  const readyDatabase =
    databaseStatus.enabled &&
    databaseStatus.configured &&
    databaseStatus.state === "ready";

  return {
    benchFeatureEnabled,
    availabilityToggleEnabled: availabilityReadiness.featureEnabled,
    databaseStatus,
    readyForAdminPreview: benchFeatureEnabled && readyDatabase,
    readyForCandidateUpdates:
      availabilityReadiness.featureEnabled && readyDatabase,
    safeForPublicListing: false,
    adminRoute: labsInterimBenchAdminRoute,
    candidateRoute: `${interimAvailabilityPath}/[token]`,
    tokenExpiryDays: getInterimAvailabilityTokenExpiryDays(env),
  };
}

export function getLabsInterimBenchPreview(
  env: LabsInterimBenchEnv = process.env,
) {
  const status = getLabsInterimBenchStatus(env);

  return {
    status,
    roles: labsInterimBenchRoles,
    metrics: labsInterimBenchMetricDefinitions.map((label) => ({
      label,
      state: "waiting_for_private_postgres" as const,
    })),
    candidateUpdateFields: [
      "availability",
      "available from date",
      "day rate/range",
      "preferred contract type",
      "sectors",
      "functions",
      "location/remote preference",
      "contact preference",
      "privacy/retention opt-out",
    ],
    adminViews: [
      "available now",
      "available soon",
      "rate bands",
      "specialisms",
      "stale profiles",
      "consent expiring",
      "possible match to active briefs",
    ],
    privacyRules: labsInterimBenchPrivacyRules,
  };
}
