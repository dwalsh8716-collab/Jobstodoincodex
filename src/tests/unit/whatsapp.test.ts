import { describe, expect, it } from "vitest";
import {
  buildWhatsAppUrl,
  candidateJobWhatsAppMessage,
  normaliseWhatsAppNumber,
  whatsAppMessageForIntent,
} from "@/lib/whatsapp";

describe("whatsapp utilities", () => {
  it("normalises an international WhatsApp number to digits only", () => {
    expect(normaliseWhatsAppNumber("+44 7824 514296")).toBe("447824514296");
  });

  it("builds a wa.me URL with an encoded default message", () => {
    expect(
      buildWhatsAppUrl({
        number: "447824514296",
        message: "Hi David, I'm hiring.",
      }),
    ).toBe("https://wa.me/447824514296?text=Hi%20David%2C%20I'm%20hiring.");
  });

  it("returns an empty URL when no valid number is configured", () => {
    expect(buildWhatsAppUrl({ number: "", message: "Hi" })).toBe("");
    expect(buildWhatsAppUrl({ number: "abc", message: "Hi" })).toBe("");
  });

  it("uses context-specific messages", () => {
    expect(whatsAppMessageForIntent("strategicInterim")).toContain(
      "strategic interim",
    );
  });

  it("builds candidate job question messages with role context", () => {
    expect(
      candidateJobWhatsAppMessage({
        jobTitle: "Marketing Director",
        jobSlug: "marketing-director",
      }),
    ).toBe(
      "Hi David, I've got a quick question about the Marketing Director role on Essential Resourcing. Job ref: marketing-director.",
    );
  });
});
