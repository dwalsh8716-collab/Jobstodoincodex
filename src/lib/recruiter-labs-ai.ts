import "server-only";

type RecruiterLabsAiEnv = Record<string, string | undefined>;

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

export type RecruiterLabsAiGovernanceStatus =
  (typeof recruiterLabsAiGovernanceChecks)[number]["status"];

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

  return {
    flags,
    allowedUses: recruiterLabsAiAllowedUses,
    bannedUses: recruiterLabsAiBannedUses,
    governanceChecks: recruiterLabsAiGovernanceChecks,
    safeForSampleDataOnly: true,
    safeForRealCandidateData: blockedChecks.length === 0,
    stats: {
      totalFlags: flags.length,
      enabledFlags: flags.filter((flag) => flag.enabled).length,
      blockedGovernanceChecks: blockedChecks.length,
    },
  };
}
