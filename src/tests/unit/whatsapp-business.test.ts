import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { contactFormSchema } from "@/validations/contact";
import {
  getWhatsAppBusinessStatus,
  sendWhatsAppBusinessConfirmation,
  shouldSendWhatsAppBusinessMessage,
} from "@/lib/whatsapp-business/client";
import {
  getWhatsAppCustomerServiceWindow,
  parseWhatsAppWebhookPayload,
  processWhatsAppWebhookPayload,
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
  privacyNoticeAcknowledgement: "yes",
  startedAt: Date.now() - 5000,
  jobTitle: "Marketing Director",
  jobSlug: "marketing-director",
});

describe("whatsapp business cloud api", () => {
  it("is disabled safely by default", async () => {
    delete process.env.WHATSAPP_BUSINESS_ENABLED;

    expect(getWhatsAppBusinessStatus()).toMatchObject({
      enabled: false,
      configured: false,
      state: "disabled",
    });

    await expect(
      sendWhatsAppBusinessConfirmation(payload),
    ).resolves.toMatchObject({
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

    await expect(
      sendWhatsAppBusinessConfirmation(payload),
    ).resolves.toMatchObject({
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
    expect(
      verifyMetaSignature({ rawBody, signature: "sha256=bad", appSecret }),
    ).toBe(false);
  });

  it("parses inbound webhook events without keeping WhatsApp message bodies", () => {
    process.env.OPERATIONS_PRIVACY_SALT = "privacy-salt";

    const parsed = parseWhatsAppWebhookPayload(
      {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: "+44 7824 514296",
                      id: "wamid.inbound",
                      timestamp: "1781161200",
                      type: "text",
                      text: {
                        body: "This private WhatsApp message must not be stored.",
                      },
                    },
                  ],
                  statuses: [
                    {
                      id: "wamid.outbound",
                      status: "delivered",
                      timestamp: "1781161260",
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      new Date("2026-06-11T12:00:00.000Z"),
    );

    expect(parsed.incomingMessages).toHaveLength(1);
    expect(parsed.statuses).toHaveLength(1);
    expect(parsed.incomingMessages[0]).toMatchObject({
      providerMessageId: "wamid.inbound",
      messageType: "text",
      hasText: true,
      responsePolicy: "freeform_allowed",
    });
    expect(parsed.incomingMessages[0]?.fromPhoneHash).toMatch(/^[a-f0-9]{64}$/);
    expect(parsed.statuses[0]).toMatchObject({
      providerMessageId: "wamid.outbound",
      status: "delivered",
    });
    expect(JSON.stringify(parsed)).not.toContain("private WhatsApp message");
  });

  it("marks replies outside the WhatsApp 24-hour window as template-only", () => {
    const receivedAt = new Date("2026-06-11T08:00:00.000Z");

    expect(
      getWhatsAppCustomerServiceWindow(
        receivedAt,
        new Date("2026-06-12T07:59:00.000Z"),
      ),
    ).toMatchObject({
      canReplyWithFreeform: true,
      responsePolicy: "freeform_allowed",
    });

    expect(
      getWhatsAppCustomerServiceWindow(
        receivedAt,
        new Date("2026-06-12T08:01:00.000Z"),
      ),
    ).toMatchObject({
      canReplyWithFreeform: false,
      responsePolicy: "approved_template_required",
    });
  });

  it("keeps CRM sync disabled until the explicit server-side flag is enabled", async () => {
    delete process.env.FEATURE_WHATSAPP_CRM_SYNC;

    await expect(
      processWhatsAppWebhookPayload({
        entry: [
          {
            changes: [{ value: { messages: [{ id: "wamid.test" }] } }],
          },
        ],
      }),
    ).resolves.toMatchObject({
      ok: true,
      enabled: false,
      attempted: false,
      reason: "feature_disabled",
    });
  });

  it("requires Meta app secret before live CRM sync can run", async () => {
    process.env.FEATURE_WHATSAPP_CRM_SYNC = "true";
    process.env.WHATSAPP_BUSINESS_ENABLED = "true";
    delete process.env.WHATSAPP_BUSINESS_APP_SECRET;

    await expect(
      processWhatsAppWebhookPayload({ entry: [] }),
    ).resolves.toMatchObject({
      ok: false,
      enabled: true,
      attempted: false,
      reason: "missing_app_secret",
    });
  });

  it("keeps the CRM sync migration metadata-only", () => {
    const migration = readFileSync(
      "database/migrations/014_whatsapp_crm_sync.sql",
      "utf8",
    );

    expect(migration).toContain("customer_service_window_expires_at");
    expect(migration).toContain("matched_candidate_id");
    expect(migration).toContain("'received'");
    expect(migration).not.toMatch(/message_body|raw_message|message_text/i);
  });
});
