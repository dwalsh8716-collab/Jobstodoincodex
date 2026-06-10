import { afterEach, describe, expect, it, vi } from "vitest";
import { submitContactEnquiry } from "@/actions/contact";
import {
  contactFormSchema,
  minimumCompletionTimeMs,
} from "@/validations/contact";

vi.mock("server-only", () => ({}));

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const basePayload = {
  type: "client",
  name: "  David Walsh  ",
  email: "david@example.com",
  phone: "+44 161 000 0000",
  company: "Essential Resourcing",
  briefType: "Leadership Search",
  message: "I need help with a senior marketing leadership brief.",
  consent: "yes",
  website: "",
  startedAt: Date.now() - minimumCompletionTimeMs - 500,
};

describe("contact form validation", () => {
  it("sanitises valid enquiry payloads", () => {
    const result = contactFormSchema.parse(basePayload);

    expect(result.name).toBe("David Walsh");
    expect(result.email).toBe("david@example.com");
    expect(result.phone).toBe("+44 161 000 0000");
  });

  it("rejects invalid email, consent and honeypot data", () => {
    const result = contactFormSchema.safeParse({
      ...basePayload,
      email: "not-an-email",
      consent: undefined,
      website: "filled",
    });

    expect(result.success).toBe(false);
  });
});

describe("contact server action response shape", () => {
  it("returns a safe validation error", async () => {
    const result = await submitContactEnquiry({});

    expect(result).toMatchObject({
      ok: false,
      statusCode: 400,
    });
    expect(result.message).not.toMatch(/Error|stack|RESEND_API_KEY/i);
  });

  it("rejects submissions that are unrealistically fast", async () => {
    const result = await submitContactEnquiry(
      { ...basePayload, email: "fast@example.com", startedAt: Date.now() },
      { ip: "phase-13-fast", now: Date.now() },
    );

    expect(result).toMatchObject({
      ok: false,
      statusCode: 400,
      message: "Please take a moment and try again.",
    });
  });

  it("returns a safe success message when delivery is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
    delete process.env.CONTACT_FROM_EMAIL;

    const now = Date.now();
    const result = await submitContactEnquiry(
      {
        ...basePayload,
        email: "valid-phase-13@example.com",
        startedAt: now - minimumCompletionTimeMs - 500,
      },
      { ip: "phase-13-valid", now },
    );

    expect(result.ok).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.message).toContain("validated");
    expect(result.message).not.toContain("valid-phase-13@example.com");
  });

  it("fails safely when operations database is enabled without DATABASE_URL", async () => {
    process.env.OPERATIONS_DB_ENABLED = "true";
    delete process.env.DATABASE_URL;

    const now = Date.now();
    const result = await submitContactEnquiry(
      {
        ...basePayload,
        email: "missing-db@example.com",
        startedAt: now - minimumCompletionTimeMs - 500,
      },
      { ip: "phase-47-missing-db", now },
    );

    expect(result).toMatchObject({
      ok: false,
      statusCode: 502,
      message:
        "The form could not be saved right now. Please email David directly.",
    });
  });

  it("sends a candidate confirmation email without echoing private message content", async () => {
    process.env.RESEND_API_KEY = "test_resend_key";
    process.env.CONTACT_TO_EMAIL = "david@example.com";
    process.env.CONTACT_FROM_EMAIL = "website@example.com";
    delete process.env.OPERATIONS_DB_ENABLED;
    delete process.env.DATABASE_URL;

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const now = Date.now();
    const result = await submitContactEnquiry(
      {
        ...basePayload,
        type: "candidate",
        email: "candidate-confirmation@example.com",
        linkedin: "https://www.linkedin.com/in/example",
        briefType: "Candidate conversation",
        message: "I want a confidential conversation about my next move.",
        startedAt: now - minimumCompletionTimeMs - 500,
      },
      { ip: "phase-48-confirmation", now },
    );

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const confirmationBody = JSON.parse(
      String(fetchMock.mock.calls[1]?.[1]?.body),
    ) as { to: string; subject: string; text: string };

    expect(confirmationBody).toMatchObject({
      to: "candidate-confirmation@example.com",
      subject: "We've received your note",
    });
    expect(confirmationBody.text).toContain("Candidate Privacy Notice");
    expect(confirmationBody.text).toContain("delete");
    expect(confirmationBody.text).not.toContain(
      "confidential conversation about my next move",
    );
  });
});
