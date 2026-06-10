import { afterEach, describe, expect, it } from "vitest";
import { cmsGateConfigured, createCmsSession, getCmsUsername } from "@/lib/cms-auth";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("cms gate configuration", () => {
  it("requires username, password and a separate session secret", () => {
    process.env.CMS_GATE_USERNAME = "david";
    process.env.CMS_GATE_PASSWORD = "password";
    delete process.env.CMS_GATE_SECRET;

    expect(cmsGateConfigured()).toBe(false);

    process.env.CMS_GATE_SECRET = "long-random-session-secret";

    expect(cmsGateConfigured()).toBe(true);
  });

  it("does not expose a default username when the gate is not configured", () => {
    delete process.env.CMS_GATE_USERNAME;

    expect(getCmsUsername()).toBe("");
  });

  it("does not sign sessions without CMS_GATE_SECRET", async () => {
    process.env.CMS_GATE_USERNAME = "david";
    process.env.CMS_GATE_PASSWORD = "password";
    delete process.env.CMS_GATE_SECRET;

    const session = await createCmsSession("david");

    expect(session.endsWith(".")).toBe(true);
  });
});
