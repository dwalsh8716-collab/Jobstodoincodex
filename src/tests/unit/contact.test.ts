import { describe, expect, it, vi } from "vitest";
import { submitContactEnquiry } from "@/actions/contact";
import {
  contactFormSchema,
  minimumCompletionTimeMs,
} from "@/validations/contact";

vi.mock("server-only", () => ({}));

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

    delete process.env.OPERATIONS_DB_ENABLED;

    expect(result).toMatchObject({
      ok: false,
      statusCode: 502,
      message:
        "The form could not be saved right now. Please email David directly.",
    });
  });
});
