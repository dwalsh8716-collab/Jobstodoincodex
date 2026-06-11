import "server-only";

import { logAuditEvent } from "@/lib/operations/audit";
import {
  getOperationsBackendStatus,
  runPsqlJson,
} from "@/lib/operations/database";
import {
  getRecruiterLabsAiLaunchGate,
  isRecruiterLabsAiFeatureEnabled,
} from "@/lib/recruiter-labs-ai";

type Env = Record<string, string | undefined>;

export const candidateSummaryDraftPromptVersion = "candidate-summary-draft-v1";

export const candidateSummaryPromptSafetyRules = [
  "Only use evidence supplied in the approved source fields.",
  "Do not invent facts, achievements, employers, figures or motivations.",
  "Keep uncertainty visible where the source is thin.",
  "Do not mention or infer protected characteristics.",
  "Do not score, rank, reject or recommend a candidate automatically.",
  "Write in David's plain English tone, without hype or generic recruiter fluff.",
] as const;

export type CandidateSummaryDraftSource = {
  shortlistCandidateId?: string;
  candidateName?: string;
  currentTitle?: string;
  currentCompany?: string;
  desiredRole?: string;
  seniority?: string;
  sectorExperience?: string;
  location?: string;
  workPreference?: string;
  noticePeriod?: string;
  salaryExpectation?: string;
  roleContext?: string;
  evidenceNotes?: string;
  davidNotes?: string;
  sourceDataApproved?: boolean;
  candidateSharingConsentConfirmed?: boolean;
  dataClassification?: "sample" | "redacted" | "private";
};

export type CandidateSummaryDraft = {
  draftSummary: string;
  draftStrengths: string[];
  draftWatchouts: string[];
  draftRelevantExperience: string[];
  draftRoleFitNotes: string[];
  draftClientInterviewQuestions: string[];
  draftInterviewPrepNotes: string[];
  davidRationale: string;
  uncertaintyNotes: string[];
  humanApproved: false;
  approvedBy: null;
  approvedAt: null;
  aiGenerationEventId: null;
  status: "draft";
  promptVersion: typeof candidateSummaryDraftPromptVersion;
  clientVisible: false;
};

export type CandidateSummaryDraftResult = {
  ok: boolean;
  skipped: boolean;
  reason?:
    | "feature_disabled"
    | "shortlist_candidate_not_found"
    | "source_data_not_approved"
    | "candidate_consent_missing"
    | "unsafe_source_data"
    | "database_unavailable"
    | "database_write_failed"
    | "audit_log_failed";
  draft?: CandidateSummaryDraft;
  id?: string;
};

type CandidateSummarySourceQueryResult = {
  source: CandidateSummaryDraftSource | null;
};

const unsafeSourcePattern =
  /\b(age|ethnicity|religion|pregnan|disab|health condition|marital|sexual orientation|race|nationality)\b/i;
const bannedOutputPattern =
  /\b(rank|ranking|reject|rejection|suitability score|score:|culture fit score|personality score|automated decision)\b/i;

function clean(value?: string, fallback = "Not confirmed") {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, 220) : fallback;
}

function available(value?: string) {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  return cleaned || undefined;
}

function sourceText(source: CandidateSummaryDraftSource) {
  return [
    source.candidateName,
    source.currentTitle,
    source.currentCompany,
    source.desiredRole,
    source.seniority,
    source.sectorExperience,
    source.location,
    source.workPreference,
    source.noticePeriod,
    source.salaryExpectation,
    source.roleContext,
    source.evidenceNotes,
    source.davidNotes,
  ]
    .filter(Boolean)
    .join(" ");
}

function sourceDataSummary(source: CandidateSummaryDraftSource) {
  return [
    available(source.currentTitle) ? "current title" : undefined,
    available(source.currentCompany) ? "current company" : undefined,
    available(source.seniority) ? "seniority" : undefined,
    available(source.sectorExperience) ? "sector experience" : undefined,
    available(source.roleContext) ? "role context" : undefined,
    available(source.evidenceNotes) || available(source.davidNotes)
      ? "evidence notes"
      : undefined,
  ]
    .filter(Boolean)
    .join(", ");
}

function validateDraft(draft: CandidateSummaryDraft) {
  const text = [
    draft.draftSummary,
    ...draft.draftStrengths,
    ...draft.draftWatchouts,
    ...draft.draftRelevantExperience,
    ...draft.draftRoleFitNotes,
    ...draft.draftClientInterviewQuestions,
    ...draft.draftInterviewPrepNotes,
    draft.davidRationale,
    ...draft.uncertaintyNotes,
  ].join(" ");

  return (
    draft.draftSummary.split("\n").filter(Boolean).length === 3 &&
    draft.humanApproved === false &&
    draft.clientVisible === false &&
    !bannedOutputPattern.test(text)
  );
}

export function getCandidateSummaryDraftReadiness(env: Env = process.env) {
  const featureEnabled = isRecruiterLabsAiFeatureEnabled(
    "FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS",
    env,
  );
  const databaseStatus =
    env === process.env
      ? getOperationsBackendStatus()
      : {
          enabled: env.OPERATIONS_DB_ENABLED === "true",
          configured: Boolean(env.DATABASE_URL),
          state:
            env.OPERATIONS_DB_ENABLED !== "true"
              ? "disabled"
              : env.DATABASE_URL
                ? "ready"
                : "missing_database_url",
          message: env.DATABASE_URL
            ? "Private operations database is configured."
            : "Private operations database is not ready.",
        };
  const launchGate = getRecruiterLabsAiLaunchGate();

  return {
    featureEnabled,
    databaseStatus,
    launchGate,
    safeForSyntheticAdminTesting:
      featureEnabled && launchGate.safeForSyntheticAdminTesting,
    safeForRealCandidateData: false,
    safeForClientFacingOutput: false,
  };
}

export function buildCandidateSummaryDraft(
  source: CandidateSummaryDraftSource,
): CandidateSummaryDraftResult {
  if (source.sourceDataApproved !== true) {
    return {
      ok: false,
      skipped: true,
      reason: "source_data_not_approved",
    };
  }

  if (source.candidateSharingConsentConfirmed !== true) {
    return {
      ok: false,
      skipped: true,
      reason: "candidate_consent_missing",
    };
  }

  if (unsafeSourcePattern.test(sourceText(source))) {
    return {
      ok: false,
      skipped: true,
      reason: "unsafe_source_data",
    };
  }

  const name = clean(source.candidateName, "The candidate");
  const currentRole = [
    available(source.currentTitle),
    available(source.currentCompany)
      ? `at ${source.currentCompany}`
      : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  const roleContext = clean(
    source.roleContext || source.desiredRole,
    "the brief",
  );
  const evidence = clean(
    source.evidenceNotes || source.davidNotes,
    "David needs to verify the evidence before this is client-facing.",
  );

  const draft: CandidateSummaryDraft = {
    draftSummary: [
      `- ${name} is being drafted for ${roleContext}; David must check the fit before this goes near a client.`,
      `- Current context: ${clean(currentRole, "role details still need confirming")}.`,
      `- Evidence to check: ${evidence}`,
    ].join("\n"),
    draftStrengths: [
      `Source says ${clean(source.seniority || source.currentTitle, "the level still needs confirming")}.`,
      `Relevant area to verify: ${clean(source.sectorExperience || source.desiredRole, "sector or role evidence still needs adding")}.`,
      `Practical details to confirm: ${clean(
        [source.location, source.workPreference, source.noticePeriod]
          .filter(Boolean)
          .join(", "),
        "location, working pattern and timing need checking",
      )}.`,
    ],
    draftWatchouts: [
      "Check every claim against source notes before client use.",
      "Confirm motivation, salary/rate expectations and timing with the candidate.",
      "Keep uncertainty visible where the source data is thin.",
    ],
    draftRelevantExperience: [
      `Relevant source evidence: ${clean(source.sectorExperience || source.evidenceNotes, "experience evidence still needs confirming")}.`,
      `Current or recent context: ${clean(currentRole, "current role context still needs confirming")}.`,
      `Role evidence to verify: ${clean(source.desiredRole || source.roleContext, "the target role evidence still needs checking")}.`,
    ],
    draftRoleFitNotes: [
      `Brief context to check: ${roleContext}.`,
      `Practical fit to confirm: ${clean(
        [source.location, source.workPreference, source.noticePeriod]
          .filter(Boolean)
          .join(", "),
        "location, working pattern and timing need checking",
      )}.`,
      "Do not treat this as a recommendation until David has checked the source notes.",
    ],
    draftClientInterviewQuestions: [
      "What would make the first 90 days a success in this role?",
      "Which part of the brief best matches your recent evidence?",
      "Where would you want more context before deciding if this is right?",
    ],
    draftInterviewPrepNotes: [
      "Check motivation against the role brief before client use.",
      "Confirm salary or rate expectations before any client-facing summary.",
      "Keep any uncertainty visible rather than smoothing it away.",
    ],
    davidRationale:
      "Draft only: David should verify why this person is worth considering before any client view.",
    uncertaintyNotes: [
      "AI-assisted draft only.",
      "This is an admin note only, not a people decision.",
      "David approval is required before client visibility.",
    ],
    humanApproved: false,
    approvedBy: null,
    approvedAt: null,
    aiGenerationEventId: null,
    status: "draft",
    promptVersion: candidateSummaryDraftPromptVersion,
    clientVisible: false,
  };

  if (!validateDraft(draft)) {
    return {
      ok: false,
      skipped: true,
      reason: "unsafe_source_data",
    };
  }

  return { ok: true, skipped: false, draft };
}

export async function saveCandidateSummaryDraft(
  source: CandidateSummaryDraftSource,
  env: Env = process.env,
): Promise<CandidateSummaryDraftResult> {
  if (
    !isRecruiterLabsAiFeatureEnabled("FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS", env)
  ) {
    return { ok: true, skipped: true, reason: "feature_disabled" };
  }

  const databaseStatus = getOperationsBackendStatus();
  if (!databaseStatus.enabled || !databaseStatus.configured) {
    return { ok: false, skipped: true, reason: "database_unavailable" };
  }

  const draftResult = buildCandidateSummaryDraft(source);
  if (!draftResult.ok || !draftResult.draft) return draftResult;

  try {
    const created = await runPsqlJson<{ id: string }>(
      `
        with payload as (
          select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
        ),
        created as (
          insert into recruiter_lab_ai_drafts (
            related_entity_type,
            related_entity_id,
            shortlist_candidate_id,
            draft_type,
            status,
            data_classification,
            prompt_version,
            source_data_summary,
            draft_summary,
            draft_strengths,
            draft_watchouts,
            draft_relevant_experience,
            draft_role_fit_notes,
            draft_client_interview_questions,
            draft_interview_prep_notes,
            david_rationale,
            human_approved,
            approved_by,
            approved_at,
            uncertainty_notes,
            client_visibility_blocked_at,
            client_visibility_blocked_reason,
            metadata
          )
          select
            'recruiter_labs_shortlist_candidate',
            nullif(data->>'shortlistCandidateId', '')::uuid,
            nullif(data->>'shortlistCandidateId', '')::uuid,
            'candidate_summary',
            'draft',
            coalesce(nullif(data->>'dataClassification', ''), 'sample'),
            data->>'promptVersion',
            data->>'sourceDataSummary',
            data->>'draftSummary',
            coalesce(data->'draftStrengths', '[]'::jsonb),
            coalesce(data->'draftWatchouts', '[]'::jsonb),
            coalesce(data->'draftRelevantExperience', '[]'::jsonb),
            coalesce(data->'draftRoleFitNotes', '[]'::jsonb),
            coalesce(data->'draftClientInterviewQuestions', '[]'::jsonb),
            coalesce(data->'draftInterviewPrepNotes', '[]'::jsonb),
            data->>'davidRationale',
            false,
            null,
            null,
            coalesce(data->'uncertaintyNotes', '[]'::jsonb),
            now(),
            'David approval required before client visibility.',
            jsonb_build_object(
              'source', 'candidate_summary_draft_helper',
              'sourceDataApproved', true,
              'candidateSharingConsentConfirmed', true,
              'noRanking', true,
              'noSuitabilityScore', true,
              'clientVisible', false,
              'promptSafetyRules', coalesce(data->'promptSafetyRules', '[]'::jsonb)
            )
          from payload
          returning id
        )
        select json_build_object('id', id)::text from created;
      `,
      {
        shortlistCandidateId: source.shortlistCandidateId,
        dataClassification: source.dataClassification || "sample",
        promptVersion: draftResult.draft.promptVersion,
        sourceDataSummary: sourceDataSummary(source),
        draftSummary: draftResult.draft.draftSummary,
        draftStrengths: draftResult.draft.draftStrengths,
        draftWatchouts: draftResult.draft.draftWatchouts,
        draftRelevantExperience: draftResult.draft.draftRelevantExperience,
        draftRoleFitNotes: draftResult.draft.draftRoleFitNotes,
        draftClientInterviewQuestions:
          draftResult.draft.draftClientInterviewQuestions,
        draftInterviewPrepNotes: draftResult.draft.draftInterviewPrepNotes,
        davidRationale: draftResult.draft.davidRationale,
        uncertaintyNotes: draftResult.draft.uncertaintyNotes,
        promptSafetyRules: candidateSummaryPromptSafetyRules,
      },
    );

    const audit = await logAuditEvent(
      {
        action: "recruiter_labs_ai_draft_created",
        entityType: "recruiter_labs_ai_draft",
        entityId: created.id,
        metadata: {
          draftType: "candidate_summary",
          promptVersion: candidateSummaryDraftPromptVersion,
          humanApproved: false,
          clientVisible: false,
        },
      },
      { required: true },
    );

    if (!audit.ok || !audit.id) {
      return { ok: false, skipped: true, reason: "audit_log_failed" };
    }

    await runPsqlJson<{ id: string }>(
      `
        with payload as (
          select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
        ),
        updated as (
          update recruiter_lab_ai_drafts
          set
            ai_generation_event_id = (select (data->>'auditId')::uuid from payload),
            updated_at = now()
          where id = (select (data->>'draftId')::uuid from payload)
          returning id
        )
        select json_build_object('id', id)::text from updated;
      `,
      { draftId: created.id, auditId: audit.id },
    );

    return {
      ok: true,
      skipped: false,
      id: created.id,
      draft: draftResult.draft,
    };
  } catch {
    return { ok: false, skipped: true, reason: "database_write_failed" };
  }
}

export async function saveCandidateSummaryDraftForShortlistCandidate(
  shortlistCandidateId: string,
  env: Env = process.env,
): Promise<CandidateSummaryDraftResult> {
  if (
    !isRecruiterLabsAiFeatureEnabled("FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS", env)
  ) {
    return { ok: true, skipped: true, reason: "feature_disabled" };
  }

  const databaseStatus = getOperationsBackendStatus();
  if (!databaseStatus.enabled || !databaseStatus.configured) {
    return { ok: false, skipped: true, reason: "database_unavailable" };
  }

  try {
    const result = await runPsqlJson<CandidateSummarySourceQueryResult>(
      `
        with payload as (
          select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
        ),
        matched as (
          select
            sc.id,
            sc.profile_status,
            sc.evidence_notes,
            sc.david_summary,
            sc.consent_confirmed,
            sc.candidate_sharing_consent_at,
            sc.candidate_profile_snapshot,
            s.title as shortlist_title,
            s.metadata as shortlist_metadata,
            c.name,
            c.current_title,
            c.current_company,
            c.desired_role,
            c.salary_expectation,
            c.notice_period,
            c.work_preference,
            c.sector_experience,
            c.seniority,
            c.location,
            c.status as candidate_status,
            a.status as application_status
          from recruiter_lab_shortlist_candidates sc
          join recruiter_lab_shortlists s on s.id = sc.shortlist_id
          left join candidates c on c.id = sc.candidate_id
          left join applications a on a.id = sc.application_id
          where sc.id = ((select data->>'shortlistCandidateId' from payload))::uuid
          limit 1
        )
        select jsonb_build_object(
          'source',
          (
            select jsonb_build_object(
              'shortlistCandidateId', id::text,
              'candidateName', coalesce(nullif(candidate_profile_snapshot->>'name', ''), name),
              'currentTitle', coalesce(nullif(candidate_profile_snapshot->>'headline', ''), current_title),
              'currentCompany', current_company,
              'desiredRole', coalesce(nullif(candidate_profile_snapshot->>'desiredRole', ''), desired_role),
              'seniority', coalesce(nullif(candidate_profile_snapshot->>'seniority', ''), seniority),
              'sectorExperience', coalesce(nullif(candidate_profile_snapshot->>'sectorExperience', ''), sector_experience),
              'location', coalesce(nullif(candidate_profile_snapshot->>'location', ''), location),
              'workPreference', coalesce(nullif(candidate_profile_snapshot->>'workPreference', ''), work_preference),
              'noticePeriod', coalesce(nullif(candidate_profile_snapshot->>'availability', ''), notice_period),
              'salaryExpectation', coalesce(nullif(candidate_profile_snapshot->>'packageExpectation', ''), salary_expectation),
              'roleContext', coalesce(nullif(shortlist_metadata->>'roleContext', ''), shortlist_title),
              'evidenceNotes', evidence_notes,
              'davidNotes', david_summary,
              'sourceDataApproved',
                (
                  profile_status in ('david_review', 'approved')
                  or candidate_status = 'shortlisted'
                  or application_status in ('shortlisted', 'submitted')
                ),
              'candidateSharingConsentConfirmed',
                (consent_confirmed = true and candidate_sharing_consent_at is not null),
              'dataClassification', 'private'
            )
            from matched
          )
        )::text;
      `,
      { shortlistCandidateId },
    );

    if (!result.source) {
      return {
        ok: false,
        skipped: true,
        reason: "shortlist_candidate_not_found",
      };
    }

    return saveCandidateSummaryDraft(result.source, env);
  } catch {
    return { ok: false, skipped: true, reason: "database_write_failed" };
  }
}
