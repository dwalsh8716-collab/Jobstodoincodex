import "server-only";

import { getOperationsBackendStatus } from "./operations/database";
import type { OperationsBackendStatus } from "./operations/types";

type LabsSalaryBenchmarkEnv = Record<string, string | undefined>;

export const labsSalaryBenchmarkFeatureFlag =
  "FEATURE_SALARY_BENCHMARK_ASSET";
export const labsSalaryBenchmarkAdminRoute = "/admin/labs/salary-benchmark";

export const labsSalaryBenchmarkRequestFields = [
  "role title",
  "seniority",
  "location",
  "hybrid/remote setup",
  "agency/client-side",
  "sector",
  "salary/rate budget",
  "must-have skills",
  "hiring urgency",
  "email/company details",
  "consent",
] as const;

export const labsSalaryBenchmarkReportSections = [
  "client role summary",
  "market range",
  "salary/rate caveats",
  "hiring difficulty",
  "likely candidate pool",
  "risk of underpaying",
  "suggested adjustments",
  "comparable roles",
  "interim vs permanent view",
  "David's recommendation",
  "CTA to discuss",
] as const;

export const labsSalaryBenchmarkDataSources = [
  "David's verified market knowledge",
  "internal placements/applications",
  "anonymised candidate expectations",
  "salary snapshot content",
  "trusted public salary sources",
  "manually entered benchmark ranges",
  "survey data",
] as const;

export const labsSalaryBenchmarkAdminWorkflow = [
  "view request",
  "add benchmark notes",
  "set recommended range",
  "add caveats",
  "attach/send report later",
  "create task",
  "mark status",
  "convert to lead/enquiry",
] as const;

export const labsSalaryBenchmarkReviewRules = [
  "No final report without David review.",
  "No unreviewed AI salary advice.",
  "No hallucinated salary figures.",
  "Every figure needs a caveat/source note.",
  "Draft PDF/report structure only until approved.",
  "No private salary context in GA4/GTM.",
] as const;

function databaseStatusFromEnv(
  env: LabsSalaryBenchmarkEnv = process.env,
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
        "Private operations database is staged but not enabled. Salary benchmark requests cannot be stored yet.",
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

export function getLabsSalaryBenchmarkStatus(
  env: LabsSalaryBenchmarkEnv = process.env,
) {
  const featureEnabled = env[labsSalaryBenchmarkFeatureFlag] === "true";
  const databaseStatus = databaseStatusFromEnv(env);

  return {
    featureFlag: labsSalaryBenchmarkFeatureFlag,
    featureEnabled,
    adminRoute: labsSalaryBenchmarkAdminRoute,
    noIndex: true,
    databaseStatus,
    canStoreRequests:
      featureEnabled &&
      databaseStatus.enabled &&
      databaseStatus.configured &&
      databaseStatus.state === "ready",
    readyForPublicLaunch: false,
  };
}

export function getLabsSalaryBenchmarkPreview(
  env: LabsSalaryBenchmarkEnv = process.env,
) {
  return {
    status: getLabsSalaryBenchmarkStatus(env),
    toolNames: [
      "Salary Sense-Check",
      "Salary Benchmark Request",
      "Brief and Salary Reality Check",
      "Is This Salary Competitive?",
      "Senior Marketing Salary Benchmark",
    ],
    requestFields: labsSalaryBenchmarkRequestFields,
    reportSections: labsSalaryBenchmarkReportSections,
    dataSources: labsSalaryBenchmarkDataSources,
    adminWorkflow: labsSalaryBenchmarkAdminWorkflow,
    reviewRules: labsSalaryBenchmarkReviewRules,
    principle:
      "Premium lead-generation based on honest market advice. No fake salary data.",
  };
}
