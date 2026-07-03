import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("accessibility audit gate", () => {
  it("keeps the WCAG AA audit documented and linked from the project guide", () => {
    const auditPath = "docs/ACCESSIBILITY-WCAG-AA-AUDIT.md";
    const audit = readFileSync(auditPath, "utf8");
    const readme = readFileSync("README.md", "utf8");

    expect(existsSync(auditPath)).toBe(true);
    expect(readme).toContain(auditPath);
    expect(audit).toContain("Status: no obvious WCAG AA blocker remains");
    expect(audit).toContain("## 1. Accessibility Summary");
    expect(audit).toContain("## 2. Critical Issues");
    expect(audit).toContain("## 3. WCAG AA Risks");
    expect(audit).toContain("## 4. Keyboard Navigation Findings");
    expect(audit).toContain("## 5. Screen Reader Concerns");
    expect(audit).toContain("## 6. Colour And Contrast Issues");
    expect(audit).toContain("## 7. Form Accessibility Issues");
    expect(audit).toContain("## 8. Recommended Fixes");
    expect(audit).toContain("## 9. Implementation Checklist");
  });

  it("keeps public accessibility safeguards in the automated gates", () => {
    const css = readFileSync("app/globals.css", "utf8");
    const layout = readFileSync("app/layout.tsx", "utf8");
    const productionQa = readFileSync(
      "scripts/production-qa-audit.mjs",
      "utf8",
    );
    const e2e = readFileSync("src/tests/e2e/site.spec.ts", "utf8");

    expect(layout).toContain('className="skip-link"');
    expect(css).toContain(":focus-visible");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("--color-text-muted: color-mix");
    expect(css).toContain("color: var(--color-accent-readable)");
    expect(productionQa).toContain('failures.push("missing skip link")');
    expect(e2e).toContain("@axe-core/playwright");
    expect(e2e).toContain(
      "key public pages have no obvious WCAG AA violations",
    );
  });
});
