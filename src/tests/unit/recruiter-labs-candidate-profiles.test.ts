import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  buildManualCandidateProfileDraft,
  getCandidateProfileBuilderReadiness,
  getCandidateProfileShareDecision,
  recruiterLabsCandidateProfileFeatureFlags,
} from "@/lib/recruiter-labs-candidate-profiles";

vi.mock("server-only", () => ({}));

describe("Recruiter Labs candidate profile builder", () => {
  it("keeps candidate profile flags explicit and blocked by default", () => {
    expect(recruiterLabsCandidateProfileFeatureFlags).toEqual([
      "FEATURE_BRANDED_CANDIDATE_PROFILES",
      "FEATURE_AI_CANDIDATE_SUMMARIES",
      "FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS",
      "FEATURE_CV_ANONYMIZATION",
    ]);

    expect(getCandidateProfileBuilderReadiness({})).toMatchObject({
      brandedProfilesEnabled: false,
      aiSummariesEnabled: false,
      cvAnonymizationEnabled: false,
      readyForManualProfiles: false,
      readyForAiDrafts: false,
      readyForCvExtraction: false,
      safeForClientSharing: false,
    });
  });

  it("allows manual profile readiness without approving AI or CV extraction", () => {
    const readiness = getCandidateProfileBuilderReadiness({
      FEATURE_BRANDED_CANDIDATE_PROFILES: "true",
      FEATURE_AI_CANDIDATE_SUMMARIES: "true",
      FEATURE_CV_ANONYMIZATION: "true",
      OPERATIONS_DB_ENABLED: "true",
      DATABASE_URL: "postgres://example",
    });

    expect(readiness.readyForManualProfiles).toBe(true);
    expect(readiness.aiSummariesEnabled).toBe(true);
    expect(readiness.cvAnonymizationEnabled).toBe(true);
    expect(readiness.readyForAiDrafts).toBe(false);
    expect(readiness.readyForCvExtraction).toBe(false);
    expect(readiness.safeForClientSharing).toBe(false);
  });

  it("builds bounded manual drafts as unapproved human-review profiles", () => {
    const draft = buildManualCandidateProfileDraft({
      displayName: " Candidate Name ",
      currentTitle: "Marketing Director",
      sectorExperience: ["B2B SaaS", "Financial services", ""],
      functionalStrengths: ["Brand", "Demand generation"],
      commercialImpact: ["Grew pipeline contribution"],
      strengths: ["Calm operator"],
      watchouts: ["Needs clear brief"],
      relevantExperience: ["Scaled a senior marketing team"],
      aiDraftUsed: true,
    });

    expect(draft).toMatchObject({
      profileStatus: "david_review_required",
      displayName: "Candidate Name",
      anonymisedLabel: "Anonymised candidate",
      currentTitle: "Marketing Director",
      aiDraftUsed: true,
      aiDraftLabel: "AI-assisted draft. David review required.",
      approvedForClientUse: false,
      humanReviewRequired: true,
    });
    expect(draft.sectorExperience).toEqual(["B2B SaaS", "Financial services"]);
    expect(draft.functionalStrengths).toEqual(["Brand", "Demand generation"]);
  });

  it("blocks client sharing until approval, consent, AI review and retention are clear", () => {
    expect(
      getCandidateProfileShareDecision({
        profileStatus: "david_review_required",
        approvedForClientUse: false,
        aiDraftUsed: true,
        retentionStatus: "pending_review",
      }),
    ).toMatchObject({
      canShare: false,
      reasons: expect.arrayContaining([
        "Profile is not approved for client use.",
        "David approval is missing.",
        "Candidate consent check is missing.",
        "AI draft has not been reviewed by David.",
        "Retention status blocks sharing.",
      ]),
    });

    expect(
      getCandidateProfileShareDecision({
        profileStatus: "approved_for_client",
        approvedForClientUse: true,
        approvedAt: "2026-06-11T09:00:00.000Z",
        consentCheckedAt: "2026-06-11T09:05:00.000Z",
        aiDraftUsed: true,
        aiDraftReviewedAt: "2026-06-11T09:10:00.000Z",
        retentionStatus: "active",
      }),
    ).toMatchObject({ canShare: true, reasons: [] });
  });

  it("stages the private profile builder data model without public URLs or scores", () => {
    const migration = readFileSync(
      "database/migrations/031_recruiter_labs_candidate_profile_builder.sql",
      "utf8",
    );

    expect(migration).toContain("recruiter_lab_candidate_profiles");
    expect(migration).toContain("display_name");
    expect(migration).toContain("anonymised_label");
    expect(migration).toContain("functional_strengths");
    expect(migration).toContain("commercial_impact");
    expect(migration).toContain("approved_for_client_use");
    expect(migration).toContain("consent_checked_at");
    expect(migration).toContain(
      "recruiter_lab_candidate_profile_generation_events",
    );
    expect(migration).toContain("candidate_profile_id");
    expect(migration).not.toMatch(/public_url|suitability_score|candidate_score|ranking/i);
  });

  it("documents the profile builder, CV approach, AI rules and blockers", () => {
    const doc = readFileSync(
      "docs/recruiter-labs-candidate-profiles.md",
      "utf8",
    );
    const readme = readFileSync("README.md", "utf8");
    const featureFlags = readFileSync("docs/feature-flags.md", "utf8");

    expect(doc).toContain("# Recruiter Labs Candidate Profiles");
    expect(doc).toContain("## CV Extraction Approach");
    expect(doc).toContain("## AI Approach");
    expect(doc).toContain("## Human Review Workflow");
    expect(doc).toContain("## Admin UI");
    expect(doc).toContain("No public candidate data.");
    expect(doc).toContain("AI assists.");
    expect(doc).toContain("David verifies.");
    expect(readme).toContain("docs/recruiter-labs-candidate-profiles.md");
    expect(featureFlags).toContain("FEATURE_BRANDED_CANDIDATE_PROFILES");
  });
});
