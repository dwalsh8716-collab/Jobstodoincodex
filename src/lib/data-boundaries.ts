export const publicSanityDocumentTypes = [
  "siteSettings",
  "homePage",
  "navigation",
  "page",
  "service",
  "job",
  "insight",
  "caseStudy",
  "salarySnapshot",
  "testimonial",
  "faq",
  "person",
  "ctaBlock",
  "proofItem",
  "redirect",
] as const;

export const privateOperationalStores = [
  "Railway Postgres",
  "private object storage for future CV files",
] as const;

export const forbiddenSanityFieldNames = [
  "candidateName",
  "candidateEmail",
  "candidatePhone",
  "candidateStatus",
  "candidateProfile",
  "cv",
  "cvFile",
  "cvUrl",
  "cvFileUrl",
  "coverLetter",
  "applicationRecord",
  "applicationStatus",
  "clientContactEmail",
  "privateClientContact",
  "privateNotes",
  "internalStatus",
  "leadHistory",
  "consentRecord",
  "dsarRequest",
  "auditLog",
] as const;

export function isForbiddenSanityFieldName(fieldName: string) {
  return forbiddenSanityFieldNames.includes(
    fieldName as (typeof forbiddenSanityFieldNames)[number],
  );
}
