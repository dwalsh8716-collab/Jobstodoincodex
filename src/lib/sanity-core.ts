export const sanityCoreSchemaCoverage = [
  {
    requirement: "Post",
    schemaType: "insight",
    editorLabel: "Insights / Posts",
    status: "covered_by_existing_schema",
    notes:
      "Insights are the public post/article model, with author, rich text, FAQs, related content and SEO.",
  },
  {
    requirement: "Author",
    schemaType: "person",
    editorLabel: "Authors / David Walsh / Team",
    status: "covered_by_existing_schema",
    notes:
      "People records act as authors and public profile content. They are not candidate records.",
  },
  {
    requirement: "CaseStudy",
    schemaType: "caseStudy",
    editorLabel: "Case Studies",
    status: "native_schema",
    notes:
      "Public case-study proof only, with permission and no private client/candidate records.",
  },
  {
    requirement: "Service",
    schemaType: "service",
    editorLabel: "Services",
    status: "native_schema",
    notes:
      "Commercial public service pages with problems, outcomes, FAQs, CTAs and SEO.",
  },
  {
    requirement: "SiteSettings",
    schemaType: "siteSettings",
    editorLabel: "Site Settings",
    status: "native_schema",
    notes:
      "Global public settings, contact routes, booking, WhatsApp, proof and default SEO.",
  },
  {
    requirement: "Navigation",
    schemaType: "navigation",
    editorLabel: "Navigation",
    status: "native_schema",
    notes: "Header/footer link records with ordering and CTA flags.",
  },
  {
    requirement: "Footer",
    schemaType: "siteSettings",
    editorLabel: "Footer settings",
    status: "covered_by_existing_schema",
    notes:
      "Footer copy, footer CTA and footer navigation live in Site Settings to avoid a duplicate singleton.",
  },
  {
    requirement: "Testimonial",
    schemaType: "testimonial",
    editorLabel: "Testimonials",
    status: "native_schema",
    notes:
      "Public testimonials only, with explicit permission fields before named proof is used.",
  },
  {
    requirement: "SalaryGuide",
    schemaType: "salarySnapshot",
    editorLabel: "Salary Guides / Snapshots",
    status: "covered_by_existing_schema",
    notes:
      "The salary snapshot model now supports public salary-guide landing pages without storing gated lead data.",
  },
  {
    requirement: "Job",
    schemaType: "job",
    editorLabel: "Jobs",
    status: "native_schema",
    notes:
      "Public job advert content only. Applications, CVs and candidate PII stay in private operations storage.",
  },
] as const;

export type SanityCoreSchemaCoverage =
  (typeof sanityCoreSchemaCoverage)[number];

export const sanityCorePrivateDataPolicy = {
  publicCms:
    "Sanity stores public website content only: pages, posts, services, public jobs, proof, salary content, navigation, footer and SEO.",
  privateStore:
    "Private enquiries, candidate records, applications, CV metadata, DSAR records, audit logs and client operational notes belong in Railway Postgres/private storage.",
  noDuplicateSchemas:
    "Post, Author, Footer and SalaryGuide are covered by existing editorial models rather than duplicate document types.",
} as const;

export function getSanityCoreSchemaCoverage() {
  return {
    documents: sanityCoreSchemaCoverage,
    requiredCount: sanityCoreSchemaCoverage.length,
    nativeCount: sanityCoreSchemaCoverage.filter(
      (item) => item.status === "native_schema",
    ).length,
    reusedCount: sanityCoreSchemaCoverage.filter(
      (item) => item.status === "covered_by_existing_schema",
    ).length,
    privateDataPolicy: sanityCorePrivateDataPolicy,
  };
}
