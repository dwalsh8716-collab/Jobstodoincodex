import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "../../../app/api/client-shortlist-engagement/route";
import {
  getRecruiterLabsEngagementReadiness,
  parseRecruiterLabsEngagementPayload,
  recruiterLabsPortalEngagementEvents,
} from "@/lib/recruiter-labs-engagement";

vi.mock("server-only", () => ({}));

const originalEnv = { ...process.env };
const validToken = "abcdefghijklmnopqrstuvwxyzABCDEF";
const validCandidateId = "00000000-0000-4000-8000-000000000001";

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("Recruiter Labs private portal engagement", () => {
  it("supports the required private engagement events", () => {
    expect(recruiterLabsPortalEngagementEvents).toEqual([
      "shortlist_opened",
      "candidate_profile_expanded",
      "candidate_profile_collapsed",
      "modal_opened",
      "modal_closed",
      "dwell_ping",
      "cv_viewed",
      "cv_downloaded",
      "feedback_submitted",
    ]);
  });

  it("requires scoped candidates and bounded dwell timing", () => {
    expect(
      parseRecruiterLabsEngagementPayload({
        token: validToken,
        eventType: "candidate_profile_expanded",
      }).success,
    ).toBe(false);

    expect(
      parseRecruiterLabsEngagementPayload({
        token: validToken,
        shortlistCandidateId: validCandidateId,
        eventType: "candidate_profile_expanded",
      }).success,
    ).toBe(true);

    expect(
      parseRecruiterLabsEngagementPayload({
        token: validToken,
        shortlistCandidateId: validCandidateId,
        eventType: "dwell_ping",
        dwellMilliseconds: 3000,
      }).success,
    ).toBe(false);

    expect(
      parseRecruiterLabsEngagementPayload({
        token: validToken,
        shortlistCandidateId: validCandidateId,
        eventType: "dwell_ping",
        dwellMilliseconds: 30000,
      }).success,
    ).toBe(true);
  });

  it("keeps engagement disabled until both portal flags and the private database are ready", () => {
    expect(getRecruiterLabsEngagementReadiness({})).toMatchObject({
      portalEnabled: false,
      feedbackTrackingEnabled: false,
      ready: false,
      databaseStatus: { state: "disabled" },
    });

    expect(
      getRecruiterLabsEngagementReadiness({
        FEATURE_CLIENT_PRESENTATION_PORTAL: "true",
        FEATURE_SHORTLIST_FEEDBACK_TRACKING: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({
      portalEnabled: true,
      feedbackTrackingEnabled: true,
      ready: true,
      databaseStatus: { state: "ready" },
    });
  });

  it("stages private Postgres storage without raw tokens or candidate scoring", () => {
    const migration = readFileSync(
      "database/migrations/019_recruiter_labs_portal_engagement.sql",
      "utf8",
    );

    expect(migration).toContain("recruiter_lab_portal_engagement_events");
    expect(migration).toContain("dwell_milliseconds integer");
    expect(migration).toContain("'candidate_profile_expanded'");
    expect(migration).toContain("'cv_downloaded'");
    expect(migration).toContain("total_dwell_seconds integer");
    expect(migration).not.toMatch(/raw_token|token text|candidate_quality|candidate_score|rank/i);
  });

  it("returns a safe disabled API response without echoing token or candidate id", async () => {
    delete process.env.FEATURE_CLIENT_PRESENTATION_PORTAL;
    delete process.env.FEATURE_SHORTLIST_FEEDBACK_TRACKING;
    delete process.env.OPERATIONS_DB_ENABLED;
    delete process.env.DATABASE_URL;

    const response = await POST(
      new Request("http://localhost/api/client-shortlist-engagement", {
        method: "POST",
        body: JSON.stringify({
          token: validToken,
          shortlistCandidateId: validCandidateId,
          eventType: "candidate_profile_expanded",
        }),
      }),
    );
    const text = await response.text();

    expect(response.status).toBe(503);
    expect(text).toContain("Client portal engagement tracking is not live yet.");
    expect(text).not.toContain(validToken);
    expect(text).not.toContain(validCandidateId);
  });

  it("keeps private engagement out of public tracking code", () => {
    const apiRoute = readFileSync(
      "app/api/client-shortlist-engagement/route.ts",
      "utf8",
    );
    const tracker = readFileSync(
      "src/components/ClientShortlistEngagement.tsx",
      "utf8",
    );
    const feedback = readFileSync(
      "src/components/ClientShortlistFeedback.tsx",
      "utf8",
    );

    expect(`${apiRoute}\n${tracker}\n${feedback}`).not.toMatch(
      /analyticsAttributes|gtag|ga4|dataLayer|whatsapp_click/i,
    );
  });
});
