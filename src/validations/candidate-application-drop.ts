import { z } from "zod";
import {
  maxCandidateNoteLength,
  minStandaloneCandidateNoteLength,
} from "@/lib/candidate-application-constraints";
import { preferredContactMethods } from "./contact";

export const maxCvFileBytes = 10 * 1024 * 1024;

export const allowedCvMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const allowedCvExtensions = [".pdf", ".doc", ".docx"] as const;

const emptyToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

const safeText = (max: number) =>
  z
    .string()
    .trim()
    .transform((value) =>
      value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ""),
    )
    .pipe(z.string().max(max));

export const candidateApplicationDropSchema = z
  .object({
    type: z.enum(["candidate", "job"]).default("candidate"),
    name: safeText(80).pipe(z.string().min(2, "Please add your name.")),
    email: z
      .string()
      .trim()
      .email("Please add a valid email address.")
      .max(254),
    phone: z.preprocess(emptyToUndefined, z.string().trim().max(32).optional()),
    linkedin: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .url("Please add a full URL, including https://")
        .max(240)
        .optional(),
    ),
    note: z.preprocess(
      emptyToUndefined,
      safeText(maxCandidateNoteLength).optional(),
    ),
    preferredContactMethod: z
      .enum(preferredContactMethods)
      .default("no_preference"),
    consent: z.literal("yes", {
      errorMap: () => ({ message: "Consent is required." }),
    }),
    privacyNoticeAcknowledgement: z.literal("yes", {
      errorMap: () => ({
        message:
          "Please confirm that you have read the Candidate Privacy Notice.",
      }),
    }),
    whatsappContactConsent: z.literal("yes").optional(),
    talentPoolConsent: z.literal("yes").optional(),
    hasCvFile: z.literal("yes").optional(),
    website: z.preprocess(
      emptyToUndefined,
      z.string().max(0, "Spam check failed.").optional().default(""),
    ),
    startedAt: z.coerce
      .number()
      .int()
      .positive("Please reload the form and try again."),
    sourcePage: z.preprocess(emptyToUndefined, safeText(240).optional()),
    jobTitle: z.preprocess(emptyToUndefined, safeText(160).optional()),
    jobSlug: z.preprocess(emptyToUndefined, safeText(160).optional()),
    utm_source: z.preprocess(emptyToUndefined, safeText(80).optional()),
    utm_medium: z.preprocess(emptyToUndefined, safeText(80).optional()),
    utm_campaign: z.preprocess(emptyToUndefined, safeText(80).optional()),
    referrerHost: z.preprocess(emptyToUndefined, safeText(100).optional()),
  })
  .superRefine((payload, ctx) => {
    const noteLength = payload.note?.length || 0;

    if (
      !payload.linkedin &&
      noteLength < minStandaloneCandidateNoteLength &&
      payload.hasCvFile !== "yes"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["note"],
        message:
          "Add a CV or profile link, or write at least 10 characters in the short note.",
      });
    }

    if (payload.preferredContactMethod === "whatsapp" && !payload.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Please add a phone number if you prefer WhatsApp contact.",
      });
    }

    if (
      payload.preferredContactMethod === "whatsapp" &&
      payload.whatsappContactConsent !== "yes"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["whatsappContactConsent"],
        message:
          "Please confirm WhatsApp is okay if you choose it as your preferred contact method.",
      });
    }
  });

export type CandidateApplicationDropPayload = z.infer<
  typeof candidateApplicationDropSchema
>;

export type CvFileMeta = {
  name: string;
  type: string;
  size: number;
};

function hasAllowedExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  return allowedCvExtensions.some((extension) => lower.endsWith(extension));
}

export function validateCvFile(
  value: FormDataEntryValue | null,
): { ok: true; file: CvFileMeta | null } | { ok: false; message: string } {
  if (!value || typeof value === "string") return { ok: true, file: null };

  if (value.size === 0) return { ok: true, file: null };

  if (value.size > maxCvFileBytes) {
    return {
      ok: false,
      message: "CV file is too large. Maximum size is 10MB.",
    };
  }

  const hasValidExtension = hasAllowedExtension(value.name);
  const hasKnownSafeMime =
    value.type === "" ||
    value.type === "application/octet-stream" ||
    allowedCvMimeTypes.includes(
      value.type as (typeof allowedCvMimeTypes)[number],
    );

  if (!hasValidExtension || !hasKnownSafeMime) {
    return {
      ok: false,
      message: "CV file must be a PDF, DOC or DOCX.",
    };
  }

  return {
    ok: true,
    file: {
      name: value.name,
      type: value.type || "application/octet-stream",
      size: value.size,
    },
  };
}

export function formDataToCandidateApplicationDropInput(formData: FormData) {
  const cvFile = formData.get("cvFile");

  return {
    type: formData.get("type"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    linkedin: formData.get("linkedin"),
    note: formData.get("note"),
    preferredContactMethod: formData.get("preferredContactMethod"),
    consent: formData.get("consent"),
    privacyNoticeAcknowledgement: formData.get("privacyNoticeAcknowledgement"),
    whatsappContactConsent: formData.get("whatsappContactConsent") || undefined,
    talentPoolConsent: formData.get("talentPoolConsent") || undefined,
    hasCvFile:
      cvFile && typeof cvFile !== "string" && cvFile.size > 0
        ? "yes"
        : undefined,
    website: formData.get("website"),
    startedAt: formData.get("startedAt"),
    sourcePage: formData.get("sourcePage"),
    jobTitle: formData.get("jobTitle"),
    jobSlug: formData.get("jobSlug"),
    utm_source: formData.get("utm_source"),
    utm_medium: formData.get("utm_medium"),
    utm_campaign: formData.get("utm_campaign"),
    referrerHost: formData.get("referrerHost"),
  };
}
