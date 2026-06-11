import "server-only";

import { getOperationsBackendStatus } from "@/lib/operations/database";
import { getWhatsAppBusinessStatus } from "@/lib/whatsapp-business/client";

export const whatsAppCrmSyncRoute = "/admin/recruiter-labs/whatsapp-crm-sync";

export const whatsAppCrmSyncFeatureFlags = [
  "FEATURE_WHATSAPP_CRM_SYNC",
  "FEATURE_LOXO_INTEGRATION",
  "FEATURE_WHATSAPP_MESSAGE_LOGGING",
  "FEATURE_WHATSAPP_LOGISTICS_AUTOMATION",
] as const;

export type WhatsAppCrmSyncFeatureFlag =
  (typeof whatsAppCrmSyncFeatureFlags)[number];

export const whatsAppCrmAllowedMessageTypes = [
  "Interview time confirmation",
  "Address or Google Meet link once approved for WhatsApp",
  "Reminder 24 hours before an interview",
  "Reminder 1 hour before an interview",
  "Availability check",
  "Reschedule request",
  "Document reminder",
  "Application received acknowledgement",
  "David has sent you an email",
  "Can you confirm availability?",
] as const;

export const whatsAppCrmBannedMessageTypes = [
  "Rejection",
  "Offer withdrawal",
  "Difficult feedback",
  "Sensitive salary negotiation",
  "Disciplinary or sensitive matters",
  "Bulk job broadcast",
  "Speculative marketing campaign",
  "Anything that should be a phone call",
] as const;

export const whatsAppCrmOperatingPrinciples = [
  "WhatsApp is for logistics and process acceleration.",
  "Negative news starts with a human phone call, not a WhatsApp template.",
  "Loxo remains the candidate CRM source of truth unless David explicitly changes that.",
  "Postgres stores only sync metadata, consent state and audit references by default.",
  "Sanity must not store candidate messages, phone numbers or communication logs.",
  "No personal WhatsApp scraping. No marketing broadcast workflow. No secrets in GitHub.",
] as const;

export const loxoSupportQuestions = [
  "Does my Loxo plan include Open API access?",
  "Can I create candidate/person activities or notes via API?",
  "Can I search people by phone number or email via API?",
  "Can custom fields store WhatsApp consent and contact preference?",
  "Does Loxo support webhooks for person and person_event changes?",
  "Does Loxo have a native WhatsApp Business integration?",
  "Which WhatsApp/SMS partners does Loxo officially support for my plan?",
  "Can message history or message metadata be synced to candidate records?",
  "Do you support shared inbox workflows for recruiters?",
  "Is there a sandbox or test API environment?",
  "What OAuth, bearer-token or API-key authentication method is used?",
  "What rate limits apply?",
  "Can API permissions be restricted to people, events, phones and webhooks?",
  "Do you provide GDPR, DPA and subprocessor documentation for integrations?",
] as const;

export type WhatsAppCrmProviderStatus =
  | "preferred_discovery"
  | "worth_shortlisting"
  | "possible"
  | "hold"
  | "blocked";

export type WhatsAppCrmProviderOption = {
  name: string;
  route: "loxo_marketplace" | "official_provider" | "automation_layer";
  status: WhatsAppCrmProviderStatus;
  finding: string;
  strengths: readonly string[];
  concerns: readonly string[];
  evidenceUrl: string;
};

export const whatsAppCrmProviderOptions: readonly WhatsAppCrmProviderOption[] =
  [
    {
      name: "Loxo marketplace - Ringover",
      route: "loxo_marketplace",
      status: "preferred_discovery",
      finding:
        "Loxo lists Ringover as a marketplace communication partner covering calls, video, SMS, WhatsApp, summaries and activity inside Loxo.",
      strengths: [
        "Loxo-facing workflow before custom code",
        "Shared communications product rather than personal WhatsApp",
        "Likely lower implementation risk if David's Loxo plan supports it",
      ],
      concerns: [
        "Needs David/Loxo confirmation on plan, pricing, DPA and WhatsApp Business setup",
        "Needs proof of export, deletion and candidate opt-out handling",
      ],
      evidenceUrl: "https://www.loxo.co/loxo-marketplace",
    },
    {
      name: "Loxo marketplace - TalentLynk",
      route: "loxo_marketplace",
      status: "preferred_discovery",
      finding:
        "Loxo lists TalentLynk as a way to start calls and messages on WhatsApp, SMS or email from a Loxo contact page, with communication activity synced.",
      strengths: [
        "Directly aligned to the Loxo source-of-truth principle",
        "Could avoid building a parallel message inbox",
        "Worth asking Loxo about before any custom build",
      ],
      concerns: [
        "Public marketplace copy is not a contract or security review",
        "Needs UK/EU data processing, retention and permissions review",
      ],
      evidenceUrl: "https://www.loxo.co/loxo-marketplace",
    },
    {
      name: "Loxo marketplace - Payemoji",
      route: "loxo_marketplace",
      status: "hold",
      finding:
        "Loxo lists Payemoji for targeted or bulk WhatsApp messages and conversational AI. Useful to review, but not the first recommendation for Essential Resourcing because bulk job alerts are explicitly out of scope.",
      strengths: [
        "Visible Loxo marketplace presence",
        "WhatsApp-specific recruitment messaging angle",
      ],
      concerns: [
        "Bulk/targeted messaging can drift into spam quickly",
        "Do not choose it just because it was mentioned",
        "Needs separate marketing-consent, template and opt-out review before any use",
      ],
      evidenceUrl: "https://www.loxo.co/loxo-marketplace",
    },
    {
      name: "Meta WhatsApp Business Cloud API direct",
      route: "official_provider",
      status: "possible",
      finding:
        "The current site already stages direct Cloud API sends and signed webhooks. Direct Cloud API remains viable only if Loxo write-back and operational ownership are clear.",
      strengths: [
        "Official WhatsApp Business path",
        "Maximum control over consent gates, templates and metadata-only storage",
      ],
      concerns: [
        "Highest internal ownership burden",
        "Requires Meta app, templates, webhook security, monitoring and support",
        "Still needs a Loxo write-back decision",
      ],
      evidenceUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api",
    },
    {
      name: "Twilio WhatsApp",
      route: "official_provider",
      status: "worth_shortlisting",
      finding:
        "Twilio supports WhatsApp senders, sandbox testing, one-way notifications and two-way conversational messaging through its messaging APIs.",
      strengths: [
        "Mature developer tooling",
        "Sandbox route for prototype testing",
        "Good fit if custom sync layer is approved later",
      ],
      concerns: [
        "Does not remove the need for Loxo API write-back",
        "Provider DPA, pricing and UK/EU processing need review",
      ],
      evidenceUrl: "https://www.twilio.com/docs/whatsapp",
    },
    {
      name: "Bird",
      route: "official_provider",
      status: "possible",
      finding:
        "Bird is a mainstream WhatsApp Business messaging provider to compare if marketplace options fail.",
      strengths: [
        "Established omnichannel messaging provider",
        "Likely webhook and template support",
      ],
      concerns: [
        "No Loxo-specific proof found in this pass",
        "Needs DPA, data residency and implementation review",
      ],
      evidenceUrl: "https://developers.bird.com",
    },
    {
      name: "Infobip",
      route: "official_provider",
      status: "possible",
      finding:
        "Infobip is a mainstream WhatsApp Business provider to compare if Loxo marketplace options do not work.",
      strengths: [
        "Established enterprise messaging provider",
        "Likely shared inbox, templates and webhook coverage",
      ],
      concerns: [
        "No Loxo-specific proof found in this pass",
        "May be more platform than David needs",
      ],
      evidenceUrl: "https://www.infobip.com/docs/whatsapp",
    },
    {
      name: "Zapier / Make",
      route: "automation_layer",
      status: "hold",
      finding:
        "Automation tools may help with a quick proof of concept, but they can create weak data boundaries if message payloads are copied around without discipline.",
      strengths: [
        "Fast to test non-sensitive metadata flows",
        "Useful for discovery if Loxo exposes the needed triggers/actions",
      ],
      concerns: [
        "Cloud automation logs can become an uncontrolled candidate-data store",
        "Not suitable for raw WhatsApp message bodies without a full privacy review",
      ],
      evidenceUrl: "https://zapier.com/apps/loxo/integrations",
    },
    {
      name: "WatBox / Stitch AI",
      route: "automation_layer",
      status: "blocked",
      finding:
        "Named as discovery candidates only. No reliable public Loxo-specific evidence was confirmed in this pass, so they should not be shortlisted without vendor proof.",
      strengths: [
        "Worth asking about only if David already has a relationship",
      ],
      concerns: [
        "No verified Loxo compatibility from public docs in this pass",
        "Do not build around them without API, DPA and security evidence",
      ],
      evidenceUrl: "https://www.loxo.co/loxo-marketplace",
    },
  ];

export const loxoApiEvidence = [
  {
    label: "Loxo Open API",
    detail:
      "Public docs state all endpoints use bearer token authentication and API keys are generated in Loxo settings.",
    url: "https://loxo.readme.io/reference/loxo-api.md",
  },
  {
    label: "People search",
    detail:
      "The people index endpoint supports a query parameter, which is the safest starting point for phone/email lookup validation.",
    url: "https://loxo.readme.io/reference/peopleindex.md",
  },
  {
    label: "Person events",
    detail:
      "The person_events create endpoint can create notes/activity against a person, including person_id, job_id and notes fields.",
    url: "https://loxo.readme.io/reference/person_eventscreate.md",
  },
  {
    label: "SMS opt-ins",
    detail:
      "The person SMS opt-in endpoint exposes opt-in and normalized phone number fields.",
    url: "https://loxo.readme.io/reference/person_sms_opt_inscreate.md",
  },
  {
    label: "Webhooks",
    detail:
      "The webhook endpoint supports candidate, person and person_event create/update/destroy event types.",
    url: "https://loxo.readme.io/reference/webhookscreate.md",
  },
  {
    label: "SMS",
    detail:
      "The SMS create endpoint exists in Loxo's API, but WhatsApp support should still be confirmed through Loxo or a marketplace partner.",
    url: "https://loxo.readme.io/reference/smscreate.md",
  },
] as const;

export type WhatsAppCrmTimelineEvent = {
  id: string;
  label: string;
  channel: "website" | "whatsapp" | "loxo" | "postgres" | "manual";
  status: "mock_only" | "blocked" | "future";
  detail: string;
};

export const mockWhatsAppCrmTimeline: readonly WhatsAppCrmTimelineEvent[] = [
  {
    id: "sample-consent",
    label: "Candidate contact preference captured",
    channel: "website",
    status: "mock_only",
    detail:
      "Sample candidate chooses WhatsApp for interview logistics. No real phone number is shown.",
  },
  {
    id: "sample-webhook",
    label: "Inbound WhatsApp webhook received",
    channel: "whatsapp",
    status: "future",
    detail:
      "Future webhook stores provider ID, direction, status and phone hash only. No message body.",
  },
  {
    id: "sample-match",
    label: "Candidate match requires one exact private match",
    channel: "postgres",
    status: "future",
    detail:
      "If zero or multiple matches are found, the event stays unmatched and needs David review.",
  },
  {
    id: "sample-loxo-event",
    label: "Loxo activity write-back",
    channel: "loxo",
    status: "blocked",
    detail:
      "Blocked until David confirms Loxo API access, permissions, DPA and safe activity-note format.",
  },
  {
    id: "sample-human-rule",
    label: "Negative news rule",
    channel: "manual",
    status: "mock_only",
    detail:
      "Rejections, offer withdrawals and difficult feedback stay as phone-call-first work.",
  },
] as const;

export function getWhatsAppCrmSyncDiscoveryStatus(
  env: Record<string, string | undefined> = process.env,
) {
  const flagStates = whatsAppCrmSyncFeatureFlags.map((name) => ({
    name,
    enabled: env[name] === "true",
  }));
  const whatsappStatus = getWhatsAppBusinessStatus(env);
  const databaseStatus = getOperationsBackendStatus();
  const loxoConfigured = Boolean(
    env.LOXO_AGENCY_SLUG && env.LOXO_API_BASE_URL && env.LOXO_API_TOKEN,
  );

  return {
    route: whatsAppCrmSyncRoute,
    flagStates,
    enabledFlags: flagStates.filter((flag) => flag.enabled).length,
    databaseStatus,
    whatsappStatus,
    loxoConfigured,
    canShowPrivatePrototype: true,
    canSendRealWhatsAppMessages: false,
    canSyncToLoxo: false,
    productionReadiness: "discovery_only" as const,
    recommendedFirstStep:
      "Ask Loxo whether Ringover, TalentLynk or a native communication option can satisfy WhatsApp logging before building a custom sync layer.",
    message:
      "Private discovery only. No real WhatsApp CRM sync, no Loxo calls and no message bodies are enabled.",
  };
}
