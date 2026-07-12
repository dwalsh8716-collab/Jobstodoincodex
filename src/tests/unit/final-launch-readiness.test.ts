import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("final launch readiness audit", () => {
  it("keeps the final launch readiness verdict documented and linked", () => {
    const auditPath = "docs/FINAL-LAUNCH-READINESS-AUDIT.md";
    const audit = readFileSync(auditPath, "utf8");
    const readme = readFileSync("README.md", "utf8");
    const handover = readFileSync("docs/launch-handover.md", "utf8");

    expect(existsSync(auditPath)).toBe(true);
    expect(readme).toContain(auditPath);
    expect(handover).toContain(auditPath);
    expect(audit).toContain("Verdict: code launch-ready");
    expect(audit).toContain("## 1. Launch Readiness Verdict");
    expect(audit).toContain("## 2. Must-Fix Before Launch");
    expect(audit).toContain("## 3. Should-Fix Soon");
    expect(audit).toContain("## 4. Nice-To-Have Polish");
    expect(audit).toContain("## 5. Final Deployment Checklist");
    expect(audit).toContain("## 6. Post-Launch Monitoring Checklist");
  });

  it("keeps the final launch call honest about external gates", () => {
    const audit = readFileSync("docs/FINAL-LAUNCH-READINESS-AUDIT.md", "utf8");

    expect(audit).toContain("public domain switch still gated");
    expect(audit).toContain("GA4 is configured directly");
    expect(audit).toContain("Resend/contact form delivery is configured");
    expect(audit).toContain("Search Console DNS TXT record");
    expect(audit).toContain("Sanity CORS");
    expect(audit).toContain("npm audit --audit-level=high");
    expect(audit).toContain("No fake green ticks");
  });
});
