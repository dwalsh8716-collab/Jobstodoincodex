import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  getWhatsAppCrmSyncDiscoveryStatus,
  loxoApiEvidence,
  loxoSupportQuestions,
  mockWhatsAppCrmTimeline,
  whatsAppCrmAllowedMessageTypes,
  whatsAppCrmBannedMessageTypes,
  whatsAppCrmOperatingPrinciples,
  whatsAppCrmProviderOptions,
  whatsAppCrmSyncFeatureFlags,
} from "@/lib/recruiter-labs-whatsapp-crm-sync";

vi.mock("server-only", () => ({}));

describe("WhatsApp CRM sync discovery", () => {
  it("keeps the Loxo sync discovery private and blocked for production", () => {
    expect(getWhatsAppCrmSyncDiscoveryStatus({})).toMatchObject({
      route: "/admin/recruiter-labs/whatsapp-crm-sync",
      enabledFlags: 0,
      canShowPrivatePrototype: true,
      canSendRealWhatsAppMessages: false,
      canSyncToLoxo: false,
      productionReadiness: "discovery_only",
    });

    expect(
      getWhatsAppCrmSyncDiscoveryStatus({
        FEATURE_WHATSAPP_CRM_SYNC: "true",
        FEATURE_LOXO_INTEGRATION: "true",
        FEATURE_WHATSAPP_MESSAGE_LOGGING: "true",
        FEATURE_WHATSAPP_LOGISTICS_AUTOMATION: "true",
        WHATSAPP_BUSINESS_ENABLED: "true",
        WHATSAPP_BUSINESS_PHONE_NUMBER_ID: "123",
        WHATSAPP_BUSINESS_ACCESS_TOKEN: "token",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
        LOXO_API_BASE_URL: "https://app.loxo.co/api",
        LOXO_AGENCY_SLUG: "example",
        LOXO_API_TOKEN: "token",
      }),
    ).toMatchObject({
      enabledFlags: 4,
      loxoConfigured: true,
      canSendRealWhatsAppMessages: false,
      canSyncToLoxo: false,
      productionReadiness: "discovery_only",
    });
  });

  it("documents the marketplace-first recommendation without forcing a vendor", () => {
    expect(whatsAppCrmSyncFeatureFlags).toEqual([
      "FEATURE_WHATSAPP_CRM_SYNC",
      "FEATURE_LOXO_INTEGRATION",
      "FEATURE_WHATSAPP_MESSAGE_LOGGING",
      "FEATURE_WHATSAPP_LOGISTICS_AUTOMATION",
    ]);

    const providers = new Map(
      whatsAppCrmProviderOptions.map((provider) => [
        provider.name,
        provider.status,
      ]),
    );

    expect(providers.get("Loxo marketplace - Ringover")).toBe(
      "preferred_discovery",
    );
    expect(providers.get("Loxo marketplace - TalentLynk")).toBe(
      "preferred_discovery",
    );
    expect(providers.get("Loxo marketplace - Payemoji")).toBe("hold");
    expect(providers.get("Twilio WhatsApp")).toBe("worth_shortlisting");
    expect(providers.get("WatBox / Stitch AI")).toBe("blocked");

    expect(JSON.stringify(whatsAppCrmProviderOptions)).toContain(
      "Do not choose it just because it was mentioned",
    );
  });

  it("keeps the WhatsApp operating policy logistics-only", () => {
    expect(whatsAppCrmAllowedMessageTypes).toContain("Availability check");
    expect(whatsAppCrmAllowedMessageTypes.join(" ")).toContain(
      "David has sent you an email",
    );
    expect(whatsAppCrmBannedMessageTypes).toContain("Rejection");
    expect(whatsAppCrmBannedMessageTypes).toContain("Bulk job broadcast");
    expect(whatsAppCrmOperatingPrinciples.join(" ")).toContain(
      "Loxo remains the candidate CRM source of truth",
    );
  });

  it("uses fake timeline data and no raw WhatsApp message bodies", () => {
    expect(mockWhatsAppCrmTimeline).toHaveLength(5);
    expect(JSON.stringify(mockWhatsAppCrmTimeline)).toContain(
      "No message body",
    );
    expect(JSON.stringify(mockWhatsAppCrmTimeline)).not.toMatch(
      /447824514296|candidate@example\.com/i,
    );
  });

  it("stages a metadata-only schema for conversations, sync events and preferences", () => {
    const migration = readFileSync(
      "database/migrations/025_whatsapp_loxo_crm_discovery.sql",
      "utf8",
    );

    expect(migration).toContain(
      "create table if not exists whatsapp_conversations",
    );
    expect(migration).toContain("phone_hash");
    expect(migration).toContain("create table if not exists crm_sync_events");
    expect(migration).toContain(
      "create table if not exists candidate_communication_preferences",
    );
    expect(migration).toContain("whatsapp_opt_out_at");
    expect(migration).toContain("redaction_policy");
    expect(migration).not.toMatch(/raw_message|message_body|message_text/i);
  });

  it("documents Loxo evidence and David's support checklist", () => {
    expect(loxoApiEvidence.map((item) => item.label)).toEqual([
      "Loxo Open API",
      "People search",
      "Person events",
      "SMS opt-ins",
      "Webhooks",
      "SMS",
    ]);
    expect(loxoSupportQuestions).toHaveLength(14);
    expect(loxoSupportQuestions.join(" ")).toContain(
      "Does my Loxo plan include Open API access?",
    );
  });

  it("keeps the private admin route noindexed and documentation blunt", () => {
    const page = readFileSync(
      "app/admin/recruiter-labs/whatsapp-crm-sync/page.tsx",
      "utf8",
    );
    const doc = readFileSync(
      "docs/recruiter-labs-whatsapp-crm-sync.md",
      "utf8",
    );
    const readme = readFileSync("README.md", "utf8");
    const dataBoundaries = readFileSync("docs/data-boundaries.md", "utf8");

    expect(page).toContain("isCmsSessionValid");
    expect(page).toContain("index: false");
    expect(page).toContain("No live sync");
    expect(doc).toContain("## Production Readiness");
    expect(doc).toContain("Not ready.");
    expect(doc).toContain("Negative news starts with a human phone call.");
    expect(doc).toContain("No bulk spam.");
    expect(readme).toContain("docs/recruiter-labs-whatsapp-crm-sync.md");
    expect(dataBoundaries).toContain("WhatsApp/Loxo sync metadata");
  });
});
