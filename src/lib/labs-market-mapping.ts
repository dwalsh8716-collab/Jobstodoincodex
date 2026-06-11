import "server-only";

import { getOperationsBackendStatus } from "./operations/database";
import type { OperationsBackendStatus } from "./operations/types";

type LabsMarketMappingEnv = Record<string, string | undefined>;

export const labsMarketMappingFeatureFlag = "FEATURE_MARKET_MAPPING";
export const labsMarketMappingAdminRoute = "/admin/labs/market-mapping";

export const labsMarketMappingVisualApproach = [
  "search funnel",
  "sector map",
  "seniority heatmap",
  "location spread",
  "status board",
  "network reach cards",
  "anonymised talent pool snapshot",
  "role difficulty score",
] as const;

export const labsMarketMappingFunnel = [
  { stage: "Target role universe", count: 240, note: "Possible market to map" },
  { stage: "Mapped", count: 126, note: "Relevant profiles or businesses found" },
  { stage: "Approached", count: 64, note: "Direct outreach or warm route started" },
  { stage: "Engaged", count: 28, note: "Meaningful response or conversation" },
  { stage: "Shortlisted", count: 6, note: "David-reviewed shortlist potential" },
] as const;

export const labsMarketMappingSegments = [
  {
    segmentName: "B2B technology",
    segmentType: "sector",
    targetCount: 80,
    mappedCount: 42,
    approachedCount: 24,
    engagedCount: 12,
    shortlistedCount: 3,
  },
  {
    segmentName: "Agency leadership",
    segmentType: "sector",
    targetCount: 55,
    mappedCount: 34,
    approachedCount: 18,
    engagedCount: 8,
    shortlistedCount: 2,
  },
  {
    segmentName: "North West client-side",
    segmentType: "geography",
    targetCount: 65,
    mappedCount: 30,
    approachedCount: 14,
    engagedCount: 6,
    shortlistedCount: 1,
  },
  {
    segmentName: "Strategic Interim",
    segmentType: "availability",
    targetCount: 40,
    mappedCount: 20,
    approachedCount: 8,
    engagedCount: 2,
    shortlistedCount: 0,
  },
] as const;

export const labsMarketMappingConstraints = [
  "salary/rate may be below the market for the brief",
  "hybrid/location expectation may narrow the field",
  "sector knowledge may be useful but not always essential",
  "seniority may need rethinking if hands-on delivery is critical",
  "interim urgency may need a different route from permanent search",
] as const;

export const labsMarketMappingPrivacyRules = [
  "No named candidate lists in public visualisations.",
  "No public candidate PII.",
  "No raw CV text.",
  "No scraped personal profile data.",
  "Private client maps require access control.",
  "Public maps must stay aggregate and anonymised.",
  "No GA4/GTM private market-map events.",
] as const;

function databaseStatusFromEnv(
  env: LabsMarketMappingEnv = process.env,
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
        "Private operations database is staged but not enabled. Market maps cannot save client-specific progress yet.",
    };
  }

  if (!configured) {
    return {
      enabled,
      configured,
      state: "missing_database_url",
      message: "OPERATIONS_DB_ENABLED is true, but DATABASE_URL is missing.",
    };
  }

  return {
    enabled,
    configured,
    state: "ready",
    message: "Private operations database is configured.",
  };
}

export function getLabsMarketMappingStatus(
  env: LabsMarketMappingEnv = process.env,
) {
  const featureEnabled = env[labsMarketMappingFeatureFlag] === "true";
  const databaseStatus = databaseStatusFromEnv(env);

  return {
    featureFlag: labsMarketMappingFeatureFlag,
    featureEnabled,
    adminRoute: labsMarketMappingAdminRoute,
    noIndex: true,
    databaseStatus,
    canSavePrivateMaps:
      featureEnabled &&
      databaseStatus.enabled &&
      databaseStatus.configured &&
      databaseStatus.state === "ready",
    readyForPublicLaunch: false,
  };
}

export function getLabsMarketMappingPreview(
  env: LabsMarketMappingEnv = process.env,
) {
  return {
    status: getLabsMarketMappingStatus(env),
    visualApproach: labsMarketMappingVisualApproach,
    funnel: labsMarketMappingFunnel,
    segments: labsMarketMappingSegments,
    constraints: labsMarketMappingConstraints,
    privacyRules: labsMarketMappingPrivacyRules,
    privateClientUses: [
      "retained search update",
      "strategic interim market scan",
      "salary/rate reality discussion",
      "why this role is hard explanation",
      "proof of work",
      "sales presentation",
    ],
    publicBoundary:
      "Public versions must be high-level, anonymised and methodology-led.",
    privateBoundary:
      "Role-specific client maps need signed access, audit logging and no named candidate list exposure.",
  };
}
