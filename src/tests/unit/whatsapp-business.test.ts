import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { contactFormSchema } from "@/validations/contact";
import {
  getWhatsAppBusinessStatus,
  sendWhatsAppBusinessConfirmation,
  shouldSendWhatsAppBusinessMessage,
} from "@/lib/whatsapp-business/client";
import {
  verifyMetaSignature,
  verifyWhatsAppWebhookChallenge,
} from "@/lib/whatsapp-business/webhook";

vi.mock("server-only", () => ({}));

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const payload = contactFormSchema.parse({
  type: "job",
  name: "Candidate Name",
  email: "candidate@example.com",
  phone: "+44 7824 514296",
  preferredContactMethod: "whatsapp",
  linkedin: "https://www.linkedin.com/in/example",
  briefType: "Job application",
  message: "I would like to apply for this role.",
  consent: "yes",
  startedAt: Date.now() - 5000,
  jobTitle: "Marketing Director",
});

describe("whatsapp business cloud api", () => {
  it("is disabled safely by default", async () => {
    delete process.env.WHATSAPP_BUSINESS_ENABLED;

    expect(getWhatsAppBusinessStatus()).toMatchObject({
      enabled: false,
      configured: false,
      state: "disabled",
    });

    await expect(sendWhatsAppBusinessConfirmation(payload)).resolves.toMatchObject({
      ok: true,
      skipped: true,
      reason: "disabled",
    });
  });

  it("requires explicit WhatsApp preference and a valid phone number", () => {
    expect(shouldSendWhatsAppBusinessMessage(payload)).toBe(true);
    expect(
      shouldSendWhatsAppBusinessMessage({
        ...payload,
        preferredContactMethod: "email",
      }),
    ).toBe(false);
  });

  it("sends an approved-template payload server side when configured", async () => {
    process.env.WHATSAPP_BUSINESS_ENABLED = "true";
    process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID = "123456789";
    process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN = "test-token";
    process.env.WHATSAPP_BUSINESS_API_VERSION = "v23.0";
    process.env.WHATSAPP_BUSINESS_TEMPLATE_LANGUAGE = "en_GB";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [{ id: "wamid.test" }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendWhatsAppBusinessConfirmation(payload)).resolves.toMatchObject({
      ok: true,
      skipped: false,
      messageId: "wamid.test",
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/123456789/messages");
    expect(String(url)).not.toContain("test-token");
    expect(String(init?.body)).not.toContain("test-token");

    const body = JSON.parse(String(init?.body)) as {
      to: string;
      type: string;
      template: { name: string; components: Array<{ parameters: unknown[] }> };
    };

    expect(body).toMatchObject({
      to: "447824514296",
      type: "template",
    });
    expect(body.template.name).toBe("candidate_application_received");
    expect(body.template.components[0]?.parameters).toHaveLength(2);
  });

  it("verifies webhook challenge and Meta signatures", () => {
    process.env.WHATSAPP_BUSINESS_VERIFY_TOKEN = "verify-me";

    expect(
      verifyWhatsAppWebhookChallenge({
        mode: "subscribe",
        token: "verify-me",
        challenge: "12345",
      }),
    ).toBe("12345");

    const rawBody = JSON.stringify({ entry: [] });
    const appSecret = "app-secret";
    const signature = `sha256=${createHmac("sha256", appSecret)
      .update(rawBody)
      .digest("hex")}`;

    expect(verifyMetaSignature({ rawBody, signature, appSecret })).toBe(true);
    expect(verifyMetaSignature({ rawBody, signature: "sha256=bad", appSecret }))
      .toBe(false);
  });
});
