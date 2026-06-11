import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  candidateTransparencyScorecardCriteria,
  candidateTransparencyScorecardFlag,
  candidateTransparencyScorecardRoute,
  getCandidateTransparencyJobScorecard,
  getCandidateTransparencyScorecardOverview,
} from "@/lib/candidate-transparency-scorecard";
import { candidateTransparencyFlagDefinitions } from "@/lib/candidate-transparency";
import { getJobTransparencyIssues, jobs } from "@/lib/content";
import { parseServerEnv } from "@/lib/env";
import type { Job } from "@/lib/types";

vi.mock("server-only", () => ({}));

const transparentJob: Job = {
  ...jobs[0],
  title: "Senior PR Account Director",
  slug: "senior-pr-account-director",
  status: "live",
  noIndex: false,
  salaryRange: "GBP 55,000 to GBP 65,000",
  salaryMin: 55000,
  salaryMax: 65000,
  salaryCurrency: "GBP",
  salaryPeriod: "annual",
  salaryVisibility: "public_range",
  rateMin: undefined,
  rateMax: undefined,
  ratePeriod: "to_be_confirmed",
  salary: "GBP 55,000 to GBP 65,000",
  salaryStatus: "verified",
  salaryTransparencyNote: "Salary range confirmed with the client.",
  location: "Manchester",
  officeLocation: "Manchester",
  workingPattern: "full-time",
  hybridPattern: "Two days a week in the Manchester office.",
  remotePossible: "limited",
  hybrid: "Two days a week in the Manchester office.",
  hybridReality: "Two days a week in the Manchester office.",
  locationExpectation:
    "Manchester office access is needed; no regular client-site travel.",
  travelExpectation: "No regular client-site travel expected.",
  employmentType: "Permanent",
  roleType: "Permanent senior agency role",
  seniority: "Senior",
  sector: "PR agency",
  agencyOrClientSide: "agency",
  whyRoleExists:
    "The agency needs senior client leadership that can reduce founder pressure and steady the account team.",
  whyThisRoleMatters:
    "The agency needs senior client leadership that can reduce founder pressure and steady the account team.",
  successInThreeMonths:
    "The account team has clearer priorities and fewer avoidable client escalations.",
  successInSixMonths:
    "Clients feel better led and the founder is pulled into fewer day-to-day conversations.",
  successInTwelveMonths:
    "The agency has stronger senior client leadership and a calmer account rhythm.",
  summary:
    "Senior agency role for a PR operator who can lead clients, support teams and bring calm commercial judgement.",
  description: [
    "This is a senior PR agency role with real client leadership responsibility.",
    "The right person will handle complex client conversations and help the team make better decisions.",
  ],
  davidsTake: [
    "This is about calm client leadership, not a shiny title. The client needs someone who can spot problems early and make the work easier to run.",
  ],
  responsibilities: [
    "Lead senior client relationships.",
    "Support account directors and managers.",
    "Bring commercial judgement to tricky client work.",
  ],
  mustHaves: [
    "Credible agency client leadership.",
    "Strong PR and communications judgement.",
    "Evidence of mentoring account teams.",
  ],
  niceToHaves: [
    "Sector depth that matches the client portfolio.",
    "Experience helping founders create more headspace.",
  ],
  whatGoodLooksLike: [
    "Clients feel better led.",
    "The account team has clearer priorities.",
    "The founder is pulled into fewer day-to-day client conversations.",
  ],
  requirements: [
    "Senior PR agency experience.",
    "Strong client leadership.",
    "Calm judgement under pressure.",
  ],
  benefits: [
    "Clear senior client leadership scope.",
    "Direct process with David before any client introduction.",
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
  applicationProcessNotes:
    "David reviews profile links or short notes directly before any client introduction.",
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
  closingDate: "2099-12-31",
  seoTitle: "Senior PR Account Director | Essential Resourcing",
  metaDescription:
    "Clear senior PR agency role with salary, hybrid pattern and process explained.",
};

describe("candidate transparency scorecard", () => {
  it("keeps the scorecard feature flag server-side, default-off and env-validated", () => {
    expect(candidateTransparencyScorecardFlag).toBe(
      "FEATURE_CANDIDATE_TRANSPARENCY_SCORECARD",
    );
    expect(
      candidateTransparencyFlagDefinitions.map((flag) => flag.name),
    ).toContain(candidateTransparencyScorecardFlag);
    expect(
      parseServerEnv({
        FEATURE_CANDIDATE_TRANSPARENCY_SCORECARD: "false",
      } as unknown as NodeJS.ProcessEnv),
    ).toMatchObject({
      FEATURE_CANDIDATE_TRANSPARENCY_SCORECARD: "false",
    });
  });

  it("turns vague draft jobs red and points at the missing candidate information", () => {
    const scorecard = getCandidateTransparencyJobScorecard(jobs[0]);

    expect(scorecard.readiness).toBe("red");
    expect(scorecard.readinessLabel).toBe("Not candidate-ready");
    expect(scorecard.score).toBeLessThan(75);
    expect(scorecard.issueIds).toEqual(
      expect.arrayContaining([
        "salary_or_rate_not_confirmed",
        "hybrid_reality_missing",
        "candidate_transparency_placeholders_present",
      ]),
    );
    expect(
      scorecard.criteria.find(
        (criterion) => criterion.id === "salary_rate_shown",
      )?.status,
    ).toBe("red");
    expect(
      scorecard.criteria.find(
        (criterion) => criterion.id === "jobposting_schema_readiness",
      )?.status,
    ).toBe("red");
  });

  it("marks a clear live job green and schema-ready", () => {
    expect(getJobTransparencyIssues(transparentJob)).toEqual([]);

    const scorecard = getCandidateTransparencyJobScorecard(transparentJob);

    expect(scorecard.readiness).toBe("green");
    expect(scorecard.readinessLabel).toBe("Ready");
    expect(scorecard.score).toBe(100);
    expect(scorecard.jobPostingReady).toBe(true);
    expect(scorecard.criteria).toHaveLength(
      candidateTransparencyScorecardCriteria.length,
    );
    expect(
      scorecard.criteria.every((criterion) => criterion.status === "green"),
    ).toBe(true);
  });

  it("keeps draft-but-clear jobs amber rather than pretending they are live", () => {
    const scorecard = getCandidateTransparencyJobScorecard({
      ...transparentJob,
      status: "draft",
    });

    expect(scorecard.readiness).toBe("amber");
    expect(scorecard.jobPostingReady).toBe(false);
    expect(
      scorecard.criteria.find(
        (criterion) => criterion.id === "jobposting_schema_readiness",
      ),
    ).toMatchObject({
      status: "amber",
      issueIds: ["job_not_live_or_noindexed"],
    });
  });

  it("summarises private scorecard state without public exposure", () => {
    const overview = getCandidateTransparencyScorecardOverview(
      [jobs[0], transparentJob],
      {},
    );

    expect(overview.route).toBe(candidateTransparencyScorecardRoute);
    expect(overview.flag.enabled).toBe(false);
    expect(overview.flag.publicExposure).toBe(false);
    expect(overview.safeForPublicExposure).toBe(false);
    expect(overview.productionGateActive).toBe(false);
    expect(overview.stats).toMatchObject({
      totalJobs: 2,
      greenJobs: 1,
      redJobs: 1,
      criteria: 14,
    });

    expect(
      getCandidateTransparencyScorecardOverview([transparentJob], {
        FEATURE_CANDIDATE_TRANSPARENCY_SCORECARD: "true",
      }).productionGateActive,
    ).toBe(true);
  });

  it("keeps the admin page private, noindexed and linked from docs", () => {
    const route = readFileSync(
      "app/admin/recruiter-labs/candidate-transparency/page.tsx",
      "utf8",
    );
    const admin = readFileSync("app/admin/recruiter-labs/page.tsx", "utf8");
    const docs = readFileSync(
      "docs/recruiter-labs-candidate-transparency-scorecard.md",
      "utf8",
    );
    const readme = readFileSync("README.md", "utf8");

    expect(route).toContain("isCmsSessionValid");
    expect(route).toContain(
      'redirect("/cms?next=/admin/recruiter-labs/candidate-transparency")',
    );
    expect(route).toContain("index: false");
    expect(route).toContain("getCandidateTransparencyScorecardOverview");
    expect(admin).toContain("/admin/recruiter-labs/candidate-transparency");
    expect(docs).toContain("Do not publish vague jobs");
    expect(docs).toContain("AI must stay advisory");
    expect(readme).toContain(
      "docs/recruiter-labs-candidate-transparency-scorecard.md",
    );
  });
});
