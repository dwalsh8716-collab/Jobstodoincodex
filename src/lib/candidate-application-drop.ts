import "server-only";

import { isCandidateTransparencyFeatureEnabled } from "./candidate-transparency";

type CandidateApplicationDropEnv = Record<string, string | undefined>;

export const candidateApplicationDropFeatureFlag =
  "FEATURE_CANDIDATE_APPLICATION_DROP" as const;

export const candidateApplicationDropStorageEnvVars = [
  "CANDIDATE_CV_STORAGE_PROVIDER",
  "CANDIDATE_CV_STORAGE_BUCKET",
  "CANDIDATE_CV_STORAGE_SIGNING_SECRET",
] as const;

export const candidateApplicationDropManualBlockers = [
  "Choose and configure private object storage.",
  "Keep CV files out of Sanity, GitHub and the public folder.",
  "Add signed admin-only access for private downloads.",
  "Add virus scanning or a documented manual review process.",
  "Confirm retention, deletion and DSAR handling for CV files.",
  "Get legal/privacy wording reviewed before accepting uploads.",
] as const;

export function getCandidateApplicationDropStatus(
  env: CandidateApplicationDropEnv = process.env,
) {
  const featureFlagEnabled = isCandidateTransparencyFeatureEnabled(
    candidateApplicationDropFeatureFlag,
    env,
  );
  const privateStorageConfigured = candidateApplicationDropStorageEnvVars.every(
    (key) => Boolean(env[key]),
  );

  return {
    featureFlag: candidateApplicationDropFeatureFlag,
    featureFlagEnabled,
    privateStorageConfigured,
    storageAdapterImplemented: false,
    canAcceptCvUploads: false,
    status: "staged" as const,
    message:
      "CV upload is staged but disabled until private storage, signed access, scanning, retention and legal/privacy review are approved.",
  };
}
