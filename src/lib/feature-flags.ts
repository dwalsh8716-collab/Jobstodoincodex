import "server-only";

import {
  type CandidateTransparencyFlagName,
  candidateTransparencyFlagDefinitions,
} from "./candidate-transparency";
import { type LabsFeatureFlagName, labsFeatureFlagDefinitions } from "./labs";
import {
  type RecruiterLabsAiFlagName,
  recruiterLabsAiFlagDefinitions,
} from "./recruiter-labs-ai";
import {
  type RecruiterLabsFlagName,
  recruiterLabsFlagDefinitions,
} from "./recruiter-labs";

export type FeatureFlagName =
  | LabsFeatureFlagName
  | RecruiterLabsFlagName
  | RecruiterLabsAiFlagName
  | CandidateTransparencyFlagName;

export type FeatureFlagArea =
  | "Essential Resourcing Labs"
  | "Recruiter Labs client pipeline"
  | "Recruiter Labs candidate transparency"
  | "Recruiter Labs AI Ops";

export type FeatureFlagDefinition = {
  name: FeatureFlagName;
  label: string;
  description: string;
  area: FeatureFlagArea;
  defaultValue: false;
  enabledValue: "true";
  scope: "server-only";
  safeForPublicNow: false;
  publicBundleRule: string;
  ownerDoc: string;
  launchRule: string;
};

export type FeatureFlagState = FeatureFlagDefinition & {
  enabled: boolean;
};

type SourceFlag = {
  readonly name: FeatureFlagName;
  readonly label: string;
  readonly description: string;
};

type SharedFlagDetails = Pick<
  FeatureFlagDefinition,
  "area" | "ownerDoc" | "publicBundleRule" | "launchRule"
>;

function defineFlags(
  flags: readonly SourceFlag[],
  details: SharedFlagDetails,
): FeatureFlagDefinition[] {
  return flags.map((flag) => ({
    ...flag,
    ...details,
    defaultValue: false,
    enabledValue: "true",
    scope: "server-only",
    safeForPublicNow: false,
  }));
}

export const issue117SuggestedFeatureFlags = [
  "FEATURE_RECRUITER_LABS_ENABLED",
  "FEATURE_CLIENT_PRESENTATION_PORTAL",
  "FEATURE_BRANDED_CANDIDATE_PROFILES",
  "FEATURE_SHORTLIST_FEEDBACK_TRACKING",
  "FEATURE_WHATSAPP_INTERVIEW_SCHEDULING",
  "FEATURE_AI_OPS_COMPRESSION",
  "FEATURE_CANDIDATE_TRANSPARENCY_LABS",
  "FEATURE_SALARY_GUIDE_GATE",
  "FEATURE_INTERIM_BENCH_PORTAL",
] as const satisfies readonly FeatureFlagName[];

export const featureFlagDefinitions: readonly FeatureFlagDefinition[] = [
  ...defineFlags(labsFeatureFlagDefinitions, {
    area: "Essential Resourcing Labs",
    ownerDoc: "docs/essential-resourcing-labs.md",
    publicBundleRule:
      "Do not import Labs helpers into public page components. Use protected admin routes until a launch gate passes.",
    launchRule:
      "Default off. Enable only for protected admin planning or a reviewed, separate public release.",
  }),
  ...defineFlags(recruiterLabsFlagDefinitions, {
    area: "Recruiter Labs client pipeline",
    ownerDoc: "docs/recruiter-labs-client-pipeline-launch-gate.md",
    publicBundleRule:
      "Keep client-pipeline code under protected admin/private routes until signed access, consent and audit gates pass.",
    launchRule:
      "Default off. Do not use with real client or candidate data until the Recruiter Labs launch gate is green.",
  }),
  ...defineFlags(candidateTransparencyFlagDefinitions, {
    area: "Recruiter Labs candidate transparency",
    ownerDoc: "docs/recruiter-labs-candidate-transparency.md",
    publicBundleRule:
      "Keep candidate-workflow logic server-side unless a specific public job-page change is reviewed and approved.",
    launchRule:
      "Default off. Enable only after storage, consent, data handling and candidate copy are reviewed.",
  }),
  ...defineFlags(recruiterLabsAiFlagDefinitions, {
    area: "Recruiter Labs AI Ops",
    ownerDoc: "docs/recruiter-labs-ai-launch-gate.md",
    publicBundleRule:
      "Keep AI Ops code private. Do not import it into public routes or client components.",
    launchRule:
      "Default off. Synthetic admin testing only until provider, DPA, consent, retention and David approval gates pass.",
  }),
];

export function isFeatureFlagEnabled(
  flagName: FeatureFlagName,
  env: Record<string, string | undefined> = process.env,
) {
  return env[flagName] === "true";
}

export function getFeatureFlags(
  env: Record<string, string | undefined> = process.env,
): FeatureFlagState[] {
  return featureFlagDefinitions.map((flag) => ({
    ...flag,
    enabled: isFeatureFlagEnabled(flag.name, env),
  }));
}

export function getFeatureFlagOverview(
  env: Record<string, string | undefined> = process.env,
) {
  const flags = getFeatureFlags(env);
  const enabledFlags = flags.filter((flag) => flag.enabled);
  const byArea = flags.reduce<Record<FeatureFlagArea, number>>(
    (totals, flag) => {
      totals[flag.area] = (totals[flag.area] || 0) + 1;
      return totals;
    },
    {
      "Essential Resourcing Labs": 0,
      "Recruiter Labs client pipeline": 0,
      "Recruiter Labs candidate transparency": 0,
      "Recruiter Labs AI Ops": 0,
    },
  );

  return {
    flags,
    enabledFlags,
    byArea,
    stats: {
      totalFlags: flags.length,
      enabledFlags: enabledFlags.length,
      serverOnlyFlags: flags.filter((flag) => flag.scope === "server-only")
        .length,
      publicSafeToday: flags.filter((flag) => flag.safeForPublicNow).length,
    },
  };
}
