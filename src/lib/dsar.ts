export const dataSubjectRequestPath = "/candidate-privacy/request";

export const dataSubjectRequestDueDays = 30;

export const dataSubjectRequestTypes = [
  "access_export",
  "deletion",
  "correction",
  "consent_withdrawal",
  "restriction",
  "objection",
  "other",
] as const;

export type DataSubjectRequestType = (typeof dataSubjectRequestTypes)[number];

export const dataSubjectRequestTypeOptions: Array<{
  value: DataSubjectRequestType;
  label: string;
}> = [
  { value: "access_export", label: "Copy or export of my data" },
  { value: "deletion", label: "Delete my candidate details" },
  { value: "correction", label: "Correct or update my details" },
  { value: "consent_withdrawal", label: "Withdraw consent" },
  { value: "restriction", label: "Restrict how my data is used" },
  { value: "objection", label: "Object to processing" },
  { value: "other", label: "Ask a privacy question" },
];

export const dataSubjectRequestStatusLabels = {
  received: "Received",
  verifying_identity: "Verifying identity",
  in_review: "In review",
  awaiting_info: "Awaiting information",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
  closed: "Closed",
} as const;

export const dataSubjectVerificationLabels = {
  not_started: "Not started",
  pending: "Pending",
  verified: "Verified",
  failed: "Failed",
  not_required: "Not required",
} as const;

export const dataSubjectRequestNeutralSuccess =
  "Thanks. Your request has been received. If email confirmation is needed, check your inbox. David will review it before any data is released, changed or deleted.";
