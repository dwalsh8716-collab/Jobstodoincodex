import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { shouldSendWhatsAppBusinessMessage } from "@/lib/whatsapp-business/client";
import { candidateJobWhatsAppMessage } from "@/lib/whatsapp";
import {
  contactFormSchema,
  minimumCompletionTimeMs,
} from "@/validations/contact";

vi.mock("server-only", () => ({}));

const candidateWhatsAppPayload = {
  type: "job",
  name: "Candidate Name",
  email: "candidate@example.com",
  phone: "+44 7824 514296",
  preferredContactMethod: "whatsapp",
  linkedin: "https://www.linkedin.com/in/example",
  briefType: "Job application",
  message: "I have a quick question about this role before applying.",
  consent: "yes",
  privacyNoticeAcknowledgement: "yes",
  whatsappContactConsent: "yes",
  startedAt: Date.now() - minimumCompletionTimeMs - 500,
  jobTitle: "Marketing Director",
  jobSlug: "marketing-director",
} as const;

describe("candidate WhatsApp preferences", () => {
  it("requires explicit WhatsApp consent before candidate WhatsApp Business sends", () => {
    const valid = contactFormSchema.parse(candidateWhatsAppPayload);
    const missingWhatsAppConsent = contactFormSchema.safeParse({
      ...candidateWhatsAppPayload,
      whatsappContactConsent: undefined,
    });

    expect(missingWhatsAppConsent.success).toBe(false);
    expect(shouldSendWhatsAppBusinessMessage(valid)).toBe(true);
    expect(
      shouldSendWhatsAppBusinessMessage({
        ...valid,
        whatsappContactConsent: undefined,
      }),
    ).toBe(false);
  });

  it("builds a user-initiated job WhatsApp message with title and slug context", () => {
    expect(
      candidateJobWhatsAppMessage({
        jobTitle: "Marketing Director",
        jobSlug: "marketing-director",
      }),
    ).toBe(
      "Hi David, I've got a quick question about the Marketing Director role on Essential Resourcing. Job ref: marketing-director.",
    );
  });

  it("keeps the candidate form direct, non-pushy and consent-led", () => {
    const form = readFileSync("src/components/ContactForm.tsx", "utf8");
    const jobPage = readFileSync("app/jobs/[slug]/page.tsx", "utf8");

    expect(form).toContain('name="whatsappContactConsent"');
    expect(form).toContain("No broadcasts");
    expect(form).toContain("How would you prefer David to contact you");
    expect(jobPage).toContain("candidateJobWhatsAppMessage");
    expect(jobPage).toContain("Book a quick call");
    expect(jobPage).not.toContain(
      "Quick question about this role? WhatsApp David",
    );
  });

  it("stages private contact-preference fields for enquiries and applications", () => {
    const migration = readFileSync(
      "database/migrations/026_candidate_communication_preferences.sql",
      "utf8",
    );
    const store = readFileSync("src/lib/operations/store.ts", "utf8");

    expect(migration).toContain("whatsapp_contact_consent");
    expect(migration).toContain("phone_contact_consent");
    expect(migration).toContain("email_contact_consent");
    expect(migration).toContain("communication_notes");
    expect(migration).toContain(
      "whatsapp_contact_consent = false or preferred_contact_method = 'whatsapp'",
    );
    expect(store).toContain("contactPreferenceRecord");
    expect(store).toContain("No broadcasts or marketing list consent implied.");
  });

  it("documents the privacy boundary and no-spam rule", () => {
    const docs = readFileSync(
      "docs/recruiter-labs-candidate-whatsapp-preferences.md",
      "utf8",
    );
    const readme = readFileSync("README.md", "utf8");
    const dataJourney = readFileSync("docs/candidate-data-journey.md", "utf8");

    expect(docs).toContain("No bulk WhatsApp broadcasts");
    expect(docs).toContain("not marketing consent");
    expect(docs).toContain("not legal advice");
    expect(readme).toContain(
      "docs/recruiter-labs-candidate-whatsapp-preferences.md",
    );
    expect(dataJourney).toContain("explicit WhatsApp reply consent");
  });
});
