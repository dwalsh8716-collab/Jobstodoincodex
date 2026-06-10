export const retentionStatuses = [
  "active",
  "pending_review",
  "expiring_soon",
  "delete_requested",
  "deletion_approved",
  "deleted",
  "anonymised",
  "retained_for_legal_reason",
] as const;

export type RetentionStatus = (typeof retentionStatuses)[number];

export const retentionCategories = {
  role_application: {
    label: "Candidate application for a specific role",
    defaultMonths: 6,
    reviewBeforeExpiryDays: 30,
    notes:
      "Starting recommendation for unsuccessful or inactive role applications. Legal review required.",
  },
  talent_pool: {
    label: "Candidate talent pool / active roster",
    defaultMonths: 24,
    reviewBeforeExpiryDays: 60,
    notes:
      "Use only where the candidate has clearly opted in to stay on file for future roles.",
  },
  general_candidate_enquiry: {
    label: "General candidate enquiry",
    defaultMonths: 12,
    reviewBeforeExpiryDays: 30,
    notes:
      "For speculative candidate notes where there is no active role application.",
  },
  client_hiring_enquiry: {
    label: "Client or hiring enquiry",
    defaultMonths: 24,
    reviewBeforeExpiryDays: 60,
    notes:
      "Business-defined starting point. Confirm against legitimate relationship and legal advice.",
  },
  cv_file: {
    label: "CV or private file metadata",
    defaultMonths: 6,
    reviewBeforeExpiryDays: 30,
    notes:
      "Should follow the linked candidate/application retention and private storage deletion process.",
  },
  dsar_record: {
    label: "DSAR/privacy request record",
    defaultMonths: 24,
    reviewBeforeExpiryDays: 60,
    notes:
      "Keep enough to evidence the request and outcome. Legal review required.",
  },
  audit_log: {
    label: "Audit log",
    defaultMonths: 72,
    reviewBeforeExpiryDays: 90,
    notes:
      "Audit retention is a separate compliance decision. Do not delete audit logs blindly.",
  },
} as const;

export type RetentionCategory = keyof typeof retentionCategories;

const retentionMonthEnvKeys = {
  role_application: "RETENTION_ROLE_APPLICATION_MONTHS",
  talent_pool: "RETENTION_TALENT_POOL_MONTHS",
  general_candidate_enquiry: "RETENTION_GENERAL_CANDIDATE_MONTHS",
  client_hiring_enquiry: "RETENTION_CLIENT_ENQUIRY_MONTHS",
  cv_file: "RETENTION_CV_FILE_MONTHS",
  dsar_record: "RETENTION_DSAR_RECORD_MONTHS",
  audit_log: "RETENTION_AUDIT_LOG_MONTHS",
} as const satisfies Record<RetentionCategory, string>;

function envNumber(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function retentionRuleForCategory(
  category: RetentionCategory,
  env: NodeJS.ProcessEnv = process.env,
) {
  const rule = retentionCategories[category];
  const envMonths = envNumber(env[retentionMonthEnvKeys[category]]);

  return {
    ...rule,
    defaultMonths: envMonths ?? rule.defaultMonths,
  };
}

function utcDateOnly(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12),
  );
}

export function addMonths(date: Date, months: number) {
  const copy = utcDateOnly(date);
  copy.setUTCMonth(copy.getUTCMonth() + months);
  return copy;
}

export function subtractDays(date: Date, days: number) {
  const copy = utcDateOnly(date);
  copy.setUTCDate(copy.getUTCDate() - days);
  return copy;
}

export function retentionDatesForCategory(
  category: RetentionCategory,
  fromDate = new Date(),
  env: NodeJS.ProcessEnv = process.env,
) {
  const rule = retentionRuleForCategory(category, env);
  const retentionUntil = addMonths(fromDate, rule.defaultMonths);
  const reviewAt = subtractDays(retentionUntil, rule.reviewBeforeExpiryDays);

  return {
    retentionUntil,
    reviewAt,
  };
}

export function retentionEngineEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.RETENTION_ENGINE_ENABLED === "true";
}

export function retentionDryRunDefault(env: NodeJS.ProcessEnv = process.env) {
  return env.RETENTION_DRY_RUN !== "false";
}
