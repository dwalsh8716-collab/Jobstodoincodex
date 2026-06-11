import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  featureFlagDefinitions,
  getFeatureFlagOverview,
  getFeatureFlags,
  isFeatureFlagEnabled,
  issue117SuggestedFeatureFlags,
} from "@/lib/feature-flags";

vi.mock("server-only", () => ({}));

function walkFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walkFiles(path);
    return path;
  });
}

describe("feature flag registry", () => {
  it("keeps every current feature flag typed, server-side and off by default", () => {
    const names = featureFlagDefinitions.map((flag) => flag.name);

    expect(new Set(names).size).toBe(names.length);
    expect(names.length).toBeGreaterThanOrEqual(31);

    for (const flag of featureFlagDefinitions) {
      expect(flag.name).toMatch(/^FEATURE_/);
      expect(flag.name).not.toMatch(/^NEXT_PUBLIC_/);
      expect(flag.defaultValue).toBe(false);
      expect(flag.enabledValue).toBe("true");
      expect(flag.scope).toBe("server-only");
      expect(flag.safeForPublicNow).toBe(false);
      expect(flag.ownerDoc).toMatch(/^docs\//);
    }

    expect(getFeatureFlags({}).every((flag) => !flag.enabled)).toBe(true);
  });

  it("requires an exact true string to enable a flag", () => {
    expect(
      isFeatureFlagEnabled("FEATURE_RECRUITER_LABS_ENABLED", {
        FEATURE_RECRUITER_LABS_ENABLED: "true",
      }),
    ).toBe(true);
    expect(
      isFeatureFlagEnabled("FEATURE_RECRUITER_LABS_ENABLED", {
        FEATURE_RECRUITER_LABS_ENABLED: "TRUE",
      }),
    ).toBe(false);
    expect(
      isFeatureFlagEnabled("FEATURE_RECRUITER_LABS_ENABLED", {
        FEATURE_RECRUITER_LABS_ENABLED: "false",
      }),
    ).toBe(false);
  });

  it("covers every feature flag suggested by issue 117", () => {
    const names = new Set(featureFlagDefinitions.map((flag) => flag.name));

    for (const flagName of issue117SuggestedFeatureFlags) {
      expect(names.has(flagName)).toBe(true);
    }
  });

  it("keeps private Labs helper imports out of public app pages", () => {
    const privateImportPattern =
      /@\/lib\/(feature-flags|labs|recruiter-labs|recruiter-labs-ai|candidate-transparency)(["';])/;
    const publicAppFiles = walkFiles("app").filter(
      (file) =>
        /\.(ts|tsx)$/.test(file) &&
        !file.includes(`${join("app", "admin")}${"/"}`) &&
        !file.includes(`${join("app", "api")}${"/"}`) &&
        !file.includes(`${join("app", "cms")}${"/"}`) &&
        !file.includes(`${join("app", "studio")}${"/"}`),
    );

    for (const file of publicAppFiles) {
      expect(readFileSync(file, "utf8")).not.toMatch(privateImportPattern);
    }
  });

  it("documents the flag list, Railway steps and quick disable path", () => {
    const doc = readFileSync("docs/feature-flags.md", "utf8");
    const readme = readFileSync("README.md", "utf8");
    const overview = getFeatureFlagOverview({});

    expect(doc).toContain("# Feature Flags");
    expect(doc).toContain("Railway Instructions");
    expect(doc).toContain("To disable quickly");
    expect(doc).toContain("Public Bundle Impact");
    expect(readme).toContain("docs/feature-flags.md");
    expect(overview.stats.publicSafeToday).toBe(0);

    for (const flag of featureFlagDefinitions) {
      expect(doc).toContain(flag.name);
    }
  });
});
