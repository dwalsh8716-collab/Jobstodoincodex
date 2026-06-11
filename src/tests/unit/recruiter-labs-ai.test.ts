import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  getRecruiterLabsAiFeatureFlags,
  getRecruiterLabsAiOverview,
  isRecruiterLabsAiFeatureEnabled,
  isRecruiterLabsAiUseAllowed,
  recruiterLabsAiBannedUses,
  recruiterLabsAiFlagDefinitions,
} from "@/lib/recruiter-labs-ai";
import { siteConfig } from "@/lib/site";

vi.mock("server-only", () => ({}));

describe("Recruiter Labs AI Ops governance", () => {
  it("keeps AI Ops flags server-side and off by default", () => {
    const flags = getRecruiterLabsAiFeatureFlags({});

    expect(flags).toHaveLength(recruiterLabsAiFlagDefinitions.length);
    expect(flags.every((flag) => flag.scope === "server-only")).toBe(true);
    expect(flags.every((flag) => flag.enabled === false)).toBe(true);
    expect(
      isRecruiterLabsAiFeatureEnabled("FEATURE_AI_OPS_COMPRESSION", {
        FEATURE_AI_OPS_COMPRESSION: "true",
      }),
    ).toBe(true);
  });

  it("allows drafting and note organisation but blocks candidate evaluation", () => {
    expect(
      isRecruiterLabsAiUseAllowed(
        "draft candidate summaries for David to review",
      ),
    ).toBe(true);
    expect(
      isRecruiterLabsAiUseAllowed(
        "organise notes against a human-defined scorecard",
      ),
    ).toBe(true);
    expect(isRecruiterLabsAiUseAllowed("rank candidates")).toBe(false);
    expect(isRecruiterLabsAiUseAllowed("reject candidates")).toBe(false);
    expect(isRecruiterLabsAiUseAllowed("score culture fit")).toBe(false);
  });

  it("keeps real candidate data blocked until governance is approved", () => {
    const overview = getRecruiterLabsAiOverview({});

    expect(overview.safeForSampleDataOnly).toBe(true);
    expect(overview.safeForRealCandidateData).toBe(false);
    expect(overview.stats.blockedGovernanceChecks).toBeGreaterThan(0);
    expect(recruiterLabsAiBannedUses).toEqual(
      expect.arrayContaining([
        "rank candidates",
        "reject candidates",
        "make automated employment decisions",
      ]),
    );
  });

  it("keeps the AI Ops route private and out of the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    const page = readFileSync(
      "app/admin/recruiter-labs/ai-ops/page.tsx",
      "utf8",
    );

    expect(urls).not.toContain(`${siteConfig.url}/admin/recruiter-labs/ai-ops`);
    expect(page).toContain("isCmsSessionValid");
    expect(page).toContain("index: false");
    expect(page).toContain("No ranking. No rejection. No hidden scoring.");
  });

  it("stages private AI draft metadata without provider secrets or raw prompt fields", () => {
    const migration = readFileSync(
      "database/migrations/008_recruiter_labs_ai_governance.sql",
      "utf8",
    );

    expect(migration).toContain(
      "create table if not exists recruiter_lab_ai_drafts",
    );
    expect(migration).toContain(
      "data_classification text not null default 'sample'",
    );
    expect(migration).toContain("david_reviewed_at timestamptz");
    expect(migration).not.toMatch(/api_key|access_token|secret|raw_prompt/i);
  });
});
