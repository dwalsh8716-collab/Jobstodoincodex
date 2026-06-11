import { z } from "zod";
import { salaryGuideHiringInterests } from "@/lib/salary-guide-shared";
import { minimumCompletionTimeMs } from "./contact";

const stripControlCharacters = (value: string) =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

const limitedText = (max: number) =>
  z.string().transform(stripControlCharacters).pipe(z.string().max(max));

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    limitedText(max).optional(),
  );

export const salaryGuideLeadSchema = z.object({
  guideSlug: limitedText(120).default("senior-marketing-salary-guide"),
  name: limitedText(80).pipe(z.string().min(2, "Please add your name.")),
  company: limitedText(120).pipe(
    z.string().min(2, "Please add your company."),
  ),
  email: z
    .string()
    .trim()
    .email("Please add a valid email address.")
    .max(254),
  jobTitle: optionalText(160),
  phone: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .trim()
      .max(32)
      .regex(/^[+\d\s().-]+$/, "Please add a valid phone number.")
      .optional(),
  ),
  hiringInterest: z.enum(salaryGuideHiringInterests, {
    errorMap: () => ({ message: "Please choose what the guide is for." }),
  }),
  consentToContact: z.preprocess(
    (value) => (value === true ? "yes" : value),
    z.literal("yes", {
      errorMap: () => ({ message: "Consent to contact is required." }),
    }),
  ),
  marketingConsent: z.preprocess(
    (value) => (value === true ? "yes" : value),
    z.literal("yes").optional(),
  ),
  website: z.string().max(0, "Spam check failed.").optional().default(""),
  startedAt: z.coerce
    .number()
    .int()
    .positive("Please reload the form and try again."),
});

export type SalaryGuideLeadPayload = z.infer<typeof salaryGuideLeadSchema>;

export function formDataToSalaryGuideInput(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export { minimumCompletionTimeMs as salaryGuideMinimumCompletionTimeMs };
