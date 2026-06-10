import { describe, expect, it } from "vitest";
import {
  candidateConsentCopy,
  candidateNextSteps,
  candidatePrivacyNoticeVersion,
  candidatePrivacyPath,
  candidateRetentionStatement,
} from "@/lib/candidate-trust";

describe("candidate trust copy", () => {
  it("keeps candidate privacy route and version explicit", () => {
    expect(candidatePrivacyPath).toBe("/candidate-privacy");
    expect(candidatePrivacyNoticeVersion).toBe("candidate-privacy-v1");
  });

  it("explains retention and deletion in plain English", () => {
    expect(candidateRetentionStatement).toMatch(/genuine recruitment reason/i);
    expect(candidateRetentionStatement).toMatch(/delete your details/i);
  });

  it("keeps application consent separate from marketing consent", () => {
    expect(candidateConsentCopy("job")).toMatch(/store and use my details/i);
    expect(candidateConsentCopy("job")).toMatch(/deleted at any time/i);
    expect(candidateConsentCopy("job")).not.toMatch(/newsletter|marketing/i);
  });

  it("sets clear next steps without promising every applicant a reply", () => {
    expect(candidateNextSteps).toHaveLength(4);
    expect(candidateNextSteps.join(" ")).toMatch(/David reviews/i);
    expect(candidateNextSteps.join(" ")).not.toMatch(/guaranteed response/i);
  });
});
