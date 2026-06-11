import "server-only";

import { z } from "zod";
import { getOperationsBackendStatus } from "@/lib/operations/database";
import type { OperationsBackendStatus } from "@/lib/operations/types";
import { isRecruiterLabsAiFeatureEnabled } from "@/lib/recruiter-labs-ai";

type Env = Record<string, string | undefined>;

export const aiInterviewNotesPromptVersion = "interview-notes-v0-fake-data";

export const interviewNoteFeatureFlags = [
  "FEATURE_AI_INTERVIEW_NOTES",
  "FEATURE_AI_SCORECARD_NOTES",
] as const;

export const interviewScorecardSections = [
  {
    id: "role_motivation",
    label: "Role motivation",
    prompt:
      "Why this move, why now, and what problem are they trying to solve?",
  },
  {
    id: "relevant_experience",
    label: "Relevant experience",
    prompt: "Evidence tied to the role brief, not generic career history.",
  },
  {
    id: "leadership_seniority",
    label: "Leadership and seniority",
    prompt: "Scope, team context, decision level and pressure handled.",
  },
  {
    id: "commercial_impact",
    label: "Commercial impact",
    prompt: "Revenue, pipeline, margin, growth or business change evidence.",
  },
  {
    id: "functional_expertise",
    label: "Functional expertise",
    prompt: "The marketing, PR, digital or communications work they can prove.",
  },
  {
    id: "stakeholder_management",
    label: "Stakeholder management",
    prompt: "Board, founder, client, agency or cross-functional evidence.",
  },
  {
    id: "agency_client_side_fit",
    label: "Agency / client-side fit",
    prompt: "Context that helps David judge environment fit manually.",
  },
  {
    id: "strategic_vs_hands_on_balance",
    label: "Strategic vs hands-on balance",
    prompt: "Where they add direction, and where they still roll sleeves up.",
  },
  {
    id: "availability_notice",
    label: "Availability and notice",
    prompt:
      "Notice period, start timing, interim availability and constraints.",
  },
  {
    id: "salary_rate_alignment",
    label: "Salary / rate alignment",
    prompt: "Expectation, flexibility and what still needs confirming.",
  },
  {
    id: "concerns_watchouts",
    label: "Concerns and watch-outs",
    prompt: "Risks to verify, not rejection reasons.",
  },
  {
    id: "follow_up_questions",
    label: "Follow-up questions",
    prompt: "Questions David should ask before using this in a profile.",
  },
] as const;

export type InterviewScorecardSectionId =
  (typeof interviewScorecardSections)[number]["id"];

export const fakeInterviewTranscriptExample = [
  "David: Talk me through the kind of brief where you do your best work.",
  "Candidate: I am strongest where there is a commercial problem behind the marketing brief, especially when sales and marketing need to get closer.",
  "David: What would you need to know before speaking to the client?",
  "Candidate: I would want clarity on budget, decision speed, stakeholder appetite and whether the role is strategic or hands-on.",
].join("\n");

export const interviewNotesManualBlockers = [
  "Approve candidate consent wording for recording, transcription and AI-assisted notes.",
  "Approve provider, DPA, processing region, model-training terms and retention.",
  "Keep a manual notes alternative for candidates who opt out.",
  "Build David review, edit, approve and delete actions before profile use.",
  "Log every approval through the central audit trail.",
  "Confirm transcript storage and retention before storing real transcripts.",
] as const;

export const interviewNoteDraftSchema = z.object({
  sourceType: z.enum(["manual_notes", "fake_transcript"]),
  manualNotes: z.string().trim().min(10).max(4000).optional(),
  transcriptText: z.string().trim().min(10).max(4000).optional(),
  usesRealCandidateData: z.boolean().default(false),
  candidateConsentCaptured: z.boolean().default(false),
});

export type InterviewNoteDraftInput = z.infer<typeof interviewNoteDraftSchema>;

export type InterviewNoteSectionDraft = {
  sectionId: InterviewScorecardSectionId;
  sectionName: string;
  notes: string;
  evidence: string;
  followUpNeeded: boolean;
};

export type InterviewNotePrototypeDraft = {
  status: "david_review_required";
  sourceType: "manual_notes" | "fake_transcript";
  summaryDraft: string;
  structuredNotes: InterviewNoteSectionDraft[];
  followUpQuestions: string[];
  missingInformationPrompts: string[];
  candidateProfileUpdateSuggestions: string[];
  clientSummaryDraft: string;
  adminTasks: string[];
  approvedForProfileUse: false;
  humanReviewed: false;
  numericScore: null;
  promptVersion: typeof aiInterviewNotesPromptVersion;
};

export type InterviewNotePrototypeResult =
  | {
      ok: true;
      skipped: false;
      draft: InterviewNotePrototypeDraft;
    }
  | {
      ok: false;
      skipped: true;
      reason: "invalid_input" | "real_data_blocked";
      errors?: string[];
    };

export type AiInterviewNotesStatus = {
  featureFlags: typeof interviewNoteFeatureFlags;
  interviewNotesEnabled: boolean;
  scorecardNotesEnabled: boolean;
  databaseStatus: OperationsBackendStatus;
  dataModelStaged: boolean;
  privateMockUiStaged: boolean;
  providerConfigured: boolean;
  canUseFakeDataPrototype: boolean;
  canProcessRealInterviews: boolean;
  canApproveForProfileUse: boolean;
  status: "staged";
  message: string;
};

function databaseStatusFor(env: Env): OperationsBackendStatus {
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

function sourceText(input: InterviewNoteDraftInput) {
  return input.sourceType === "fake_transcript"
    ? input.transcriptText || fakeInterviewTranscriptExample
    : input.manualNotes || "";
}

function firstSentence(value: string) {
  return value.replace(/\s+/g, " ").trim().split(/[.!?]/)[0]?.trim() || value;
}

export function parseInterviewNoteDraftInput(input: unknown) {
  return interviewNoteDraftSchema.safeParse(input);
}

export function getAiInterviewNotesStatus(
  env: Env = process.env,
): AiInterviewNotesStatus {
  const interviewNotesEnabled = isRecruiterLabsAiFeatureEnabled(
    "FEATURE_AI_INTERVIEW_NOTES",
    env,
  );
  const scorecardNotesEnabled = isRecruiterLabsAiFeatureEnabled(
    "FEATURE_AI_SCORECARD_NOTES",
    env,
  );

  return {
    featureFlags: interviewNoteFeatureFlags,
    interviewNotesEnabled,
    scorecardNotesEnabled,
    databaseStatus: databaseStatusFor(env),
    dataModelStaged: true,
    privateMockUiStaged: true,
    providerConfigured: false,
    canUseFakeDataPrototype: interviewNotesEnabled && scorecardNotesEnabled,
    canProcessRealInterviews: false,
    canApproveForProfileUse: false,
    status: "staged",
    message:
      "AI interview notes are staged for fake/manual admin testing only. Real recording, transcription, provider calls and profile approval stay blocked.",
  };
}

export function buildInterviewNotePrototypeDraft(
  input: unknown,
): InterviewNotePrototypeResult {
  const parsed = parseInterviewNoteDraftInput(input);

  if (!parsed.success) {
    return {
      ok: false,
      skipped: true,
      reason: "invalid_input",
      errors: parsed.error.errors.map((error) => error.message),
    };
  }

  const data = parsed.data;

  if (data.usesRealCandidateData || data.candidateConsentCaptured) {
    return {
      ok: false,
      skipped: true,
      reason: "real_data_blocked",
    };
  }

  const source = sourceText(data);
  const evidence = firstSentence(source);

  return {
    ok: true,
    skipped: false,
    draft: {
      status: "david_review_required",
      sourceType: data.sourceType,
      summaryDraft:
        "Fake-data interview note draft for David review only. It structures evidence but makes no decision.",
      structuredNotes: interviewScorecardSections.map((section, index) => ({
        sectionId: section.id,
        sectionName: section.label,
        notes:
          index < 3
            ? `${section.prompt} Source evidence still needs David's review.`
            : "Not confirmed in the fake source. David should ask directly.",
        evidence: index < 3 ? evidence : "No evidence captured in this mock.",
        followUpNeeded: index >= 3,
      })),
      followUpQuestions: [
        "What evidence would you want a client to hear directly?",
        "Which part of the brief still needs sharper proof?",
        "What should stay internal rather than going into a client profile?",
      ],
      missingInformationPrompts: [
        "Confirm motivation, availability and salary/rate expectations.",
        "Check the strongest evidence against the role must-haves.",
        "Capture any concern as a question for David, not as a rejection reason.",
      ],
      candidateProfileUpdateSuggestions: [
        "Update profile summary only after David review.",
        "Add relevant experience evidence if it is verified.",
        "Keep watch-outs internal unless David approves client wording.",
      ],
      clientSummaryDraft:
        "Draft client summary placeholder. David must edit and approve before any client view.",
      adminTasks: [
        "Review the structured notes.",
        "Decide whether more follow-up is needed.",
        "Do not approve for profile use until source evidence is checked.",
      ],
      approvedForProfileUse: false,
      humanReviewed: false,
      numericScore: null,
      promptVersion: aiInterviewNotesPromptVersion,
    },
  };
}
