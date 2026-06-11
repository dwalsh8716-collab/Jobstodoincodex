import "server-only";

import {
  CASE_STUDIES_QUERY,
  CASE_STUDY_BY_SLUG_QUERY,
  INSIGHTS_QUERY,
  INSIGHT_BY_SLUG_QUERY,
  JOBS_QUERY,
  JOB_BY_SLUG_QUERY,
  SALARY_SNAPSHOTS_QUERY,
  SALARY_SNAPSHOT_BY_SLUG_QUERY,
  SERVICES_QUERY,
  SERVICE_BY_SLUG_QUERY,
} from "./sanity-queries";
import { sanityFetchWithFallback } from "./sanity-content";
import type {
  SanityCaseStudy,
  SanityInsight,
  SanityJob,
  SanityCardReference,
  SanitySalarySnapshot,
  SanityService,
  SanityPortableTextBlock,
} from "./sanity-types";
import {
  caseStudies as fallbackCaseStudies,
  insights as fallbackInsights,
  jobs as fallbackJobs,
  salarySnapshots as fallbackSalarySnapshots,
  services as fallbackServices,
} from "./content";
import type {
  CaseStudy,
  CTA,
  Insight,
  Job,
  SalarySnapshot,
  Service,
} from "./types";

const defaultCta: CTA = {
  label: "Talk to David",
  href: "/contact",
  variant: "primary",
};

function bySlug<T extends { slug: string }>(items: T[], slug?: string) {
  if (!slug) return undefined;
  return items.find((item) => item.slug === slug);
}

function strings(value: Array<string | undefined | null> | undefined) {
  return value?.filter((item): item is string => Boolean(item)) ?? [];
}

function stringsOrFallback(
  value: Array<string | undefined | null> | undefined,
  fallback: string[] = [],
) {
  const items = strings(value);
  return items.length ? items : fallback;
}

function referenceSlugs(items: SanityCardReference[] | undefined) {
  return (
    items
      ?.map((item) => item.slug)
      .filter((slug): slug is string => Boolean(slug)) ?? []
  );
}

function cta(value?: CTA, fallback: CTA = defaultCta): CTA {
  return {
    label: value?.label || fallback.label,
    href: value?.href || fallback.href,
    variant: value?.variant || fallback.variant,
  };
}

function textFromPortableBlocks(body?: SanityPortableTextBlock[]) {
  return (
    body
      ?.filter((block) => block._type === "block")
      .map((block) =>
        block.children
          ?.map((child) => child.text)
          .filter(Boolean)
          .join("")
          .trim(),
      )
      .filter((text): text is string => Boolean(text)) ?? []
  );
}

function bodySections(
  body: SanityPortableTextBlock[] | undefined,
  fallback: Insight["body"] = [],
): Insight["body"] {
  const paragraphs = textFromPortableBlocks(body);
  if (!paragraphs.length) return fallback;

  return [
    {
      heading: "Overview",
      content: paragraphs,
    },
  ];
}

function mapService(item: SanityService, fallback?: Service): Service {
  return {
    title: item.title || fallback?.title || "Untitled service",
    slug: item.slug || fallback?.slug || "",
    status: item.status === "draft" ? "draft" : "published",
    noIndex: item.noIndex ?? fallback?.noIndex ?? false,
    shortDescription: item.shortDescription || fallback?.shortDescription || "",
    heroHeadline: item.heroHeadline || fallback?.heroHeadline || item.title,
    heroSubheadline: item.heroSubheadline || fallback?.heroSubheadline || "",
    audience: stringsOrFallback(item.whoFor, fallback?.audience),
    problemsSolved: stringsOrFallback(
      item.problemsSolved,
      fallback?.problemsSolved,
    ),
    whenToUse: stringsOrFallback(item.whenToUse, fallback?.whenToUse),
    howEssentialWorks: stringsOrFallback(
      item.howEssentialWorks,
      fallback?.howEssentialWorks,
    ),
    mistakes: stringsOrFallback(item.commonMistakes, fallback?.mistakes),
    faqs: item.faqs || fallback?.faqs || [],
    relatedServiceSlugs: referenceSlugs(item.relatedServices).length
      ? referenceSlugs(item.relatedServices)
      : fallback?.relatedServiceSlugs || [],
    relatedInsightSlugs: referenceSlugs(item.relatedInsights).length
      ? referenceSlugs(item.relatedInsights)
      : fallback?.relatedInsightSlugs || [],
    relatedCaseStudySlugs: referenceSlugs(item.relatedCaseStudies).length
      ? referenceSlugs(item.relatedCaseStudies)
      : fallback?.relatedCaseStudySlugs || [],
    cta: cta(item.cta, fallback?.cta),
    seoTitle: item.seoTitle || fallback?.seoTitle || item.title,
    metaDescription:
      item.metaDescription ||
      fallback?.metaDescription ||
      item.shortDescription ||
      "",
  };
}

function mapInsight(item: SanityInsight, fallback?: Insight): Insight {
  return {
    title: item.title || fallback?.title || "Untitled insight",
    slug: item.slug || fallback?.slug || "",
    status: item.status || fallback?.status || "draft",
    noIndex: item.noIndex ?? fallback?.noIndex ?? false,
    category: item.category || fallback?.category || "Insight",
    excerpt: item.excerpt || fallback?.excerpt || "",
    publishedDate: item.publishedDate || fallback?.publishedDate || "",
    updatedDate:
      item.updatedDate || fallback?.updatedDate || item.publishedDate || "",
    readingTime: item.readingTime || fallback?.readingTime || "5 min read",
    author: item.author?.name || fallback?.author || "David Walsh",
    body: bodySections(item.body, fallback?.body),
    faqs: item.faqs || fallback?.faqs || [],
    relatedServiceSlugs: referenceSlugs(item.relatedServices).length
      ? referenceSlugs(item.relatedServices)
      : fallback?.relatedServiceSlugs || [],
    relatedInsightSlugs: referenceSlugs(item.relatedInsights).length
      ? referenceSlugs(item.relatedInsights)
      : fallback?.relatedInsightSlugs || [],
    media: fallback?.media,
    seoTitle: item.seoTitle || fallback?.seoTitle || item.title,
    metaDescription:
      item.metaDescription || fallback?.metaDescription || item.excerpt || "",
  };
}

function mapCaseStudy(item: SanityCaseStudy, fallback?: CaseStudy): CaseStudy {
  const approach = item.howWeDeriskedIt?.length
    ? item.howWeDeriskedIt
    : fallback?.approach || [];

  return {
    title: item.title || fallback?.title || "Untitled case study",
    slug: item.slug || fallback?.slug || "",
    status: item.status || fallback?.status || "draft",
    noIndex: item.noIndex ?? fallback?.noIndex ?? false,
    clientType: item.clientType || fallback?.clientType || "Client",
    sector: item.sector || fallback?.sector || "",
    roleHired: item.roleHired || fallback?.roleHired || "",
    serviceSlug: item.serviceUsed?.slug || fallback?.serviceSlug || "",
    challengeSummary: item.challengeSummary || fallback?.challengeSummary || "",
    clientContext:
      fallback?.clientContext || item.clientType || item.sector || "",
    hiringChallenge: fallback?.hiringChallenge || item.challengeSummary || "",
    whyHard: fallback?.whyHard || item.whatMadeItTricky || "",
    businessProblem: item.businessProblem || fallback?.businessProblem || "",
    whyHireMattered: item.whyHireMattered || fallback?.whyHireMattered || "",
    whatMadeItTricky: item.whatMadeItTricky || fallback?.whatMadeItTricky || "",
    whatKindOfPerson: fallback?.whatKindOfPerson || item.roleHired || "",
    approach,
    process: fallback?.process || approach.join(" "),
    outcome: item.outcome || fallback?.outcome || "",
    whatChanged: item.whatChanged || fallback?.whatChanged || "",
    impact: item.commercialImpact || fallback?.impact || "",
    quote: item.testimonialQuote || fallback?.quote,
    featured: item.featured ?? fallback?.featured ?? false,
    seoTitle: item.seoTitle || fallback?.seoTitle || item.title,
    metaDescription:
      item.metaDescription ||
      fallback?.metaDescription ||
      item.challengeSummary ||
      "",
  };
}

function mapSalarySnapshot(
  item: SanitySalarySnapshot,
  fallback?: SalarySnapshot,
): SalarySnapshot {
  return {
    title: item.title || fallback?.title || "Untitled salary snapshot",
    slug: item.slug || fallback?.slug || "",
    status: item.status || fallback?.status || "draft",
    noIndex: item.noIndex ?? fallback?.noIndex ?? false,
    contentFormat: item.contentFormat || fallback?.contentFormat || "snapshot",
    quarter: item.quarterDate || fallback?.quarter || "",
    market: item.market || fallback?.market || "",
    intro: item.introSummary || fallback?.intro || "",
    commentary: item.marketCommentary || fallback?.commentary || [],
    rows:
      item.salaryTableRows?.map((row) => ({
        role: row.roleTitle || "",
        low: row.lowSalary || "",
        mid: row.midSalary || "",
        high: row.highSalary || "",
        notes: row.notes || "",
      })) ??
      fallback?.rows ??
      [],
    hiringNotes: item.hiringNotes || fallback?.hiringNotes || [],
    candidateAvailability:
      item.candidateAvailabilityNotes || fallback?.candidateAvailability || [],
    takeaways: item.keyTakeaways || fallback?.takeaways || [],
    seoTitle: item.seoTitle || fallback?.seoTitle || item.title,
    metaDescription:
      item.metaDescription ||
      fallback?.metaDescription ||
      item.introSummary ||
      "",
  };
}

function mapJob(item: SanityJob, fallback?: Job): Job {
  const description = textFromPortableBlocks(item.body);
  const davidsTake = textFromPortableBlocks(item.davidsTake);
  const interviewSteps = stringsOrFallback(
    item.interviewSteps,
    stringsOrFallback(item.interviewProcess, fallback?.interviewSteps),
  );
  const processSteps = stringsOrFallback(
    item.processSteps,
    stringsOrFallback(item.interviewSteps, fallback?.processSteps),
  );
  const postedDate =
    item.postedDate || item.publishedDate || fallback?.postedDate || "";
  const salaryRange =
    item.salaryRange ||
    item.salary ||
    fallback?.salaryRange ||
    fallback?.salary ||
    "Salary to be confirmed";
  const workingPattern =
    item.workingPattern ||
    item.hybridRemote ||
    fallback?.workingPattern ||
    fallback?.hybrid ||
    "to_be_confirmed";
  const hybridPattern =
    item.hybridPattern ||
    item.hybridReality ||
    fallback?.hybridPattern ||
    fallback?.hybridReality ||
    "Hybrid pattern to confirm.";
  const whyRoleExists =
    item.whyRoleExists ||
    item.whyThisRoleMatters ||
    fallback?.whyRoleExists ||
    fallback?.whyThisRoleMatters ||
    "";
  const candidatePrivacyNote =
    item.candidatePrivacyNote ||
    item.candidateDataHandling ||
    fallback?.candidatePrivacyNote ||
    fallback?.candidateDataHandling ||
    "Candidate data is handled under the Candidate Privacy Notice.";

  return {
    title: item.title || fallback?.title || "Untitled role",
    slug: item.slug || fallback?.slug || "",
    status: item.status || fallback?.status || "draft",
    noIndex: item.noIndex ?? fallback?.noIndex ?? false,
    salaryRange,
    salaryMin: item.salaryMin ?? fallback?.salaryMin,
    salaryMax: item.salaryMax ?? fallback?.salaryMax,
    salaryPeriod:
      item.salaryPeriod || fallback?.salaryPeriod || "to_be_confirmed",
    salary: salaryRange,
    salaryStatus: item.salaryStatus || fallback?.salaryStatus || "unverified",
    salaryTransparencyNote:
      item.salaryTransparencyNote ||
      fallback?.salaryTransparencyNote ||
      "Salary/rate details need confirming before this role goes live.",
    location: item.location || fallback?.location || "Location to confirm",
    officeLocation:
      item.officeLocation ||
      fallback?.officeLocation ||
      item.location ||
      "Office location to confirm",
    workingPattern,
    hybridPattern,
    remotePossible:
      item.remotePossible || fallback?.remotePossible || "to_be_confirmed",
    hybrid: workingPattern,
    hybridReality:
      item.hybridReality ||
      item.hybridPattern ||
      fallback?.hybridReality ||
      fallback?.hybridPattern ||
      "Hybrid pattern to confirm.",
    locationExpectation:
      item.locationExpectation ||
      fallback?.locationExpectation ||
      "Location expectations to confirm.",
    employmentType:
      item.employmentType || fallback?.employmentType || "Permanent",
    sector: item.sector || fallback?.sector || "",
    specialism: item.specialism || fallback?.specialism || "",
    roleType:
      item.roleType ||
      fallback?.roleType ||
      item.specialism ||
      item.employmentType ||
      "",
    seniority: item.seniority || fallback?.seniority || "",
    agencyOrClientSide:
      item.agencyOrClientSide ||
      fallback?.agencyOrClientSide ||
      "to_be_confirmed",
    whyRoleExists,
    whyThisRoleMatters: whyRoleExists || fallback?.whyThisRoleMatters || "",
    summary: item.summary || fallback?.summary || "",
    description: description.length ? description : fallback?.description || [],
    davidsTake: davidsTake.length ? davidsTake : fallback?.davidsTake || [],
    responsibilities: item.responsibilities || fallback?.responsibilities || [],
    mustHaves: item.mustHaves || fallback?.mustHaves || [],
    niceToHaves: item.niceToHaves || fallback?.niceToHaves || [],
    whatGoodLooksLike:
      item.whatGoodLooksLike || fallback?.whatGoodLooksLike || [],
    requirements: item.requirements || fallback?.requirements || [],
    benefits: item.benefits || fallback?.benefits || [],
    interviewSteps,
    interviewProcessConfirmed:
      item.interviewProcessConfirmed ||
      fallback?.interviewProcessConfirmed ||
      "to_be_confirmed",
    interviewProcess: interviewSteps.length
      ? interviewSteps
      : fallback?.interviewProcess || [],
    processOverview:
      item.processOverview ||
      fallback?.processOverview ||
      "Typical process for this kind of role.",
    processSteps,
    expectedTimeline:
      item.expectedTimeline ||
      fallback?.expectedTimeline ||
      "Timeline to confirm.",
    taskRequired:
      item.taskRequired || fallback?.taskRequired || "to_be_confirmed",
    presentationRequired:
      item.presentationRequired ||
      fallback?.presentationRequired ||
      "to_be_confirmed",
    firstStageFormat:
      item.firstStageFormat ||
      fallback?.firstStageFormat ||
      "First-stage format to confirm.",
    finalStageFormat:
      item.finalStageFormat ||
      fallback?.finalStageFormat ||
      "Final-stage format to confirm.",
    feedbackExpectation:
      item.feedbackExpectation ||
      fallback?.feedbackExpectation ||
      "David will explain the next step when there is a relevant fit.",
    applicationReviewTimeframe:
      item.applicationReviewTimeframe ||
      fallback?.applicationReviewTimeframe ||
      "David reviews applications directly.",
    applicationProcess:
      item.applicationProcess || fallback?.applicationProcess || [],
    applicationNotes: item.applicationNotes || fallback?.applicationNotes || "",
    candidatePrivacyNote,
    candidateDataHandling:
      candidatePrivacyNote ||
      fallback?.candidateDataHandling ||
      "Candidate data is handled under the Candidate Privacy Notice.",
    quickQuestionEnabled:
      item.quickQuestionEnabled ?? fallback?.quickQuestionEnabled ?? true,
    whatsappQuestionEnabled:
      item.whatsappQuestionEnabled ?? fallback?.whatsappQuestionEnabled ?? true,
    quickQuestionRoute:
      item.quickQuestionRoute ||
      fallback?.quickQuestionRoute ||
      "Message David with a quick question before applying.",
    applicationCta: fallback?.applicationCta || {
      label: "Apply for this role",
      href: "/contact",
      variant: "primary",
    },
    applicationEmail:
      item.applicationEmail ||
      fallback?.applicationEmail ||
      "hello@essentialresourcing.co.uk",
    postedDate,
    publishedDate: postedDate,
    updatedDate:
      item.updatedDate ||
      item.postedDate ||
      item.publishedDate ||
      fallback?.updatedDate ||
      postedDate,
    closingDate: item.closingDate || fallback?.closingDate,
    seoTitle: item.seoTitle || fallback?.seoTitle || item.title,
    metaDescription:
      item.metaDescription || fallback?.metaDescription || item.summary || "",
  };
}

async function fetchSanityList<T>(query: string, tag: string) {
  return sanityFetchWithFallback<T[]>({
    query,
    fallback: [],
    tags: [tag],
  });
}

export async function getPublicServices() {
  const items = await fetchSanityList<SanityService>(SERVICES_QUERY, "service");
  return items.length
    ? items.map((item) => mapService(item, bySlug(fallbackServices, item.slug)))
    : fallbackServices;
}

export async function getPublicService(slug: string) {
  const fallback = bySlug(fallbackServices, slug);
  const item = await sanityFetchWithFallback<SanityService | null>({
    query: SERVICE_BY_SLUG_QUERY,
    params: { slug },
    fallback: null,
    tags: [`service:${slug}`, "service"],
  });

  return item ? mapService(item, fallback) : fallback;
}

export async function getPublicInsights() {
  const items = await fetchSanityList<SanityInsight>(INSIGHTS_QUERY, "insight");
  return items.length
    ? items.map((item) => mapInsight(item, bySlug(fallbackInsights, item.slug)))
    : fallbackInsights;
}

export async function getPublicInsight(slug: string) {
  const fallback = bySlug(fallbackInsights, slug);
  const item = await sanityFetchWithFallback<SanityInsight | null>({
    query: INSIGHT_BY_SLUG_QUERY,
    params: { slug },
    fallback: null,
    tags: [`insight:${slug}`, "insight"],
  });

  return item ? mapInsight(item, fallback) : fallback;
}

export async function getPublicCaseStudies() {
  const items = await fetchSanityList<SanityCaseStudy>(
    CASE_STUDIES_QUERY,
    "caseStudy",
  );
  return items.length
    ? items.map((item) =>
        mapCaseStudy(item, bySlug(fallbackCaseStudies, item.slug)),
      )
    : fallbackCaseStudies;
}

export async function getPublicCaseStudy(slug: string) {
  const fallback = bySlug(fallbackCaseStudies, slug);
  const item = await sanityFetchWithFallback<SanityCaseStudy | null>({
    query: CASE_STUDY_BY_SLUG_QUERY,
    params: { slug },
    fallback: null,
    tags: [`caseStudy:${slug}`, "caseStudy"],
  });

  return item ? mapCaseStudy(item, fallback) : fallback;
}

export async function getPublicSalarySnapshots() {
  const items = await fetchSanityList<SanitySalarySnapshot>(
    SALARY_SNAPSHOTS_QUERY,
    "salarySnapshot",
  );
  return items.length
    ? items.map((item) =>
        mapSalarySnapshot(item, bySlug(fallbackSalarySnapshots, item.slug)),
      )
    : fallbackSalarySnapshots;
}

export async function getPublicSalarySnapshot(slug: string) {
  const fallback = bySlug(fallbackSalarySnapshots, slug);
  const item = await sanityFetchWithFallback<SanitySalarySnapshot | null>({
    query: SALARY_SNAPSHOT_BY_SLUG_QUERY,
    params: { slug },
    fallback: null,
    tags: [`salarySnapshot:${slug}`, "salarySnapshot"],
  });

  return item ? mapSalarySnapshot(item, fallback) : fallback;
}

export async function getPublicJobs() {
  const items = await fetchSanityList<SanityJob>(JOBS_QUERY, "job");
  return items.length
    ? items.map((item) => mapJob(item, bySlug(fallbackJobs, item.slug)))
    : fallbackJobs;
}

export async function getPublicJob(slug: string) {
  const fallback = bySlug(fallbackJobs, slug);
  const item = await sanityFetchWithFallback<SanityJob | null>({
    query: JOB_BY_SLUG_QUERY,
    params: { slug },
    fallback: null,
    tags: [`job:${slug}`, "job"],
  });

  return item ? mapJob(item, fallback) : fallback;
}
