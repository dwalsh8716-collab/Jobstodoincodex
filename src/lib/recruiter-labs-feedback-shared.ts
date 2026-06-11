export const recruiterLabsFeedbackActions = [
  "shortlist",
  "interested",
  "maybe",
  "decline",
  "request_interview",
  "need_more_info",
] as const;

export type RecruiterLabsFeedbackAction =
  (typeof recruiterLabsFeedbackActions)[number];

export const recruiterLabsDeclineReasons = [
  "experience_mismatch",
  "salary_rate_mismatch",
  "location_hybrid_mismatch",
  "seniority_mismatch",
  "sector_mismatch",
  "not_enough_detail",
  "not_right_for_this_brief",
  "other",
] as const;

export type RecruiterLabsDeclineReason =
  (typeof recruiterLabsDeclineReasons)[number];

export const recruiterLabsDeclineReasonLabels = {
  experience_mismatch: "Experience mismatch",
  salary_rate_mismatch: "Salary/rate mismatch",
  location_hybrid_mismatch: "Location/hybrid mismatch",
  seniority_mismatch: "Seniority mismatch",
  sector_mismatch: "Sector mismatch",
  not_enough_detail: "Not enough detail",
  not_right_for_this_brief: "Not right for this brief",
  other: "Other",
} as const satisfies Record<RecruiterLabsDeclineReason, string>;

export const recruiterLabsFeedbackActionLabels = {
  shortlist: "Shortlist",
  interested: "Interested",
  maybe: "Maybe",
  decline: "Decline",
  request_interview: "Request interview",
  need_more_info: "Need more information",
} as const satisfies Record<RecruiterLabsFeedbackAction, string>;
