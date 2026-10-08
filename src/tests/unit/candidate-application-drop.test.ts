import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../../../app/api/candidate-application-drop/route";
import {
  candidateApplicationDropManualBlockers,
  getCandidateApplicationDropStatus,
} from "@/lib/candidate-application-drop";
import {
  candidateApplicationDropSchema,
  validateCvFile,
} from "@/validations/candidate-application-drop";

const awsMocks = vi.hoisted(() => ({
  send: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn().mockImplementation(function MockS3Client() {
    return {
      send: awsMocks.send,
    };
  }),
  PutObjectCommand: vi
    .fn()
    .mockImplementation(function MockPutObjectCommand(input) {
      return { input };
    }),
  DeleteObjectCommand: vi
    .fn()
    .mockImplementation(function MockDeleteObjectCommand(input) {
      return { input };
    }),
}));

const originalEnv = { ...process.env };
const originalFetch = global.fetch;

function enableCvUploadEnv() {
  process.env.FEATURE_CANDIDATE_APPLICATION_DROP = "true";
  process.env.CANDIDATE_CV_STORAGE_PROVIDER = "railway_bucket";
  process.env.CANDIDATE_CV_STORAGE_BUCKET = "private-cvs";
  process.env.CANDIDATE_CV_STORAGE_ENDPOINT = "https://storage.example.com";
  process.env.CANDIDATE_CV_STORAGE_REGION = "auto";
  process.env.CANDIDATE_CV_STORAGE_ACCESS_KEY_ID = "access-key";
  process.env.CANDIDATE_CV_STORAGE_SECRET_ACCESS_KEY = "secret-key";
  process.env.CANDIDATE_CV_EMAIL_DELIVERY = "resend_attachment";
  process.env.RESEND_API_KEY = "resend-key";
  process.env.CONTACT_TO_EMAIL = "david@example.com";
  process.env.CONTACT_FROM_EMAIL = "website@example.com";
}

function enableCandidateNoteEnv() {
  process.env.FEATURE_CANDIDATE_APPLICATION_DROP = "true";
  process.env.RESEND_API_KEY = "resend-key";
  process.env.CONTACT_TO_EMAIL = "david@example.com";
  process.env.CONTACT_FROM_EMAIL = "website@example.com";
}

function validPayload(startedAt = Date.now() - 5000) {
  return {
    type: "candidate",
    name: "Candidate Name",
    email: "candidate@example.com",
    phone: "+44 7824 514296",
    linkedin: "https://www.linkedin.com/in/example",
    note: "Short note about a relevant role.",
    preferredContactMethod: "email",
    consent: "yes",
    privacyNoticeAcknowledgement: "yes",
    talentPoolConsent: "yes",
    hasCvFile: "yes",
    website: "",
    startedAt,
    sourcePage: "/candidates",
  };
}

beforeEach(() => {
  process.env = { ...originalEnv };
  awsMocks.send.mockReset();
  awsMocks.send.mockResolvedValue({});
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: "email-id" }),
    text: async () => "",
  } as Response);
});

afterEach(() => {
  process.env = { ...originalEnv };
  global.fetch = originalFetch;
  vi.clearAllMocks();
});

describe("candidate application drop", () => {
  it("stays closed until candidate note delivery is configured and only enables CV upload with private storage", () => {
    const staged = getCandidateApplicationDropStatus({
      FEATURE_CANDIDATE_APPLICATION_DROP: "true",
      CANDIDATE_CV_STORAGE_PROVIDER: "railway_bucket",
      CANDIDATE_CV_STORAGE_BUCKET: "private-cvs",
    });
    const noteOnly = getCandidateApplicationDropStatus({
      FEATURE_CANDIDATE_APPLICATION_DROP: "true",
      RESEND_API_KEY: "resend-key",
      CONTACT_TO_EMAIL: "david@example.com",
      CONTACT_FROM_EMAIL: "website@example.com",
    });
    const live = getCandidateApplicationDropStatus({
      FEATURE_CANDIDATE_APPLICATION_DROP: "true",
      CANDIDATE_CV_STORAGE_PROVIDER: "railway_bucket",
      CANDIDATE_CV_STORAGE_BUCKET: "private-cvs",
      CANDIDATE_CV_STORAGE_ENDPOINT: "https://storage.example.com",
      CANDIDATE_CV_STORAGE_ACCESS_KEY_ID: "access-key",
      CANDIDATE_CV_STORAGE_SECRET_ACCESS_KEY: "secret-key",
      CANDIDATE_CV_EMAIL_DELIVERY: "resend_attachment",
      RESEND_API_KEY: "resend-key",
      CONTACT_TO_EMAIL: "david@example.com",
      CONTACT_FROM_EMAIL: "website@example.com",
    });

    expect(staged).toMatchObject({
      featureFlagEnabled: true,
      privateStorageConfigured: false,
      storageAdapterImplemented: true,
      canAcceptCvUploads: false,
      canSubmitCandidateNote: false,
      status: "staged",
    });
    expect(noteOnly).toMatchObject({
      canSubmitCandidateNote: true,
      canAcceptCvUploads: false,
      privateStorageConfigured: false,
      resendConfigured: true,
      status: "live",
    });
    expect(live).toMatchObject({
      canSubmitCandidateNote: true,
      canAcceptCvUploads: true,
      privateStorageConfigured: true,
      resendConfigured: true,
      status: "live",
    });
    expect(candidateApplicationDropManualBlockers.join(" ")).toMatch(
      /private object storage/i,
    );
  });

  it("validates passwordless application fields with a CV file", () => {
    const result = candidateApplicationDropSchema.safeParse(validPayload());

    expect(result.success).toBe(true);
  });

  it("allows a profile URL without forcing a cover letter", () => {
    const result = candidateApplicationDropSchema.safeParse({
      ...validPayload(),
      note: "",
    });

    expect(result.success).toBe(true);
  });

  it("requires a CV, profile URL or useful short note", () => {
    const missingAll = candidateApplicationDropSchema.safeParse({
      ...validPayload(),
      linkedin: "",
      note: "",
      hasCvFile: undefined,
    });
    const usefulNote = candidateApplicationDropSchema.safeParse({
      ...validPayload(),
      linkedin: "",
      note: "I am interested in relevant senior marketing roles.",
      hasCvFile: undefined,
    });

    expect(missingAll.success).toBe(false);
    expect(usefulNote.success).toBe(true);
  });

  it("accepts a longer application note up to the visible limit", () => {
    const withinLimit = candidateApplicationDropSchema.safeParse({
      ...validPayload(),
      note: "A".repeat(4000),
    });
    const overLimit = candidateApplicationDropSchema.safeParse({
      ...validPayload(),
      note: "A".repeat(4001),
    });

    expect(withinLimit.success).toBe(true);
    expect(overLimit.success).toBe(false);
  });

  it("allows a brief accompanying note with a CV or profile, but explains a note-only minimum", () => {
    const withCv = candidateApplicationDropSchema.safeParse({
      ...validPayload(),
      linkedin: "",
      note: "Hi David",
      hasCvFile: "yes",
    });
    const withProfile = candidateApplicationDropSchema.safeParse({
      ...validPayload(),
      note: "Hi David",
      hasCvFile: undefined,
    });
    const noteOnly = candidateApplicationDropSchema.safeParse({
      ...validPayload(),
      linkedin: "",
      note: "Hi David",
      hasCvFile: undefined,
    });

    expect(withCv.success).toBe(true);
    expect(withProfile.success).toBe(true);
    expect(noteOnly.success).toBe(false);
    if (!noteOnly.success) {
      expect(noteOnly.error.errors[0]?.message).toContain(
        "at least 10 characters",
      );
    }
  });

  it("requires WhatsApp consent when WhatsApp is the preferred candidate route", () => {
    const missingConsent = candidateApplicationDropSchema.safeParse({
      ...validPayload(),
      preferredContactMethod: "whatsapp",
      whatsappContactConsent: undefined,
    });
    const validConsent = candidateApplicationDropSchema.safeParse({
      ...validPayload(),
      preferredContactMethod: "whatsapp",
      whatsappContactConsent: "yes",
    });

    expect(missingConsent.success).toBe(false);
    expect(validConsent.success).toBe(true);
  });

  it("allows only sensible CV file types and size", () => {
    const pdf = new File(["%PDF-1.4"], "cv.pdf", { type: "application/pdf" });
    const badType = new File(["test"], "cv.exe", {
      type: "application/x-msdownload",
    });
    const spoofedPdf = new File(["test"], "cv.pdf", {
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
      file: { name: "cv.pdf", type: "application/pdf", size: 8 },
    });
    expect(validateCvFile(badType)).toMatchObject({
      ok: false,
      message: "CV file must be a PDF, DOC or DOCX.",
    });
    expect(validateCvFile(spoofedPdf)).toMatchObject({
      ok: false,
      message: "CV file must be a PDF, DOC or DOCX.",
    });
    expect(validateCvFile(tooLarge)).toMatchObject({
      ok: false,
      message: "CV file is too large. Maximum size is 10MB.",
    });
  });

  it("keeps the candidate route locked until note delivery is configured", async () => {
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

  it("accepts a lightweight candidate note without forcing a CV upload", async () => {
    enableCandidateNoteEnv();
    const formData = new FormData();
    const payload = {
      ...validPayload(),
      hasCvFile: undefined,
    };
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined) formData.set(key, String(value));
    }

    const response = await POST(
      new NextRequest("https://example.com/api/candidate-application-drop", {
        method: "POST",
        headers: {
          "x-forwarded-for": "203.0.113.8",
          "user-agent": "vitest",
        },
        body: formData,
      }),
    );
    const body = await response.json();
    const emailCalls = vi.mocked(global.fetch).mock.calls;
    const adminEmail = JSON.parse(String(emailCalls[0]?.[1]?.body));

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, status: "live" });
    expect(awsMocks.send).not.toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(adminEmail.attachments).toBeUndefined();
    expect(adminEmail.subject).toBe(
      "Essential Resourcing candidate note from Candidate Name",
    );
    expect(adminEmail.text).toContain(
      "LinkedIn/profile: https://www.linkedin.com/in/example",
    );
  });

  it("rejects a fake PDF before storage or email delivery", async () => {
    enableCvUploadEnv();
    const formData = new FormData();
    for (const [key, value] of Object.entries(validPayload())) {
      formData.set(key, String(value));
    }
    formData.set(
      "cvFile",
      new File(["not a pdf"], "cv.pdf", {
        type: "application/pdf",
      }),
    );

    const response = await POST(
      new NextRequest("https://example.com/api/candidate-application-drop", {
        method: "POST",
        body: formData,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("CV file must be a valid PDF, DOC or DOCX.");
    expect(awsMocks.send).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("stores the CV privately and emails the attachment to David through Resend", async () => {
    enableCvUploadEnv();
    const formData = new FormData();
    for (const [key, value] of Object.entries(validPayload())) {
      formData.set(key, String(value));
    }
    formData.set(
      "cvFile",
      new File(["%PDF-1.4 test cv"], "cv.pdf", {
        type: "application/pdf",
      }),
    );

    const response = await POST(
      new NextRequest("https://example.com/api/candidate-application-drop", {
        method: "POST",
        headers: {
          "x-forwarded-for": "203.0.113.7",
          "user-agent": "vitest",
        },
        body: formData,
      }),
    );
    const body = await response.json();
    const emailCalls = vi.mocked(global.fetch).mock.calls;
    const adminEmail = JSON.parse(String(emailCalls[0]?.[1]?.body));
    const candidateEmail = JSON.parse(String(emailCalls[1]?.[1]?.body));

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, status: "live" });
    expect(body.reference).toMatch(/^ER-CV-/);
    expect(awsMocks.send).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(adminEmail).toMatchObject({
      from: "Essential Resourcing <website@example.com>",
      to: "david@example.com",
      subject: "Essential Resourcing candidate CV from Candidate Name",
    });
    expect(adminEmail.attachments).toEqual([
      {
        filename: "cv.pdf",
        content: Buffer.from("%PDF-1.4 test cv").toString("base64"),
      },
    ]);
    expect(candidateEmail).toMatchObject({
      from: "Essential Resourcing <website@example.com>",
      to: "candidate@example.com",
    });
    expect(candidateEmail.html).toContain(
      "/assets/essential-resourcing-email-logo.png",
    );
    expect(candidateEmail.attachments).toBeUndefined();
  });

  it("documents the live private storage and privacy boundary", () => {
    const docs = readFileSync("docs/candidate-application-drop.md", "utf8");
    const readme = readFileSync("README.md", "utf8");
    const cvDocs = readFileSync("docs/cv-storage-and-retention.md", "utf8");
    const migration = readFileSync(
      "database/migrations/027_candidate_application_drop.sql",
      "utf8",
    );
    const store = readFileSync("src/lib/operations/store.ts", "utf8");

    expect(docs).toContain("CV upload is live");
    expect(docs).toContain("david@essentialresourcing.co.uk");
    expect(docs).toContain("/api/candidate-application-drop");
    expect(docs).toContain("No CV is stored in Sanity");
    expect(readme).toContain("docs/candidate-application-drop.md");
    expect(cvDocs).toContain("private Railway bucket");
    expect(migration).toContain("create table if not exists candidate_files");
    expect(migration).not.toMatch(/public_url|download_url/i);
    expect(store).toContain("website_application_drop");
    expect(store).toContain("application_created");
  });
});
