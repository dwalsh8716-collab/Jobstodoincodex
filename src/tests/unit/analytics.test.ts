import { describe, expect, it, vi } from "vitest";
import {
  analyticsAttributes,
  analyticsConsentStorageKey,
  analyticsParamsFromElement,
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

    trackEvent("form_submission", { form_type: "client" });

    expect(dataLayer).toContainEqual({
      event: "form_submission",
      form_type: "client",
    });
    expect(gtag).toHaveBeenCalledWith("event", "form_submission", {
      form_type: "client",
    });
    vi.unstubAllGlobals();
  });
});
