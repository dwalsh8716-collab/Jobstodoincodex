import { z } from "zod";

export const contactTypes = ["client", "candidate", "job"] as const;
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

export const contactFormSchema = z.object({
  type: z.enum(contactTypes).default("client"),
  name: limitedText(80).pipe(z.string().min(2, "Please add your name.")),
  email: z.string().trim().email("Please add a valid email address.").max(254),
  phone: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .trim()
      .max(32)
      .regex(/^[+\d\s().-]+$/, "Please add a valid phone number.")
      .optional(),
  ),
  company: optionalText(120),
  linkedin: optionalUrl,
  briefType: limitedText(80).pipe(
    z.string().min(2, "Please choose an enquiry type."),
  ),
  message: limitedText(2000).pipe(
    z.string().min(10, "Please add a little more detail."),
  ),
  consent: z.preprocess(
    (value) => (value === true ? "yes" : value),
    z.literal("yes", { errorMap: () => ({ message: "Consent is required." }) }),
  ),
  website: z.string().max(0, "Spam check failed.").optional().default(""),
  startedAt: z.coerce
    .number()
    .int()
    .positive("Please reload the form and try again."),
  jobTitle: optionalText(160),
});

export type ContactFormPayload = z.infer<typeof contactFormSchema>;

export function formDataToContactInput(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
