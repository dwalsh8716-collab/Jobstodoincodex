import { describe, expect, it, vi } from "vitest";
import {
  candidateTransparencyFlagDefinitions,
  getCandidateTransparencyFeatureFlags,
  isCandidateTransparencyFeatureEnabled,
} from "@/lib/candidate-transparency";
import {
  candidateJobPageStandards,
  candidateTrustQuestions,
} from "@/lib/candidate-transparency-content";
import {
  getJobTransparencyIssues,
  isJobCandidateTransparent,
  isJobLive,
  jobs,
} from "@/lib/content";
import { parseServerEnv } from "@/lib/env";
import type { Job } from "@/lib/types";

vi.mock("server-only", () => ({}));

const transparentJob: Job = {
  ...jobs[0],
  status: "live",
  salaryRange: "GBP 55,000 to GBP 65,000",
  salaryMin: 55000,
  salaryMax: 65000,
  salaryPeriod: "annual",
  salary: "GBP 55,000 to 65,000",
  salaryStatus: "verified",
  salaryTransparencyNote: "Salary range confirmed with the client.",
  officeLocation: "Manchester",
  workingPattern: "full-time",
  hybridPattern: "Two days a week in the Manchester office.",
  remotePossible: "limited",
  roleType: "Permanent",
  seniority: "Senior",
  agencyOrClientSide: "agency",
  whyRoleExists:
    "The agency needs senior client leadership that can reduce pressure on the founder and steady the account team.",
  whyThisRoleMatters:
    "The agency needs senior client leadership that can reduce pressure on the founder and steady the account team.",
  summary:
    "Senior agency role for a PR operator who can lead clients, support teams and bring calm commercial judgement.",
  description: [
    "This is a senior PR agency role with real client leadership responsibility.",
    "The right person will handle complex client conversations and help the team make better decisions.",
  ],
  davidsTake: [
    "This is about calm client leadership, not a shiny title. The client needs someone who can spot problems early and make the work easier to run.",
  ],
  hybridReality: "Two days a week in the Manchester office.",
  locationExpectation:
    "Manchester office access is needed; no regular client-site travel.",
  whatGoodLooksLike: [
    "Clients feel better led.",
    "The account team has clearer priorities.",
    "The founder is pulled into fewer day-to-day client conversations.",
  ],
  interviewSteps: [
    "Introductory call with David.",
    "First client interview with the hiring lead.",
    "Final practical conversation focused on real client scenarios.",
  ],
  interviewProcessConfirmed: "confirmed",
  interviewProcess: [
    "Introductory call with David.",
    "First client interview with the hiring lead.",
    "Final practical conversation focused on real client scenarios.",
  ],
  applicationProcess: [
    "David reviews the application directly.",
    "If there is a fit, David contacts the candidate to discuss the role.",
    "Nothing is sent to the client without the candidate's permission.",
  ],
  applicationNotes:
    "Send a short note or LinkedIn URL first. David will ask for more only if the role looks relevant.",
  candidatePrivacyNote:
    "Candidate details stay private and are used only for recruitment purposes.",
  candidateDataHandling:
    "Candidate details stay private and are used only for recruitment purposes.",
  quickQuestionEnabled: true,
  whatsappQuestionEnabled: true,
  quickQuestionRoute:
    "Candidates can ask David a quick question by WhatsApp before applying.",
  postedDate: "2026-06-10",
  publishedDate: "2026-06-10",
  updatedDate: "2026-06-10",
  benefits: [
    "Clear senior client leadership scope.",
    "Direct process with David before any client introduction.",
  ],
  closingDate: "2099-12-31",
};

describe("candidate transparency foundation", () => {
  it("keeps candidate transparency flags server-side and off by default", () => {
    const flags = getCandidateTransparencyFeatureFlags({});

    expect(flags).toHaveLength(candidateTransparencyFlagDefinitions.length);
    expect(flags.every((flag) => flag.scope === "server-only")).toBe(true);
    expect(flags.every((flag) => flag.enabled === false)).toBe(true);
    expect(
      isCandidateTransparencyFeatureEnabled("FEATURE_FLUFF_FREE_JOB_PAGES", {
        FEATURE_FLUFF_FREE_JOB_PAGES: "true",
      }),
    ).toBe(true);
  });

  it("accepts the candidate transparency feature flags in server env parsing", () => {
    expect(
      parseServerEnv({
        FEATURE_CANDIDATE_TRANSPARENCY_LABS: "false",
        FEATURE_FLUFF_FREE_JOB_PAGES: "false",
        FEATURE_CANDIDATE_APPLICATION_DROP: "false",
        FEATURE_LINKEDIN_PROFILE_APPLICATION: "false",
        FEATURE_CANDIDATE_STATUS_JOURNEY: "false",
        FEATURE_CANDIDATE_WHATSAPP_QUESTIONS: "false",
        FEATURE_INTERVIEW_PROCESS_TRANSPARENCY: "false",
      } as unknown as NodeJS.ProcessEnv),
    ).toMatchObject({
      FEATURE_CANDIDATE_TRANSPARENCY_LABS: "false",
      FEATURE_FLUFF_FREE_JOB_PAGES: "false",
    });
  });

  it("sets practical candidate trust questions and job page standards", () => {
    expect(candidateTrustQuestions).toContain("Is the salary or rate clear?");
    expect(candidateTrustQuestions).toContain(
      "How will my CV and data be handled?",
    );
    expect(candidateJobPageStandards.join(" ")).toMatch(/salary or rate/i);
    expect(candidateJobPageStandards.join(" ")).toMatch(/hybrid/i);
  });

  it("blocks draft or vague jobs from being treated as candidate-transparent live roles", () => {
    const draft = jobs[0];

    expect(getJobTransparencyIssues(draft)).toEqual(
      expect.arrayContaining([
        "salary_or_rate_not_confirmed",
        "hybrid_reality_missing",
        "location_expectation_missing",
        "candidate_transparency_placeholders_present",
      ]),
    );
    expect(isJobCandidateTransparent(draft)).toBe(false);
    expect(isJobLive(draft)).toBe(false);
  });

  it("allows a live role only when salary, hybrid, process and data handling are clear", () => {
    expect(getJobTransparencyIssues(transparentJob)).toEqual([]);
    expect(isJobCandidateTransparent(transparentJob)).toBe(true);
    expect(isJobLive(transparentJob, new Date("2026-06-10"))).toBe(true);
  });

  it("catches lazy candidate-facing jargon", () => {
    expect(
      getJobTransparencyIssues({
        ...transparentJob,
        title: "PR Rockstar",
      }),
    ).toContain("buzzword_jargon_present");

    expect(
      getJobTransparencyIssues({
        ...transparentJob,
        salaryRange: "Competitive salary",
        salary: "Competitive salary",
      }),
    ).toContain("salary_or_rate_not_confirmed");
  });
});
