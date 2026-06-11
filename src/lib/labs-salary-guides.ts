import "server-only";

import {
  getSalaryGuideLeadCaptureStatus,
  salaryGuideConfig,
} from "./salary-guide";

type LabsSalaryGuidesEnv = Record<string, string | undefined>;

export const labsSalaryGuidesFeatureFlag = "FEATURE_SALARY_GUIDE_GATE";
export const labsSalaryGuidesAdminRoute = "/admin/labs/salary-guides";

export const labsSalaryGuideAssetTypes = [
  "North West Senior Marketing Salary Guide",
  "Manchester Agency Salary Guide",
  "Strategic Interim Day Rate Guide",
  "PR & Communications Salary Snapshot",
  "Marketing Director Salary Guide",
  "Head of Marketing Salary Guide",
  "Agency Client Services Salary Guide",
  "Digital/Performance Marketing Salary Snapshot",
] as const;

export const labsSalaryGuideRequestFields = [
  "name",
  "email",
  "company",
  "role/title",
  "hiring interest",
  "optional phone",
  "contact consent",
  "optional marketing consent",
  "source page",
  "UTM source/medium/campaign",
] as const;

export const labsSalaryGuideLeadStatuses = [
  "new",
  "reviewed",
  "contacted",
  "qualified",
  "converted",
  "closed",
] as const;

export const labsSalaryGuideCmsFields = [
  "title",
  "slug",
  "summary",
  "target audience",
  "guide type",
  "year",
  "region",
  "roles covered",
  "intro copy",
  "key findings",
  "caveats",
  "downloadable asset metadata",
  "gated",
  "public launch ready",
  "feature flag name",
  "SEO title and description",
  "related services",
  "related insights",
  "CTA copy",
] as const;

export const labsSalaryGuidePrivateDataFields = [
  "guide id/slug",
  "name",
  "email",
  "company",
  "job title",
  "phone",
  "hiring interest",
  "lead status",
  "delivery status",
  "consent records",
  "hashed IP/user agent",
  "source page",
  "UTM campaign fields",
] as const;

export const labsSalaryGuideJourney = [
  "David approves a useful guide asset",
  "Sanity can hold public guide copy and asset metadata",
  "feature flag stays off until the launch gate is approved",
  "visitor completes the short request form when launched",
  "lead is stored in private Postgres, not Sanity",
  "David is notified if email delivery is configured",
  "guide link is sent only from the approved download URL",
  "admin follow-up uses status and delivery status",
  "analytics records only non-identifying conversion data",
] as const;

export const labsSalaryGuidePrivacyRules = [
  "No fake salary data.",
  "No public exposure of salary guide leads.",
  "No PII in GA4, GTM or analytics events.",
  "No pre-ticked marketing consent.",
  "Contact consent and marketing consent stay separate.",
  "Sanity stores public guide content only, not private lead records.",
  "The public route stays noindexed until David approves launch.",
  "The page stays out of the sitemap until the launch flag is enabled.",
] as const;

export const labsSalaryGuideLaunchBlockers = [
  "final salary guide content or PDF",
  "legal/privacy wording and retention period",
  "Railway Postgres production migration",
  "approved download URL",
  "Resend or approved email delivery provider",
  "who can access salary guide leads",
  "anti-spam provider decision if traffic requires it",
] as const;

export function getLabsSalaryGuidesStatus(
  env: LabsSalaryGuidesEnv = process.env,
) {
  const leadCapture = getSalaryGuideLeadCaptureStatus(env);

  return {
    featureFlag: labsSalaryGuidesFeatureFlag,
    featureEnabled: leadCapture.featureEnabled,
    adminRoute: labsSalaryGuidesAdminRoute,
    publicRoute: salaryGuideConfig.path,
    noIndex: leadCapture.noIndex,
    hiddenFromNavigation: true,
    hiddenFromSitemap: !leadCapture.featureEnabled,
    databaseStatus: leadCapture.databaseStatus,
    emailConfigured: leadCapture.emailConfigured,
    downloadUrlConfigured: leadCapture.downloadUrlConfigured,
    canCaptureLeads: leadCapture.ready,
    canDeliverGuide:
      leadCapture.ready &&
      leadCapture.emailConfigured &&
      leadCapture.downloadUrlConfigured,
    readyForPublicLaunch: false,
  };
}

export function getLabsSalaryGuidesPreview(
  env: LabsSalaryGuidesEnv = process.env,
) {
  return {
    status: getLabsSalaryGuidesStatus(env),
    guide: salaryGuideConfig,
    assetTypes: labsSalaryGuideAssetTypes,
    requestFields: labsSalaryGuideRequestFields,
    leadStatuses: labsSalaryGuideLeadStatuses,
    cmsFields: labsSalaryGuideCmsFields,
    privateDataFields: labsSalaryGuidePrivateDataFields,
    journey: labsSalaryGuideJourney,
    privacyRules: labsSalaryGuidePrivacyRules,
    launchBlockers: labsSalaryGuideLaunchBlockers,
    principle:
      "Salary guides should start serious B2B conversations, not cheap email grabs.",
  };
}
