import type { ContactFormPayload } from "@/validations/contact";

export type WhatsAppBusinessTrigger =
  | "candidate_application_received"
  | "candidate_enquiry_received"
  | "client_hiring_enquiry_received"
  | "strategic_interim_enquiry_received";

export type WhatsAppTemplateMessage = {
  trigger: WhatsAppBusinessTrigger;
  templateName: string;
  parameters: string[];
};

export const defaultWhatsAppBusinessTemplates: Record<
  WhatsAppBusinessTrigger,
  string
> = {
  candidate_application_received: "candidate_application_received",
  candidate_enquiry_received: "candidate_enquiry_received",
  client_hiring_enquiry_received: "client_hiring_enquiry_received",
  strategic_interim_enquiry_received: "strategic_interim_enquiry_received",
};

export function templateForContactPayload(
  payload: ContactFormPayload,
): WhatsAppTemplateMessage {
  if (payload.type === "job") {
    return {
      trigger: "candidate_application_received",
      templateName: defaultWhatsAppBusinessTemplates.candidate_application_received,
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
    templateName: defaultWhatsAppBusinessTemplates.client_hiring_enquiry_received,
    parameters: [payload.name],
  };
}
