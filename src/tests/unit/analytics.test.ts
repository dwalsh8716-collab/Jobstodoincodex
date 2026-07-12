import { describe, expect, it, vi } from "vitest";
import {
  analyticsAttributes,
  analyticsConsentStorageKey,
  analyticsParamsFromElement,
  consentModeStateFromPreferences,
  shouldRenderAnalyticsForPath,
  trackEvent,
} from "@/lib/analytics";

function createLocalStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  };
}

describe("analytics utility", () => {
  it("maps rejected preferences to privacy-first Consent Mode V2 defaults", () => {
    expect(
      consentModeStateFromPreferences({ analytics: false, marketing: false }),
    ).toMatchObject({
      ad_storage: "denied",
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });

  it("maps accepted preferences to analytics and advertising consent", () => {
    expect(
      consentModeStateFromPreferences({ analytics: true, marketing: true }),
    ).toMatchObject({
      ad_storage: "granted",
      analytics_storage: "granted",
      personalization_storage: "granted",
      security_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  });

  it("keeps analytics off private and sensitive routes", () => {
    expect(shouldRenderAnalyticsForPath("/admin/recruiter-labs")).toBe(false);
    expect(shouldRenderAnalyticsForPath("/cms")).toBe(false);
    expect(shouldRenderAnalyticsForPath("/studio/structure")).toBe(false);
    expect(
      shouldRenderAnalyticsForPath("/candidate/interim-availability/token"),
    ).toBe(false);
    expect(shouldRenderAnalyticsForPath("/candidate-privacy/request")).toBe(
      false,
    );
    expect(shouldRenderAnalyticsForPath("/client/shortlist/token")).toBe(false);
    expect(shouldRenderAnalyticsForPath("/recruiter-labs")).toBe(false);
  });

  it("keeps analytics available on public commercial pages", () => {
    expect(shouldRenderAnalyticsForPath("/")).toBe(true);
    expect(shouldRenderAnalyticsForPath("/services/leadership-search")).toBe(
      true,
    );
    expect(shouldRenderAnalyticsForPath("/contact")).toBe(true);
    expect(shouldRenderAnalyticsForPath("/candidates")).toBe(true);
  });

  it("creates safe data attributes for delegated CTA tracking", () => {
    const attrs = analyticsAttributes("cta_click", {
      label: "Talk to David",
      href: "/contact",
      location: "header",
    });

    expect(attrs).toEqual({
      "data-analytics-event": "cta_click",
      "data-analytics-label": "Talk to David",
      "data-analytics-href": "/contact",
      "data-analytics-location": "header",
    });
  });

  it("creates safe data attributes for LinkedIn tracking", () => {
    const attrs = analyticsAttributes("linkedin_click", {
      label: "David on LinkedIn",
      href: "https://www.linkedin.com/in/example",
      location: "footer",
      destination: "linkedin_profile",
      profile_type: "founder",
    });

    expect(attrs).toMatchObject({
      "data-analytics-event": "linkedin_click",
      "data-analytics-label": "David on LinkedIn",
      "data-analytics-href": "https://www.linkedin.com/in/example",
      "data-analytics-location": "footer",
      "data-analytics-destination": "linkedin_profile",
      "data-analytics-profile-type": "founder",
    });
  });

  it("creates safe data attributes for booking tracking", () => {
    const attrs = analyticsAttributes("booking_click", {
      label: "Book a 15-minute call",
      href: "/book-a-call",
      location: "contact_page",
      booking_type: "google_calendar",
    });

    expect(attrs).toMatchObject({
      "data-analytics-event": "booking_click",
      "data-analytics-label": "Book a 15-minute call",
      "data-analytics-href": "/book-a-call",
      "data-analytics-location": "contact_page",
      "data-analytics-booking-type": "google_calendar",
    });
  });

  it("creates safe data attributes for salary guide conversions", () => {
    const attrs = analyticsAttributes("salary_guide_lead", {
      form_type: "salary_guide",
      guide_slug: "senior-marketing-salary-guide",
    });

    expect(attrs).toMatchObject({
      "data-analytics-event": "salary_guide_lead",
      "data-analytics-form-type": "salary_guide",
      "data-analytics-guide-slug": "senior-marketing-salary-guide",
    });
  });

  it("reads analytics params from an element", () => {
    const element = {
      getAttribute: (name: string) =>
        ({
          "data-analytics-label": "Email David",
          "data-analytics-href": "mailto:david@example.com",
        })[name] ?? null,
    } as HTMLElement;

    expect(analyticsParamsFromElement(element)).toEqual({
      label: "Email David",
      href: "mailto:david@example.com",
    });
  });

  it("does not queue events without consent", () => {
    const dataLayer: unknown[] = [];
    vi.stubGlobal("window", {
      localStorage: createLocalStorage(),
      dataLayer,
    });

    trackEvent("cta_click", { label: "Talk to David" });

    expect(dataLayer).toHaveLength(0);
    vi.unstubAllGlobals();
  });

  it("queues safe events after consent", () => {
    const dataLayer: unknown[] = [];
    const gtag = vi.fn();
    vi.stubGlobal("window", {
      localStorage: createLocalStorage({
        [analyticsConsentStorageKey]: "granted",
      }),
      dataLayer,
      gtag,
    });

    trackEvent("form_error", { form_type: "client" });

    expect(dataLayer).toContainEqual({
      event: "form_error",
      form_type: "client",
    });
    expect(gtag).toHaveBeenCalledWith("event", "form_error", {
      form_type: "client",
    });
    vi.unstubAllGlobals();
  });
});
