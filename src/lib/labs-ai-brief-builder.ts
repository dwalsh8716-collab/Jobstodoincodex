import "server-only";

import {
  aiBriefDiagnosticManualBlockers,
  getAiBriefDiagnosticStatus,
} from "./ai-brief-diagnostic";

type LabsAiBriefBuilderEnv = Record<string, string | undefined>;

export const labsAiBriefBuilderAdminRoute = "/admin/labs/ai-brief-builder";
export const labsAiBriefBuilderApiRoute =
  "/api/recruiter-labs/brief-diagnostic";

export const labsAiBriefBuilderSections = [
  {
    title: "The business problem",
    questions: [
      "What has changed in the business?",
      "Why does this hire exist now?",
      "What problem needs solving?",
      "What happens if nobody is hired?",
    ],
  },
  {
    title: "The role reality",
    questions: [
      "Permanent, interim or unsure?",
      "What must this person fix, build or lead?",
      "What have you tried already?",
    ],
  },
  {
    title: "The market reality",
    questions: [
      "What salary or day-rate is actually approved?",
      "What is flexible?",
      "What is non-negotiable?",
    ],
  },
  {
    title: "The must-haves",
    questions: [
      "Which requirements are genuinely essential?",
      "Which would be nice rather than necessary?",
      "Which trade-offs would David challenge?",
    ],
  },
  {
    title: "Salary/rate",
    questions: [
      "Does the budget match the brief?",
      "What happens if the market pushes back?",
    ],
  },
  {
    title: "Urgency",
    questions: [
      "What needs to happen this week?",
      "What does success look like in 3, 6 and 12 months?",
    ],
  },
  {
    title: "David's review",
    questions: [
      "What questions should David ask next?",
      "What should not be used until David approves it?",
    ],
  },
] as const;

export const labsAiBriefBuilderOutputTypes = [
  "clearer role summary",
  "risks/gaps in the brief",
  "suggested must-haves",
  "salary realism notes",
  "interim vs permanent recommendation",
  "questions David should ask",
  "draft job advert outline",
] as const;

export const labsAiBriefBuilderSafetyRules = [
  "Draft only.",
  "Labelled as unreviewed.",
  "David review required before use.",
  "No automatic publishing.",
  "No client sending without approval.",
  "No automated candidate decisions.",
  "No sensitive data to AI providers without approved provider/privacy controls.",
] as const;

export function getLabsAiBriefBuilderStatus(
  env: LabsAiBriefBuilderEnv = process.env,
) {
  const diagnosticStatus = getAiBriefDiagnosticStatus(env);

  return {
    featureFlag: diagnosticStatus.featureFlag,
    featureFlagEnabled: diagnosticStatus.featureFlagEnabled,
    databaseStatus: diagnosticStatus.databaseStatus,
    dataModelStaged: diagnosticStatus.dataModelStaged,
    nonAiModeAvailable: true,
    aiProviderConfigured: diagnosticStatus.aiProviderConfigured,
    aiProviderImplemented: diagnosticStatus.aiProviderImplemented,
    canAcceptSubmissions: diagnosticStatus.canAcceptSubmissions,
    canGenerateAiDrafts: diagnosticStatus.canGenerateAiDrafts,
    readyForPrivatePreview:
      diagnosticStatus.featureFlagEnabled &&
      diagnosticStatus.databaseStatus.state === "ready",
    readyForPublicLaunch: false,
    noIndex: true,
    adminRoute: labsAiBriefBuilderAdminRoute,
    apiRoute: labsAiBriefBuilderApiRoute,
  };
}

export function getLabsAiBriefBuilderPreview(
  env: LabsAiBriefBuilderEnv = process.env,
) {
  const status = getLabsAiBriefBuilderStatus(env);

  return {
    status,
    sections: labsAiBriefBuilderSections,
    modes: [
      {
        label: "Structured non-AI mode",
        state: "available_for_private_design" as const,
        detail:
          "Uses guided questions and deterministic review-pack logic. No provider call.",
      },
      {
        label: "AI-assisted draft mode",
        state: "blocked" as const,
        detail:
          "Requires approved provider, DPA, processing-region review, prompt logging and David approval workflow.",
      },
    ],
    outputTypes: labsAiBriefBuilderOutputTypes,
    safetyRules: labsAiBriefBuilderSafetyRules,
    manualBlockers: aiBriefDiagnosticManualBlockers,
    cta: "Sense-check this brief with David",
  };
}
