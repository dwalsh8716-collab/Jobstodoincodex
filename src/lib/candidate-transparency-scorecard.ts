import "server-only";

import {
  getJobTransparencyIssues,
  isJobCandidateTransparent,
  isJobClosed,
} from "./content";
import type { Job } from "./types";

type CandidateTransparencyScorecardEnv = Record<string, string | undefined>;

export const candidateTransparencyScorecardRoute =
  "/admin/recruiter-labs/candidate-transparency";

export const candidateTransparencyScorecardFlag =
  "FEATURE_CANDIDATE_TRANSPARENCY_SCORECARD";

export type CandidateTransparencyScorecardReadiness = "green" | "amber" | "red";

export type CandidateTransparencyCriterionId =
  | "salary_rate_shown"
  | "salary_rate_caveat_clear"
  | "location_clear"
  | "hybrid_pattern_clear"
  | "role_type_clear"
  | "why_role_exists_explained"
  | "must_haves_realistic"
  | "nice_to_haves_separated"
  | "interview_process_explained"
  | "after_applying_explained"
  | "privacy_note_included"
  | "quick_question_route_included"
  | "no_banned_jargon"
  | "jobposting_schema_readiness";

type CriterionTemplate = {
  id: CandidateTransparencyCriterionId;
  label: string;
  checkedFields: string[];
  passGuidance: string;
  failGuidance: string;
};

export type CandidateTransparencyCriterionResult = CriterionTemplate & {
  status: CandidateTransparencyScorecardReadiness;
  issueIds: string[];
  evidence: string;
};

export type CandidateTransparencyJobScorecard = {
  job: Pick<Job, "title" | "slug" | "status" | "noIndex">;
  score: number;
  readiness: CandidateTransparencyScorecardReadiness;
  readinessLabel: "Ready" | "Needs improvement" | "Not candidate-ready";
  candidateTransparent: boolean;
  jobPostingReady: boolean;
  issueIds: string[];
  criteria: CandidateTransparencyCriterionResult[];
  counts: {
    green: number;
    amber: number;
    red: number;
    total: number;
  };
};

const criterionTemplates: readonly CriterionTemplate[] = [
  {
    id: "salary_rate_shown",
    label: "Salary/rate shown",
    checkedFields: [
      "salaryRange",
      "salary",
      "salaryStatus",
      "salaryVisibility",
      "salaryCurrency",
      "rateMin",
      "rateMax",
      "ratePeriod",
    ],
    passGuidance:
      "Candidates can see a real salary or rate position before applying.",
    failGuidance:
      "Add a real salary/rate range or keep the role in draft until David can stand behind the number.",
  },
  {
    id: "salary_rate_caveat_clear",
    label: "Salary/rate caveat clear",
    checkedFields: ["salaryTransparencyNote", "salaryStatus"],
    passGuidance:
      "The advert explains whether the range is verified or indicative.",
    failGuidance:
      "Add a plain-English salary note so candidates understand how firm the range is.",
  },
  {
    id: "location_clear",
    label: "Location clear",
    checkedFields: [
      "location",
      "officeLocation",
      "locationExpectation",
      "travelExpectation",
    ],
    passGuidance:
      "The role explains where the work is based and what travel or office rhythm is expected.",
    failGuidance:
      "Confirm the office base, location expectation and any client-site travel before publishing.",
  },
  {
    id: "hybrid_pattern_clear",
    label: "Hybrid pattern clear",
    checkedFields: [
      "workingPattern",
      "hybridPattern",
      "hybridReality",
      "remotePossible",
    ],
    passGuidance: "Hybrid or office expectations are specific enough to trust.",
    failGuidance:
      "Replace vague hybrid copy with the actual office rhythm and remote position.",
  },
  {
    id: "role_type_clear",
    label: "Role type clear",
    checkedFields: ["roleType", "seniority", "sector", "agencyOrClientSide"],
    passGuidance:
      "Candidates can tell what kind of role this is and where it sits.",
    failGuidance:
      "Make the role type, seniority, sector and agency/client-side context explicit.",
  },
  {
    id: "why_role_exists_explained",
    label: "Why role exists explained",
    checkedFields: [
      "whyRoleExists",
      "whyThisRoleMatters",
      "davidsTake",
      "successInThreeMonths",
      "successInSixMonths",
      "successInTwelveMonths",
    ],
    passGuidance: "The advert says why the hire matters, not just the title.",
    failGuidance:
      "Explain the business reason for the hire and add David's plain-English take.",
  },
  {
    id: "must_haves_realistic",
    label: "Must-haves realistic",
    checkedFields: ["mustHaves"],
    passGuidance: "Must-haves are separated and not written as a wish list.",
    failGuidance:
      "Add realistic must-haves. Keep them tight enough that a strong candidate can self-select.",
  },
  {
    id: "nice_to_haves_separated",
    label: "Nice-to-haves separated",
    checkedFields: ["niceToHaves"],
    passGuidance:
      "Useful extras are clearly separate from the true must-haves.",
    failGuidance:
      "Separate useful extras so candidates are not put off by a fake requirements list.",
  },
  {
    id: "interview_process_explained",
    label: "Interview process explained",
    checkedFields: ["interviewSteps", "interviewProcessConfirmed"],
    passGuidance:
      "The advert tells candidates what the process is likely to involve.",
    failGuidance:
      "Add the interview steps and mark whether they are confirmed or indicative.",
  },
  {
    id: "after_applying_explained",
    label: "What happens after applying explained",
    checkedFields: [
      "applicationProcess",
      "applicationProcessNotes",
      "applicationNotes",
    ],
    passGuidance: "Candidates know what happens after they send a note.",
    failGuidance:
      "Add plain next-step wording so the application does not feel like a black hole.",
  },
  {
    id: "privacy_note_included",
    label: "Privacy note included",
    checkedFields: ["candidatePrivacyNote", "candidateDataHandling"],
    passGuidance:
      "The role explains candidate data handling and links into the privacy journey.",
    failGuidance:
      "Add a public-safe privacy note. Do not put private candidate data in Sanity.",
  },
  {
    id: "quick_question_route_included",
    label: "Quick question route included",
    checkedFields: [
      "quickQuestionEnabled",
      "quickQuestionRoute",
      "whatsappQuestionEnabled",
    ],
    passGuidance:
      "Candidates have a quick human route without replacing the formal application.",
    failGuidance:
      "Add a quick-question route, usually WhatsApp or email, before publishing.",
  },
  {
    id: "no_banned_jargon",
    label: "No banned jargon",
    checkedFields: [
      "title",
      "summary",
      "description",
      "responsibilities",
      "requirements",
    ],
    passGuidance: "The copy avoids lazy recruitment jargon and placeholders.",
    failGuidance:
      "Remove banned phrases, filler and placeholder copy. Say what the role really is.",
  },
  {
    id: "jobposting_schema_readiness",
    label: "JobPosting schema readiness",
    checkedFields: [
      "status",
      "salaryMin",
      "salaryMax",
      "salaryCurrency",
      "salaryPeriod",
      "salaryVisibility",
      "rateMin",
      "rateMax",
      "ratePeriod",
      "postedDate",
      "seoTitle",
      "metaDescription",
    ],
    passGuidance: "The role is safe to expose as JobPosting when live.",
    failGuidance:
      "Fix candidate transparency issues before this role can safely emit JobPosting schema.",
  },
] as const;

export const candidateTransparencyScorecardCriteria = criterionTemplates.map(
  ({ id, label, checkedFields }) => ({
    id,
    label,
    checkedFields,
  }),
);

const issueGroups = {
  salary_rate_shown: ["salary_or_rate_not_confirmed"],
  salary_rate_caveat_clear: ["salary_transparency_note_missing"],
  location_clear: [
    "location_missing",
    "office_location_missing",
    "location_expectation_missing",
  ],
  hybrid_pattern_clear: [
    "working_pattern_missing",
    "hybrid_pattern_missing",
    "remote_possible_missing",
    "hybrid_reality_missing",
  ],
  role_type_clear: [
    "role_type_missing",
    "seniority_missing",
    "sector_missing",
    "agency_or_client_side_missing",
  ],
  why_role_exists_explained: ["why_role_exists_missing", "davids_take_missing"],
  must_haves_realistic: ["must_haves_missing"],
  nice_to_haves_separated: ["nice_to_haves_missing"],
  interview_process_explained: [
    "interview_steps_missing",
    "interview_process_not_confirmed",
    "interview_process_missing",
  ],
  after_applying_explained: [
    "application_process_missing",
    "application_notes_missing",
  ],
  privacy_note_included: [
    "candidate_privacy_note_missing",
    "candidate_data_handling_missing",
  ],
  quick_question_route_included: ["quick_question_route_missing"],
  no_banned_jargon: [
    "buzzword_jargon_present",
    "candidate_transparency_placeholders_present",
  ],
} satisfies Partial<Record<CandidateTransparencyCriterionId, string[]>>;

function getReadinessLabel(readiness: CandidateTransparencyScorecardReadiness) {
  if (readiness === "green") return "Ready";
  if (readiness === "amber") return "Needs improvement";
  return "Not candidate-ready";
}

function createCriterionResult(
  template: CriterionTemplate,
  status: CandidateTransparencyScorecardReadiness,
  issueIds: string[],
  evidence: string,
): CandidateTransparencyCriterionResult {
  return {
    ...template,
    status,
    issueIds,
    evidence,
  };
}

function getIssueMatches(issueSet: Set<string>, issueIds: readonly string[]) {
  return issueIds.filter((issueId) => issueSet.has(issueId));
}

function hasEnoughUsefulMustHaves(job: Job) {
  const usefulMustHaves = job.mustHaves.filter((item) => item.trim());
  if (usefulMustHaves.length === 0) return "red";
  if (usefulMustHaves.length < 2 || usefulMustHaves.length > 8) return "amber";
  return "green";
}

function getJobPostingStatus(
  job: Job,
  issueIds: string[],
): CandidateTransparencyScorecardReadiness {
  if (isJobClosed(job)) return "red";
  if (issueIds.length > 0) return "red";
  if (job.noIndex || job.status !== "live") return "amber";
  return "green";
}

function scoreCriterion(
  job: Job,
  template: CriterionTemplate,
  issueSet: Set<string>,
  issueIds: string[],
): CandidateTransparencyCriterionResult {
  if (template.id === "must_haves_realistic") {
    const status = getIssueMatches(issueSet, issueGroups.must_haves_realistic)
      .length
      ? "red"
      : hasEnoughUsefulMustHaves(job);
    return createCriterionResult(
      template,
      status,
      getIssueMatches(issueSet, issueGroups.must_haves_realistic),
      status === "green"
        ? `${job.mustHaves.length} must-haves listed.`
        : `${job.mustHaves.length} must-haves listed. Tighten the real must-haves before this is a green advert.`,
    );
  }

  if (template.id === "quick_question_route_included") {
    const matches = getIssueMatches(
      issueSet,
      issueGroups.quick_question_route_included,
    );
    const status =
      !job.quickQuestionEnabled || matches.length ? "red" : "green";
    return createCriterionResult(
      template,
      status,
      !job.quickQuestionEnabled
        ? [...matches, "quick_question_disabled"]
        : matches,
      status === "green"
        ? "Quick-question route is enabled."
        : "Quick-question route is missing or disabled.",
    );
  }

  if (template.id === "jobposting_schema_readiness") {
    const status = getJobPostingStatus(job, issueIds);
    const schemaIssues =
      status === "red"
        ? issueIds
        : status === "amber"
          ? ["job_not_live_or_noindexed"]
          : [];
    return createCriterionResult(
      template,
      status,
      schemaIssues,
      status === "green"
        ? "Live role is candidate-transparent and schema-ready."
        : "JobPosting stays blocked until the role is live, indexable and candidate-transparent.",
    );
  }

  const matches = getIssueMatches(issueSet, issueGroups[template.id] ?? []);
  const status = matches.length ? "red" : "green";

  return createCriterionResult(
    template,
    status,
    matches,
    status === "green" ? template.passGuidance : template.failGuidance,
  );
}

export function getCandidateTransparencyJobScorecard(
  job: Job,
): CandidateTransparencyJobScorecard {
  const issueIds = Array.from(new Set(getJobTransparencyIssues(job)));
  const issueSet = new Set(issueIds);
  const criteria = criterionTemplates.map((template) =>
    scoreCriterion(job, template, issueSet, issueIds),
  );
  const counts = {
    green: criteria.filter((criterion) => criterion.status === "green").length,
    amber: criteria.filter((criterion) => criterion.status === "amber").length,
    red: criteria.filter((criterion) => criterion.status === "red").length,
    total: criteria.length,
  };
  const readiness: CandidateTransparencyScorecardReadiness = counts.red
    ? "red"
    : counts.amber
      ? "amber"
      : "green";
  const score = Math.round((counts.green / counts.total) * 100);

  return {
    job: {
      title: job.title,
      slug: job.slug,
      status: job.status,
      noIndex: job.noIndex,
    },
    score,
    readiness,
    readinessLabel: getReadinessLabel(readiness),
    candidateTransparent: isJobCandidateTransparent(job),
    jobPostingReady:
      criteria.find(
        (criterion) => criterion.id === "jobposting_schema_readiness",
      )?.status === "green",
    issueIds,
    criteria,
    counts,
  };
}

export function getCandidateTransparencyScorecardOverview(
  inputJobs: Job[],
  env: CandidateTransparencyScorecardEnv = process.env,
) {
  const scorecards = inputJobs.map(getCandidateTransparencyJobScorecard);
  const flagEnabled = env[candidateTransparencyScorecardFlag] === "true";

  return {
    route: candidateTransparencyScorecardRoute,
    flag: {
      name: candidateTransparencyScorecardFlag,
      enabled: flagEnabled,
      defaultValue: false,
      scope: "server-only" as const,
      publicExposure: false,
    },
    scorecards,
    stats: {
      totalJobs: scorecards.length,
      greenJobs: scorecards.filter(
        (scorecard) => scorecard.readiness === "green",
      ).length,
      amberJobs: scorecards.filter(
        (scorecard) => scorecard.readiness === "amber",
      ).length,
      redJobs: scorecards.filter((scorecard) => scorecard.readiness === "red")
        .length,
      criteria: criterionTemplates.length,
    },
    productionGateActive: flagEnabled,
    safeForPublicExposure: false,
    aiAssistance: {
      status: "future_david_review_only" as const,
      rule: "AI may suggest copy warnings later, but David must review every suggestion. No automated candidate judgement.",
    },
  };
}
