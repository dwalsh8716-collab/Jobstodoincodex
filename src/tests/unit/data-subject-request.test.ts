import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import {
  confirmDataSubjectRequestEmail,
  submitDataSubjectRequest,
} from "@/actions/data-subject-request";
import {
  buildDataSubjectRequestVerificationUrl,
  createDataSubjectRequestVerificationToken,
  dataSubjectRequestVerificationPath,
  getDataSubjectRequestVerificationTokenHours,
  hashDataSubjectRequestVerificationToken,
} from "@/lib/dsar-verification";
import {
  dataSubjectRequestMinimumCompletionTimeMs,
  dataSubjectRequestSchema,
} from "@/validations/data-subject-request";

vi.mock("server-only", () => ({}));

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const basePayload = {
  name: "  Candidate Name  ",
  email: "candidate@example.com",
  phone: "+44 7824 514296",
  requestType: "access_export",
  message: "Please send me a copy of the candidate data you hold.",
  confirmAuthority: "yes",
  privacyNotice: "yes",
  website: "",
  startedAt: Date.now() - dataSubjectRequestMinimumCompletionTimeMs - 500,
};

describe("data subject request validation", () => {
  it("sanitises a valid request", () => {
    const result = dataSubjectRequestSchema.parse(basePayload);

    expect(result.name).toBe("Candidate Name");
    expect(result.email).toBe("candidate@example.com");
    expect(result.requestType).toBe("access_export");
  });

  it("rejects invalid email, request type and missing authority", () => {
    const result = dataSubjectRequestSchema.safeParse({
      ...basePayload,
      email: "not-an-email",
      requestType: "wipe_everything_now",
      confirmAuthority: undefined,
    });

    expect(result.success).toBe(false);
  });
});

describe("data subject request action", () => {
  it("returns a safe validation error", async () => {
    const result = await submitDataSubjectRequest({});

    expect(result).toMatchObject({
      ok: false,
      statusCode: 400,
    });
    expect(result.message).not.toMatch(/Error|stack|RESEND_API_KEY/i);
  });

  it("rejects submissions that are unrealistically fast", async () => {
    const now = Date.now();
    const result = await submitDataSubjectRequest(
      {
        ...basePayload,
        email: "fast-dsar@example.com",
        startedAt: now,
      },
      { ip: "phase-50-fast", now },
    );

    expect(result).toMatchObject({
      ok: false,
      statusCode: 400,
      message: "Please take a moment and try again.",
    });
  });

  it("does not pretend a request is handled when storage and email are missing", async () => {
    delete process.env.OPERATIONS_DB_ENABLED;
    delete process.env.DATABASE_URL;
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;

    const now = Date.now();
    const result = await submitDataSubjectRequest(
      {
        ...basePayload,
        email: "not-configured-dsar@example.com",
        startedAt: now - dataSubjectRequestMinimumCompletionTimeMs - 500,
      },
      { ip: "phase-50-not-configured", now },
    );

    expect(result).toMatchObject({
      ok: false,
      statusCode: 503,
    });
    expect(result.message).toMatch(/email David directly/i);
  });

  it("fails safely when operations database is enabled without DATABASE_URL", async () => {
    process.env.OPERATIONS_DB_ENABLED = "true";
    delete process.env.DATABASE_URL;

    const now = Date.now();
    const result = await submitDataSubjectRequest(
      {
        ...basePayload,
        email: "missing-db-dsar@example.com",
        startedAt: now - dataSubjectRequestMinimumCompletionTimeMs - 500,
      },
      { ip: "phase-50-missing-db", now },
    );

    expect(result).toMatchObject({
      ok: false,
      statusCode: 502,
      message:
        "The request could not be safely saved right now. Please email David directly.",
    });
  });

  it("sends admin and requester emails without echoing private message content", async () => {
    process.env.RESEND_API_KEY = "test_resend_key";
    process.env.CONTACT_TO_EMAIL = "david@example.com";
    process.env.CONTACT_FROM_EMAIL = "website@example.com";
    delete process.env.OPERATIONS_DB_ENABLED;
    delete process.env.DATABASE_URL;

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const now = Date.now();
    const result = await submitDataSubjectRequest(
      {
        ...basePayload,
        email: "email-dsar@example.com",
        message: "Please delete the notes about my confidential job search.",
        requestType: "deletion",
        startedAt: now - dataSubjectRequestMinimumCompletionTimeMs - 500,
      },
      { ip: "phase-50-email", now },
    );

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const adminBody = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body),
    ) as { text: string };
    const requesterBody = JSON.parse(
      String(fetchMock.mock.calls[1]?.[1]?.body),
    ) as { to: string; subject: string; text: string };

    expect(adminBody.text).toContain("Delete my candidate details");
    expect(adminBody.text).not.toContain("confidential job search");
    expect(requesterBody).toMatchObject({
      to: "email-dsar@example.com",
      subject: "We've received your data request",
    });
    expect(requesterBody.text).toContain("Candidate Privacy Notice");
    expect(requesterBody.text).toContain("Identity verification");
    expect(requesterBody.text).not.toContain("confidential job search");
  });

  it("fails safely for invalid email confirmation tokens", async () => {
    const result = await confirmDataSubjectRequestEmail("not valid");

    expect(result).toMatchObject({
      ok: false,
      statusCode: 400,
    });
    expect(result.message).not.toMatch(/stack|DATABASE_URL|RESEND_API_KEY/i);
  });

  it("uses hashed, time-limited DSAR email confirmation tokens", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    process.env.DSAR_EMAIL_VERIFICATION_TOKEN_HOURS = "48";

    const token = createDataSubjectRequestVerificationToken();
    const url = buildDataSubjectRequestVerificationUrl(token.token);

    expect(token.token).not.toBe(token.tokenHash);
    expect(token.tokenHash).toBe(
      hashDataSubjectRequestVerificationToken(token.token),
    );
    expect(url).toContain(dataSubjectRequestVerificationPath);
    expect(url).toContain(encodeURIComponent(token.token));
    expect(getDataSubjectRequestVerificationTokenHours()).toBe(48);
  });

  it("stages DSAR email verification without one-click deletion or GET verification", () => {
    const migration = readFileSync(
      "database/migrations/017_dsar_email_verification.sql",
      "utf8",
    );
    const confirmPage = readFileSync(
      "app/candidate-privacy/request/confirm/page.tsx",
      "utf8",
    );
    const confirmApi = readFileSync(
      "app/api/data-request/confirm/route.ts",
      "utf8",
    );

    expect(migration).toContain("email_verification_token_hash text");
    expect(migration).toContain("email_verification_expires_at timestamptz");
    expect(confirmPage).toContain("DataSubjectRequestConfirmForm");
    expect(confirmApi).toContain("export async function POST");
    expect(confirmApi).not.toContain("export async function GET");
    expect(confirmApi).not.toMatch(/delete from candidates|delete from files/i);
  });
});
