import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parsePublicEnv } from "@/lib/env";

const originalEnv = { ...process.env };

async function loadSiteConfig() {
  vi.resetModules();
  return import("@/lib/site");
}

describe("booking configuration", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL;
    delete process.env.NEXT_PUBLIC_BOOKING_URL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("hides booking CTAs when no booking URL is configured", async () => {
    const { siteConfig } = await loadSiteConfig();

    expect(siteConfig.booking.enabled).toBe(false);
    expect(siteConfig.booking.url).toBe("");
    expect(siteConfig.bookingUrl).toBe("/contact");
  });

  it("hides booking CTAs when the booking URL is malformed", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL = "not-a-url";

    const { siteConfig } = await loadSiteConfig();

    expect(siteConfig.booking.enabled).toBe(false);
    expect(siteConfig.booking.url).toBe("");
  });

  it("uses the Google Calendar booking URL when configured", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL =
      "https://calendar.google.com/calendar/appointments/schedules/example";

    const { siteConfig } = await loadSiteConfig();

    expect(siteConfig.booking.enabled).toBe(true);
    expect(siteConfig.booking.url).toBe(
      "https://calendar.google.com/calendar/appointments/schedules/example",
    );
    expect(siteConfig.bookingUrl).toBe(siteConfig.booking.url);
  });

  it("keeps the legacy booking URL as a safe fallback", async () => {
    process.env.NEXT_PUBLIC_BOOKING_URL =
      "https://calendar.google.com/calendar/appointments/schedules/legacy";

    const { siteConfig } = await loadSiteConfig();

    expect(siteConfig.booking.enabled).toBe(true);
    expect(siteConfig.booking.url).toBe(
      "https://calendar.google.com/calendar/appointments/schedules/legacy",
    );
  });

  it("validates the new public Google booking env var as a URL", () => {
    expect(() =>
      parsePublicEnv({
        ...process.env,
        NEXT_PUBLIC_GOOGLE_BOOKING_URL: "not-a-url",
      }),
    ).toThrow();
  });
});
