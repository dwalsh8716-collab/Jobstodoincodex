import "server-only";

type RecruiterLabsAiEnv = Record<string, string | undefined>;
type RecruiterLabsAiLaunchRequirement =
  | "synthetic_admin_testing"
  | "real_candidate_data"
  | "client_facing_output";

export type RecruiterLabsAiLaunchGateStatus =
  | "passed"
  | "blocked"
  | "manual_review";

export type RecruiterLabsAiLaunchGateCheck = {
  id: string;
  category: string;
  label: string;
  status: RecruiterLabsAiLaunchGateStatus;
  evidence: string;
  requiredBefore: readonly RecruiterLabsAiLaunchRequirement[];
};

export const recruiterLabsAiFlagDefinitions = [
  {
    name: "FEATURE_AI_OPS_COMPRESSION",
    label: "AI ops compression",
    description:
      "Private planning flag for using AI to reduce admin typing without replacing judgement.",
  },
  {
    name: "FEATURE_AI_INTERVIEW_NOTES",
    label: "AI interview notes",
    description:
      "Future note-structuring support for interviews, with David review.",
  },
  {
    name: "FEATURE_AI_SCORECARD_NOTES",
    label: "AI scorecard notes",
    description:
      "Future scorecard-aligned note organisation. Not candidate scoring.",
  },
  {
    name: "FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS",
    label: "AI candidate summary drafts",
    description:
      "Future draft summaries for David to edit and approve before any client use.",
  },
  {
    name: "FEATURE_AI_CLIENT_PROFILE_DRAFTS",
    label: "AI client profile drafts",
    description:
      "Future shortlist profile drafting, blocked until consent and approval rules are live.",
  },
  {
    name: "FEATURE_AI_FOLLOW_UP_DRAFTS",
    label: "AI follow-up drafts",
    description:
      "Future draft follow-up messages. No automated sending without human approval.",
  },
] as const;

export type RecruiterLabsAiFlagName =
  (typeof recruiterLabsAiFlagDefinitions)[number]["name"];

export const recruiterLabsAiAllowedUses = [
  "structure interview notes",
  "summarise transcripts after approval",
  "organise notes against a human-defined scorecard",
  "draft candidate summaries for David to review",
  "draft client-ready shortlist notes",
  "draft interview questions",
  "draft follow-up emails for human approval",
  "create admin task suggestions",
  "flag missing information for human follow-up",
  "prepare internal briefing notes",
] as const;

export const recruiterLabsAiBannedUses = [
  "rank candidates",
  "reject candidates",
  "filter resumes automatically",
  "decide suitability",
  "infer protected characteristics",
  "score personality",
  "score culture fit",
  "make automated employment decisions",
  "publish client-facing summaries without David approval",
  "send candidate or client messages automatically",
  "invent experience or achievements",
  "hide uncertainty",
] as const;

export const recruiterLabsAiGovernanceChecks = [
  {
    id: "no-provider-configured",
    label: "No AI provider is configured",
    status: "passed",
    detail:
      "There are no AI provider API keys, model calls or public AI tools in the app.",
  },
  {
    id: "no-automated-evaluation",
    label: "No automated candidate evaluation",
    status: "passed",
    detail:
      "The foundation contains no ranking, rejection, filtering or scoring logic.",
  },
  {
    id: "human-review-required",
    label: "David approval required",
    status: "passed",
    detail:
      "AI output is treated as draft-only until David reviews and approves it.",
  },
  {
    id: "real-data-provider-review",
    label: "Real candidate data is blocked",
    status: "blocked",
    detail:
      "Provider, data processing location, DPA/terms, redaction and retention rules need approval before real data is sent to any AI service.",
  },
  {
    id: "client-facing-workflow",
    label: "Client-facing AI output is blocked",
    status: "blocked",
    detail:
      "Client-facing summaries need consent, audit logging and David approval workflow before launch.",
  },
] as const;

export const recruiterLabsAiLaunchGateChecks = [
  {
    id: "no-automated-ranking",
    category: "Banned uses",
    label: "No automated candidate ranking",
    status: "passed",
    evidence:
      "The AI foundation exposes allowed drafting uses and explicitly bans candidate ranking.",
    requiredBefore: [
      "synthetic_admin_testing",
      "real_candidate_data",
      "client_facing_output",
    ],
  },
  {
    id: "no-automated-cv-filtering",
    category: "Banned uses",
    label: "No automated CV filtering",
    status: "passed",
    evidence:
      "No CV ingestion, filtering route or candidate-selection algorithm exists.",
    requiredBefore: [
      "synthetic_admin_testing",
      "real_candidate_data",
      "client_facing_output",
    ],
  },
  {
    id: "no-automated-rejection",
    category: "Banned uses",
    label: "No automated rejection",
    status: "passed",
    evidence:
      "Banned-use policy blocks rejection, suitability decisions and AI-only decisions.",
    requiredBefore: [
      "synthetic_admin_testing",
      "real_candidate_data",
      "client_facing_output",
    ],
  },
  {
    id: "no-suitability-score",
    category: "Banned uses",
    label: "No suitability, personality or culture score",
    status: "passed",
    evidence:
      "No score fields or scoring logic are exposed. Scorecard notes are organisation only, not scoring.",
    requiredBefore: [
      "synthetic_admin_testing",
      "real_candidate_data",
      "client_facing_output",
    ],
  },
  {
    id: "no-protected-characteristic-inference",
    category: "Banned uses",
    label: "No protected-characteristic inference",
    status: "passed",
    evidence:
      "Protected-characteristic inference is listed as a banned AI use and no inference workflow exists.",
    requiredBefore: [
      "synthetic_admin_testing",
      "real_candidate_data",
      "client_facing_output",
    ],
  },
  {
    id: "drafts-labelled",
    category: "Human review",
    label: "AI output is labelled as draft",
    status: "passed",
    evidence:
      "AI Ops copy and the private draft schema treat generated output as draft until David reviews it.",
    requiredBefore: [
      "synthetic_admin_testing",
      "real_candidate_data",
      "client_facing_output",
    ],
  },
  {
    id: "david-review-workflow",
    category: "Human review",
    label: "David review and approval workflow",
    status: "manual_review",
    evidence:
      "Review and approval fields are staged in Postgres, but no live edit/approve UI is built yet.",
    requiredBefore: ["real_candidate_data", "client_facing_output"],
  },
  {
    id: "edit-delete-output",
    category: "Human review",
    label: "David can edit or delete AI output",
    status: "manual_review",
    evidence:
      "Deletion metadata is staged for future routes. Real editing/deletion UI must be built before real use.",
    requiredBefore: ["real_candidate_data", "client_facing_output"],
  },
  {
    id: "provider-documented",
    category: "Privacy",
    label: "AI provider is documented",
    status: "blocked",
    evidence:
      "No AI provider has been selected or approved, so real candidate data cannot be sent anywhere.",
    requiredBefore: ["real_candidate_data", "client_facing_output"],
  },
  {
    id: "provider-dpa-region-training",
    category: "Privacy",
    label: "DPA, processing region and training use are reviewed",
    status: "blocked",
    evidence:
      "Provider terms, data region, training use, retention and deletion/export support need approval.",
    requiredBefore: ["real_candidate_data", "client_facing_output"],
  },
  {
    id: "pii-minimisation-redaction",
    category: "Privacy",
    label: "PII minimisation and redaction rules",
    status: "manual_review",
    evidence:
      "Redaction notes are staged, but no production redaction workflow exists yet.",
    requiredBefore: ["real_candidate_data", "client_facing_output"],
  },
  {
    id: "retention-dsar-ready",
    category: "Privacy",
    label: "Retention, deletion and DSAR handling",
    status: "manual_review",
    evidence:
      "Retention status is staged, but AI draft retention and DSAR handling need production review.",
    requiredBefore: ["real_candidate_data", "client_facing_output"],
  },
  {
    id: "transcription-consent-wording",
    category: "Consent",
    label: "Interview transcription consent wording",
    status: "blocked",
    evidence:
      "No approved recording/transcription consent wording or live capture route exists.",
    requiredBefore: ["real_candidate_data", "client_facing_output"],
  },
  {
    id: "candidate-opt-out",
    category: "Consent",
    label: "Candidate opt-out route",
    status: "blocked",
    evidence:
      "No candidate opt-out route exists for AI-assisted notes or transcription.",
    requiredBefore: ["real_candidate_data", "client_facing_output"],
  },
  {
    id: "manual-note-alternative",
    category: "Consent",
    label: "Manual note alternative remains available",
    status: "passed",
    evidence:
      "The current site has no AI notetaker or recording dependency, so manual notes remain the default.",
    requiredBefore: ["real_candidate_data", "client_facing_output"],
  },
  {
    id: "audit-events-staged",
    category: "Audit",
    label: "AI generation and approval events are typed",
    status: "passed",
    evidence:
      "Audit action names exist for AI draft creation, review, approval, rejection and blocked generation.",
    requiredBefore: ["real_candidate_data", "client_facing_output"],
  },
  {
    id: "source-and-prompt-tracking",
    category: "Audit",
    label: "Source summary and prompt version are tracked",
    status: "passed",
    evidence:
      "The private AI draft schema includes source data summary and prompt version metadata without storing raw prompts.",
    requiredBefore: ["real_candidate_data", "client_facing_output"],
  },
  {
    id: "publication-logging",
    category: "Audit",
    label: "Client-facing publication is logged",
    status: "manual_review",
    evidence:
      "Publication audit action names are staged, but no client-facing AI output route exists yet.",
    requiredBefore: ["client_facing_output"],
  },
  {
    id: "server-side-secrets",
    category: "Security",
    label: "API keys stay server-side only",
    status: "passed",
    evidence:
      "No AI provider key is configured or committed. Future keys must stay in server environment variables.",
    requiredBefore: [
      "synthetic_admin_testing",
      "real_candidate_data",
      "client_facing_output",
    ],
  },
  {
    id: "feature-flags-off",
    category: "Security",
    label: "AI feature flags are off by default",
    status: "passed",
    evidence: "All AI Ops flags default to false and are read server-side.",
    requiredBefore: [
      "synthetic_admin_testing",
      "real_candidate_data",
      "client_facing_output",
    ],
  },
  {
    id: "private-noindex",
    category: "Security",
    label: "Private routes stay noindexed",
    status: "passed",
    evidence:
      "`/admin/recruiter-labs/ai-ops` requires the CMS session gate, is noindexed and is absent from the sitemap.",
    requiredBefore: [
      "synthetic_admin_testing",
      "real_candidate_data",
      "client_facing_output",
    ],
  },
  {
    id: "no-public-drafts",
    category: "Security",
    label: "No public exposure of AI drafts",
    status: "passed",
    evidence: "No public AI draft route, API or Sanity content model exists.",
    requiredBefore: [
      "synthetic_admin_testing",
      "real_candidate_data",
      "client_facing_output",
    ],
  },
] as const satisfies readonly RecruiterLabsAiLaunchGateCheck[];

export type RecruiterLabsAiGovernanceStatus =
  (typeof recruiterLabsAiGovernanceChecks)[number]["status"];

export const recruiterLabsAiRollbackSteps = [
  "Set every AI Ops feature flag to false.",
  "Disable the selected AI provider key in the hosting environment.",
  "Stop any AI draft route from accepting real candidate data.",
  "Mark affected AI drafts as rejected or deleted.",
  "Remove client visibility for any affected profile.",
  "Review audit events for generation, approval, publication and deletion.",
  "Confirm candidate retention, deletion and DSAR actions still work.",
] as const;

export function isRecruiterLabsAiFeatureEnabled(
  flagName: RecruiterLabsAiFlagName,
  env: RecruiterLabsAiEnv = process.env,
) {
  return env[flagName] === "true";
}

export function getRecruiterLabsAiFeatureFlags(
  env: RecruiterLabsAiEnv = process.env,
) {
  return recruiterLabsAiFlagDefinitions.map((flag) => ({
    ...flag,
    enabled: isRecruiterLabsAiFeatureEnabled(flag.name, env),
    scope: "server-only" as const,
  }));
}

export function isRecruiterLabsAiUseAllowed(useCase: string) {
  const normalised = useCase.trim().toLowerCase();

  return (
    recruiterLabsAiAllowedUses.some((allowedUse) =>
      normalised.includes(allowedUse.toLowerCase()),
    ) &&
    !recruiterLabsAiBannedUses.some((bannedUse) =>
      normalised.includes(bannedUse.toLowerCase()),
    )
  );
}

export function getRecruiterLabsAiOverview(
  env: RecruiterLabsAiEnv = process.env,
) {
  const flags = getRecruiterLabsAiFeatureFlags(env);
  const blockedChecks = recruiterLabsAiGovernanceChecks.filter(
    (check) => check.status === "blocked",
  );
  const launchGate = getRecruiterLabsAiLaunchGate();

  return {
    flags,
    allowedUses: recruiterLabsAiAllowedUses,
    bannedUses: recruiterLabsAiBannedUses,
    governanceChecks: recruiterLabsAiGovernanceChecks,
    launchGate,
    rollbackSteps: recruiterLabsAiRollbackSteps,
    safeForSampleDataOnly: true,
    safeForRealCandidateData:
      blockedChecks.length === 0 && launchGate.safeForRealCandidateData,
    stats: {
      totalFlags: flags.length,
      enabledFlags: flags.filter((flag) => flag.enabled).length,
      blockedGovernanceChecks: blockedChecks.length,
      totalLaunchGateChecks: launchGate.checks.length,
      unresolvedLaunchGateChecks: launchGate.unresolvedChecks.length,
    },
  };
}

export function getRecruiterLabsAiLaunchGate() {
  const checks: RecruiterLabsAiLaunchGateCheck[] =
    recruiterLabsAiLaunchGateChecks.map((check) => ({ ...check }));
  const blockedChecks = checks.filter((check) => check.status === "blocked");
  const manualReviewChecks = checks.filter(
    (check) => check.status === "manual_review",
  );
  const unresolvedChecks = checks.filter((check) => check.status !== "passed");

  const unresolvedFor = (requirement: RecruiterLabsAiLaunchRequirement) =>
    unresolvedChecks.filter((check) =>
      check.requiredBefore.includes(requirement),
    );

  return {
    checks,
    blockedChecks,
    manualReviewChecks,
    unresolvedChecks,
    safeForSyntheticAdminTesting:
      unresolvedFor("synthetic_admin_testing").length === 0,
    safeForRealCandidateData: unresolvedFor("real_candidate_data").length === 0,
    safeForClientFacingOutput:
      unresolvedFor("client_facing_output").length === 0,
  };
}
