import { z } from "zod";

export const contactTypes = ["client", "candidate", "job"] as const;
export const preferredContactMethods = [
  "no_preference",
  "email",
  "phone",
  "whatsapp",
] as const;
export const minimumCompletionTimeMs = 3000;

const stripControlCharacters = (value: string) =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

const limitedText = (max: number) =>
  z.string().transform(stripControlCharacters).pipe(z.string().max(max));
const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    limitedText(max).optional(),
  );

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z
    .string()
    .trim()
    .url("Please add a full URL, including https://")
    .max(240)
    .optional(),
);

export const contactFormSchema = z
  .object({
    type: z.enum(contactTypes).default("client"),
    name: limitedText(80).pipe(z.string().min(2, "Please add your name.")),
    email: z
      .string()
      .trim()
      .email("Please add a valid email address.")
      .max(254),
    phone: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z
        .string()
        .trim()
        .max(32)
        .regex(/^[+\d\s().-]+$/, "Please add a valid phone number.")
        .optional(),
    ),
    preferredContactMethod: z
      .enum(preferredContactMethods)
      .default("no_preference"),
    company: optionalText(120),
    linkedin: optionalUrl,
    briefType: limitedText(80).pipe(
      z.string().min(2, "Please choose an enquiry type."),
    ),
    message: optionalText(2000),
    consent: z.preprocess(
      (value) => (value === true ? "yes" : value),
      z.literal("yes", {
        errorMap: () => ({ message: "Consent is required." }),
      }),
    ),
    privacyNoticeAcknowledgement: z.preprocess(
      (value) => (value === true ? "yes" : value),
      z.literal("yes").optional(),
    ),
    whatsappContactConsent: z.preprocess(
      (value) => (value === true ? "yes" : value),
      z.literal("yes").optional(),
    ),
    talentPoolConsent: z.preprocess(
      (value) => (value === true ? "yes" : value),
      z.literal("yes").optional(),
    ),
    website: z.string().max(0, "Spam check failed.").optional().default(""),
    startedAt: z.coerce
      .number()
      .int()
      .positive("Please reload the form and try again."),
    jobTitle: optionalText(160),
    jobSlug: optionalText(160),
    sourcePage: optionalText(240),
  })
  .superRefine((payload, ctx) => {
    const messageLength = payload.message?.length || 0;

    if (payload.type === "client" && messageLength < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["message"],
        message: "Please add a little more detail.",
      });
    }

    if (payload.type !== "client") {
      if (!payload.linkedin && messageLength < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["linkedin"],
          message:
            "Please add either a LinkedIn/profile URL or a short note.",
        });
      }

      if (payload.message && messageLength > 0 && messageLength < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["message"],
          message: "Please add a little more detail, or leave the note blank.",
        });
      }
    }

    if (
      ["phone", "whatsapp"].includes(payload.preferredContactMethod) &&
      !payload.phone
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message:
          "Please add a phone number if you prefer phone or WhatsApp contact.",
      });
    }

    if (
      payload.type !== "client" &&
      payload.privacyNoticeAcknowledgement !== "yes"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["privacyNoticeAcknowledgement"],
        message:
          "Please confirm that you have read the Candidate Privacy Notice.",
      });
    }

    if (
      payload.type !== "client" &&
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

export type ContactFormPayload = z.infer<typeof contactFormSchema>;

export function formDataToContactInput(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
