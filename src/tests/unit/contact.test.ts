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
  briefType: "Retained Search",
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

  it("requires a phone number when WhatsApp is preferred", () => {
    const result = contactFormSchema.safeParse({
      ...basePayload,
      phone: "",
      preferredContactMethod: "whatsapp",
    });

    expect(result.success).toBe(false);
  });

  it("requires explicit WhatsApp consent for candidate WhatsApp replies", () => {
    const missingWhatsAppConsent = contactFormSchema.safeParse({
      ...basePayload,
      type: "job",
      briefType: "Job application",
      preferredContactMethod: "whatsapp",
      privacyNoticeAcknowledgement: "yes",
    });
    const validWhatsAppPreference = contactFormSchema.safeParse({
      ...basePayload,
      type: "job",
      briefType: "Job application",
      preferredContactMethod: "whatsapp",
      privacyNoticeAcknowledgement: "yes",
      whatsappContactConsent: "yes",
    });

    expect(missingWhatsAppConsent.success).toBe(false);
    expect(validWhatsAppPreference.success).toBe(true);
  });

  it("requires candidate privacy acknowledgement separately from contact consent", () => {
    const missingPrivacy = contactFormSchema.safeParse({
      ...basePayload,
      type: "candidate",
      briefType: "Candidate conversation",
      consent: "yes",
    });
    const validCandidate = contactFormSchema.safeParse({
      ...basePayload,
      type: "candidate",
      briefType: "Candidate conversation",
      consent: "yes",
      privacyNoticeAcknowledgement: "yes",
      talentPoolConsent: "yes",
    });

    expect(missingPrivacy.success).toBe(false);
    expect(validCandidate.success).toBe(true);
  });

  it("keeps personal and hiring salary questions on their respective routes", () => {
    expect(
      contactFormSchema.safeParse({
        ...basePayload,
        type: "candidate",
        briefType: "Personal salary sense-check",
        privacyNoticeAcknowledgement: "yes",
      }).success,
    ).toBe(true);
    expect(
      contactFormSchema.safeParse({
        ...basePayload,
        type: "client",
        briefType: "Personal salary sense-check",
      }).success,
    ).toBe(false);
    expect(
      contactFormSchema.safeParse({
        ...basePayload,
        type: "candidate",
        briefType: "Hiring salary sense-check",
        privacyNoticeAcknowledgement: "yes",
      }).success,
    ).toBe(false);
    expect(
      contactFormSchema.safeParse({
        ...basePayload,
        type: "candidate",
        briefType: "Personal salary sense-check",
      }).success,
    ).toBe(false);
  });

  it("lets candidates apply with a profile URL instead of a cover letter", () => {
    const validProfileOnlyApplication = contactFormSchema.safeParse({
      ...basePayload,
      type: "job",
      briefType: "Job application",
      message: "",
      linkedin: "https://www.linkedin.com/in/example",
      privacyNoticeAcknowledgement: "yes",
    });
    const missingProfileAndNote = contactFormSchema.safeParse({
      ...basePayload,
      type: "job",
      briefType: "Job application",
      message: "",
      linkedin: "",
      privacyNoticeAcknowledgement: "yes",
    });

    expect(validProfileOnlyApplication.success).toBe(true);
    expect(missingProfileAndNote.success).toBe(false);
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
        privacyNoticeAcknowledgement: "yes",
        whatsappContactConsent: "yes",
        talentPoolConsent: "yes",
        startedAt: now - minimumCompletionTimeMs - 500,
      },
      { ip: "phase-48-confirmation", now },
    );

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const confirmationBody = JSON.parse(
      String(fetchMock.mock.calls[1]?.[1]?.body),
    ) as {
      from: string;
      to: string;
      subject: string;
      text: string;
      html: string;
    };

    expect(confirmationBody).toMatchObject({
      from: "Essential Resourcing <website@example.com>",
      to: "candidate-confirmation@example.com",
      subject: "We've received your note",
    });
    expect(confirmationBody.html).toContain(
      "/assets/essential-resourcing-email-logo.png",
    );
    expect(confirmationBody.text).toContain("Candidate Privacy Notice");
    expect(confirmationBody.text).toContain("delete");
    expect(confirmationBody.text).not.toContain(
      "confidential conversation about my next move",
    );
  });

  it("labels a personal salary question clearly and sends a relevant acknowledgement", async () => {
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
        email: "personal-salary@example.com",
        briefType: "Personal salary sense-check",
        message: "I would like to discuss my current package privately.",
        privacyNoticeAcknowledgement: "yes",
        sourcePage:
          "/insights/manchester-north-west-marketing-salary-guide-2026",
        startedAt: now - minimumCompletionTimeMs - 500,
      },
      { ip: "personal-salary-enquiry", now },
    );

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const adminEmail = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body),
    ) as { subject: string; text: string };
    const confirmation = JSON.parse(
      String(fetchMock.mock.calls[1]?.[1]?.body),
    ) as { subject: string; text: string };
    expect(adminEmail.subject).toBe(
      "Essential Resourcing | Personal salary sense-check from David Walsh",
    );
    expect(adminEmail.text).toContain("Route: Personal salary question");
    expect(adminEmail.text).toContain(
      "do not add to the talent pool without separate consent",
    );
    expect(adminEmail.text).toContain(
      "Source page: https://essentialresourcing.co.uk/insights/manchester-north-west-marketing-salary-guide-2026",
    );
    expect(confirmation.subject).toBe("We've received your salary question");
    expect(confirmation.text).toContain("does not add you to a talent pool");
    expect(confirmation.text).not.toContain("current package privately");
    expect(confirmation.text).not.toContain("possible fit");
  });

  it("labels a hiring salary question without sending a candidate acknowledgement", async () => {
    process.env.RESEND_API_KEY = "test_resend_key";
    process.env.CONTACT_TO_EMAIL = "david@example.com";
    delete process.env.OPERATIONS_DB_ENABLED;
    delete process.env.DATABASE_URL;

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const now = Date.now();
    const result = await submitContactEnquiry(
      {
        ...basePayload,
        email: "hiring-salary@example.com",
        briefType: "Hiring salary sense-check",
        sourcePage: "/contact",
        startedAt: now - minimumCompletionTimeMs - 500,
      },
      { ip: "hiring-salary-enquiry", now },
    );

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const adminEmail = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body),
    ) as { subject: string; text: string };
    expect(adminEmail.subject).toBe(
      "Essential Resourcing | Hiring salary sense-check from David Walsh",
    );
    expect(adminEmail.text).toContain("Route: client");
    expect(adminEmail.text).toContain(
      "Source page: https://essentialresourcing.co.uk/contact",
    );
  });
});
