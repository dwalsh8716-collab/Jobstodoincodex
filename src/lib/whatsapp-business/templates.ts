import type { ContactFormPayload } from "@/validations/contact";

export type WhatsAppBusinessTrigger =
  | "candidate_application_received"
  | "candidate_enquiry_received"
  | "client_hiring_enquiry_received"
  | "strategic_interim_enquiry_received"
  | WhatsAppInterviewLogisticsTrigger;

export const whatsAppInterviewLogisticsTriggers = [
  "interview_confirmation",
  "interview_reminder",
  "interview_reschedule",
  "interview_location_drop",
  "interview_availability_check",
] as const;

export type WhatsAppInterviewLogisticsTrigger =
  (typeof whatsAppInterviewLogisticsTriggers)[number];

export const blockedWhatsAppInterviewAutomationTriggers = [
  "rejection",
  "offer_withdrawal",
  "sensitive_feedback",
  "salary_negotiation",
  "bad_news",
  "bulk_marketing",
] as const;

export type WhatsAppTemplateMessage = {
  trigger: WhatsAppBusinessTrigger;
  templateName: string;
  parameters: string[];
};

export type WhatsAppInterviewLocationType =
  | "google_meet"
  | "physical"
  | "phone"
  | "to_be_confirmed";

export type WhatsAppInterviewTemplateInput = {
  trigger: WhatsAppInterviewLogisticsTrigger;
  candidateName: string;
  interviewStartAt: Date | string;
  timezone?: string | null;
  roleTitle?: string | null;
  locationType?: WhatsAppInterviewLocationType | null;
  locationLabel?: string | null;
  googleMeetUrl?: string | null;
  mapUrl?: string | null;
  locationApprovedForWhatsApp?: boolean | null;
};

export const defaultWhatsAppBusinessTemplates: Record<
  WhatsAppBusinessTrigger,
  string
> = {
  candidate_application_received: "candidate_application_received",
  candidate_enquiry_received: "candidate_enquiry_received",
  client_hiring_enquiry_received: "client_hiring_enquiry_received",
  strategic_interim_enquiry_received: "strategic_interim_enquiry_received",
  interview_confirmation: "interview_confirmation",
  interview_reminder: "interview_reminder",
  interview_reschedule: "interview_reschedule",
  interview_location_drop: "interview_location_drop",
  interview_availability_check: "interview_availability_check",
};

const interviewTemplateEnvVars: Record<
  WhatsAppInterviewLogisticsTrigger,
  string
> = {
  interview_confirmation: "WHATSAPP_BUSINESS_INTERVIEW_CONFIRMATION_TEMPLATE",
  interview_reminder: "WHATSAPP_BUSINESS_INTERVIEW_REMINDER_TEMPLATE",
  interview_reschedule: "WHATSAPP_BUSINESS_INTERVIEW_RESCHEDULE_TEMPLATE",
  interview_location_drop: "WHATSAPP_BUSINESS_INTERVIEW_LOCATION_TEMPLATE",
  interview_availability_check:
    "WHATSAPP_BUSINESS_INTERVIEW_AVAILABILITY_TEMPLATE",
};

function cleanTemplateParam(value?: string | null, fallback = "Not confirmed") {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, 240) : fallback;
}

function formatInterviewDateTime(
  value: Date | string,
  timezone = "Europe/London",
) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Time to be confirmed";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone || "Europe/London",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function locationParameter(input: WhatsAppInterviewTemplateInput) {
  if (input.locationType === "google_meet") {
    return cleanTemplateParam(
      input.googleMeetUrl,
      "Google Meet link will follow from David.",
    );
  }

  if (input.locationType === "phone") {
    return "Phone call. David will confirm the number if needed.";
  }

  if (input.locationType === "physical") {
    if (!input.locationApprovedForWhatsApp) {
      return "David will confirm the location separately.";
    }

    return cleanTemplateParam(
      [input.locationLabel, input.mapUrl].filter(Boolean).join(" "),
      "David will confirm the location separately.",
    );
  }

  return "David will confirm the details separately.";
}

export function isAllowedWhatsAppInterviewLogisticsTrigger(
  trigger: string,
): trigger is WhatsAppInterviewLogisticsTrigger {
  return whatsAppInterviewLogisticsTriggers.includes(
    trigger as WhatsAppInterviewLogisticsTrigger,
  );
}

export function templateNameForTrigger(
  trigger: WhatsAppBusinessTrigger,
  env: Record<string, string | undefined> = process.env,
) {
  if (isAllowedWhatsAppInterviewLogisticsTrigger(trigger)) {
    return (
      env[interviewTemplateEnvVars[trigger]] ||
      defaultWhatsAppBusinessTemplates[trigger]
    );
  }

  return defaultWhatsAppBusinessTemplates[trigger];
}

export function templateForInterviewLogistics(
  input: WhatsAppInterviewTemplateInput,
  env: Record<string, string | undefined> = process.env,
): WhatsAppTemplateMessage {
  return {
    trigger: input.trigger,
    templateName: templateNameForTrigger(input.trigger, env),
    parameters: [
      cleanTemplateParam(input.candidateName, "there"),
      formatInterviewDateTime(
        input.interviewStartAt,
        input.timezone || "Europe/London",
      ),
      cleanTemplateParam(input.roleTitle, "the interview"),
      locationParameter(input),
    ],
  };
}

export function templateForContactPayload(
  payload: ContactFormPayload,
): WhatsAppTemplateMessage {
  if (payload.type === "job") {
    return {
      trigger: "candidate_application_received",
      templateName:
        defaultWhatsAppBusinessTemplates.candidate_application_received,
      parameters: [payload.name, payload.jobTitle || "the role"],
    };
  }

  if (payload.type === "candidate") {
    return {
      trigger: "candidate_enquiry_received",
      templateName: defaultWhatsAppBusinessTemplates.candidate_enquiry_received,
      parameters: [payload.name],
    };
  }

  if (/strategic interim/i.test(payload.briefType)) {
    return {
      trigger: "strategic_interim_enquiry_received",
      templateName:
        defaultWhatsAppBusinessTemplates.strategic_interim_enquiry_received,
      parameters: [payload.name],
    };
  }

  return {
    trigger: "client_hiring_enquiry_received",
    templateName:
      defaultWhatsAppBusinessTemplates.client_hiring_enquiry_received,
    parameters: [payload.name],
  };
}
