import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("final QA launch report", () => {
  it("keeps the launch decision report present, linked and blunt about blockers", () => {
    const reportPath = "docs/final-qa-launch-report.md";
    const report = readFileSync(reportPath, "utf8");
    const handover = readFileSync("docs/launch-handover.md", "utf8");
    const readme = readFileSync("README.md", "utf8");

    expect(existsSync(reportPath)).toBe(true);
    expect(handover).toContain(reportPath);
    expect(readme).toContain(reportPath);
    expect(report).toContain("Status: production preview ready, launch gated.");
    expect(report).toContain("Not safe for full public launch until");
    expect(report).toContain("Railway preview is live");
    expect(report).toContain("GA4 Measurement ID");
    expect(report).toContain("Resend email delivery");
    expect(report).toContain("Recruiter Labs");
    expect(report).toContain("No fake green ticks");
  });
});
