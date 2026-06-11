import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  forbiddenSanityFieldNames,
  isForbiddenSanityFieldName,
  publicSanityDocumentTypes,
} from "@/lib/data-boundaries";

const schemaSource = readFileSync("sanity/schemas/index.ts", "utf8");

describe("data boundary rules", () => {
  it("keeps Sanity document types public-content only", () => {
    expect(publicSanityDocumentTypes).toEqual(
      expect.arrayContaining([
        "siteSettings",
        "job",
        "insight",
        "caseStudy",
        "salarySnapshot",
      ]),
    );
    expect(publicSanityDocumentTypes).not.toContain("candidate");
    expect(publicSanityDocumentTypes).not.toContain("application");
    expect(publicSanityDocumentTypes).not.toContain("dataSubjectRequest");
  });

  it("does not define private operational fields in Sanity schemas", () => {
    const definedFieldNames = Array.from(
      schemaSource.matchAll(/name:\s*"([^"]+)"/g),
    ).map((match) => match[1]);

    const forbiddenMatches = definedFieldNames.filter((fieldName) =>
      isForbiddenSanityFieldName(fieldName),
    );

    expect(forbiddenMatches).toEqual([]);
  });

  it("keeps form submissions away from Sanity mutation APIs", () => {
    const filesToCheck = [
      "src/actions/contact.ts",
      "src/actions/data-subject-request.ts",
      "src/lib/sanity.ts",
      "src/lib/sanity-content.ts",
    ];
    const mutationPattern =
      /SANITY_WRITE_TOKEN|createOrReplace|createIfNotExists|\.create\(|\.mutate\(|\.patch\(/;

    for (const file of filesToCheck) {
      expect(readFileSync(file, "utf8")).not.toMatch(mutationPattern);
    }
  });

  it("keeps the forbidden field list explicit", () => {
    expect(forbiddenSanityFieldNames).toEqual(
      expect.arrayContaining([
        "candidateEmail",
        "candidatePhone",
        "candidateLinkedInUrl",
        "candidateProfileUrl",
        "cvFile",
        "coverLetter",
        "clientShortlist",
        "magicLinkToken",
        "candidatePresentation",
        "candidateRanking",
        "aiCandidateScore",
        "aiPrompt",
        "aiTranscript",
        "aiClientProfileDraft",
        "aiDraftOutput",
        "privateNotes",
        "auditLog",
      ]),
    );
  });
});
