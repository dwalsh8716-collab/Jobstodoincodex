import "server-only";

import { getOperationsBackendStatus } from "./operations/database";
import { isRecruiterLabsAiFeatureEnabled } from "./recruiter-labs-ai";
import { isRecruiterLabsFeatureEnabled } from "./recruiter-labs";
import type { RetentionStatus } from "./retention";

type Env = Record<string, string | undefined>;

export const recruiterLabsCandidateProfileFeatureFlags = [
  "FEATURE_BRANDED_CANDIDATE_PROFILES",
  "FEATURE_AI_CANDIDATE_SUMMARIES",
  "FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS",
  "FEATURE_CV_ANONYMIZATION",
] as const;

export type CandidateProfileBuilderStatus =
  | "draft"
  | "david_review_required"
  | "david_edited"
  | "approved_for_client"
  | "withheld"
  | "archived"
  | "deleted";

export type CandidateProfileBuilderInput = {
  displayName?: string | null;
  anonymisedLabel?: string | null;
  currentTitle?: string | null;
  location?: string | null;
  workPreference?: string | null;
  salaryExpectation?: string | null;
  rateExpectation?: string | null;
  noticePeriod?: string | null;
  availability?: string | null;
  seniority?: string | null;
  sectorExperience?: string[];
  agencyClientSide?: "agency" | "client_side" | "both" | "to_be_confirmed";
  functionalStrengths?: string[];
  leadershipScope?: string | null;
  commercialImpact?: string[];
  davidSummary?: string | null;
  strengths?: string[];
  watchouts?: string[];
  relevantExperience?: string[];
  aiDraftUsed?: boolean;
};

export type CandidateProfileDraft = Required<
  Pick<
    CandidateProfileBuilderInput,
    | "sectorExperience"
    | "functionalStrengths"
    | "commercialImpact"
    | "strengths"
    | "watchouts"
    | "relevantExperience"
  >
> & {
  profileStatus: CandidateProfileBuilderStatus;
  displayName?: string;
  anonymisedLabel: string;
  currentTitle?: string;
  location?: string;
  workPreference?: string;
  salaryExpectation?: string;
  rateExpectation?: string;
  noticePeriod?: string;
  availability?: string;
  seniority?: string;
  agencyClientSide: "agency" | "client_side" | "both" | "to_be_confirmed";
  leadershipScope?: string;
  davidSummary?: string;
  aiDraftUsed: boolean;
  aiDraftLabel?: string;
  approvedForClientUse: false;
  humanReviewRequired: true;
};

export type CandidateProfileShareDecision = {
  canShare: boolean;
  reasons: string[];
};

function databaseStatusFromEnv(env: Env) {
  if (env === process.env) return getOperationsBackendStatus();

  const enabled = env.OPERATIONS_DB_ENABLED === "true";
  const configured = Boolean(env.DATABASE_URL);

  if (!enabled) {
    return {
      enabled,
      configured,
      state: "disabled" as const,
      message: "Private operations database is disabled.",
    };
  }

  if (!configured) {
    return {
      enabled,
      configured,
      state: "missing_database_url" as const,
      message: "Private operations database is missing DATABASE_URL.",
    };
  }

  return {
    enabled,
    configured,
    state: "ready" as const,
    message: "Private operations database is configured.",
  };
}

function clean(value?: string | null, maxLength = 180) {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function cleanList(values: string[] | undefined, maxItems = 8) {
  return (values || [])
    .map((value) => clean(value, 220))
    .filter((value): value is string => Boolean(value))
    .slice(0, maxItems);
}

export function getCandidateProfileBuilderReadiness(env: Env = process.env) {
  const brandedProfilesEnabled = isRecruiterLabsFeatureEnabled(
    "FEATURE_BRANDED_CANDIDATE_PROFILES",
    env,
  );
  const aiSummariesEnabled =
    isRecruiterLabsFeatureEnabled("FEATURE_AI_CANDIDATE_SUMMARIES", env) ||
    isRecruiterLabsAiFeatureEnabled(
      "FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS",
      env,
    );
  const cvAnonymizationEnabled = isRecruiterLabsAiFeatureEnabled(
    "FEATURE_CV_ANONYMIZATION",
    env,
  );
  const databaseStatus = databaseStatusFromEnv(env);

  return {
    brandedProfilesEnabled,
    aiSummariesEnabled,
    cvAnonymizationEnabled,
    databaseStatus,
    readyForManualProfiles:
      brandedProfilesEnabled && databaseStatus.state === "ready",
    readyForAiDrafts: false,
    readyForCvExtraction: false,
    safeForClientSharing: false,
    blockers: [
      !brandedProfilesEnabled &&
        "FEATURE_BRANDED_CANDIDATE_PROFILES is not enabled.",
      databaseStatus.state !== "ready" &&
        "Private operations database is not ready.",
      "AI provider, consent wording and David review workflow are not approved.",
      "Private CV storage, extraction and malware scanning are not approved.",
      "Client sharing still needs explicit David approval and consent checks.",
    ].filter(Boolean) as string[],
  };
}

export function buildManualCandidateProfileDraft(
  input: CandidateProfileBuilderInput,
): CandidateProfileDraft {
  const aiDraftUsed = Boolean(input.aiDraftUsed);

  return {
    profileStatus: aiDraftUsed ? "david_review_required" : "draft",
    displayName: clean(input.displayName, 120),
    anonymisedLabel:
      clean(input.anonymisedLabel, 120) || "Anonymised candidate",
    currentTitle: clean(input.currentTitle, 160),
    location: clean(input.location, 120),
    workPreference: clean(input.workPreference, 160),
    salaryExpectation: clean(input.salaryExpectation, 120),
    rateExpectation: clean(input.rateExpectation, 120),
    noticePeriod: clean(input.noticePeriod, 120),
    availability: clean(input.availability, 120),
    seniority: clean(input.seniority, 120),
    sectorExperience: cleanList(input.sectorExperience),
    agencyClientSide: input.agencyClientSide || "to_be_confirmed",
    functionalStrengths: cleanList(input.functionalStrengths),
    leadershipScope: clean(input.leadershipScope, 240),
    commercialImpact: cleanList(input.commercialImpact),
    davidSummary: clean(input.davidSummary, 600),
    strengths: cleanList(input.strengths),
    watchouts: cleanList(input.watchouts),
    relevantExperience: cleanList(input.relevantExperience),
    aiDraftUsed,
    aiDraftLabel: aiDraftUsed
      ? "AI-assisted draft. David review required."
      : undefined,
    approvedForClientUse: false,
    humanReviewRequired: true,
  };
}

export function getCandidateProfileShareDecision(input: {
  profileStatus?: CandidateProfileBuilderStatus | null;
  approvedForClientUse?: boolean | null;
  approvedAt?: Date | string | null;
  consentCheckedAt?: Date | string | null;
  aiDraftUsed?: boolean | null;
  aiDraftReviewedAt?: Date | string | null;
  retentionStatus?: RetentionStatus | null;
}): CandidateProfileShareDecision {
  const reasons: string[] = [];

  if (input.profileStatus !== "approved_for_client") {
    reasons.push("Profile is not approved for client use.");
  }

  if (input.approvedForClientUse !== true || !input.approvedAt) {
    reasons.push("David approval is missing.");
  }

  if (!input.consentCheckedAt) {
    reasons.push("Candidate consent check is missing.");
  }

  if (input.aiDraftUsed && !input.aiDraftReviewedAt) {
    reasons.push("AI draft has not been reviewed by David.");
  }

  if (
    input.retentionStatus &&
    ["pending_review", "delete_requested", "deletion_approved", "deleted"].includes(
      input.retentionStatus,
    )
  ) {
    reasons.push("Retention status blocks sharing.");
  }

  return {
    canShare: reasons.length === 0,
    reasons,
  };
}
