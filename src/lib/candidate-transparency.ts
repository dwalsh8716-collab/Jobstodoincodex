import "server-only";

type CandidateTransparencyEnv = Record<string, string | undefined>;

export const candidateTransparencyFlagDefinitions = [
  {
    name: "FEATURE_CANDIDATE_TRANSPARENCY_LABS",
    label: "Candidate transparency labs",
    description:
      "Private planning stream for transparent candidate journeys and job standards.",
  },
  {
    name: "FEATURE_FLUFF_FREE_JOB_PAGES",
    label: "Fluff-free job pages",
    description:
      "Future public rollout for stricter salary, hybrid and process standards on job pages.",
  },
  {
    name: "FEATURE_CANDIDATE_APPLICATION_DROP",
    label: "Candidate application drop",
    description:
      "Future friction-light candidate application route, blocked until secure storage is approved.",
  },
  {
    name: "FEATURE_LINKEDIN_PROFILE_APPLICATION",
    label: "LinkedIn/profile application",
    description:
      "Future profile-first application option without asking for unnecessary CV upload.",
  },
  {
    name: "FEATURE_CANDIDATE_STATUS_JOURNEY",
    label: "Candidate status journey",
    description:
      "Future private candidate status updates, backed by Postgres rather than Sanity.",
  },
  {
    name: "FEATURE_CANDIDATE_WHATSAPP_QUESTIONS",
    label: "Candidate WhatsApp questions",
    description:
      "Future candidate quick-question workflow through approved WhatsApp Business rules.",
  },
  {
    name: "FEATURE_INTERVIEW_PROCESS_TRANSPARENCY",
    label: "Interview process transparency",
    description:
      "Future structured interview-process fields and status updates for live roles.",
  },
] as const;

export type CandidateTransparencyFlagName =
  (typeof candidateTransparencyFlagDefinitions)[number]["name"];

export const candidateTrustQuestions = [
  "Is this role real?",
  "Is the salary or rate clear?",
  "Where is it based?",
  "What hybrid setup is actually expected?",
  "What problem is this hire solving?",
  "What will the interview process look like?",
  "What happens after I apply?",
  "How will my CV and data be handled?",
  "Can I ask David a quick question?",
  "Will I be contacted by WhatsApp, email or phone?",
] as const;

export const candidateJobPageStandards = [
  "State the salary or rate range before a role goes live.",
  "Say whether salary is verified, indicative or not ready to publish.",
  "Explain the real hybrid and office rhythm.",
  "Separate must-haves from useful extras.",
  "Explain why the role exists and what problem it solves.",
  "Show the expected interview process before asking for an application.",
  "Keep CV, LinkedIn and contact data out of Sanity.",
  "Offer a quick human question route without replacing the formal application.",
] as const;

export function isCandidateTransparencyFeatureEnabled(
  flagName: CandidateTransparencyFlagName,
  env: CandidateTransparencyEnv = process.env,
) {
  return env[flagName] === "true";
}

export function getCandidateTransparencyFeatureFlags(
  env: CandidateTransparencyEnv = process.env,
) {
  return candidateTransparencyFlagDefinitions.map((flag) => ({
    ...flag,
    enabled: isCandidateTransparencyFeatureEnabled(flag.name, env),
    scope: "server-only" as const,
  }));
}

export function getCandidateTransparencyOverview(
  env: CandidateTransparencyEnv = process.env,
) {
  const flags = getCandidateTransparencyFeatureFlags(env);

  return {
    flags,
    standards: candidateJobPageStandards,
    trustQuestions: candidateTrustQuestions,
    stats: {
      totalFlags: flags.length,
      enabledFlags: flags.filter((flag) => flag.enabled).length,
    },
  };
}
