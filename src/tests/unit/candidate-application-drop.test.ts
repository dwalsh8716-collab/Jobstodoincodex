import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { POST } from "../../../app/api/candidate-application-drop/route";
import {
  candidateApplicationDropManualBlockers,
  getCandidateApplicationDropStatus,
} from "@/lib/candidate-application-drop";
import {
  candidateApplicationDropSchema,
  validateCvFile,
} from "@/validations/candidate-application-drop";

vi.mock("server-only", () => ({}));

describe("candidate application drop", () => {
  it("keeps CV upload disabled even if someone sets the feature flag before storage is built", () => {
    const status = getCandidateApplicationDropStatus({
      FEATURE_CANDIDATE_APPLICATION_DROP: "true",
      CANDIDATE_CV_STORAGE_PROVIDER: "r2",
      CANDIDATE_CV_STORAGE_BUCKET: "private-cvs",
      CANDIDATE_CV_STORAGE_SIGNING_SECRET: "secret",
    });

    expect(status).toMatchObject({
      featureFlagEnabled: true,
      privateStorageConfigured: true,
      storageAdapterImplemented: false,
      canAcceptCvUploads: false,
      status: "staged",
    });
    expect(candidateApplicationDropManualBlockers.join(" ")).toMatch(
      /legal\/privacy/i,
    );
  });

  it("validates passwordless application fields without requiring an account", () => {
    const result = candidateApplicationDropSchema.safeParse({
      name: "Candidate Name",
      email: "candidate@example.com",
      phone: "+44 7824 514296",
      linkedin: "https://www.linkedin.com/in/example",
      note: "Short note about a relevant role.",
      preferredContactMethod: "email",
      consent: "yes",
      privacyNoticeAcknowledgement: "yes",
      talentPoolConsent: "yes",
    });

    expect(result.success).toBe(true);
  });

  it("allows a profile URL without forcing a cover letter", () => {
    const result = candidateApplicationDropSchema.safeParse({
      name: "Candidate Name",
      email: "candidate@example.com",
      linkedin: "https://www.linkedin.com/in/example",
      preferredContactMethod: "email",
      consent: "yes",
      privacyNoticeAcknowledgement: "yes",
    });

    expect(result.success).toBe(true);
  });

  it("requires either a profile URL or a useful short note", () => {
    const missingBoth = candidateApplicationDropSchema.safeParse({
      name: "Candidate Name",
      email: "candidate@example.com",
      preferredContactMethod: "email",
      consent: "yes",
      privacyNoticeAcknowledgement: "yes",
    });
    const usefulNote = candidateApplicationDropSchema.safeParse({
      name: "Candidate Name",
      email: "candidate@example.com",
      note: "I am interested in relevant senior marketing roles.",
      preferredContactMethod: "email",
      consent: "yes",
      privacyNoticeAcknowledgement: "yes",
    });

    expect(missingBoth.success).toBe(false);
    expect(usefulNote.success).toBe(true);
  });

  it("requires WhatsApp consent when WhatsApp is the preferred candidate route", () => {
    const missingConsent = candidateApplicationDropSchema.safeParse({
      name: "Candidate Name",
      email: "candidate@example.com",
      phone: "+44 7824 514296",
      note: "Short note about a relevant role.",
      preferredContactMethod: "whatsapp",
      consent: "yes",
      privacyNoticeAcknowledgement: "yes",
    });
    const validConsent = candidateApplicationDropSchema.safeParse({
      name: "Candidate Name",
      email: "candidate@example.com",
      phone: "+44 7824 514296",
      note: "Short note about a relevant role.",
      preferredContactMethod: "whatsapp",
      consent: "yes",
      privacyNoticeAcknowledgement: "yes",
      whatsappContactConsent: "yes",
    });

    expect(missingConsent.success).toBe(false);
    expect(validConsent.success).toBe(true);
  });

  it("allows only sensible staged CV file types and size", () => {
    const pdf = new File(["test"], "cv.pdf", { type: "application/pdf" });
    const badType = new File(["test"], "cv.exe", {
      type: "application/x-msdownload",
    });
    const tooLarge = new File(
      [new Uint8Array(10 * 1024 * 1024 + 1)],
      "cv.pdf",
      {
        type: "application/pdf",
      },
    );

    expect(validateCvFile(pdf)).toMatchObject({
      ok: true,
      file: { name: "cv.pdf", type: "application/pdf", size: 4 },
    });
    expect(validateCvFile(badType)).toMatchObject({
      ok: false,
      message: "CV file must be a PDF, DOC or DOCX.",
    });
    expect(validateCvFile(tooLarge)).toMatchObject({
      ok: false,
      message: "CV file is too large. Maximum size is 10MB.",
    });
  });

  it("keeps the upload API locked until private storage is approved", async () => {
    const response = await POST(
      new NextRequest("https://example.com/api/candidate-application-drop", {
        method: "POST",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({ ok: false, status: "staged" });
    expect(body.message).not.toMatch(/secret|token|bucket/i);
  });

  it("documents the staged component, storage blockers and privacy boundary", () => {
    const docs = readFileSync("docs/candidate-application-drop.md", "utf8");
    const readme = readFileSync("README.md", "utf8");
    const cvDocs = readFileSync("docs/cv-storage-and-retention.md", "utf8");
    const migration = readFileSync(
      "database/migrations/027_candidate_application_drop.sql",
      "utf8",
    );
    const store = readFileSync("src/lib/operations/store.ts", "utf8");

    expect(docs).toContain("CV upload is staged, not live.");
    expect(docs).toContain("LinkedIn/profile URL or a short note");
    expect(docs).toContain("/api/candidate-application-drop");
    expect(docs).toContain("No CVs in Sanity");
    expect(readme).toContain("docs/candidate-application-drop.md");
    expect(cvDocs).toContain("docs/candidate-application-drop.md");
    expect(migration).toContain("create table if not exists candidate_files");
    expect(migration).not.toMatch(/public_url|download_url/i);
    expect(store).toContain("website_application_drop");
    expect(store).toContain("application_created");
  });
});
