import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { POST } from "../../../app/api/recruiter-labs/brief-diagnostic/route";
import {
  aiBriefDiagnosticManualBlockers,
  buildAiBriefDiagnosticReviewPack,
  getAiBriefDiagnosticStatus,
  parseAiBriefDiagnosticSubmission,
} from "@/lib/ai-brief-diagnostic";

vi.mock("server-only", () => ({}));

const validBriefDiagnostic = {
  hiringFor: "Senior marketing leader for a B2B services business",
  whyNow:
    "The founder needs stronger commercial marketing leadership this quarter.",
  problemToSolve:
    "Marketing is too reactive and sales need a clearer pipeline story.",
  failureImpact:
    "The team will keep wasting senior time and the sales plan will drift.",
  engagementType: "unsure",
  salaryRateBudget: "Competitive",
  locationHybridReality: "Manchester, three days a week in the office",
  mustHaves: [
    "B2B services",
    "Founder-led environments",
    "Commercial marketing",
  ],
  niceToHaves: ["Agency experience"],
  triedHiringAlready: true,
  whatDidNotWork:
    "The last advert brought broad CVs but not enough senior judgement.",
  urgency: "critical",
  contactName: "Client Name",
  contactEmail: "client@example.com",
  contactPhone: "+44 7824 514296",
  companyName: "Example Co",
  privacyNoticeAcknowledgement: true,
  aiDraftAcknowledgement: true,
  marketingConsent: false,
};

describe("AI brief diagnostic", () => {
  it("keeps the diagnostic staged even if the flag and database envs are set", () => {
    const status = getAiBriefDiagnosticStatus({
      FEATURE_AI_BRIEF_BUILDER: "true",
      OPERATIONS_DB_ENABLED: "true",
      DATABASE_URL: "postgres://example",
    });

    expect(status).toMatchObject({
      featureFlagEnabled: true,
      dataModelStaged: true,
      aiProviderConfigured: false,
      aiProviderImplemented: false,
      emailDeliveryImplemented: false,
      clientConfirmationImplemented: false,
      canAcceptSubmissions: false,
      canGenerateAiDrafts: false,
      canEmailDavid: false,
      status: "staged",
    });
    expect(aiBriefDiagnosticManualBlockers.join(" ")).toMatch(/AI provider/i);
  });

  it("validates the full client qualification journey and privacy acknowledgements", () => {
    expect(parseAiBriefDiagnosticSubmission(validBriefDiagnostic).success).toBe(
      true,
    );

    expect(
      parseAiBriefDiagnosticSubmission({
        ...validBriefDiagnostic,
        privacyNoticeAcknowledgement: false,
      }).success,
    ).toBe(false);

    expect(
      parseAiBriefDiagnosticSubmission({
        ...validBriefDiagnostic,
        triedHiringAlready: true,
        whatDidNotWork: "",
      }).success,
    ).toBe(false);
  });

  it("builds a draft-only review pack with no fake market claims or client visibility", () => {
    const result = buildAiBriefDiagnosticReviewPack(validBriefDiagnostic);

    expect(result).toMatchObject({
      ok: true,
      skipped: false,
      reviewPack: {
        status: "draft",
        humanApproved: false,
        clientVisible: false,
        generatedBy: "deterministic_staging_helper",
      },
    });

    if (!result.ok) throw new Error("Expected valid review pack");

    expect(result.gaps.map((gap) => gap.id)).toEqual(
      expect.arrayContaining([
        "unclear-budget",
        "engagement-model-unsure",
        "critical-urgency",
      ]),
    );
    expect(result.reviewPack.formalCommercialBrief).toContain(
      "Senior marketing leader",
    );
    expect(result.reviewPack.suggestedFollowUpQuestions).toEqual(
      expect.arrayContaining([
        "What salary or day-rate range has actually been approved?",
      ]),
    );
    expect(JSON.stringify(result.reviewPack)).not.toMatch(
      /market says|guaranteed|benchmark proves|rank|reject|suitability score/i,
    );
  });

  it("stages private Postgres tables without Sanity, raw prompts, secrets or analytics payloads", () => {
    const migration = readFileSync(
      "database/migrations/022_ai_brief_diagnostic.sql",
      "utf8",
    );

    expect(migration).toContain(
      "recruiter_lab_ai_brief_diagnostic_submissions",
    );
    expect(migration).toContain("recruiter_lab_ai_brief_diagnostic_drafts");
    expect(migration).toContain("client_visibility_blocked_at");
    expect(migration).toContain(
      "human_approved boolean not null default false",
    );
    expect(migration).not.toMatch(
      /sanity|raw_prompt|api_key|access_token|secret|analytics|ga4/i,
    );
  });

  it("keeps the API locked and avoids echoing client PII", async () => {
    const response = await POST(
      new Request("http://localhost/api/recruiter-labs/brief-diagnostic", {
        method: "POST",
        body: JSON.stringify(validBriefDiagnostic),
      }),
    );
    const text = await response.text();

    expect(response.status).toBe(503);
    expect(text).toContain("AI brief diagnostic is staged");
    expect(text).not.toContain(validBriefDiagnostic.contactEmail);
    expect(text).not.toContain(validBriefDiagnostic.contactName);
  });

  it("documents the data boundary, feature flag and launch blockers", () => {
    const docs = readFileSync(
      "docs/recruiter-labs-ai-brief-diagnostic.md",
      "utf8",
    );
    const readme = readFileSync("README.md", "utf8");
    const dataBoundaries = readFileSync("src/lib/data-boundaries.ts", "utf8");

    expect(docs).toContain("FEATURE_AI_BRIEF_BUILDER=false");
    expect(docs).toContain("No automatic publishing");
    expect(docs).toContain("/api/recruiter-labs/brief-diagnostic");
    expect(readme).toContain("docs/recruiter-labs-ai-brief-diagnostic.md");
    expect(dataBoundaries).toContain("briefDiagnosticSubmission");
  });
});
