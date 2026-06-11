import "server-only";

import type { RetentionStatus } from "./retention";

export const recruiterLabsFlagDefinitions = [
  {
    name: "FEATURE_RECRUITER_LABS_ENABLED",
    label: "Recruiter Labs foundation",
    description:
      "Enables protected admin planning for the future client pipeline system.",
  },
  {
    name: "FEATURE_CLIENT_PRESENTATION_PORTAL",
    label: "Client presentation portal",
    description: "Future magic-link shortlist portal for client review.",
  },
  {
    name: "FEATURE_BRANDED_CANDIDATE_PROFILES",
    label: "Branded candidate profiles",
    description:
      "Future David-approved candidate profile cards built from private data.",
  },
  {
    name: "FEATURE_SHORTLIST_FEEDBACK_TRACKING",
    label: "Shortlist feedback tracking",
    description:
      "Future client feedback actions and private engagement tracking.",
  },
  {
    name: "FEATURE_INTERVIEW_REQUEST_WORKFLOW",
    label: "Interview request workflow",
    description:
      "Future client interview requests from the protected shortlist view.",
  },
  {
    name: "FEATURE_WHATSAPP_INTERVIEW_SCHEDULING",
    label: "WhatsApp interview scheduling",
    description:
      "Future transactional interview logistics through WhatsApp Business.",
  },
  {
    name: "FEATURE_GOOGLE_MEET_INTERVIEW_SCHEDULING",
    label: "Google Meet interview scheduling",
    description:
      "Future Google Calendar and Meet orchestration for interview slots.",
  },
  {
    name: "FEATURE_AI_CANDIDATE_SUMMARIES",
    label: "AI candidate summary drafts",
    description:
      "Future AI-assisted drafts only, with David verification before client view.",
  },
] as const;

export type RecruiterLabsFlagName =
  (typeof recruiterLabsFlagDefinitions)[number]["name"];

type RecruiterLabsEnv = Record<string, string | undefined>;
type RecruiterLabsRequirement =
  | "private_admin_testing"
  | "private_beta"
  | "real_client_launch";

export type RecruiterLabsLaunchGateStatus =
  | "passed"
  | "blocked"
  | "manual_review";

export type RecruiterLabsLaunchGateCheck = {
  id: string;
  category: string;
  label: string;
  status: RecruiterLabsLaunchGateStatus;
  evidence: string;
  requiredBefore: readonly RecruiterLabsRequirement[];
};

export type RecruiterLabsAccessState =
  | "active"
  | "invalid"
  | "expired"
  | "revoked";

export type RecruiterLabsClientAccessRecord = {
  tokenHash?: string | null;
  expiresAt?: Date | string | null;
  revokedAt?: Date | string | null;
};

export type RecruiterLabsCandidateShareInput = {
  profileStatus: "draft" | "david_review" | "approved" | "withheld" | "removed";
  approvedAt?: Date | string | null;
  consentConfirmed?: boolean | null;
  candidateSharingConsentAt?: Date | string | null;
  cvAccessRequired?: boolean | null;
  cvAccessApproved?: boolean | null;
  cvAccessRevokedAt?: Date | string | null;
  retentionStatus?: RetentionStatus | null;
  sharingMode?: "named" | "anonymised" | null;
};

export const recruiterLabsDependencies = [
  {
    label: "Railway Postgres backend",
    status: "staged",
    detail:
      "Schema and scripts exist. Production DATABASE_URL still needs setup.",
  },
  {
    label: "Admin authentication",
    status: "staged",
    detail: "Protected admin routes use the CMS session gate.",
  },
  {
    label: "Private CV storage",
    status: "blocked",
    detail: "No public or private CV upload/storage flow is live yet.",
  },
  {
    label: "Candidate consent model",
    status: "staged",
    detail: "Candidate privacy and consent records exist for future workflows.",
  },
  {
    label: "Audit logging",
    status: "staged",
    detail: "Append-only audit logging is ready when Postgres is enabled.",
  },
  {
    label: "DSAR and retention framework",
    status: "staged",
    detail: "DSAR route and retention review engine are staged.",
  },
  {
    label: "WhatsApp and Google scheduling",
    status: "disabled",
    detail: "Both must remain disabled unless configured and approved.",
  },
] as const;

export const recruiterLabsLaunchGateChecks = [
  {
    id: "admin-route-protected",
    category: "Private routing",
    label: "Admin route is protected",
    status: "passed",
    evidence:
      "`/admin/recruiter-labs` uses the CMS session gate and redirects anonymous visitors.",
    requiredBefore: [
      "private_admin_testing",
      "private_beta",
      "real_client_launch",
    ],
  },
  {
    id: "public-client-routes-absent",
    category: "Private routing",
    label: "No public client portal exists yet",
    status: "passed",
    evidence:
      "There is no `/client/shortlist/[token]` route and `/client` is blocked from robots.",
    requiredBefore: [
      "private_admin_testing",
      "private_beta",
      "real_client_launch",
    ],
  },
  {
    id: "search-index-exclusion",
    category: "Private routing",
    label: "Private surfaces stay out of search",
    status: "passed",
    evidence:
      "Admin routes are noindexed and Recruiter Labs/client URLs are excluded from the sitemap.",
    requiredBefore: [
      "private_admin_testing",
      "private_beta",
      "real_client_launch",
    ],
  },
  {
    id: "magic-link-validation",
    category: "Magic links",
    label: "Client tokens must be hashed, expiring and revocable",
    status: "blocked",
    evidence:
      "Hash storage is staged. The public validation route is deliberately not built yet.",
    requiredBefore: ["private_beta", "real_client_launch"],
  },
  {
    id: "candidate-consent-gate",
    category: "Candidate consent",
    label: "Candidate sharing checks are explicit",
    status: "passed",
    evidence:
      "Server-side share decision logic blocks missing consent, missing approval and unsafe retention states.",
    requiredBefore: ["private_beta", "real_client_launch"],
  },
  {
    id: "cv-access-gate",
    category: "CV security",
    label: "CV access cannot be public",
    status: "blocked",
    evidence:
      "Private file metadata exists, but signed/authenticated CV access routes are not live.",
    requiredBefore: ["private_beta", "real_client_launch"],
  },
  {
    id: "audit-logging-live",
    category: "Audit logging",
    label: "Access, feedback and CV actions must be logged",
    status: "manual_review",
    evidence:
      "Typed audit actions are staged. Production logging needs Railway Postgres enabled and migrated.",
    requiredBefore: ["private_beta", "real_client_launch"],
  },
  {
    id: "ai-human-approval",
    category: "AI safety",
    label: "AI output stays draft until David approves it",
    status: "passed",
    evidence:
      "AI candidate summary flags are server-only and the profile status model requires approval before client visibility.",
    requiredBefore: ["private_beta", "real_client_launch"],
  },
  {
    id: "whatsapp-disabled-unconfigured",
    category: "WhatsApp safety",
    label: "WhatsApp automation is disabled unless configured",
    status: "passed",
    evidence:
      "WhatsApp Business messaging is server-side, disabled by default and requires operational contact consent.",
    requiredBefore: ["private_beta", "real_client_launch"],
  },
  {
    id: "google-manual-fallback",
    category: "Google safety",
    label: "Google scheduling requires approval",
    status: "blocked",
    evidence:
      "Booking links are safe, but Calendar/Meet orchestration is not implemented and must remain manual until approved.",
    requiredBefore: ["real_client_launch"],
  },
  {
    id: "analytics-pii-boundary",
    category: "Analytics boundary",
    label: "Candidate PII stays out of marketing analytics",
    status: "passed",
    evidence:
      "Analytics events are consent-aware and Recruiter Labs data is kept in private operational stores.",
    requiredBefore: ["private_beta", "real_client_launch"],
  },
  {
    id: "legal-privacy-review",
    category: "Legal review",
    label: "Legal/privacy review is still required",
    status: "blocked",
    evidence:
      "Privacy wording, retention periods, client access terms and candidate consent wording need David/legal sign-off.",
    requiredBefore: ["real_client_launch"],
  },
] as const satisfies readonly RecruiterLabsLaunchGateCheck[];

export const recruiterLabsBuildPhases = [
  {
    title: "Private foundation",
    status: "current",
    detail:
      "Flags, private route, database model, docs and launch rules are staged.",
  },
  {
    title: "Shortlist data model",
    status: "next",
    detail:
      "Store shortlists, candidate profile review status, hashed tokens and feedback in Postgres.",
  },
  {
    title: "Magic-link portal",
    status: "blocked",
    detail:
      "Requires signed token validation, expiry, revocation and no token analytics/logging.",
  },
  {
    title: "Interview workflow",
    status: "blocked",
    detail:
      "Requires shortlist feedback, candidate consent, WhatsApp and Google Calendar approvals.",
  },
  {
    title: "AI-assisted drafts",
    status: "blocked",
    detail:
      "Only safe after human review workflow, privacy controls and no automated candidate evaluation rules.",
  },
] as const;

const retentionBlockingStatuses = new Set<RetentionStatus>([
  "pending_review",
  "delete_requested",
  "deletion_approved",
  "deleted",
  "anonymised",
]);

function dateFrom(value: Date | string | null | undefined) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function isRecruiterLabsFeatureEnabled(
  flagName: RecruiterLabsFlagName,
  env: RecruiterLabsEnv = process.env,
) {
  return env[flagName] === "true";
}

export function getRecruiterLabsFeatureFlags(
  env: RecruiterLabsEnv = process.env,
) {
  return recruiterLabsFlagDefinitions.map((flag) => ({
    ...flag,
    enabled: isRecruiterLabsFeatureEnabled(flag.name, env),
    scope: "server-only" as const,
  }));
}

export function getRecruiterLabsLaunchGate() {
  const checks: RecruiterLabsLaunchGateCheck[] =
    recruiterLabsLaunchGateChecks.map((check) => ({ ...check }));
  const blockedChecks = checks.filter((check) => check.status === "blocked");
  const manualReviewChecks = checks.filter(
    (check) => check.status === "manual_review",
  );
  const privateAdminBlockers = checks.filter(
    (check) =>
      check.status === "blocked" &&
      check.requiredBefore.includes("private_admin_testing"),
  );

  return {
    checks,
    blockedChecks,
    manualReviewChecks,
    safeForPrivateAdminTesting: privateAdminBlockers.length === 0,
    safeForRealClients: blockedChecks.length === 0,
  };
}

export function getRecruiterLabsClientAccessDecision(
  record: RecruiterLabsClientAccessRecord | null | undefined,
  now = new Date(),
): {
  allowed: boolean;
  state: RecruiterLabsAccessState;
  reason?: string;
} {
  if (!record?.tokenHash) {
    return {
      allowed: false,
      state: "invalid",
      reason: "missing_or_invalid_token",
    };
  }

  if (record.revokedAt) {
    return {
      allowed: false,
      state: "revoked",
      reason: "token_revoked",
    };
  }

  const expiresAt = dateFrom(record.expiresAt);

  if (!expiresAt) {
    return {
      allowed: false,
      state: "invalid",
      reason: "missing_expiry",
    };
  }

  if (expiresAt.getTime() <= now.getTime()) {
    return {
      allowed: false,
      state: "expired",
      reason: "token_expired",
    };
  }

  return {
    allowed: true,
    state: "active",
  };
}

export function getRecruiterLabsCandidateShareDecision(
  input: RecruiterLabsCandidateShareInput,
): {
  canShare: boolean;
  sharingMode: "named" | "anonymised";
  anonymisedModeAvailable: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  const sharingMode = input.sharingMode || "named";
  const retentionStatus = input.retentionStatus || "pending_review";

  if (input.profileStatus !== "approved" || !dateFrom(input.approvedAt)) {
    reasons.push("david_approval_required");
  }

  if (!input.consentConfirmed) {
    reasons.push("candidate_consent_required");
  }

  if (sharingMode === "named" && !dateFrom(input.candidateSharingConsentAt)) {
    reasons.push("candidate_sharing_consent_timestamp_required");
  }

  if (input.cvAccessRequired && !input.cvAccessApproved) {
    reasons.push("cv_access_permission_required");
  }

  if (input.cvAccessRevokedAt) {
    reasons.push("cv_access_revoked");
  }

  if (retentionBlockingStatuses.has(retentionStatus)) {
    reasons.push("retention_review_required");
  }

  return {
    canShare: reasons.length === 0,
    sharingMode,
    anonymisedModeAvailable: true,
    reasons,
  };
}

export function getRecruiterLabsOverview(env: RecruiterLabsEnv = process.env) {
  const flags = getRecruiterLabsFeatureFlags(env);
  const launchGate = getRecruiterLabsLaunchGate();

  return {
    flags,
    dependencies: recruiterLabsDependencies,
    phases: recruiterLabsBuildPhases,
    launchGate,
    stats: {
      totalFlags: flags.length,
      enabledFlags: flags.filter((flag) => flag.enabled).length,
      blockedDependencies: recruiterLabsDependencies.filter(
        (dependency) => dependency.status === "blocked",
      ).length,
      passedLaunchGateChecks: launchGate.checks.filter(
        (check) => check.status === "passed",
      ).length,
      blockedLaunchGateChecks: launchGate.blockedChecks.length,
      manualLaunchGateChecks: launchGate.manualReviewChecks.length,
      publicRoutes: 0,
    },
  };
}
