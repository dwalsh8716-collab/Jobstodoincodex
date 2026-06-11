import "server-only";

import type { OperationsBackendStatus } from "./operations/types";

type LabsFunctionalMatrixEnv = Record<string, string | undefined>;

export const labsFunctionalMatrixFeatureFlag = "FEATURE_FUNCTIONAL_MATRIX";
export const labsFunctionalMatrixAdminRoute = "/admin/labs/functional-matrix";

export const labsFunctionalMatrixDimensions = [
  {
    id: "strategy",
    label: "Strategy",
    prompt: "How much senior thinking and market judgement does the role need?",
  },
  {
    id: "execution",
    label: "Execution",
    prompt: "How hands-on does this person need to be week by week?",
  },
  {
    id: "leadership",
    label: "Leadership",
    prompt: "Are they leading people, agencies, boards or a function?",
  },
  {
    id: "commercial_impact",
    label: "Commercial impact",
    prompt: "What commercial outcome should this hire change?",
  },
  {
    id: "technical_skill",
    label: "Technical skill",
    prompt: "Which specialist craft skills genuinely matter?",
  },
  {
    id: "channel_expertise",
    label: "Channel expertise",
    prompt: "Which channels are must-have rather than familiar-to-have?",
  },
  {
    id: "stakeholder_management",
    label: "Stakeholder management",
    prompt: "Who needs taking with them for this to work?",
  },
  {
    id: "agency_client_side",
    label: "Agency/client-side experience",
    prompt: "Does context matter, or can the right operator adapt?",
  },
  {
    id: "sector_knowledge",
    label: "Sector knowledge",
    prompt: "Is sector knowledge essential, useful or a false comfort blanket?",
  },
  {
    id: "team_management",
    label: "Team management",
    prompt: "What team shape will they inherit, build or fix?",
  },
  {
    id: "budget_ownership",
    label: "Budget ownership",
    prompt: "What budget, P&L or agency spend will they be trusted with?",
  },
  {
    id: "growth_change",
    label: "Growth/change experience",
    prompt: "Is this about scaling, turnaround, repositioning or steady delivery?",
  },
  {
    id: "hands_on_delivery",
    label: "Hands-on delivery",
    prompt: "Where must they still roll their sleeves up?",
  },
  {
    id: "transformation",
    label: "Transformation",
    prompt: "Is there a change programme, new model or operating reset involved?",
  },
  {
    id: "interim_urgency",
    label: "Interim urgency",
    prompt: "How quickly must impact happen, and can a permanent hire wait?",
  },
] as const;

export const labsFunctionalMatrixOutputs = [
  "role requirement matrix",
  "must-have/nice-to-have split",
  "brief quality score",
  "mismatch warnings",
  "candidate comparison matrix",
  "shortlist summary",
  "hiring risk notes",
  "salary realism note",
] as const;

export const labsFunctionalMatrixUseCases = [
  "client briefing",
  "retained search scoping",
  "strategic interim scoping",
  "candidate evaluation by David, not automated scoring",
  "shortlist comparison",
  "salary benchmarking",
] as const;

export const labsFunctionalMatrixSafetyRules = [
  "Private/admin preview only.",
  "No public route.",
  "No candidate scoring or automated recommendation.",
  "No private client or candidate data in Sanity.",
  "Use Postgres if a matrix references live client, role or candidate data.",
  "Use Sanity only for public/static template definitions.",
  "Treat the brief quality score as an advisory prompt, not a decision.",
] as const;

export const labsFunctionalMatrixExample = {
  title: "Senior marketing leadership search",
  serviceType: "Leadership search",
  clientType: "Founder-led B2B business",
  scoreLabels: ["Light", "Useful", "Important", "Critical"],
  mustHaves: [
    "Can set the marketing direction, not just run campaigns.",
    "Has led senior stakeholders through change.",
    "Can turn budget into pipeline, brand or commercial progress.",
  ],
  niceToHaves: [
    "Sector experience where it shortens ramp-up.",
    "Agency-side background if stakeholder craft matters.",
  ],
  risks: [
    "A title-led brief may overvalue sector comfort and undervalue change leadership.",
    "Too many must-haves will shrink the market before the search starts.",
  ],
} as const;

function operationsStatusFromEnv(
  env: LabsFunctionalMatrixEnv = process.env,
): OperationsBackendStatus {
  const enabled = env.OPERATIONS_DB_ENABLED === "true";
  const configured = Boolean(env.DATABASE_URL);

  if (!enabled) {
    return {
      enabled,
      configured,
      state: "disabled",
      message:
        "Private operations database is staged but not enabled. Keep live matrices read-only until Postgres is ready.",
    };
  }

  if (!configured) {
    return {
      enabled,
      configured,
      state: "missing_database_url",
      message: "OPERATIONS_DB_ENABLED is true, but DATABASE_URL is missing.",
    };
  }

  return {
    enabled,
    configured,
    state: "ready",
    message: "Private operations database is configured.",
  };
}

export function getLabsFunctionalMatrixStatus(
  env: LabsFunctionalMatrixEnv = process.env,
) {
  const featureEnabled = env[labsFunctionalMatrixFeatureFlag] === "true";
  const databaseStatus = operationsStatusFromEnv(env);

  return {
    featureFlag: labsFunctionalMatrixFeatureFlag,
    featureEnabled,
    adminRoute: labsFunctionalMatrixAdminRoute,
    noIndex: true,
    databaseStatus,
    canSaveMatrices:
      featureEnabled &&
      databaseStatus.enabled &&
      databaseStatus.configured &&
      databaseStatus.state === "ready",
    readyForPublicLaunch: false,
  };
}

export function getLabsFunctionalMatrixPreview(
  env: LabsFunctionalMatrixEnv = process.env,
) {
  return {
    status: getLabsFunctionalMatrixStatus(env),
    dimensions: labsFunctionalMatrixDimensions,
    outputs: labsFunctionalMatrixOutputs,
    useCases: labsFunctionalMatrixUseCases,
    safetyRules: labsFunctionalMatrixSafetyRules,
    example: labsFunctionalMatrixExample,
    principle: "The job title is not the brief.",
  };
}
