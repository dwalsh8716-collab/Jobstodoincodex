import "server-only";

import { getOperationsBackendStatus } from "./operations/database";
import type { OperationsBackendStatus } from "./operations/types";

type LabsMarketDashboardEnv = Record<string, string | undefined>;

export type LabsMarketDashboardStatus = {
  featureEnabled: boolean;
  databaseStatus: OperationsBackendStatus;
  readyForPrivatePreview: boolean;
  readyForPublicLaunch: false;
  noIndex: true;
  route: string;
};

export type LabsMarketDashboardDefinition = {
  slug: string;
  title: string;
  audience: string;
  focus: string[];
  requiredSources: string[];
  confidenceRule: string;
  leadCapturePath: string;
};

export const labsMarketDashboardRoute = "/admin/labs/market-dashboards";

export const labsMarketDashboardDefinitions = [
  {
    slug: "north-west-marketing-salary-dashboard",
    title: "North West Marketing Salary Dashboard",
    audience: "Marketing leaders hiring across Manchester and the North West",
    focus: ["salary ranges", "seniority", "location trends"],
    requiredSources: [
      "verified salary guide data",
      "David-reviewed market notes",
      "anonymised internal salary expectations",
    ],
    confidenceRule:
      "Publish only when each visible range has source notes, last-updated date and confidence level.",
    leadCapturePath: "/salary-guides",
  },
  {
    slug: "manchester-agency-hiring-dashboard",
    title: "Manchester Agency Hiring Dashboard",
    audience: "Agency founders and leadership teams",
    focus: ["agency hiring trends", "function demand", "seniority"],
    requiredSources: [
      "manual agency market notes",
      "anonymised role-demand records",
      "public source citations where used",
    ],
    confidenceRule:
      "Avoid claims about hiring momentum unless the methodology names the data source type.",
    leadCapturePath: "/contact",
  },
  {
    slug: "strategic-interim-rate-dashboard",
    title: "Strategic Interim Rate Dashboard",
    audience: "Clients needing senior interim marketing or comms support",
    focus: ["interim day rates", "availability", "function demand"],
    requiredSources: [
      "anonymised interim availability",
      "verified rate expectations",
      "David-reviewed brief evidence",
    ],
    confidenceRule:
      "Keep candidate availability aggregate-only and never expose named interim profiles.",
    leadCapturePath: "/services/strategic-interim",
  },
  {
    slug: "senior-marketing-leadership-market-snapshot",
    title: "Senior Marketing Leadership Market Snapshot",
    audience: "Founders, CEOs and senior marketing leaders",
    focus: ["leadership demand", "salary ranges", "market movement notes"],
    requiredSources: [
      "manual leadership search notes",
      "anonymised brief demand",
      "verified public citations where used",
    ],
    confidenceRule:
      "Use directional language unless the sample size and methodology support a precise figure.",
    leadCapturePath: "/contact",
  },
  {
    slug: "pr-communications-salary-dashboard",
    title: "PR & Communications Salary Dashboard",
    audience: "PR, communications and corporate affairs hiring teams",
    focus: ["salary ranges", "role family", "location trends"],
    requiredSources: [
      "verified salary guide data",
      "David-reviewed PR and comms market notes",
      "anonymised candidate expectations",
    ],
    confidenceRule:
      "Keep ranges broad enough to avoid fake precision and update every quarter before publishing.",
    leadCapturePath: "/salary-guides",
  },
] as const satisfies readonly LabsMarketDashboardDefinition[];

export const labsMarketDashboardPrivacyRules = [
  "No raw PII.",
  "No individual candidate exposure.",
  "No named client trend unless David has approval and a public source.",
  "No GA4/GTM private dashboard events.",
  "No fake precision.",
  "No public launch without verified data and methodology notes.",
] as const;

function databaseStatusFromEnv(
  env: LabsMarketDashboardEnv = process.env,
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

export function getLabsMarketDashboardStatus(
  env: LabsMarketDashboardEnv = process.env,
): LabsMarketDashboardStatus {
  const featureEnabled = env.FEATURE_LIVE_MARKET_DASHBOARDS === "true";
  const databaseStatus = databaseStatusFromEnv(env);

  return {
    featureEnabled,
    databaseStatus,
    readyForPrivatePreview:
      featureEnabled &&
      databaseStatus.enabled &&
      databaseStatus.configured &&
      databaseStatus.state === "ready",
    readyForPublicLaunch: false,
    noIndex: true,
    route: labsMarketDashboardRoute,
  };
}

export function getLabsMarketDashboardPreview(
  env: LabsMarketDashboardEnv = process.env,
) {
  const status = getLabsMarketDashboardStatus(env);

  return {
    status,
    dashboards: labsMarketDashboardDefinitions.map((dashboard) => ({
      ...dashboard,
      dataState: "waiting_for_verified_data" as const,
      displayState: "hidden_private_preview" as const,
    })),
    filters: {
      roleFamily: ["Marketing", "PR & Communications", "Digital", "Agency"],
      seniority: ["Manager", "Head of", "Director", "C-suite", "Interim"],
      location: ["Manchester", "North West", "UK-wide", "Hybrid"],
      sector: ["Agency", "Client-side", "B2B", "Consumer"],
    },
    methodologyRequired: [
      "source type",
      "confidence level",
      "sample size or evidence strength",
      "last updated date",
      "David review note",
      "public citation where public data is used",
    ],
    privacyRules: labsMarketDashboardPrivacyRules,
  };
}
