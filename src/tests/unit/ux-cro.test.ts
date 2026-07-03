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
    expect(clientsPage).toContain("A senior brief should feel calmer");
    expect(candidatesPage).toContain("No live roles are published today.");
    expect(candidatesPage).toContain("Send a confidential note");
    expect(css).toContain("overflow-wrap: anywhere");
  });
});
