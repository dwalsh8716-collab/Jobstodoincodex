import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("UX and conversion audit", () => {
  it("documents the CRO audit and keeps the implemented conversion fixes visible", () => {
    const audit = readFileSync("docs/UX-CRO-AUDIT.md", "utf8");
    const contactPage = readFileSync("app/contact/page.tsx", "utf8");
    const clientsPage = readFileSync("app/clients/page.tsx", "utf8");
    const candidatesPage = readFileSync("app/candidates/page.tsx", "utf8");
    const css = readFileSync("app/globals.css", "utf8");

    expect(audit).toContain("UX Executive Summary");
    expect(audit).toContain("Conversion Blockers");
    expect(audit).toContain("Trust Gaps");
    expect(audit).toContain("Prioritised UX Action Plan");
    expect(audit).toContain("No noisy widgetry");

    expect(contactPage).toContain("Send the brief");
    expect(contactPage).toContain("Other useful routes");
    expect(clientsPage).toContain(
      "Better marketing hires start with a better brief.",
    );
    expect(candidatesPage).toContain(
      "Good roles. Honest advice. No recruitment nonsense.",
    );
    expect(candidatesPage).toContain("Send David a confidential note");
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).toContain(".dark .tag");
    expect(css).toContain("color: var(--color-accent-readable);");
    expect(css).not.toContain(".tag::before");
    expect(css).not.toContain(
      "background: color-mix(in srgb, var(--color-accent) 14%, transparent)",
    );
  });
});
