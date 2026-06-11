import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  getLabsInterimBenchPreview,
  getLabsInterimBenchStatus,
  labsInterimBenchAdminRoute,
} from "@/lib/labs-interim-bench";
import { interimAvailabilityPath } from "@/lib/interim-availability-shared";
import { siteConfig } from "@/lib/site";
import { interimAvailabilityUpdateSchema } from "@/validations/interim-availability";

vi.mock("server-only", () => ({}));

const validToken = "abcdefghijklmnopqrstuvwxyzABCDEF";

describe("Labs Strategic Interim bench", () => {
  it("keeps the bench private, feature-flagged and database-gated", () => {
    expect(getLabsInterimBenchStatus({})).toMatchObject({
      benchFeatureEnabled: false,
      availabilityToggleEnabled: false,
      readyForAdminPreview: false,
      readyForCandidateUpdates: false,
      safeForPublicListing: false,
      databaseStatus: { state: "disabled" },
      adminRoute: labsInterimBenchAdminRoute,
      candidateRoute: `${interimAvailabilityPath}/[token]`,
    });

    expect(
      getLabsInterimBenchStatus({
        FEATURE_INTERIM_BENCH_PORTAL: "true",
        FEATURE_INTERIM_AVAILABILITY_TOGGLE: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({
      benchFeatureEnabled: true,
      availabilityToggleEnabled: true,
      readyForAdminPreview: true,
      readyForCandidateUpdates: true,
      safeForPublicListing: false,
      databaseStatus: { state: "ready" },
    });
  });

  it("defines admin metrics and privacy rules without exposing real candidate data", () => {
    const preview = getLabsInterimBenchPreview({});

    expect(preview.metrics.map((metric) => metric.label)).toEqual(
      expect.arrayContaining([
        "available now",
        "available within 2 weeks",
        "available within 1 month",
        "rate bands",
        "specialisms",
        "stale profiles",
        "consent expiring",
        "possible match to active briefs",
      ]),
    );
    expect(preview.metrics.every((metric) => metric.state)).toBe(true);
    expect(preview.privacyRules).toContain("No public talent database.");
    expect(preview.privacyRules).toContain("No exposed profiles.");
  });

  it("keeps admin and candidate routes hidden from public sitemap output", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    const adminRoute = readFileSync(
      "app/admin/labs/interim-bench/page.tsx",
      "utf8",
    );
    const candidateRoute = readFileSync(
      "app/candidate/interim-availability/[token]/page.tsx",
      "utf8",
    );
    const labsAdmin = readFileSync("app/admin/labs/page.tsx", "utf8");

    expect(urls).not.toContain(`${siteConfig.url}${labsInterimBenchAdminRoute}`);
    expect(urls).not.toContain(`${siteConfig.url}${interimAvailabilityPath}`);
    expect(adminRoute).toContain("isCmsSessionValid");
    expect(adminRoute).toContain("index: false");
    expect(adminRoute).toContain("No public listing");
    expect(candidateRoute).toContain("noIndex: true");
    expect(labsAdmin).toContain("/admin/labs/interim-bench");
  });

  it("stages the interim bench data model without public profile URLs or candidate scoring", () => {
    const migration = readFileSync(
      "database/migrations/034_labs_interim_bench_portal.sql",
      "utf8",
    );

    for (const tableName of [
      "interim_profiles",
      "interim_preferences",
      "interim_profile_updates",
      "interim_consent_records",
    ]) {
      expect(migration).toContain(tableName);
    }

    for (const field of [
      "preferred_contract_type",
      "sectors",
      "functions",
      "location_preference",
      "remote_preference",
      "contact_preference",
      "consent_until",
      "profile_visibility",
      "retention_status",
    ]) {
      expect(migration).toContain(field);
    }

    expect(migration).toContain("cv_file_id uuid references files");
    expect(migration).not.toMatch(
      /public_url|public_profile|candidate_score|ranking|raw_token|token text/i,
    );
  });

  it("accepts optional preference fields while keeping CV upload out of the form", () => {
    const parsed = interimAvailabilityUpdateSchema.safeParse({
      token: validToken,
      status: "available_now",
      dayRate: "800/day",
      preferredContractType: "Interim or fixed project",
      sectors: "B2B, SaaS, agency",
      functions: "Marketing leadership, comms, transformation",
      locationPreference: "Manchester and North West",
      remotePreference: "Hybrid",
      contactPreference: "WhatsApp first",
    });
    const form = readFileSync("src/components/InterimAvailabilityForm.tsx", "utf8");

    expect(parsed.success).toBe(true);
    expect(form).toContain("Preferred work");
    expect(form).toContain("Remote preference");
    expect(form).toContain("CV or profile uploads are not live here yet");
    expect(form).not.toContain('type="file"');
  });

  it("documents the staged bench architecture and blockers", () => {
    const doc = readFileSync("docs/labs-strategic-interim-bench.md", "utf8");
    const roadmap = readFileSync(
      "docs/essential-resourcing-labs-roadmap.md",
      "utf8",
    );
    const labsDoc = readFileSync("docs/essential-resourcing-labs.md", "utf8");
    const featureFlags = readFileSync("docs/feature-flags.md", "utf8");
    const readme = readFileSync("README.md", "utf8");

    for (const section of [
      "## Routes",
      "## Feature Flags",
      "## Data Model",
      "## User Roles",
      "## Candidate UX",
      "## Admin Dashboard",
      "## Auth And Privacy Requirements",
      "## Testing Checklist",
      "## Blockers",
    ]) {
      expect(doc).toContain(section);
    }

    expect(doc).toContain("No public talent database");
    expect(doc).toContain("No exposed profiles");
    expect(doc).toContain("CV upload is not live");
    expect(roadmap).toContain("docs/labs-strategic-interim-bench.md");
    expect(labsDoc).toContain("docs/labs-strategic-interim-bench.md");
    expect(featureFlags).toContain("FEATURE_INTERIM_BENCH_PORTAL");
    expect(readme).toContain("docs/labs-strategic-interim-bench.md");
  });
});
