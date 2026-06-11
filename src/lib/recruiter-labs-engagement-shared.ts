export const recruiterLabsPortalEngagementEvents = [
  "shortlist_opened",
  "candidate_profile_expanded",
  "candidate_profile_collapsed",
  "modal_opened",
  "modal_closed",
  "dwell_ping",
  "cv_viewed",
  "cv_downloaded",
  "feedback_submitted",
] as const;

export type RecruiterLabsPortalEngagementEvent =
  (typeof recruiterLabsPortalEngagementEvents)[number];

export const recruiterLabsPortalEngagementEventLabels = {
  shortlist_opened: "Shortlist opened",
  candidate_profile_expanded: "Candidate profile expanded",
  candidate_profile_collapsed: "Candidate profile collapsed",
  modal_opened: "Modal opened",
  modal_closed: "Modal closed",
  dwell_ping: "Dwell time",
  cv_viewed: "CV viewed",
  cv_downloaded: "CV downloaded",
  feedback_submitted: "Feedback submitted",
} as const satisfies Record<RecruiterLabsPortalEngagementEvent, string>;
