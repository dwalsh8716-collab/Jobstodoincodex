import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "../../../app/api/client-shortlist-feedback/route";
import {
  getRecruiterLabsFeedbackReadiness,
  parseRecruiterLabsFeedbackPayload,
  recruiterLabsDeclineReasons,
  recruiterLabsFeedbackActions,
} from "@/lib/recruiter-labs-feedback";

vi.mock("server-only", () => ({}));

const originalEnv = { ...process.env };
const validToken = "abcdefghijklmnopqrstuvwxyzABCDEF";
const validCandidateId = "00000000-0000-4000-8000-000000000001";

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("Recruiter Labs client feedback", () => {
  it("supports the required portal feedback actions and decline reasons", () => {
    expect(recruiterLabsFeedbackActions).toEqual([
      "shortlist",
      "interested",
      "maybe",
      "decline",
      "request_interview",
      "need_more_info",
    ]);
    expect(recruiterLabsDeclineReasons).toEqual([
      "experience_mismatch",
      "salary_rate_mismatch",
      "location_hybrid_mismatch",
      "seniority_mismatch",
      "sector_mismatch",
      "not_enough_detail",
      "not_right_for_this_brief",
      "other",
    ]);
  });

  it("requires structured decline reasons without forcing comments", () => {
    expect(
      parseRecruiterLabsFeedbackPayload({
        token: validToken,
        shortlistCandidateId: validCandidateId,
        action: "decline",
      }).success,
    ).toBe(false);
    expect(
      parseRecruiterLabsFeedbackPayload({
        token: validToken,
        shortlistCandidateId: validCandidateId,
        action: "decline",
        declineReason: "salary_rate_mismatch",
      }).success,
    ).toBe(true);
    expect(
      parseRecruiterLabsFeedbackPayload({
        token: validToken,
        shortlistCandidateId: validCandidateId,
        action: "interested",
        declineReason: "salary_rate_mismatch",
      }).success,
    ).toBe(false);
  });

  it("accepts interview request details only for request interview actions", () => {
    expect(
      parseRecruiterLabsFeedbackPayload({
        token: validToken,
        shortlistCandidateId: validCandidateId,
        action: "request_interview",
        interviewType: "video",
        locationPreference: "google_meet",
        preferredTimes: "Tuesday morning or Thursday afternoon.",
        clientNotes: "Please ask David to sense-check availability first.",
      }).success,
    ).toBe(true);

    expect(
      parseRecruiterLabsFeedbackPayload({
        token: validToken,
        shortlistCandidateId: validCandidateId,
        action: "interested",
        preferredTimes: "Tuesday morning.",
      }).success,
    ).toBe(false);
  });

  it("keeps feedback disabled until both flags and the private database are ready", () => {
    expect(getRecruiterLabsFeedbackReadiness({})).toMatchObject({
      portalEnabled: false,
      feedbackEnabled: false,
      ready: false,
      databaseStatus: { state: "disabled" },
    });
    expect(
      getRecruiterLabsFeedbackReadiness({
        FEATURE_CLIENT_PRESENTATION_PORTAL: "true",
        FEATURE_SHORTLIST_FEEDBACK_TRACKING: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({
      portalEnabled: true,
      feedbackEnabled: true,
      ready: true,
      databaseStatus: { state: "ready" },
    });
  });

  it("stages feedback database fields, side effects and structured decline categories", () => {
    const migration = readFileSync(
      "database/migrations/011_recruiter_labs_feedback_tracking.sql",
      "utf8",
    );

    expect(migration).toContain("'interested'");
    expect(migration).toContain("decline_reason text");
    expect(migration).toContain("activity_event_id uuid");
    expect(migration).toContain("admin_task_id uuid");
    expect(migration).toContain("client_feedback_status text");
    expect(migration).toContain("'salary_rate_mismatch'");
    expect(migration).toContain("'not_right_for_this_brief'");
    expect(migration).not.toMatch(/raw_token|token text|ga4|analytics/i);
  });

  it("stages the interview request workflow model and activity trail", () => {
    const migration = readFileSync(
      "database/migrations/029_recruiter_labs_interview_request_workflow.sql",
      "utf8",
    );
    const feedbackHelper = readFileSync(
      "src/lib/recruiter-labs-feedback.ts",
      "utf8",
    );

    for (const field of [
      "shortlist_id",
      "candidate_id",
      "application_id",
      "client_company_id",
      "client_contact_id",
      "request_source",
      "interview_type",
      "location_preference",
      "preferred_times",
      "client_notes",
    ]) {
      expect(migration).toContain(field);
    }

    expect(migration).toContain("recruiter_lab_interview_request_activity");
    expect(migration).toContain("'david_reviewing'");
    expect(migration).toContain("'candidate_contact_approved'");
    expect(migration).toContain("'created_from_client_portal'");
    expect(feedbackHelper).toContain("candidateContactAutomatic");
    expect(feedbackHelper).toContain("calendarAutomatic");
    expect(feedbackHelper).toContain(
      "recruiter_lab_interview_request_activity",
    );
  });

  it("returns a safe disabled API response without echoing token, candidate id or comments", async () => {
    delete process.env.FEATURE_CLIENT_PRESENTATION_PORTAL;
    delete process.env.FEATURE_SHORTLIST_FEEDBACK_TRACKING;
    delete process.env.OPERATIONS_DB_ENABLED;
    delete process.env.DATABASE_URL;

    const response = await POST(
      new Request("http://localhost/api/client-shortlist-feedback", {
        method: "POST",
        body: JSON.stringify({
          token: validToken,
          shortlistCandidateId: validCandidateId,
          action: "decline",
          declineReason: "salary_rate_mismatch",
          comment: "This private client comment must not come back.",
        }),
      }),
    );
    const text = await response.text();

    expect(response.status).toBe(503);
    expect(text).toContain("Client portal feedback is not live yet.");
    expect(text).not.toContain(validToken);
    expect(text).not.toContain(validCandidateId);
    expect(text).not.toContain("private client comment");
  });

  it("keeps the private feedback route out of marketing analytics", () => {
    const apiRoute = readFileSync(
      "app/api/client-shortlist-feedback/route.ts",
      "utf8",
    );
    const clientComponent = readFileSync(
      "src/components/ClientShortlistFeedback.tsx",
      "utf8",
    );

    expect(`${apiRoute}\n${clientComponent}`).not.toMatch(
      /analyticsAttributes|gtag|ga4|dataLayer|whatsapp_click/i,
    );
    expect(clientComponent).toContain("It does not book the");
    expect(clientComponent).toContain("Preferred times (optional)");
    expect(clientComponent).toContain("Send request to David");
    expect(apiRoute).toContain(
      "Thanks - David has the request and will coordinate the next step.",
    );
  });

  it("documents the interview request workflow and blockers", () => {
    const doc = readFileSync("docs/recruiter-labs-interview-requests.md", "utf8");
    const readme = readFileSync("README.md", "utf8");

    expect(doc).toContain("# Recruiter Labs Interview Requests");
    expect(doc).toContain("## Client Portal UX");
    expect(doc).toContain("## Admin Workflow");
    expect(doc).toContain("## Notification Status");
    expect(doc).toContain("candidate is not contacted automatically");
    expect(doc).toContain("Client can request interviews instantly.");
    expect(readme).toContain("docs/recruiter-labs-interview-requests.md");
  });
});
