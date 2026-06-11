import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  createCvAnonymizationDraft,
  createDraftAnonymizedText,
  getCvAnonymizationGate,
} from "@/lib/cv-anonymization";
import {
  getRecruiterLabsAiFeatureFlags,
  isRecruiterLabsAiFeatureEnabled,
} from "@/lib/recruiter-labs-ai";

vi.mock("server-only", () => ({}));

describe("CV anonymization staging", () => {
  it("keeps CV anonymization feature-flagged off by default", () => {
    const gate = getCvAnonymizationGate(
      {},
      {
        enabled: false,
        configured: false,
        state: "disabled",
        message: "disabled",
      },
    );

    expect(gate).toMatchObject({
      featureFlagEnabled: false,
      recruiterLabsEnabled: false,
      databaseReady: false,
      canCreateDraft: false,
      safeForRealCvFiles: false,
      safeForClientUse: false,
    });
    expect(
      isRecruiterLabsAiFeatureEnabled("FEATURE_CV_ANONYMIZATION", {
        FEATURE_CV_ANONYMIZATION: "true",
      }),
    ).toBe(true);
    expect(getRecruiterLabsAiFeatureFlags({})).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "FEATURE_CV_ANONYMIZATION",
          enabled: false,
          scope: "server-only",
        }),
      ]),
    );
  });

  it("redacts obvious direct identifiers without rewriting the substance", () => {
    const draft = createDraftAnonymizedText({
      candidateName: "Alex Morgan",
      extractedText: `
Alex Morgan
Senior Marketing Manager
alex@example.com
+44 7824 514296
https://www.linkedin.com/in/alex-morgan
https://alexmorgan.example
Manchester M1 1AA
2019-2023 Acme Agency - led B2B demand generation and managed a team of four.
References: Jane Smith, CEO.
      `,
    });

    expect(draft.anonymizedText).toContain("[name redacted]");
    expect(draft.anonymizedText).toContain("[email redacted]");
    expect(draft.anonymizedText).toContain("[phone redacted]");
    expect(draft.anonymizedText).toContain("[LinkedIn URL redacted]");
    expect(draft.anonymizedText).toContain("[website redacted]");
    expect(draft.anonymizedText).toContain("[address line redacted]");
    expect(draft.anonymizedText).toContain("[references redacted]");
    expect(draft.anonymizedText).toContain("2019-2023");
    expect(draft.anonymizedText).toContain(
      "led B2B demand generation and managed a team of four",
    );
    expect(draft.anonymizedText).toContain("Acme Agency");
    expect(draft.removedItems).toEqual(
      expect.arrayContaining(["name", "email", "phone", "LinkedIn URL"]),
    );
  });

  it("redacts employer names only when anonymised employer mode is selected", () => {
    const preserved = createDraftAnonymizedText({
      extractedText: "2020-2024 Acme Agency - Client Services Director.",
      employerNames: ["Acme Agency"],
    });
    const redacted = createDraftAnonymizedText({
      extractedText: "2020-2024 Acme Agency - Client Services Director.",
      employerNames: ["Acme Agency"],
      redactEmployerNames: true,
    });

    expect(preserved.anonymizedText).toContain("Acme Agency");
    expect(redacted.anonymizedText).toContain("[employer redacted]");
    expect(redacted.removedItems).toContain("employer names");
  });

  it("blocks the worker unless the private feature and database gates are ready", async () => {
    await expect(
      createCvAnonymizationDraft({
        originalCvFileId: "00000000-0000-0000-0000-000000000001",
        extractedText: "Private CV text",
      }),
    ).resolves.toMatchObject({
      ok: false,
      status: "blocked",
      reason: "feature_disabled",
    });
  });

  it("stages the private data model without raw CV or provider secrets", () => {
    const migration = readFileSync(
      "database/migrations/013_cv_anonymization_drafts.sql",
      "utf8",
    );
    const docs = readFileSync("docs/cv-anonymization.md", "utf8");
    const env = readFileSync(".env.example", "utf8");

    for (const field of [
      "original_cv_file_id",
      "anonymized_text",
      "anonymization_status",
      "reviewed_by",
      "reviewed_at",
      "approved_for_client_use",
      "ai_generation_event_id",
    ]) {
      expect(migration).toContain(field);
    }

    expect(migration).toContain("references files(id)");
    expect(migration).not.toMatch(
      /raw_cv|raw_prompt|api_key|access_token|secret/i,
    );
    expect(docs).toContain("No real CV should be processed");
    expect(env).toContain("FEATURE_CV_ANONYMIZATION=false");
  });
});
