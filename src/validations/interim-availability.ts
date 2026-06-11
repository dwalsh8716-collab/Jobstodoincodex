import { z } from "zod";
import { interimAvailabilityStatuses } from "@/lib/interim-availability-shared";

const stripControlCharacters = (value: string) =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .transform(stripControlCharacters)
      .pipe(z.string().max(max))
      .optional(),
  );

const optionalDate = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please add a valid date.")
    .optional(),
);

export const interimAvailabilityUpdateSchema = z
  .object({
    token: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9_-]{32,200}$/, "This link could not be used."),
    status: z.enum(interimAvailabilityStatuses, {
      errorMap: () => ({ message: "Please choose your availability." }),
    }),
    availableFrom: optionalDate,
    dayRate: optionalText(80),
    preferredContractType: optionalText(120),
    sectors: optionalText(500),
    functions: optionalText(500),
    locationPreference: optionalText(160),
    remotePreference: optionalText(160),
    contactPreference: optionalText(160),
    notes: optionalText(1000),
    optOut: z.coerce.boolean().optional().default(false),
  })
  .superRefine((value, context) => {
    if (value.status === "available_from" && !value.availableFrom) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["availableFrom"],
        message: "Please add the date you expect to be available.",
      });
    }
  });

export type InterimAvailabilityUpdatePayload = z.infer<
  typeof interimAvailabilityUpdateSchema
>;
