import { z } from "zod";

export const salaryGuideEmailSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Add your name.")
      .max(80)
      .regex(
        /^[\p{L}\p{M}\s'.’-]+$/u,
        "Please use your name, without links or other details.",
      ),
    email: z.string().trim().email("Add a valid email address.").max(254),
    website: z.string().max(0).default(""),
    startedAt: z.number().int().positive(),
    requestId: z.string().uuid(),
  })
  .strict();
