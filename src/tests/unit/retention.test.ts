import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  retentionCategories,
  retentionDatesForCategory,
  retentionDryRunDefault,
  retentionEngineEnabled,
  retentionRuleForCategory,
  retentionStatuses,
} from "@/lib/retention";

function testEnv(values: Record<string, string> = {}): NodeJS.ProcessEnv {
  return { NODE_ENV: "test", ...values } as NodeJS.ProcessEnv;
}

describe("retention model", () => {
  it("defines safe review-first retention categories", () => {
    expect(retentionCategories.role_application.defaultMonths).toBe(6);
    expect(retentionCategories.talent_pool.defaultMonths).toBe(24);
    expect(retentionCategories.audit_log.defaultMonths).toBeGreaterThan(24);
    expect(retentionCategories.cv_file.notes).toMatch(/private storage/i);
  });

  it("keeps retention statuses explicit", () => {
    expect(retentionStatuses).toEqual(
      expect.arrayContaining([
        "active",
        "pending_review",
        "delete_requested",
        "deleted",
        "anonymised",
        "retained_for_legal_reason",
      ]),
    );
  });

  it("calculates review dates before retention expiry", () => {
    const fromDate = new Date("2026-01-10T00:00:00.000Z");
    const { retentionUntil, reviewAt } = retentionDatesForCategory(
      "role_application",
      fromDate,
      testEnv(),
    );

    expect(retentionUntil.toISOString().startsWith("2026-07-10")).toBe(true);
    expect(reviewAt.getTime()).toBeLessThan(retentionUntil.getTime());
  });

  it("is disabled and dry-run by default", () => {
    expect(retentionEngineEnabled(testEnv())).toBe(false);
    expect(retentionDryRunDefault(testEnv())).toBe(true);
    expect(
      retentionEngineEnabled(
        testEnv({
          RETENTION_ENGINE_ENABLED: "true",
        }),
      ),
    ).toBe(true);
  });

  it("allows legal-review retention periods to be configured", () => {
    expect(
      retentionRuleForCategory(
        "role_application",
        testEnv({
          RETENTION_ROLE_APPLICATION_MONTHS: "9",
        }),
      ).defaultMonths,
    ).toBe(9);

    expect(
      retentionRuleForCategory(
        "role_application",
        testEnv({
          RETENTION_ROLE_APPLICATION_MONTHS: "not-a-number",
        }),
      ).defaultMonths,
    ).toBe(retentionCategories.role_application.defaultMonths);
  });

  it("does not expose a public retention cron endpoint", () => {
    expect(existsSync(join(process.cwd(), "app/api/retention/route.ts"))).toBe(
      false,
    );
    expect(
      existsSync(join(process.cwd(), "app/api/cron/retention/route.ts")),
    ).toBe(false);
  });
});
