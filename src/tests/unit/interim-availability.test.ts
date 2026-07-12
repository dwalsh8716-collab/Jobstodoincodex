import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "../../../app/robots";
import sitemap from "../../../app/sitemap";
import {
  buildInterimAvailabilityUrl,
  createInterimAvailabilityMagicLink,
  createInterimAvailabilityToken,
  getInterimAvailabilityToggleReadiness,
  hashInterimAvailabilityToken,
  submitInterimAvailabilityUpdate,
} from "@/lib/interim-availability";
import { interimAvailabilityPath } from "@/lib/interim-availability-shared";
import { siteConfig } from "@/lib/site";
import { interimAvailabilityUpdateSchema } from "@/validations/interim-availability";

vi.mock("server-only", () => ({}));

const originalEnv = { ...process.env };
const validToken = createInterimAvailabilityToken().token;

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("interim availability magic-link staging", () => {
  it("keeps the toggle feature-flagged and database-gated", async () => {
    expect(getInterimAvailabilityToggleReadiness({})).toMatchObject({
      featureEnabled: false,
      databaseStatus: { state: "disabled" },
      safeForPublicListing: false,
      safeForCandidateUse: false,
    });

    await expect(
      submitInterimAvailabilityUpdate({
        token: validToken,
        status: "available_now",
      }),
    ).resolves.toMatchObject({
      ok: false,
      statusCode: 400,
    });
  });

  it("uses high-entropy tokens and stores only hashes", () => {
    const issued = createInterimAvailabilityToken();
    const url = buildInterimAvailabilityUrl(issued.token);

    expect(issued.token).toMatch(/^[A-Za-z0-9_-]{32,}$/);
    expect(issued.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(issued.tokenHash).toBe(hashInterimAvailabilityToken(issued.token));
    expect(issued.tokenHash).not.toContain(issued.token);
    expect(url).toContain(interimAvailabilityPath);
    expect(url).toContain(encodeURIComponent(issued.token));
  });

  it("requires a date only when the candidate chooses available from", () => {
    expect(
      interimAvailabilityUpdateSchema.safeParse({
        token: validToken,
        status: "available_now",
      }).success,
    ).toBe(true);

    const missingDate = interimAvailabilityUpdateSchema.safeParse({
      token: validToken,
      status: "available_from",
    });

    expect(missingDate.success).toBe(false);
  });

  it("does not prepare WhatsApp availability links without consent", async () => {
    await expect(
      createInterimAvailabilityMagicLink({
        candidateId: "11111111-1111-4111-8111-111111111111",
        channel: "whatsapp",
        env: { FEATURE_INTERIM_AVAILABILITY_TOGGLE: "true" },
      }),
    ).resolves.toMatchObject({
      ok: false,
      reason: "whatsapp_consent_required",
    });
  });

  it("stages private Postgres tables and noindexed token routes", async () => {
    const migration = readFileSync(
      "database/migrations/018_interim_availability_toggle.sql",
      "utf8",
    );
    const page = readFileSync(
      "app/candidate/interim-availability/[token]/page.tsx",
      "utf8",
    );
    const api = readFileSync("app/api/interim-availability/route.ts", "utf8");
    const robotsRules = robots().rules;
    const disallow = Array.isArray(robotsRules)
      ? robotsRules.flatMap((rule) => rule.disallow || [])
      : robotsRules.disallow || [];
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(migration).toContain("interim_candidate_availability");
    expect(migration).toContain("interim_availability_tokens");
    expect(migration).toContain("token_hash text not null unique");
    expect(migration).not.toMatch(/\btoken\s+text\b/);
    expect(page).toContain("noIndex: true");
    expect(page).toContain('dynamic = "force-dynamic"');
    expect(api).toContain("export async function POST");
    expect(api).not.toContain("export async function GET");
    expect(disallow).toContain("/candidate/");
    expect(urls).not.toContain(`${siteConfig.url}${interimAvailabilityPath}`);
  });
});
