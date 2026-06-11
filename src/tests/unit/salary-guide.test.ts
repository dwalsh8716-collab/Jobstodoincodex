import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as postSalaryGuide } from "../../../app/api/salary-guide/route";
import {
  getSalaryGuideLeadCaptureStatus,
  salaryGuideConfig,
  submitSalaryGuideLead,
} from "@/lib/salary-guide";
import {
  salaryGuideLeadSchema,
  salaryGuideMinimumCompletionTimeMs,
} from "@/validations/salary-guide";

vi.mock("server-only", () => ({}));

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const validPayload = {
  guideSlug: salaryGuideConfig.slug,
  name: "  David Walsh  ",
  company: "Essential Resourcing",
  email: "salary-guide@example.com",
  jobTitle: "",
  phone: "+44 161 000 0000",
  hiringInterest: "salary_benchmarking",
  consentToContact: "yes",
  website: "",
  startedAt: Date.now() - salaryGuideMinimumCompletionTimeMs - 500,
};

describe("salary guide lead capture", () => {
  it("sanitises valid lead payloads and keeps marketing consent optional", () => {
    const result = salaryGuideLeadSchema.parse(validPayload);

    expect(result.name).toBe("David Walsh");
    expect(result.email).toBe("salary-guide@example.com");
    expect(result.marketingConsent).toBeUndefined();
  });

  it("requires email, hiring interest and contact consent", () => {
    const result = salaryGuideLeadSchema.safeParse({
      ...validPayload,
      email: "not-an-email",
      hiringInterest: "",
      consentToContact: undefined,
    });

    expect(result.success).toBe(false);
  });

  it("keeps the feature disabled, private and noindexed by default", () => {
    expect(getSalaryGuideLeadCaptureStatus({})).toMatchObject({
      featureEnabled: false,
      ready: false,
      noIndex: true,
      downloadUrlConfigured: false,
      databaseStatus: { state: "disabled" },
    });
  });

  it("only becomes ready when the flag and private database are configured", () => {
    expect(
      getSalaryGuideLeadCaptureStatus({
        FEATURE_SALARY_GUIDE_GATE: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgresql://example",
        SALARY_GUIDE_DOWNLOAD_URL: "https://example.com/guide.pdf",
      }),
    ).toMatchObject({
      featureEnabled: true,
      ready: true,
      noIndex: false,
      downloadUrlConfigured: true,
      databaseStatus: { state: "ready" },
    });
  });

  it("fails safely before the public launch gate is approved", async () => {
    delete process.env.FEATURE_SALARY_GUIDE_GATE;

    const now = Date.now();
    const result = await submitSalaryGuideLead(
      {
        ...validPayload,
        email: "disabled-gate@example.com",
        startedAt: now - salaryGuideMinimumCompletionTimeMs - 500,
      },
      { ip: "salary-guide-disabled", now },
    );

    expect(result).toMatchObject({
      ok: false,
      statusCode: 503,
      code: "feature_disabled",
    });
    expect(result.message).not.toContain("disabled-gate@example.com");
  });

  it("rejects too-fast submissions before storing anything", async () => {
    const now = Date.now();
    const result = await submitSalaryGuideLead(
      {
        ...validPayload,
        email: "fast-salary-guide@example.com",
        startedAt: now,
      },
      { ip: "salary-guide-fast", now },
    );

    expect(result).toMatchObject({
      ok: false,
      statusCode: 400,
      code: "too_fast",
      message: "Please take a moment and try again.",
    });
  });

  it("returns a safe API response without echoing lead data", async () => {
    const now = Date.now();
    const response = await postSalaryGuide(
      new NextRequest("https://example.com/api/salary-guide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...validPayload,
          email: "api-salary-guide@example.com",
          startedAt: now - salaryGuideMinimumCompletionTimeMs - 500,
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      ok: false,
      code: "feature_disabled",
    });
    expect(JSON.stringify(body)).not.toContain("api-salary-guide@example.com");
    expect(JSON.stringify(body)).not.toContain("Essential Resourcing");
  });

  it("uses private Postgres tables for leads and consent, not Sanity fields", () => {
    const migration = readFileSync(
      "database/migrations/012_salary_guide_leads.sql",
      "utf8",
    );
    const sanitySchema = readFileSync("sanity/schemas/index.ts", "utf8");

    expect(migration).toContain("create table if not exists salary_guide_leads");
    expect(migration).toContain("marketing_consent boolean");
    expect(migration).toContain("delivery_status");
    expect(sanitySchema).not.toMatch(/salaryGuideLead|downloadToken|gatedLead/i);
  });

  it("tracks only a non-identifying analytics conversion event", () => {
    const form = readFileSync("src/components/SalaryGuideLeadForm.tsx", "utf8");

    expect(form).toContain('trackEvent("salary_guide_lead"');
    expect(form).toContain("guide_slug");
    expect(form).not.toContain("trackEvent(\"salary_guide_lead\", { email");
    expect(form).not.toContain("trackEvent(\"salary_guide_lead\", { name");
    expect(form).not.toContain("trackEvent(\"salary_guide_lead\", { phone");
  });
});
