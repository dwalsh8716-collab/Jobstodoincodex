import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  buildCandidateSummaryDraft,
  candidateSummaryDraftPromptVersion,
  candidateSummaryPromptSafetyRules,
  getCandidateSummaryDraftReadiness,
  saveCandidateSummaryDraft,
  saveCandidateSummaryDraftForShortlistCandidate,
} from "@/lib/recruiter-labs-ai-candidate-summary";
import {
  buildInterviewNotePrototypeDraft,
  fakeInterviewTranscriptExample,
  getAiInterviewNotesStatus,
  interviewNotesManualBlockers,
  interviewScorecardSections,
} from "@/lib/recruiter-labs-ai-interview-notes";
import {
  getRecruiterLabsAiFeatureFlags,
  getRecruiterLabsAiLaunchGate,
  getRecruiterLabsAiOverview,
  isRecruiterLabsAiFeatureEnabled,
  isRecruiterLabsAiUseAllowed,
  recruiterLabsAiBannedUses,
  recruiterLabsAiFlagDefinitions,
} from "@/lib/recruiter-labs-ai";
import { siteConfig } from "@/lib/site";

vi.mock("server-only", () => ({}));

describe("Recruiter Labs AI Ops governance", () => {
  it("keeps AI Ops flags server-side and off by default", () => {
    const flags = getRecruiterLabsAiFeatureFlags({});

    expect(flags).toHaveLength(recruiterLabsAiFlagDefinitions.length);
    expect(flags.every((flag) => flag.scope === "server-only")).toBe(true);
    expect(flags.every((flag) => flag.enabled === false)).toBe(true);
    expect(
      isRecruiterLabsAiFeatureEnabled("FEATURE_AI_OPS_COMPRESSION", {
        FEATURE_AI_OPS_COMPRESSION: "true",
      }),
    ).toBe(true);
  });

  it("allows drafting and note organisation but blocks candidate evaluation", () => {
    expect(
      isRecruiterLabsAiUseAllowed(
        "draft candidate summaries for David to review",
      ),
    ).toBe(true);
    expect(
      isRecruiterLabsAiUseAllowed(
        "organise notes against a human-defined scorecard",
      ),
    ).toBe(true);
    expect(isRecruiterLabsAiUseAllowed("rank candidates")).toBe(false);
    expect(isRecruiterLabsAiUseAllowed("reject candidates")).toBe(false);
    expect(isRecruiterLabsAiUseAllowed("score culture fit")).toBe(false);
  });

  it("keeps real candidate data blocked until governance is approved", () => {
    const overview = getRecruiterLabsAiOverview({});

    expect(overview.safeForSampleDataOnly).toBe(true);
    expect(overview.safeForRealCandidateData).toBe(false);
    expect(overview.stats.blockedGovernanceChecks).toBeGreaterThan(0);
    expect(overview.stats.unresolvedLaunchGateChecks).toBeGreaterThan(0);
    expect(recruiterLabsAiBannedUses).toEqual(
      expect.arrayContaining([
        "rank candidates",
        "reject candidates",
        "make automated employment decisions",
      ]),
    );
  });

  it("keeps the AI launch gate hard for real data and client-facing output", () => {
    const launchGate = getRecruiterLabsAiLaunchGate();

    expect(launchGate.safeForSyntheticAdminTesting).toBe(true);
    expect(launchGate.safeForRealCandidateData).toBe(false);
    expect(launchGate.safeForClientFacingOutput).toBe(false);
    expect(launchGate.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "no-automated-ranking",
          status: "passed",
        }),
        expect.objectContaining({
          id: "provider-documented",
          status: "blocked",
        }),
        expect.objectContaining({
          id: "transcription-consent-wording",
          status: "blocked",
        }),
        expect.objectContaining({
          id: "david-review-workflow",
          status: "manual_review",
        }),
      ]),
    );
  });

  it("keeps the AI Ops route private and out of the sitemap", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    const page = readFileSync(
      "app/admin/recruiter-labs/ai-ops/page.tsx",
      "utf8",
    );

    expect(urls).not.toContain(`${siteConfig.url}/admin/recruiter-labs/ai-ops`);
    expect(page).toContain("isCmsSessionValid");
    expect(page).toContain("index: false");
    expect(page).toContain("No ranking. No rejection. No hidden scoring.");
    expect(page).toContain("Fake data only until every blocker is cleared.");
  });

  it("stages private AI draft metadata without provider secrets or raw prompt fields", () => {
    const migration = readFileSync(
      "database/migrations/008_recruiter_labs_ai_governance.sql",
      "utf8",
    );

    expect(migration).toContain(
      "create table if not exists recruiter_lab_ai_drafts",
    );
    expect(migration).toContain(
      "data_classification text not null default 'sample'",
    );
    expect(migration).toContain("david_reviewed_at timestamptz");
    expect(migration).not.toMatch(/api_key|access_token|secret|raw_prompt/i);
  });

  it("tracks source summaries and prompt versions without storing raw prompts", () => {
    const migration = readFileSync(
      "database/migrations/009_recruiter_labs_ai_launch_gate.sql",
      "utf8",
    );

    expect(migration).toContain("source_data_summary text");
    expect(migration).toContain(
      "prompt_version text not null default 'v0-governance-only'",
    );
    expect(migration).toContain("client_visibility_blocked_at timestamptz");
    expect(migration).not.toMatch(/raw_prompt|api_key|access_token|secret/i);
  });

  it("documents the required AI launch gate controls", () => {
    const doc = readFileSync("docs/recruiter-labs-ai-launch-gate.md", "utf8");

    expect(doc).toContain("# Recruiter Labs AI Launch Gate");
    expect(doc).toContain("## Banned Use Policy");
    expect(doc).toContain("## Launch Gate Checklist");
    expect(doc).toContain("## Vendor Checklist");
    expect(doc).toContain("## Approval Workflow");
    expect(doc).toContain("## Rollback Plan");
    expect(doc).toContain("## Production Blockers");
    expect(doc).toContain(
      "This is technical launch guidance, not legal advice.",
    );
  });

  it("documents the AI Ops roadmap without allowing candidate evaluation", () => {
    const doc = readFileSync("docs/recruiter-labs-ai-ops-roadmap.md", "utf8");
    const readme = readFileSync("README.md", "utf8");
    const governance = readFileSync(
      "docs/recruiter-labs-ai-governance.md",
      "utf8",
    );

    expect(doc).toContain("# Recruiter Labs AI Ops Roadmap");
    expect(doc).toContain("## Phased Plan");
    expect(doc).toContain("## Dependencies");
    expect(doc).toContain("## Risks");
    expect(doc).toContain("## Build Now Vs Later");
    expect(doc).toContain("## Codex Issue Order");
    expect(doc).toContain("## What Not To Build");
    expect(doc).toContain("## Private Beta Checklist");
    expect(doc).toContain(
      "AI should compress operations, not evaluate candidates.",
    );
    expect(doc).toContain("No ranking. No filtering. No faff.");
    expect(doc).toContain("#87");
    expect(doc).toContain("#85");
    expect(doc).not.toMatch(/automatic candidate ranking|AI rejection route/i);
    expect(readme).toContain("docs/recruiter-labs-ai-ops-roadmap.md");
    expect(governance).toContain("docs/recruiter-labs-ai-ops-roadmap.md");
  });

  it("documents AI notetaker vendor discovery without approving a provider", () => {
    const doc = readFileSync(
      "docs/recruiter-labs-ai-vendor-discovery.md",
      "utf8",
    );
    const readme = readFileSync("README.md", "utf8");
    const roadmap = readFileSync(
      "docs/recruiter-labs-ai-ops-roadmap.md",
      "utf8",
    );

    expect(doc).toContain("# Recruiter Labs AI Vendor Discovery");
    expect(doc).toContain("## Comparison Matrix");
    expect(doc).toContain("## Loxo / CRM Questions");
    expect(doc).toContain("## Questions For Any Provider");
    expect(doc).toContain("## Risk Register");
    expect(doc).toContain("## Staged Next Steps");
    expect(doc).toContain("Explore Loxo AI Notetaker first.");
    expect(doc).toContain("Explore Metaview second");
    expect(doc).toContain("No provider has been connected.");
    expect(doc).toContain(
      "Do not build a custom AI notetaker inside the website.",
    );
    expect(doc).toContain(
      "Can automated scoring, ranking or recommendation be disabled?",
    );
    expect(doc).toContain("https://www.loxo.co/ai-agents/ai-notetaker");
    expect(doc).toContain(
      "https://support.metaview.ai/integrations/ats-integrations/loxo",
    );
    expect(doc).not.toMatch(
      /approved vendor|provider is approved|connect accounts/i,
    );
    expect(readme).toContain("docs/recruiter-labs-ai-vendor-discovery.md");
    expect(roadmap).toContain("docs/recruiter-labs-ai-vendor-discovery.md");
  });

  it("stages interview notes as fake/manual evidence without scoring", () => {
    const status = getAiInterviewNotesStatus({
      FEATURE_AI_INTERVIEW_NOTES: "true",
      FEATURE_AI_SCORECARD_NOTES: "true",
      OPERATIONS_DB_ENABLED: "true",
      DATABASE_URL: "postgres://example",
    });
    const draft = buildInterviewNotePrototypeDraft({
      sourceType: "fake_transcript",
      transcriptText: fakeInterviewTranscriptExample,
      usesRealCandidateData: false,
      candidateConsentCaptured: false,
    });
    const blocked = buildInterviewNotePrototypeDraft({
      sourceType: "fake_transcript",
      transcriptText: fakeInterviewTranscriptExample,
      usesRealCandidateData: true,
      candidateConsentCaptured: true,
    });

    expect(status).toMatchObject({
      interviewNotesEnabled: true,
      scorecardNotesEnabled: true,
      dataModelStaged: true,
      privateMockUiStaged: true,
      providerConfigured: false,
      canUseFakeDataPrototype: true,
      canProcessRealInterviews: false,
      canApproveForProfileUse: false,
    });
    expect(interviewScorecardSections).toHaveLength(12);
    expect(interviewNotesManualBlockers.join(" ")).toMatch(/consent/i);
    expect(draft).toMatchObject({
      ok: true,
      skipped: false,
      draft: {
        status: "david_review_required",
        approvedForProfileUse: false,
        humanReviewed: false,
        numericScore: null,
      },
    });
    if (!draft.ok) throw new Error("Expected interview note draft");
    expect(draft.draft.structuredNotes).toHaveLength(
      interviewScorecardSections.length,
    );
    expect(JSON.stringify(draft.draft)).not.toMatch(
      /pass\/fail|ranking|suitability score|culture-fit score|rejection recommendation/i,
    );
    expect(blocked).toMatchObject({
      ok: false,
      reason: "real_data_blocked",
    });
  });

  it("documents and gates the private interview note prototype", () => {
    const doc = readFileSync(
      "docs/recruiter-labs-ai-interview-notes.md",
      "utf8",
    );
    const page = readFileSync(
      "app/admin/recruiter-labs/ai-ops/page.tsx",
      "utf8",
    );
    const migration = readFileSync(
      "database/migrations/024_ai_interview_notes.sql",
      "utf8",
    );
    const readme = readFileSync("README.md", "utf8");
    const dataBoundaries = readFileSync("docs/data-boundaries.md", "utf8");

    expect(doc).toContain("# Recruiter Labs AI Interview Notes");
    expect(doc).toContain("No hidden recording. No secret transcription.");
    expect(doc).toContain("Scorecards here mean structured notes.");
    expect(doc).toContain("docs/recruiter-labs-ai-vendor-discovery.md");
    expect(page).toContain("isCmsSessionValid");
    expect(page).toContain("Fake interview only. No recording. No scoring.");
    expect(page).toContain("Evidence note only. No numeric score.");
    expect(migration).toContain(
      "create table if not exists recruiter_lab_interview_notes",
    );
    expect(migration).toContain(
      "create table if not exists recruiter_lab_interview_scorecard_sections",
    );
    expect(migration).toContain(
      "source_type in ('manual_notes', 'fake_transcript')",
    );
    expect(migration).toContain("approval_event_id uuid references audit_logs");
    expect(migration).not.toMatch(
      /numeric_score|ranking_score|suitability_score|rejection_recommendation/i,
    );
    expect(readme).toContain("docs/recruiter-labs-ai-interview-notes.md");
    expect(dataBoundaries).toContain("AI interview notes");
  });

  it("builds candidate summary drafts as unapproved, client-hidden drafts only", () => {
    const result = buildCandidateSummaryDraft({
      sourceDataApproved: true,
      candidateSharingConsentConfirmed: true,
      candidateName: "Candidate Name",
      currentTitle: "Marketing Director",
      currentCompany: "Example Co",
      desiredRole: "Senior marketing leadership brief",
      seniority: "Senior leadership",
      sectorExperience: "B2B services and agency-side growth",
      location: "Manchester",
      workPreference: "Hybrid",
      noticePeriod: "One month",
      evidenceNotes:
        "Has led integrated teams and worked closely with founders.",
      roleContext: "a retained leadership search",
    });

    expect(result).toMatchObject({
      ok: true,
      skipped: false,
      draft: {
        humanApproved: false,
        approvedBy: null,
        approvedAt: null,
        aiGenerationEventId: null,
        status: "draft",
        promptVersion: candidateSummaryDraftPromptVersion,
        clientVisible: false,
      },
    });
    expect(result.draft?.draftSummary.split("\n")).toHaveLength(3);
    expect(result.draft?.draftStrengths).toHaveLength(3);
    expect(result.draft?.draftWatchouts).toHaveLength(3);
    expect(result.draft?.draftRelevantExperience).toHaveLength(3);
    expect(result.draft?.draftRoleFitNotes).toHaveLength(3);
    expect(result.draft?.draftClientInterviewQuestions).toHaveLength(3);
    expect(result.draft?.draftInterviewPrepNotes).toHaveLength(3);
    expect(result.draft?.davidRationale).toContain("Draft only");
    expect(JSON.stringify(result.draft)).not.toMatch(
      /rank|ranking|reject|suitability score|culture fit score/i,
    );
  });

  it("keeps candidate summary prompt safety rules explicit", () => {
    expect(candidateSummaryPromptSafetyRules).toEqual(
      expect.arrayContaining([
        "Only use evidence supplied in the approved source fields.",
        "Do not invent facts, achievements, employers, figures or motivations.",
        "Do not score, rank, reject or recommend a candidate automatically.",
      ]),
    );
  });

  it("blocks candidate summary drafts without approved source data and consent", () => {
    expect(
      buildCandidateSummaryDraft({
        sourceDataApproved: false,
        candidateSharingConsentConfirmed: true,
      }),
    ).toMatchObject({
      ok: false,
      reason: "source_data_not_approved",
    });

    expect(
      buildCandidateSummaryDraft({
        sourceDataApproved: true,
        candidateSharingConsentConfirmed: false,
      }),
    ).toMatchObject({
      ok: false,
      reason: "candidate_consent_missing",
    });

    expect(
      buildCandidateSummaryDraft({
        sourceDataApproved: true,
        candidateSharingConsentConfirmed: true,
        evidenceNotes: "Includes age and health condition notes.",
      }),
    ).toMatchObject({
      ok: false,
      reason: "unsafe_source_data",
    });
  });

  it("keeps candidate summary saving feature-flagged and database-gated", async () => {
    expect(getCandidateSummaryDraftReadiness({})).toMatchObject({
      featureEnabled: false,
      databaseStatus: { state: "disabled" },
      safeForSyntheticAdminTesting: false,
      safeForRealCandidateData: false,
      safeForClientFacingOutput: false,
    });

    expect(
      getCandidateSummaryDraftReadiness({
        FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({
      featureEnabled: true,
      databaseStatus: { state: "ready" },
      safeForSyntheticAdminTesting: true,
      safeForRealCandidateData: false,
      safeForClientFacingOutput: false,
    });

    await expect(saveCandidateSummaryDraft({})).resolves.toMatchObject({
      ok: true,
      skipped: true,
      reason: "feature_disabled",
    });

    await expect(
      saveCandidateSummaryDraftForShortlistCandidate(
        "11111111-1111-4111-8111-111111111111",
      ),
    ).resolves.toMatchObject({
      ok: true,
      skipped: true,
      reason: "feature_disabled",
    });
  });

  it("stages exact candidate summary draft fields without scoring", () => {
    const migration = readFileSync(
      "database/migrations/016_candidate_summary_drafts.sql",
      "utf8",
    );

    expect(migration).toContain("draft_summary text");
    expect(migration).toContain("draft_strengths jsonb");
    expect(migration).toContain("draft_watchouts jsonb");
    expect(migration).toContain("human_approved boolean");
    expect(migration).toContain("approved_by uuid");
    expect(migration).toContain("approved_at timestamptz");
    expect(migration).toContain("ai_generation_event_id uuid");
    expect(migration).toContain("metadata->>'suitabilityScore' is null");
    expect(migration).not.toMatch(/ranking_score|rejection_recommendation/i);

    const reviewMigration = readFileSync(
      "database/migrations/023_candidate_summary_review_versions.sql",
      "utf8",
    );

    expect(reviewMigration).toContain("draft_relevant_experience jsonb");
    expect(reviewMigration).toContain("draft_role_fit_notes jsonb");
    expect(reviewMigration).toContain("draft_client_interview_questions jsonb");
    expect(reviewMigration).toContain("draft_interview_prep_notes jsonb");
    expect(reviewMigration).toContain("david_edited_summary text");
    expect(reviewMigration).toContain(
      "create table if not exists recruiter_lab_candidate_profile_versions",
    );
    expect(reviewMigration).toContain("approved_for_client");
    expect(reviewMigration).toContain("client_visible_at is null");
    expect(reviewMigration).not.toMatch(
      /ranking_score|suitability_score|rejection_recommendation/i,
    );
  });

  it("loads candidate summary trigger data from approved shortlist sources only", () => {
    const helper = readFileSync(
      "src/lib/recruiter-labs-ai-candidate-summary.ts",
      "utf8",
    );

    expect(helper).toContain("saveCandidateSummaryDraftForShortlistCandidate");
    expect(helper).toContain("candidate_sharing_consent_at is not null");
    expect(helper).not.toContain("c.name,\n            c.name");
    expect(helper).toContain("profile_status in ('david_review', 'approved')");
    expect(helper).toContain("candidate_status = 'shortlisted'");
    expect(helper).toContain(
      "application_status in ('shortlisted', 'submitted')",
    );
    expect(helper).toContain("saveCandidateSummaryDraft(result.source, env)");
  });
});
