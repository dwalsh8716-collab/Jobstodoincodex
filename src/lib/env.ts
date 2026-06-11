import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalBooleanFlag = z.preprocess(
  emptyToUndefined,
  z.enum(["true", "false"]).optional(),
);

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().optional(),
  ),
  NEXT_PUBLIC_SITE_NAME: z.preprocess(emptyToUndefined, z.string().optional()),
  NEXT_PUBLIC_THEME_PALETTE: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  NEXT_PUBLIC_BOOKING_URL: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  NEXT_PUBLIC_GOOGLE_BOOKING_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().optional(),
  ),
  NEXT_PUBLIC_LINKEDIN_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().optional(),
  ),
  NEXT_PUBLIC_PHONE: z.preprocess(emptyToUndefined, z.string().optional()),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  NEXT_PUBLIC_GA_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  NEXT_PUBLIC_GTM_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  NEXT_PUBLIC_LINKEDIN_PARTNER_ID: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  NEXT_PUBLIC_META_PIXEL_ID: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  NEXT_PUBLIC_CLARITY_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  NEXT_PUBLIC_HOTJAR_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  NEXT_PUBLIC_SANITY_DATASET: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  NEXT_PUBLIC_SANITY_API_VERSION: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
});

const serverEnvSchema = publicEnvSchema.extend({
  GOOGLE_SITE_VERIFICATION: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  FEATURE_LABS_ENABLED: optionalBooleanFlag,
  FEATURE_SALARY_GUIDE_GATE: optionalBooleanFlag,
  FEATURE_SALARY_BENCHMARK_ASSET: optionalBooleanFlag,
  FEATURE_MARKET_MAPPING: optionalBooleanFlag,
  FEATURE_BAD_HIRE_CALCULATOR: optionalBooleanFlag,
  FEATURE_FUNCTIONAL_MATRIX: optionalBooleanFlag,
  FEATURE_CLIENT_SHORTLIST_PORTAL: optionalBooleanFlag,
  FEATURE_AI_BRIEF_BUILDER: optionalBooleanFlag,
  FEATURE_INTERIM_BENCH_PORTAL: optionalBooleanFlag,
  FEATURE_LIVE_MARKET_DASHBOARDS: optionalBooleanFlag,
  FEATURE_RECRUITER_LABS_ENABLED: optionalBooleanFlag,
  FEATURE_CLIENT_PRESENTATION_PORTAL: optionalBooleanFlag,
  FEATURE_BRANDED_CANDIDATE_PROFILES: optionalBooleanFlag,
  FEATURE_SHORTLIST_FEEDBACK_TRACKING: optionalBooleanFlag,
  FEATURE_INTERVIEW_REQUEST_WORKFLOW: optionalBooleanFlag,
  FEATURE_WHATSAPP_INTERVIEW_SCHEDULING: optionalBooleanFlag,
  FEATURE_GOOGLE_MEET_INTERVIEW_SCHEDULING: optionalBooleanFlag,
  FEATURE_AI_CANDIDATE_SUMMARIES: optionalBooleanFlag,
  FEATURE_CANDIDATE_TRANSPARENCY_LABS: optionalBooleanFlag,
  FEATURE_FLUFF_FREE_JOB_PAGES: optionalBooleanFlag,
  FEATURE_CANDIDATE_APPLICATION_DROP: optionalBooleanFlag,
  FEATURE_LINKEDIN_PROFILE_APPLICATION: optionalBooleanFlag,
  FEATURE_CANDIDATE_STATUS_JOURNEY: optionalBooleanFlag,
  FEATURE_CANDIDATE_WHATSAPP_QUESTIONS: optionalBooleanFlag,
  FEATURE_INTERVIEW_PROCESS_TRANSPARENCY: optionalBooleanFlag,
  FEATURE_AI_OPS_COMPRESSION: optionalBooleanFlag,
  FEATURE_AI_INTERVIEW_NOTES: optionalBooleanFlag,
  FEATURE_AI_SCORECARD_NOTES: optionalBooleanFlag,
  FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS: optionalBooleanFlag,
  FEATURE_AI_CLIENT_PROFILE_DRAFTS: optionalBooleanFlag,
  FEATURE_AI_FOLLOW_UP_DRAFTS: optionalBooleanFlag,
  RECRUITER_LABS_CLIENT_TOKEN_EXPIRY_DAYS: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  SANITY_PROJECT_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  SANITY_DATASET: z.preprocess(emptyToUndefined, z.string().optional()),
  SANITY_API_VERSION: z.preprocess(emptyToUndefined, z.string().optional()),
  SANITY_READ_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  SANITY_API_READ_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  SANITY_PREVIEW_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  CMS_GATE_USERNAME: z.preprocess(emptyToUndefined, z.string().optional()),
  CMS_GATE_PASSWORD: z.preprocess(emptyToUndefined, z.string().optional()),
  CMS_GATE_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  DATABASE_URL: z.preprocess(emptyToUndefined, z.string().optional()),
  OPERATIONS_DB_ENABLED: z.preprocess(emptyToUndefined, z.string().optional()),
  OPERATIONS_PRIVACY_SALT: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  RETENTION_ENGINE_ENABLED: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  RETENTION_DRY_RUN: z.preprocess(emptyToUndefined, z.string().optional()),
  RETENTION_ROLE_APPLICATION_MONTHS: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  RETENTION_TALENT_POOL_MONTHS: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  RETENTION_GENERAL_CANDIDATE_MONTHS: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  RETENTION_CLIENT_ENQUIRY_MONTHS: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  RETENTION_CV_FILE_MONTHS: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  CANDIDATE_CV_STORAGE_PROVIDER: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  CANDIDATE_CV_STORAGE_BUCKET: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  CANDIDATE_CV_STORAGE_SIGNING_SECRET: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  RETENTION_DSAR_RECORD_MONTHS: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  RETENTION_AUDIT_LOG_MONTHS: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  CRON_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  WHATSAPP_BUSINESS_ENABLED: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  WHATSAPP_BUSINESS_PHONE_NUMBER_ID: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  WHATSAPP_BUSINESS_ACCESS_TOKEN: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  WHATSAPP_BUSINESS_VERIFY_TOKEN: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  WHATSAPP_BUSINESS_APP_SECRET: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  WHATSAPP_BUSINESS_DEFAULT_TEMPLATE: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  WHATSAPP_BUSINESS_TEMPLATE_LANGUAGE: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  WHATSAPP_BUSINESS_API_VERSION: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  CONTACT_TO_EMAIL: z.preprocess(
    emptyToUndefined,
    z.string().email().optional(),
  ),
  CONTACT_FROM_EMAIL: z.preprocess(
    emptyToUndefined,
    z.string().email().optional(),
  ),
  RATE_LIMIT_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parsePublicEnv(
  env: NodeJS.ProcessEnv = process.env,
): PublicEnv {
  return publicEnvSchema.parse(env);
}

export function parseServerEnv(
  env: NodeJS.ProcessEnv = process.env,
): ServerEnv {
  return serverEnvSchema.parse(env);
}
