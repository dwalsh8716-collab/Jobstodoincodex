import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const adrFiles = [
  "docs/adr/0001-use-nextjs-app-router-for-public-frontend.md",
  "docs/adr/0002-use-sanity-for-public-cms-only.md",
  "docs/adr/0003-use-loxo-as-primary-crm-ats.md",
  "docs/adr/0004-use-postgres-only-for-private-website-workflows.md",
  "docs/adr/0005-keep-recruiter-labs-private-feature-flagged-and-noindexed.md",
  "docs/adr/0006-use-railway-for-hosting.md",
  "docs/adr/0007-ai-assists-operations-not-candidate-evaluation.md",
  "docs/adr/0008-whatsapp-used-for-logistics-not-negative-news.md",
] as const;

describe("architecture decision records", () => {
  it("keeps the ADR index and requested decision records present", () => {
    expect(existsSync("docs/adr/README.md")).toBe(true);

    for (const file of adrFiles) {
      expect(existsSync(file), file).toBe(true);
    }
  });

  it("uses the agreed ADR structure", () => {
    for (const file of adrFiles) {
      const doc = readFileSync(file, "utf8");

      expect(doc).toContain("## Status");
      expect(doc).toContain("## Context");
      expect(doc).toContain("## Decision");
      expect(doc).toContain("## Consequences");
      expect(doc).toContain("## What Not To Do");
    }
  });

  it("documents the decisions future Codex work must preserve", () => {
    const joinedDocs = adrFiles
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(joinedDocs).toContain("Next.js App Router");
    expect(joinedDocs).toContain("Sanity as the public website CMS only");
    expect(joinedDocs).toContain("Use Loxo as the primary CRM/ATS");
    expect(joinedDocs).toContain("Postgres only for private website workflows");
    expect(joinedDocs).toContain("Keep Recruiter Labs private");
    expect(joinedDocs).toContain("Use Railway for hosting");
    expect(joinedDocs).toContain("AI may assist operations");
    expect(joinedDocs).toContain("Use WhatsApp for logistics");
  });

  it("links the ADR index from the README", () => {
    const readme = readFileSync("README.md", "utf8");

    expect(readme).toContain("docs/adr/README.md");
  });
});
