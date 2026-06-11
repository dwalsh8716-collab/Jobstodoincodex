import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { GET as getHealth } from "../../../app/api/health/route";

vi.mock("server-only", () => ({}));

describe("observability and alerts", () => {
  it("keeps the health route simple and non-sensitive", async () => {
    const response = getHealth();
    const body = await response.json();
    const serialised = JSON.stringify(body);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      service: "essential-resourcing",
      operations: {
        enabled: expect.any(Boolean),
        configured: expect.any(Boolean),
        state: expect.any(String),
      },
    });
    expect(serialised).not.toMatch(
      /DATABASE_URL|RESEND_API_KEY|SENTRY|TOKEN|SECRET|PASSWORD/i,
    );
  });

  it("keeps the observability setup guide present and linked", () => {
    const docPath = "docs/observability-and-alerts.md";
    const readme = readFileSync("README.md", "utf8");
    const audit = readFileSync("docs/observability-audit.md", "utf8");

    expect(existsSync(docPath)).toBe(true);
    expect(readme).toContain(docPath);
    expect(audit).toContain(docPath);
  });

  it("does not pretend a monitoring provider has been installed", () => {
    const doc = readFileSync("docs/observability-and-alerts.md", "utf8");

    expect(doc).toContain("No Sentry SDK has been installed");
    expect(doc).toContain("No paid monitoring service has been added");
    expect(doc).toContain("No PII in monitoring");
  });

  it("keeps the monthly health report practical and non-technical", () => {
    const docPath = "docs/monthly-website-health-report-template.md";
    const scriptPath = "scripts/monthly-health-check.mjs";
    const readme = readFileSync("README.md", "utf8");
    const report = readFileSync(docPath, "utf8");
    const script = readFileSync(scriptPath, "utf8");

    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(scriptPath)).toBe(true);
    expect(readme).toContain(docPath);
    expect(report).toContain("Green: safe");
    expect(report).toContain("No fake compliance");
    expect(report).toContain("Do not put real candidate/client private details");
    expect(script).toContain("Manual checks still needed");
    expect(script).not.toMatch(
      /DATABASE_URL|RESEND_API_KEY|CRON_SECRET|CMS_GATE_PASSWORD/i,
    );
  });
});
