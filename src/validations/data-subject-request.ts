import { z } from "zod";
import { dataSubjectRequestTypes } from "@/lib/dsar";

export const dataSubjectRequestMinimumCompletionTimeMs = 3000;

const stripControlCharacters = (value: string) =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

const limitedText = (max: number) =>
  z.string().transform(stripControlCharacters).pipe(z.string().max(max));

const optionalPhone = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z
    .string()
    .trim()
    .max(32)
    .regex(/^[+\d\s().-]+$/, "Please add a valid phone number.")
    .optional(),
);

export const dataSubjectRequestSchema = z.object({
  name: limitedText(80).pipe(z.string().min(2, "Please add your name.")),
  email: z.string().trim().email("Please add a valid email address.").max(254),
  phone: optionalPhone,
  requestType: z.enum(dataSubjectRequestTypes, {
    errorMap: () => ({ message: "Please choose a request type." }),
  }),
  message: limitedText(2000).pipe(
    z.string().min(10, "Please add a little more detail."),
  ),
  confirmAuthority: z.preprocess(
    (value) => (value === true ? "yes" : value),
    z.literal("yes", {
      errorMap: () => ({
        message: "Please confirm you can make this request.",
      }),
    }),
  ),
  privacyNotice: z.preprocess(
    (value) => (value === true ? "yes" : value),
    z.literal("yes", {
      errorMap: () => ({
        message: "Please confirm you have read the privacy notice.",
      }),
    }),
  ),
  website: z.string().max(0, "Spam check failed.").optional().default(""),
  startedAt: z.coerce
    .number()
    .int()
    .positive("Please reload the form and try again."),
});

export type DataSubjectRequestPayload = z.infer<
  typeof dataSubjectRequestSchema
>;

export function formDataToDataSubjectRequestInput(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
