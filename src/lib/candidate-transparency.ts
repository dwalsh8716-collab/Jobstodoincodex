import "server-only";

import {
  candidateJobPageStandards,
  candidateTrustQuestions,
} from "./candidate-transparency-content";

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
  {
    name: "FEATURE_CANDIDATE_TRANSPARENCY_SCORECARD",
    label: "Candidate transparency scorecard",
    description:
      "Private readiness checker for salary, hybrid, process, privacy and no-fluff job advert quality before publishing.",
  },
] as const;

export type CandidateTransparencyFlagName =
  (typeof candidateTransparencyFlagDefinitions)[number]["name"];

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
