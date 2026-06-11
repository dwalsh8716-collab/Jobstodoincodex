import "server-only";

import { z } from "zod";
import { getOperationsBackendStatus } from "@/lib/operations/database";
import type { OperationsBackendStatus } from "@/lib/operations/types";
import { isLabsFeatureEnabled } from "@/lib/labs";

type AiBriefDiagnosticEnv = Record<string, string | undefined>;

export const aiBriefDiagnosticFeatureFlag = "FEATURE_AI_BRIEF_BUILDER" as const;
export const aiBriefDiagnosticPromptVersion = "brief-diagnostic-v1" as const;

export const aiBriefDiagnosticManualBlockers = [
  "Confirm the client-facing privacy wording and retention rules.",
  "Choose and approve an AI provider, DPA, processing region and model-training terms.",
  "Build David's private review/edit/approve screen before any output is used.",
  "Add email delivery only after the summary format is approved.",
  "Test that no PII is sent to analytics or public logs.",
  "Agree when this should hand off to Loxo or a private CRM workflow.",
] as const;

const briefListItemSchema = z.string().trim().min(2).max(140);

function normaliseListInput(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return value;
}

const requiredBriefListSchema = z.preprocess(
  normaliseListInput,
  z.array(briefListItemSchema).min(1).max(12),
);

const optionalBriefListSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return [];
  return normaliseListInput(value);
}, z.array(briefListItemSchema).max(12));

const optionalTrimmedString = z
  .string()
  .trim()
  .max(220)
  .optional()
  .transform((value) => (value ? value : undefined));

export const aiBriefDiagnosticSubmissionSchema = z
  .object({
    hiringFor: z.string().trim().min(3).max(220),
    whyNow: z.string().trim().min(3).max(1000),
    problemToSolve: z.string().trim().min(3).max(1000),
    failureImpact: z.string().trim().min(3).max(1000),
    engagementType: z.enum(["permanent", "interim", "unsure"]),
    salaryRateBudget: z.string().trim().min(2).max(220),
    locationHybridReality: z.string().trim().min(2).max(220),
    mustHaves: requiredBriefListSchema,
    niceToHaves: optionalBriefListSchema,
    triedHiringAlready: z.boolean(),
    whatDidNotWork: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .transform((value) => (value ? value : undefined)),
    urgency: z.enum(["low", "medium", "high", "critical"]),
    contactName: z.string().trim().min(2).max(120),
    contactEmail: z.string().trim().email().max(254),
    contactPhone: optionalTrimmedString,
    companyName: optionalTrimmedString,
    sourcePagePath: z
      .string()
      .trim()
      .max(180)
      .regex(/^\/[A-Za-z0-9/_?=&.-]*$/)
      .optional(),
    privacyNoticeAcknowledgement: z.literal(true),
    aiDraftAcknowledgement: z.literal(true),
    marketingConsent: z.boolean().default(false),
  })
  .superRefine((value, context) => {
    if (value.triedHiringAlready && !value.whatDidNotWork) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["whatDidNotWork"],
        message:
          "Please say what has not worked so David can qualify it properly.",
      });
    }
  });

export type AiBriefDiagnosticSubmission = z.infer<
  typeof aiBriefDiagnosticSubmissionSchema
>;

export type AiBriefDiagnosticGap = {
  id: string;
  severity: "follow_up" | "risk" | "blocker";
  label: string;
  detail: string;
};

export type AiBriefDiagnosticReviewPack = {
  status: "draft";
  promptVersion: typeof aiBriefDiagnosticPromptVersion;
  generatedBy: "deterministic_staging_helper";
  humanApproved: false;
  clientVisible: false;
  formalCommercialBrief: string;
  unclearAreas: string[];
  risks: string[];
  salaryHybridConcerns: string;
  suggestedFollowUpQuestions: string[];
  emailSummaryToDavid: string;
  optionalClientConfirmation: string;
};

export type AiBriefDiagnosticBuildResult =
  | {
      ok: true;
      skipped: false;
      submission: AiBriefDiagnosticSubmission;
      gaps: AiBriefDiagnosticGap[];
      reviewPack: AiBriefDiagnosticReviewPack;
    }
  | {
      ok: false;
      skipped: true;
      reason: "invalid_input";
      errors: string[];
    };

export type AiBriefDiagnosticStatus = {
  featureFlag: typeof aiBriefDiagnosticFeatureFlag;
  featureFlagEnabled: boolean;
  databaseStatus: OperationsBackendStatus;
  dataModelStaged: boolean;
  aiProviderConfigured: boolean;
  aiProviderImplemented: boolean;
  emailDeliveryImplemented: boolean;
  clientConfirmationImplemented: boolean;
  canAcceptSubmissions: boolean;
  canGenerateAiDrafts: boolean;
  canEmailDavid: boolean;
  status: "staged";
  message: string;
};

function getDatabaseStatus(env: AiBriefDiagnosticEnv): OperationsBackendStatus {
  if (env === process.env) return getOperationsBackendStatus();

  const enabled = env.OPERATIONS_DB_ENABLED === "true";
  const configured = Boolean(env.DATABASE_URL);

  return {
    enabled,
    configured,
    state: !enabled
      ? "disabled"
      : configured
        ? "ready"
        : "missing_database_url",
    message: configured
      ? "Private operations database is configured."
      : "Private operations database is not ready.",
  };
}

function isThinAnswer(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length < 8;
}

function asCommaList(values: string[]) {
  return values.length ? values.join(", ") : "Not confirmed";
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

const unclearBudgetPattern =
  /\b(tbc|unknown|unsure|open|market|competitive|negotiable|depends)\b/i;
const hybridPattern =
  /\b(remote|hybrid|office|on-site|onsite|days?|manchester|london|uk|regional)\b/i;

export function parseAiBriefDiagnosticSubmission(input: unknown) {
  return aiBriefDiagnosticSubmissionSchema.safeParse(input);
}

export function getAiBriefDiagnosticStatus(
  env: AiBriefDiagnosticEnv = process.env,
): AiBriefDiagnosticStatus {
  const featureFlagEnabled = isLabsFeatureEnabled(
    aiBriefDiagnosticFeatureFlag,
    env,
  );
  const databaseStatus = getDatabaseStatus(env);

  return {
    featureFlag: aiBriefDiagnosticFeatureFlag,
    featureFlagEnabled,
    databaseStatus,
    dataModelStaged: true,
    aiProviderConfigured: false,
    aiProviderImplemented: false,
    emailDeliveryImplemented: false,
    clientConfirmationImplemented: false,
    canAcceptSubmissions: false,
    canGenerateAiDrafts: false,
    canEmailDavid: false,
    status: "staged",
    message:
      "AI brief diagnostic is staged but disabled until privacy wording, Railway Postgres, AI provider approval, David review workflow and email delivery are approved.",
  };
}

export function getAiBriefDiagnosticGaps(
  submission: AiBriefDiagnosticSubmission,
): AiBriefDiagnosticGap[] {
  const gaps: AiBriefDiagnosticGap[] = [];

  if (isThinAnswer(submission.problemToSolve)) {
    gaps.push({
      id: "thin-problem",
      severity: "follow_up",
      label: "Problem needs sharpening",
      detail:
        "The business problem is thin. David should ask what needs to change, not just what title is being hired.",
    });
  }

  if (isThinAnswer(submission.failureImpact)) {
    gaps.push({
      id: "thin-failure-impact",
      severity: "risk",
      label: "Failure impact unclear",
      detail:
        "The cost of getting this hire wrong is not clear enough to qualify urgency or search approach.",
    });
  }

  if (unclearBudgetPattern.test(submission.salaryRateBudget)) {
    gaps.push({
      id: "unclear-budget",
      severity: "risk",
      label: "Budget needs a caveat",
      detail:
        "Salary or day-rate language is vague. David should qualify the budget before giving any advice.",
    });
  }

  if (!hybridPattern.test(submission.locationHybridReality)) {
    gaps.push({
      id: "unclear-hybrid",
      severity: "risk",
      label: "Hybrid reality needs checking",
      detail:
        "The location and working pattern need practical detail before this becomes a useful brief.",
    });
  }

  if (submission.engagementType === "unsure") {
    gaps.push({
      id: "engagement-model-unsure",
      severity: "follow_up",
      label: "Permanent or interim is undecided",
      detail:
        "David should ask whether the problem needs a permanent hire, interim support or a staged plan.",
    });
  }

  if (submission.mustHaves.length > 8) {
    gaps.push({
      id: "too-many-must-haves",
      severity: "risk",
      label: "Must-haves may be overloaded",
      detail:
        "The must-have list is long enough to narrow the market or blur the actual non-negotiables.",
    });
  }

  if (submission.triedHiringAlready && !submission.whatDidNotWork) {
    gaps.push({
      id: "previous-search-gap",
      severity: "follow_up",
      label: "Previous hiring attempt needs detail",
      detail:
        "The client has tried hiring already, but the reason it failed is not captured.",
    });
  }

  if (submission.urgency === "critical") {
    gaps.push({
      id: "critical-urgency",
      severity: "blocker",
      label: "Urgency needs immediate qualification",
      detail:
        "Critical urgency may point towards interim support or a narrower first search brief.",
    });
  }

  return gaps;
}

function followUpQuestions(
  submission: AiBriefDiagnosticSubmission,
  gaps: AiBriefDiagnosticGap[],
) {
  const questions = new Set<string>();

  for (const gap of gaps) {
    if (gap.id === "thin-problem") {
      questions.add(
        "What problem does this person need to solve in the first 90 days?",
      );
    }
    if (gap.id === "thin-failure-impact") {
      questions.add(
        "What happens commercially if this hire is still unresolved in three months?",
      );
    }
    if (gap.id === "unclear-budget") {
      questions.add(
        "What salary or day-rate range has actually been approved?",
      );
    }
    if (gap.id === "unclear-hybrid") {
      questions.add(
        "How many days, where, and how flexible is the working pattern really?",
      );
    }
    if (gap.id === "engagement-model-unsure") {
      questions.add(
        "Is this a long-term leadership gap, a short-term delivery problem, or both?",
      );
    }
    if (gap.id === "too-many-must-haves") {
      questions.add(
        "Which three must-haves would survive if the market pushed back?",
      );
    }
    if (gap.id === "previous-search-gap") {
      questions.add(
        "What specifically did not work when you tried hiring before?",
      );
    }
    if (gap.id === "critical-urgency") {
      questions.add("What needs to happen this week, and what can wait?");
    }
  }

  if (questions.size === 0) {
    questions.add(
      `What would make the ${submission.hiringFor} brief worth prioritising now?`,
    );
    questions.add("Where is the brief still a bit more hope than reality?");
  }

  return Array.from(questions).slice(0, 8);
}

function buildSalaryHybridConcern(gaps: AiBriefDiagnosticGap[]) {
  const relevant = gaps.filter((gap) =>
    ["unclear-budget", "unclear-hybrid"].includes(gap.id),
  );

  if (!relevant.length) {
    return "No obvious salary or hybrid warning from the submitted answers. David should still check the range, location and flexibility before advising.";
  }

  return relevant.map((gap) => gap.detail).join(" ");
}

export function buildAiBriefDiagnosticReviewPack(
  input: unknown,
): AiBriefDiagnosticBuildResult {
  const parsed = parseAiBriefDiagnosticSubmission(input);

  if (!parsed.success) {
    return {
      ok: false,
      skipped: true,
      reason: "invalid_input",
      errors: parsed.error.errors.map((error) => error.message),
    };
  }

  const submission = parsed.data;
  const gaps = getAiBriefDiagnosticGaps(submission);
  const questions = followUpQuestions(submission, gaps);
  const riskLabels = gaps
    .filter((gap) => gap.severity !== "follow_up")
    .map((gap) => `${gap.label}: ${gap.detail}`);
  const unclearAreas = gaps.map((gap) => `${gap.label}: ${gap.detail}`);

  return {
    ok: true,
    skipped: false,
    submission,
    gaps,
    reviewPack: {
      status: "draft",
      promptVersion: aiBriefDiagnosticPromptVersion,
      generatedBy: "deterministic_staging_helper",
      humanApproved: false,
      clientVisible: false,
      formalCommercialBrief: [
        `Role or problem: ${submission.hiringFor}`,
        `Why now: ${submission.whyNow}`,
        `Problem to solve: ${submission.problemToSolve}`,
        `If it fails: ${submission.failureImpact}`,
        `Likely route: ${submission.engagementType}`,
        `Budget: ${submission.salaryRateBudget}`,
        `Location and hybrid reality: ${submission.locationHybridReality}`,
        `Must-haves: ${asCommaList(submission.mustHaves)}`,
        `Nice-to-haves: ${asCommaList(submission.niceToHaves)}`,
        `Tried hiring already: ${submission.triedHiringAlready ? "yes" : "no"}`,
        `What has not worked: ${submission.whatDidNotWork || "Not confirmed"}`,
        `Urgency: ${submission.urgency}`,
      ].join("\n"),
      unclearAreas,
      risks: riskLabels.length
        ? riskLabels
        : ["No automated risk claim. David should still review the brief."],
      salaryHybridConcerns: buildSalaryHybridConcern(gaps),
      suggestedFollowUpQuestions: questions,
      emailSummaryToDavid: [
        `${submission.contactName}${submission.companyName ? ` from ${submission.companyName}` : ""} has submitted a brief diagnostic.`,
        `They are hiring for: ${submission.hiringFor}.`,
        `Urgency: ${submission.urgency}. Route: ${submission.engagementType}.`,
        `Reply to: ${submission.contactEmail}.`,
        "Review the draft before using it with the client.",
      ].join(" "),
      optionalClientConfirmation: [
        `Hi ${firstName(submission.contactName)}, thanks for sending this over.`,
        "I will read it properly and come back with a straight view on the brief, the risks and the quickest sensible next step.",
        "David",
      ].join(" "),
    },
  };
}
