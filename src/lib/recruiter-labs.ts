import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { runPsqlJson } from "./operations/database";
import type { OperationsBackendStatus } from "./operations/types";
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
    name: "FEATURE_RETAINED_SEARCH_DASHBOARD",
    label: "Retained search dashboard",
    description:
      "Future aggregate-only retained search progress view for clients.",
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
    name: "FEATURE_WHATSAPP_CRM_SYNC",
    label: "WhatsApp CRM sync",
    description:
      "Future official WhatsApp webhook sync into private candidate activity records.",
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
  {
    name: "FEATURE_DAVIDS_AUDIO_NOTES",
    label: "David's Take audio notes",
    description:
      "Future admin-approved private audio notes for candidate shortlist profiles.",
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

export type RecruiterLabsClientPortalState =
  | RecruiterLabsAccessState
  | "feature_disabled"
  | "backend_unavailable"
  | "rate_limited"
  | "shortlist_not_ready";

export type RecruiterLabsClientAccessRecord = {
  tokenHash?: string | null;
  expiresAt?: Date | string | null;
  revokedAt?: Date | string | null;
};

export type RecruiterLabsClientPortalDecision = {
  allowed: boolean;
  state: RecruiterLabsClientPortalState;
  reason?: string;
  tokenHash?: string;
  shortlistId?: string | null;
  expiresAt?: string | null;
};

export type RecruiterLabsShortlistCandidatePresentation = {
  id: string;
  displayOrder: number;
  name: string;
  headline?: string;
  location?: string;
  availability?: string;
  salaryExpectation?: string;
  davidSummary?: string;
  evidenceNotes?: string;
  sharingMode: "named" | "anonymised";
  cvAccessAllowed: boolean;
  audioNotePlanned: boolean;
};

export type RecruiterLabsShortlistPresentation = {
  id: string;
  title: string;
  status: string;
  launchGateStatus: string;
  roleContext?: string;
  davidIntroNote?: string;
  expiresAt?: string | null;
  clientVisibleAt?: string | null;
  candidates: RecruiterLabsShortlistCandidatePresentation[];
  withheldCandidateCount: number;
};

export type RecruiterLabsClientPortalView = {
  decision: RecruiterLabsClientPortalDecision;
  status: RecruiterLabsClientPortalStatus;
  shortlist: RecruiterLabsShortlistPresentation | null;
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

type RecruiterLabsClientPortalStatus = {
  route: typeof recruiterLabsClientPortalRoute;
  featureEnabled: boolean;
  expiryDays: number;
  databaseStatus: OperationsBackendStatus;
  canReadPrivateData: boolean;
};

type RecruiterLabsClientPortalQueryResult = {
  access: {
    tokenHash?: string | null;
    shortlistId?: string | null;
    expiresAt?: string | null;
    revokedAt?: string | null;
  } | null;
  shortlist: {
    id: string;
    title: string;
    status: string;
    launchGateStatus?: string | null;
    expiresAt?: string | null;
    revokedAt?: string | null;
    clientVisibleAt?: string | null;
    notes?: string | null;
    metadata?: Record<string, unknown> | null;
  } | null;
  candidates: Array<{
    id: string;
    displayOrder?: number | null;
    profileStatus: RecruiterLabsCandidateShareInput["profileStatus"];
    davidSummary?: string | null;
    evidenceNotes?: string | null;
    consentConfirmed?: boolean | null;
    approvedAt?: string | null;
    candidateSharingConsentAt?: string | null;
    cvAccessRequired?: boolean | null;
    cvAccessApproved?: boolean | null;
    cvAccessRevokedAt?: string | null;
    retentionStatus?: RetentionStatus | null;
    sharingMode?: "named" | "anonymised" | null;
    candidateProfileSnapshot?: Record<string, unknown> | null;
  }>;
};

export const recruiterLabsClientPortalRoute = "/client/shortlist/[token]";
export const recruiterLabsClientPortalDefaultExpiryDays = 30;
export const recruiterLabsClientPortalMaxExpiryDays = 90;
const recruiterLabsTokenByteLength = 32;
const recruiterLabsPortalRateLimitStore = new Map<
  string,
  { count: number; resetAt: number }
>();

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
    label: "Private audio-note storage",
    status: "blocked",
    detail:
      "David's Take audio notes need private object storage, compression and signed playback before client use.",
  },
  {
    label: "Retained search dashboard",
    status: "staged",
    detail:
      "Aggregate-only dashboard schema and route can be staged without exposing candidate PII.",
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
  {
    label: "AI governance",
    status: "staged",
    detail:
      "AI Ops is private, synthetic-data only and blocked from real candidate data until the AI launch gate is cleared.",
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
    id: "client-token-route-staged",
    category: "Private routing",
    label: "Client token route is staged but not public",
    status: "passed",
    evidence:
      "`/client/shortlist/[token]` exists only as a noindexed, feature-gated route. `/client` is blocked from robots and the route is absent from the sitemap.",
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
      "Hash storage, token helpers and staged route states exist. Real client use is still blocked until Railway Postgres, audit proof, CV access and legal/privacy review are complete.",
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
    id: "audio-notes-private-storage",
    category: "Audio notes",
    label: "David's Take audio notes need private signed playback",
    status: "blocked",
    evidence:
      "Audio-note metadata, approval states and locked APIs are staged. Private object storage, compression and signed playback are not live.",
    requiredBefore: ["private_beta", "real_client_launch"],
  },
  {
    id: "retained-search-dashboard-aggregate-only",
    category: "Client dashboard",
    label: "Retained search dashboard must stay aggregate-only",
    status: "manual_review",
    evidence:
      "Aggregate pipeline event tables and a noindexed route are staged. Real client use still needs metric source review and wording sign-off.",
    requiredBefore: ["private_beta", "real_client_launch"],
  },
  {
    id: "audit-logging-live",
    category: "Audit logging",
    label: "Access, feedback and CV actions must be logged",
    status: "manual_review",
    evidence:
      "Typed audit actions and private portal engagement events are staged. Production logging needs Railway Postgres enabled and migrated.",
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
      "Public website events are consent-aware and Recruiter Labs portal engagement writes to private Postgres only.",
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
    status: "staged",
    detail:
      "A noindexed, feature-gated route is staged. Real client use still requires Railway Postgres, audit proof, CV access and privacy sign-off.",
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

function operationsStatusFromEnv(
  env: RecruiterLabsEnv = process.env,
): OperationsBackendStatus {
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

function normaliseClientPortalToken(rawToken?: string | null) {
  const token = rawToken?.trim();
  if (!token) return undefined;
  if (!/^[A-Za-z0-9_-]{32,256}$/.test(token)) return undefined;
  return token;
}

function safeString(
  value: unknown,
  maxLength = 180,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function snapshotString(
  snapshot: Record<string, unknown> | null | undefined,
  keys: string[],
  maxLength?: number,
) {
  for (const key of keys) {
    const value = safeString(snapshot?.[key], maxLength);
    if (value) return value;
  }

  return undefined;
}

function jsonStringFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
  keys: string[],
  maxLength?: number,
) {
  for (const key of keys) {
    const value = metadata?.[key];
    if (typeof value === "string") {
      const trimmed = safeString(value, maxLength);
      if (trimmed) return trimmed;
    }
  }

  return undefined;
}

function getClientPortalExpiryDate(now: Date, expiryDays: number) {
  return new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);
}

function isLaunchGateSafeForClient(shortlist: {
  status: string;
  launchGateStatus?: string | null;
  clientVisibleAt?: string | null;
}) {
  const liveStatus = shortlist.status === "private_preview" || shortlist.status === "sent";
  const gateApproved =
    shortlist.launchGateStatus === "private_beta" ||
    shortlist.launchGateStatus === "approved";

  return liveStatus && gateApproved && Boolean(dateFrom(shortlist.clientVisibleAt));
}

function toCandidatePresentation(
  candidate: RecruiterLabsClientPortalQueryResult["candidates"][number],
): RecruiterLabsShortlistCandidatePresentation | null {
  const shareDecision = getRecruiterLabsCandidateShareDecision({
    profileStatus: candidate.profileStatus,
    approvedAt: candidate.approvedAt,
    consentConfirmed: candidate.consentConfirmed,
    candidateSharingConsentAt: candidate.candidateSharingConsentAt,
    cvAccessRequired: candidate.cvAccessRequired,
    cvAccessApproved: candidate.cvAccessApproved,
    cvAccessRevokedAt: candidate.cvAccessRevokedAt,
    retentionStatus: candidate.retentionStatus,
    sharingMode: candidate.sharingMode,
  });

  if (!shareDecision.canShare) return null;

  const snapshot = candidate.candidateProfileSnapshot;
  const anonymised = shareDecision.sharingMode === "anonymised";
  const name = anonymised
    ? "Anonymised candidate"
    : snapshotString(snapshot, ["name", "displayName", "fullName"], 80) ||
      "Candidate profile";

  return {
    id: candidate.id,
    displayOrder: candidate.displayOrder ?? 0,
    name,
    headline: snapshotString(snapshot, ["headline", "roleTitle", "currentTitle"]),
    location: snapshotString(snapshot, ["location", "region"]),
    availability: snapshotString(snapshot, ["availability", "noticePeriod"]),
    salaryExpectation: snapshotString(snapshot, [
      "salaryExpectation",
      "packageExpectation",
    ]),
    davidSummary: safeString(candidate.davidSummary, 900),
    evidenceNotes: safeString(candidate.evidenceNotes, 900),
    sharingMode: shareDecision.sharingMode,
    cvAccessAllowed: Boolean(
      candidate.cvAccessRequired &&
        candidate.cvAccessApproved &&
        !candidate.cvAccessRevokedAt,
    ),
    audioNotePlanned: false,
  };
}

async function getRecruiterLabsClientPortalData(
  tokenHash: string,
): Promise<RecruiterLabsClientPortalQueryResult> {
  return runPsqlJson<RecruiterLabsClientPortalQueryResult>(
    `
      with payload as (
        select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
      ),
      matched_token as (
        select
          t.token_hash,
          t.shortlist_id::text,
          t.expires_at,
          t.revoked_at,
          s.id::text as shortlist_id_text,
          s.title,
          s.status,
          s.expires_at as shortlist_expires_at,
          s.revoked_at as shortlist_revoked_at,
          s.notes,
          s.metadata,
          s.launch_gate_status,
          s.client_visible_at
        from recruiter_lab_client_access_tokens t
        join recruiter_lab_shortlists s on s.id = t.shortlist_id
        where t.token_hash = (select data->>'tokenHash' from payload)
        limit 1
      ),
      candidate_rows as (
        select
          c.id::text,
          c.display_order,
          c.profile_status,
          c.david_summary,
          c.evidence_notes,
          c.consent_confirmed,
          c.approved_at,
          c.candidate_sharing_consent_at,
          c.cv_access_required,
          c.cv_access_approved,
          c.cv_access_revoked_at,
          c.retention_status,
          c.sharing_mode,
          c.candidate_profile_snapshot
        from recruiter_lab_shortlist_candidates c
        join matched_token mt on mt.shortlist_id = c.shortlist_id
        order by c.display_order asc, c.created_at asc
      )
      select coalesce(
        (
          select jsonb_build_object(
            'access', jsonb_build_object(
              'tokenHash', mt.token_hash,
              'shortlistId', mt.shortlist_id,
              'expiresAt', mt.expires_at,
              'revokedAt', mt.revoked_at
            ),
            'shortlist', jsonb_build_object(
              'id', mt.shortlist_id_text,
              'title', mt.title,
              'status', mt.status,
              'launchGateStatus', mt.launch_gate_status,
              'expiresAt', mt.shortlist_expires_at,
              'revokedAt', mt.shortlist_revoked_at,
              'clientVisibleAt', mt.client_visible_at,
              'notes', mt.notes,
              'metadata', mt.metadata
            ),
            'candidates', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'id', cr.id,
                    'displayOrder', cr.display_order,
                    'profileStatus', cr.profile_status,
                    'davidSummary', cr.david_summary,
                    'evidenceNotes', cr.evidence_notes,
                    'consentConfirmed', cr.consent_confirmed,
                    'approvedAt', cr.approved_at,
                    'candidateSharingConsentAt', cr.candidate_sharing_consent_at,
                    'cvAccessRequired', cr.cv_access_required,
                    'cvAccessApproved', cr.cv_access_approved,
                    'cvAccessRevokedAt', cr.cv_access_revoked_at,
                    'retentionStatus', cr.retention_status,
                    'sharingMode', cr.sharing_mode,
                    'candidateProfileSnapshot', cr.candidate_profile_snapshot
                  )
                )
                from candidate_rows cr
              ),
              '[]'::jsonb
            )
          )
          from matched_token mt
        ),
        '{"access": null, "shortlist": null, "candidates": []}'::jsonb
      )
    `,
    { tokenHash },
  );
}

export function isRecruiterLabsFeatureEnabled(
  flagName: RecruiterLabsFlagName,
  env: RecruiterLabsEnv = process.env,
) {
  return env[flagName] === "true";
}

export function getRecruiterLabsClientPortalExpiryDays(
  env: RecruiterLabsEnv = process.env,
) {
  const configured = Number(env.RECRUITER_LABS_CLIENT_TOKEN_EXPIRY_DAYS);
  if (!Number.isFinite(configured) || configured <= 0) {
    return recruiterLabsClientPortalDefaultExpiryDays;
  }

  return Math.min(
    Math.floor(configured),
    recruiterLabsClientPortalMaxExpiryDays,
  );
}

export function hashRecruiterLabsClientToken(rawToken?: string | null) {
  const token = normaliseClientPortalToken(rawToken);
  if (!token) return undefined;

  return createHash("sha256").update(token).digest("hex");
}

export function createRecruiterLabsClientToken({
  now = new Date(),
  expiryDays = recruiterLabsClientPortalDefaultExpiryDays,
}: {
  now?: Date;
  expiryDays?: number;
} = {}) {
  const rawToken = randomBytes(recruiterLabsTokenByteLength).toString(
    "base64url",
  );
  const tokenHash = hashRecruiterLabsClientToken(rawToken);

  if (!tokenHash) {
    throw new Error("Failed to create a Recruiter Labs client token.");
  }

  return {
    rawToken,
    tokenHash,
    expiresAt: getClientPortalExpiryDate(now, expiryDays),
    expiryDays,
  };
}

export function getRecruiterLabsClientPortalStatus(
  env: RecruiterLabsEnv = process.env,
): RecruiterLabsClientPortalStatus {
  const featureEnabled = isRecruiterLabsFeatureEnabled(
    "FEATURE_CLIENT_PRESENTATION_PORTAL",
    env,
  );
  const databaseStatus = operationsStatusFromEnv(env);

  return {
    route: recruiterLabsClientPortalRoute,
    featureEnabled,
    expiryDays: getRecruiterLabsClientPortalExpiryDays(env),
    databaseStatus,
    canReadPrivateData:
      featureEnabled &&
      databaseStatus.enabled &&
      databaseStatus.configured &&
      databaseStatus.state === "ready",
  };
}

export function getRecruiterLabsClientPortalRateLimitDecision(
  rawToken?: string | null,
  now = new Date(),
  options: { limit?: number; windowMs?: number } = {},
) {
  const tokenHash =
    hashRecruiterLabsClientToken(rawToken) ||
    createHash("sha256").update("missing-client-portal-token").digest("hex");
  const key = tokenHash.slice(0, 24);
  const limit = options.limit ?? 24;
  const windowMs = options.windowMs ?? 60_000;
  const current = recruiterLabsPortalRateLimitStore.get(key);

  if (!current || current.resetAt <= now.getTime()) {
    recruiterLabsPortalRateLimitStore.set(key, {
      count: 1,
      resetAt: now.getTime() + windowMs,
    });

    return { allowed: true, remaining: limit - 1, resetAt: now.getTime() + windowMs };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
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

export async function getRecruiterLabsClientPortalView(
  rawToken?: string | null,
  env: RecruiterLabsEnv = process.env,
  now = new Date(),
): Promise<RecruiterLabsClientPortalView> {
  const status = getRecruiterLabsClientPortalStatus(env);
  const tokenHash = hashRecruiterLabsClientToken(rawToken);

  const unavailableView = (
    decision: RecruiterLabsClientPortalDecision,
  ): RecruiterLabsClientPortalView => ({
    decision,
    status,
    shortlist: null,
  });

  if (!tokenHash) {
    return unavailableView({
      allowed: false,
      state: "invalid",
      reason: "missing_or_invalid_token",
    });
  }

  if (!status.featureEnabled) {
    return unavailableView({
      allowed: false,
      state: "feature_disabled",
      reason: "feature_disabled",
      tokenHash,
    });
  }

  if (!status.canReadPrivateData) {
    return unavailableView({
      allowed: false,
      state: "backend_unavailable",
      reason: status.databaseStatus.state,
      tokenHash,
    });
  }

  let data: RecruiterLabsClientPortalQueryResult;

  try {
    data = await getRecruiterLabsClientPortalData(tokenHash);
  } catch {
    return unavailableView({
      allowed: false,
      state: "backend_unavailable",
      reason: "private_database_lookup_failed",
      tokenHash,
    });
  }

  const accessDecision = getRecruiterLabsClientAccessDecision(
    data.access,
    now,
  );

  if (!accessDecision.allowed || !data.shortlist) {
    return unavailableView({
      ...accessDecision,
      state: accessDecision.state,
      tokenHash,
      shortlistId: data.access?.shortlistId,
      expiresAt: data.access?.expiresAt,
    });
  }

  const shortlistAccessDecision = getRecruiterLabsClientAccessDecision(
    {
      tokenHash,
      expiresAt: data.shortlist.expiresAt || data.access?.expiresAt,
      revokedAt: data.shortlist.revokedAt,
    },
    now,
  );

  if (!shortlistAccessDecision.allowed) {
    return unavailableView({
      ...shortlistAccessDecision,
      tokenHash,
      shortlistId: data.shortlist.id,
      expiresAt: data.shortlist.expiresAt || data.access?.expiresAt,
    });
  }

  if (!isLaunchGateSafeForClient(data.shortlist)) {
    return unavailableView({
      allowed: false,
      state: "shortlist_not_ready",
      reason: "launch_gate_not_approved",
      tokenHash,
      shortlistId: data.shortlist.id,
      expiresAt: data.shortlist.expiresAt || data.access?.expiresAt,
    });
  }

  const candidates = data.candidates
    .map(toCandidatePresentation)
    .filter(
      (
        candidate,
      ): candidate is RecruiterLabsShortlistCandidatePresentation =>
        Boolean(candidate),
    );

  return {
    decision: {
      allowed: true,
      state: "active",
      tokenHash,
      shortlistId: data.shortlist.id,
      expiresAt: data.shortlist.expiresAt || data.access?.expiresAt,
    },
    status,
    shortlist: {
      id: data.shortlist.id,
      title: data.shortlist.title,
      status: data.shortlist.status,
      launchGateStatus: data.shortlist.launchGateStatus || "blocked",
      roleContext: jsonStringFromMetadata(data.shortlist.metadata, [
        "roleContext",
        "role_context",
      ]),
      davidIntroNote:
        jsonStringFromMetadata(data.shortlist.metadata, [
          "davidIntroNote",
          "david_intro_note",
        ]) || safeString(data.shortlist.notes, 900),
      expiresAt: data.shortlist.expiresAt || data.access?.expiresAt,
      clientVisibleAt: data.shortlist.clientVisibleAt,
      candidates,
      withheldCandidateCount: Math.max(0, data.candidates.length - candidates.length),
    },
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
