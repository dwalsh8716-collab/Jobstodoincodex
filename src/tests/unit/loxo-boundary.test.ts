import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const loxoBoundaryMigration = readFileSync(
  "database/migrations/010_loxo_reference_boundary.sql",
  "utf8",
);

describe("Loxo-first database boundary", () => {
  it("keeps Loxo as an external reference, not a replacement CRM", () => {
    expect(loxoBoundaryMigration).toContain("loxo_candidate_id");
    expect(loxoBoundaryMigration).toContain("loxo_company_id");
    expect(loxoBoundaryMigration).toContain("loxo_contact_id");
    expect(loxoBoundaryMigration).toContain("loxo_job_id");
    expect(loxoBoundaryMigration).toContain("loxo_application_id");
    expect(loxoBoundaryMigration).toContain("loxo_handoff_id");
  });

  it("records integration handoff/sync events without adding live credentials", () => {
    expect(loxoBoundaryMigration).toContain("integration_sync_events");
    expect(loxoBoundaryMigration).toContain("manual_handoff");
    expect(loxoBoundaryMigration).not.toMatch(/api[_-]?key|access[_-]?token/i);
  });

  it("documents that Loxo remains the CRM source of truth", () => {
    const boundaryDoc = readFileSync(
      "docs/backend-data-boundary-audit.md",
      "utf8",
    );
    const dataBoundaryDoc = readFileSync("docs/data-boundaries.md", "utf8");

    expect(boundaryDoc).toContain("Loxo remains the source of truth");
    expect(boundaryDoc).toContain("No ORM was introduced");
    expect(dataBoundaryDoc).toContain(
      "Loxo remains the CRM/ATS source of truth",
    );
    expect(dataBoundaryDoc).toContain("Loxo API keys in the database");
  });
});
