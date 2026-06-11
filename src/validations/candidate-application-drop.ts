import { z } from "zod";
import { preferredContactMethods } from "./contact";

export const maxCvFileBytes = 10 * 1024 * 1024;

export const allowedCvMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const allowedCvExtensions = [".pdf", ".doc", ".docx"] as const;

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

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
    note: z.preprocess(emptyToUndefined, safeText(2000).optional()),
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
    jobTitle: z.preprocess(emptyToUndefined, safeText(160).optional()),
    jobSlug: z.preprocess(emptyToUndefined, safeText(160).optional()),
  })
  .superRefine((payload, ctx) => {
    const noteLength = payload.note?.length || 0;

    if (!payload.linkedin && noteLength < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["linkedin"],
        message:
          "Please add either a LinkedIn/profile URL or a short note.",
      });
    }

    if (payload.note && noteLength > 0 && noteLength < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["note"],
        message: "Please add a little more detail, or leave the note blank.",
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

  if (
    !allowedCvMimeTypes.includes(
      value.type as (typeof allowedCvMimeTypes)[number],
    ) &&
    !hasAllowedExtension(value.name)
  ) {
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
  return {
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
    jobTitle: formData.get("jobTitle"),
    jobSlug: formData.get("jobSlug"),
  };
}
