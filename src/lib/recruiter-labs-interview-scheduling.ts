import "server-only";

import { isRecruiterLabsFeatureEnabled } from "./recruiter-labs";
import { getOperationsBackendStatus } from "./operations/database";
import { getWhatsAppInterviewSchedulingReadiness } from "./whatsapp-business/interview-logistics";

type Env = Record<string, string | undefined>;

export const recruiterLabsInterviewSchedulingFeatureFlags = [
  "FEATURE_INTERVIEW_REQUEST_WORKFLOW",
  "FEATURE_WHATSAPP_INTERVIEW_SCHEDULING",
  "FEATURE_GOOGLE_MEET_INTERVIEW_SCHEDULING",
] as const;

export const recruiterLabsInterviewSchedulingEnvVars = [
  "OPERATIONS_DB_ENABLED",
  "DATABASE_URL",
  "OPERATIONS_PRIVACY_SALT",
  "FEATURE_INTERVIEW_REQUEST_WORKFLOW",
  "FEATURE_WHATSAPP_INTERVIEW_SCHEDULING",
  "FEATURE_GOOGLE_MEET_INTERVIEW_SCHEDULING",
  "WHATSAPP_BUSINESS_ENABLED",
  "WHATSAPP_BUSINESS_PHONE_NUMBER_ID",
  "WHATSAPP_BUSINESS_ACCESS_TOKEN",
  "WHATSAPP_BUSINESS_INTERVIEW_CONFIRMATION_TEMPLATE",
  "WHATSAPP_BUSINESS_INTERVIEW_REMINDER_TEMPLATE",
  "WHATSAPP_BUSINESS_INTERVIEW_RESCHEDULE_TEMPLATE",
  "WHATSAPP_BUSINESS_INTERVIEW_LOCATION_TEMPLATE",
  "WHATSAPP_BUSINESS_INTERVIEW_AVAILABILITY_TEMPLATE",
] as const;

export const futureGoogleCalendarEnvVars = [
  "GOOGLE_CALENDAR_CLIENT_ID",
  "GOOGLE_CALENDAR_CLIENT_SECRET",
  "GOOGLE_CALENDAR_REFRESH_TOKEN",
  "GOOGLE_CALENDAR_ID",
] as const;

export type RecruiterLabsInterviewLocationType =
  | "google_meet"
  | "physical"
  | "phone"
  | "to_be_confirmed";

export type RecruiterLabsCalendarDraftInput = {
  roleTitle?: string | null;
  candidateLabel?: string | null;
  clientLabel?: string | null;
  scheduledStartAt?: Date | string | null;
  scheduledEndAt?: Date | string | null;
  timezone?: string | null;
  locationType?: RecruiterLabsInterviewLocationType | null;
  locationLabel?: string | null;
  googleMeetUrl?: string | null;
  candidateContactApproved?: boolean | null;
  davidApprovedFinalSlot?: boolean | null;
};

export type RecruiterLabsCalendarDraftResult = {
  ok: boolean;
  code:
    | "draft_ready"
    | "candidate_contact_not_approved"
    | "david_approval_required"
    | "missing_time"
    | "invalid_time"
    | "end_before_start";
  manualOnly: true;
  title?: string;
  description?: string;
  location?: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  timezone?: string;
  reminders?: string[];
  warnings: string[];
};

function databaseStatusFromEnv(env: Env) {
  if (env === process.env) return getOperationsBackendStatus();

  const enabled = env.OPERATIONS_DB_ENABLED === "true";
  const configured = Boolean(env.DATABASE_URL);

  if (!enabled) {
    return {
      enabled,
      configured,
      state: "disabled" as const,
      message: "Private operations database is disabled.",
    };
  }

  if (!configured) {
    return {
      enabled,
      configured,
      state: "missing_database_url" as const,
      message: "Private operations database is missing DATABASE_URL.",
    };
  }

  return {
    enabled,
    configured,
    state: "ready" as const,
    message: "Private operations database is configured.",
  };
}

function clean(value: string | null | undefined, fallback: string) {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  return trimmed ? trimmed.slice(0, 180) : fallback;
}

function parseDate(value: Date | string | null | undefined) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function googleOAuthConfigured(env: Env) {
  return futureGoogleCalendarEnvVars.every((name) => Boolean(env[name]));
}

export function getRecruiterLabsInterviewSchedulingReadiness(
  env: Env = process.env,
) {
  const interviewWorkflowEnabled = isRecruiterLabsFeatureEnabled(
    "FEATURE_INTERVIEW_REQUEST_WORKFLOW",
    env,
  );
  const googleMeetFeatureEnabled = isRecruiterLabsFeatureEnabled(
    "FEATURE_GOOGLE_MEET_INTERVIEW_SCHEDULING",
    env,
  );
  const databaseStatus = databaseStatusFromEnv(env);
  const whatsAppReadiness = getWhatsAppInterviewSchedulingReadiness(env);
  const googleConfigured = googleOAuthConfigured(env);

  const blockers = [
    !interviewWorkflowEnabled &&
      "FEATURE_INTERVIEW_REQUEST_WORKFLOW is not enabled.",
    databaseStatus.state !== "ready" &&
      "Private operations database is not ready.",
    !whatsAppReadiness.ready &&
      "WhatsApp interview logistics are not ready for live sends.",
    !googleMeetFeatureEnabled &&
      "FEATURE_GOOGLE_MEET_INTERVIEW_SCHEDULING is not enabled.",
    !googleConfigured &&
      "Google Calendar OAuth is not configured or approved.",
    "Automatic Google Calendar event creation is not implemented.",
  ].filter(Boolean) as string[];

  return {
    manualFirst: true,
    interviewWorkflowEnabled,
    databaseStatus,
    whatsAppReadiness,
    googleMeetFeatureEnabled,
    googleOAuthConfigured: googleConfigured,
    readyForManualScheduling:
      interviewWorkflowEnabled && databaseStatus.state === "ready",
    readyForWhatsAppLogistics: whatsAppReadiness.ready,
    readyForGoogleCalendarAutomation: false,
    safeForAutomaticCalendarEvents: false,
    blockers,
  };
}

export function buildRecruiterLabsCalendarDraft(
  input: RecruiterLabsCalendarDraftInput,
): RecruiterLabsCalendarDraftResult {
  const warnings = [
    "Manual draft only. David must check it before sending.",
    "Do not add CV notes, salary negotiation or private client notes.",
    "Google Calendar and Meet automation is not created by this helper.",
  ];

  if (input.candidateContactApproved !== true) {
    return {
      ok: false,
      code: "candidate_contact_not_approved",
      manualOnly: true,
      warnings,
    };
  }

  if (input.davidApprovedFinalSlot !== true) {
    return {
      ok: false,
      code: "david_approval_required",
      manualOnly: true,
      warnings,
    };
  }

  if (!input.scheduledStartAt || !input.scheduledEndAt) {
    return { ok: false, code: "missing_time", manualOnly: true, warnings };
  }

  const start = parseDate(input.scheduledStartAt);
  const end = parseDate(input.scheduledEndAt);

  if (!start || !end) {
    return { ok: false, code: "invalid_time", manualOnly: true, warnings };
  }

  if (end.getTime() <= start.getTime()) {
    return { ok: false, code: "end_before_start", manualOnly: true, warnings };
  }

  const roleTitle = clean(input.roleTitle, "Interview");
  const candidate = clean(input.candidateLabel, "Candidate");
  const client = clean(input.clientLabel, "Client");
  const timezone = clean(input.timezone, "Europe/London");
  const locationType = input.locationType || "to_be_confirmed";
  const location =
    locationType === "google_meet"
      ? clean(
          input.googleMeetUrl,
          "Google Meet link to be generated by David in Google Calendar",
        )
      : locationType === "phone"
        ? "Phone call. David to confirm the number."
        : locationType === "physical"
          ? clean(input.locationLabel, "Location to be confirmed by David")
          : "Location to be confirmed by David";

  return {
    ok: true,
    code: "draft_ready",
    manualOnly: true,
    title: `Interview: ${roleTitle}`,
    description: [
      "Essential Resourcing interview coordination.",
      `Candidate: ${candidate}`,
      `Client: ${client}`,
      "David to approve the final invite before anything is sent.",
      "Keep sensitive notes, CV detail and salary negotiation out of the calendar body.",
    ].join("\n"),
    location,
    scheduledStartAt: start.toISOString(),
    scheduledEndAt: end.toISOString(),
    timezone,
    reminders: ["24 hours before", "1 hour before"],
    warnings,
  };
}
