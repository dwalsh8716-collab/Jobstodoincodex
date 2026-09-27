import { createHash } from "node:crypto";
import { getCliClient } from "sanity/cli";
import {
  caseStudies,
  insights,
  jobs,
  salarySnapshots,
  services,
} from "../src/lib/content.ts";

const dryRun = process.argv.includes("--dry-run");
const verifyOnly = process.argv.includes("--verify");
const types = [
  "service",
  "insight",
  "caseStudy",
  "salarySnapshot",
  "job",
  "person",
];

const client = getCliClient({
  apiVersion: "2026-06-09",
});

function stableKey(...parts) {
  return createHash("sha1")
    .update(parts.map((part) => String(part ?? "")).join(":"))
    .digest("hex")
    .slice(0, 12);
}

function compactObject(value) {
  if (Array.isArray(value)) return value.map(compactObject);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, compactObject(entryValue)]),
  );
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (!value || typeof value !== "object") {
    return JSON.stringify(value);
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

function matchesApprovedCopy(document, patch) {
  return Object.entries(patch)
    .filter(
      ([field, expectedValue]) =>
        stableStringify(document?.[field]) !== stableStringify(expectedValue),
    )
    .map(([field]) => field);
}

function slugField(slug) {
  return { _type: "slug", current: slug };
}

function objectArray(slug, prefix, items, mapItem) {
  return (items || []).map((item, index) => ({
    _key: stableKey(slug, prefix, index, JSON.stringify(item)),
    ...mapItem(item),
  }));
}

function faqArray(slug, faqs) {
  return objectArray(slug, "faq", faqs, (faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));
}

function portableTextFromSections(slug, sections = []) {
  const blocks = [];

  sections.forEach((section, sectionIndex) => {
    if (section.heading) {
      blocks.push(
        portableTextBlock(slug, "h2", section.heading, sectionIndex, 0),
      );
    }

    (section.content || []).forEach((paragraph, paragraphIndex) => {
      blocks.push(
        portableTextBlock(
          slug,
          "normal",
          paragraph,
          sectionIndex,
          paragraphIndex + 1,
        ),
      );
    });
  });

  return blocks;
}

function portableTextFromParagraphs(slug, paragraphs = [], prefix = "body") {
  return paragraphs.map((paragraph, index) =>
    portableTextBlock(slug, "normal", paragraph, prefix, index),
  );
}

function portableTextBlock(slug, style, text, sectionIndex, paragraphIndex) {
  const blockKey = stableKey(
    slug,
    "block",
    style,
    sectionIndex,
    paragraphIndex,
    text,
  );
  return {
    _key: blockKey,
    _type: "block",
    style,
    markDefs: [],
    children: [
      {
        _key: stableKey(blockKey, "span"),
        _type: "span",
        text,
        marks: [],
      },
    ],
  };
}

function refs(slugToId, sourceSlug, type, slugs = []) {
  return slugs.map((slug, index) => {
    const id = slugToId.get(`${type}:${slug}`);
    if (!id) {
      throw new Error(
        `Missing Sanity reference for ${type}:${slug} used by ${sourceSlug}.`,
      );
    }
    return {
      _key: stableKey(sourceSlug, type, slug, index),
      _type: "reference",
      _ref: id,
    };
  });
}

function ref(slugToId, sourceSlug, type, slug) {
  if (!slug) return undefined;
  const id = slugToId.get(`${type}:${slug}`);
  if (!id) {
    throw new Error(
      `Missing Sanity reference for ${type}:${slug} used by ${sourceSlug}.`,
    );
  }
  return { _type: "reference", _ref: id };
}

function servicePatch(item, slugToId) {
  return compactObject({
    title: item.title,
    slug: slugField(item.slug),
    shortDescription: item.shortDescription,
    heroHeadline: item.heroHeadline,
    heroSubheadline: item.heroSubheadline,
    whoFor: item.audience || [],
    problemsSolved: item.problemsSolved || [],
    whenToUse: item.whenToUse || [],
    commonMistakes: item.mistakes || [],
    howEssentialWorks: item.howEssentialWorks || [],
    searchSummary: item.searchSummary,
    searchPhrases: item.searchPhrases || [],
    processSteps: objectArray(
      item.slug,
      "process",
      item.processSteps,
      (step) => ({
        title: step.title,
        text: step.description,
      }),
    ),
    relatedServices: refs(
      slugToId,
      item.slug,
      "service",
      item.relatedServiceSlugs,
    ),
    relatedCaseStudies: refs(
      slugToId,
      item.slug,
      "caseStudy",
      item.relatedCaseStudySlugs,
    ),
    relatedInsights: refs(
      slugToId,
      item.slug,
      "insight",
      item.relatedInsightSlugs,
    ),
    faqs: faqArray(item.slug, item.faqs),
    ctaHeading: item.ctaHeading,
    ctaText: item.ctaText,
    cta: item.cta,
    seoTitle: item.seoTitle,
    metaDescription: item.metaDescription,
    noIndex: item.noIndex ?? false,
    status: item.status || "published",
  });
}

function insightPatch(item, slugToId, authorId) {
  return compactObject({
    title: item.title,
    slug: slugField(item.slug),
    excerpt: item.excerpt,
    category: item.category,
    author: authorId ? { _type: "reference", _ref: authorId } : undefined,
    publishedDate: item.publishedDate,
    updatedDate: item.updatedDate,
    readingTime: item.readingTime,
    body: portableTextFromSections(item.slug, item.body),
    faqs: faqArray(item.slug, item.faqs),
    relatedServices: refs(
      slugToId,
      item.slug,
      "service",
      item.relatedServiceSlugs,
    ),
    relatedInsights: refs(
      slugToId,
      item.slug,
      "insight",
      item.relatedInsightSlugs,
    ),
    ctaHeading: item.ctaHeading,
    ctaText: item.ctaText,
    seoTitle: item.seoTitle,
    metaDescription: item.metaDescription,
    noIndex: item.noIndex ?? false,
    status: item.status || "published",
  });
}

function caseStudyPatch(item, slugToId) {
  return compactObject({
    title: item.title,
    slug: slugField(item.slug),
    clientType: item.clientType,
    sector: item.sector,
    roleHired: item.roleHired,
    serviceUsed: ref(slugToId, item.slug, "service", item.serviceSlug),
    challengeSummary: item.challengeSummary,
    clientContext: item.clientContext,
    hiringChallenge: item.hiringChallenge,
    businessProblem: item.businessProblem,
    whyHireMattered: item.whyHireMattered,
    whatMadeItTricky: item.whatMadeItTricky,
    whyHard: item.whyHard,
    whatKindOfPerson: item.whatKindOfPerson,
    howWeDeriskedIt: item.approach || [],
    process: item.process,
    outcome: item.outcome,
    whatChanged: item.whatChanged,
    whatChangedHeading: item.whatChangedHeading,
    commercialImpact: item.impact,
    impactHeading: item.impactHeading,
    testimonialQuote: item.quote,
    essentialView: item.essentialView || [],
    ctaHeading: item.ctaHeading,
    ctaText: item.ctaText,
    ctaLabel: item.ctaLabel,
    proofLogoPath: item.proofLogo,
    proofLogoAlt: item.proofLogoAlt,
    candidateLinkedInUrl: item.candidateLinkedInUrl,
    candidateLinkedInLabel: item.candidateLinkedInLabel,
    externalSourceUrl: item.externalSourceUrl,
    externalSourceLabel: item.externalSourceLabel,
    featured: item.featured ?? false,
    seoTitle: item.seoTitle,
    metaDescription: item.metaDescription,
    noIndex: item.noIndex ?? false,
    status: item.status || "draft",
  });
}

function salarySnapshotPatch(item) {
  return compactObject({
    title: item.title,
    slug: slugField(item.slug),
    contentFormat: item.contentFormat || "snapshot",
    quarterDate: item.quarter,
    market: item.market,
    introSummary: item.intro,
    marketCommentary: item.commentary || [],
    salaryTableRows: objectArray(item.slug, "salary-row", item.rows, (row) => ({
      roleTitle: row.role,
      lowSalary: row.low,
      midSalary: row.mid,
      highSalary: row.high,
      notes: row.notes,
    })),
    hiringNotes: item.hiringNotes || [],
    candidateAvailabilityNotes: item.candidateAvailability || [],
    keyTakeaways: item.takeaways || [],
    ctaHeading: item.ctaHeading,
    ctaText: item.ctaText,
    cta: item.cta,
    seoTitle: item.seoTitle,
    metaDescription: item.metaDescription,
    noIndex: item.noIndex ?? false,
    status: item.status || "draft",
  });
}

function jobPatch(item) {
  return compactObject({
    title: item.title,
    slug: slugField(item.slug),
    salaryRange: item.salaryRange,
    salaryMin: item.salaryMin,
    salaryMax: item.salaryMax,
    salaryCurrency: item.salaryCurrency,
    salaryPeriod: item.salaryPeriod,
    salaryVisibility: item.salaryVisibility,
    rateMin: item.rateMin,
    rateMax: item.rateMax,
    ratePeriod: item.ratePeriod,
    salary: item.salary,
    salaryStatus: item.salaryStatus,
    salaryTransparencyNote: item.salaryTransparencyNote,
    location: item.location,
    officeLocation: item.officeLocation,
    workingPattern: item.workingPattern,
    hybridPattern: item.hybridPattern,
    remotePossible: item.remotePossible,
    hybridReality: item.hybridReality,
    locationExpectation: item.locationExpectation,
    travelExpectation: item.travelExpectation,
    employmentType: item.employmentType,
    roleType: item.roleType,
    seniority: item.seniority,
    sector: item.sector,
    agencyOrClientSide: item.agencyOrClientSide,
    specialism: item.specialism,
    whyRoleExists: item.whyRoleExists,
    whyThisRoleMatters: item.whyThisRoleMatters,
    successInThreeMonths: item.successInThreeMonths,
    successInSixMonths: item.successInSixMonths,
    successInTwelveMonths: item.successInTwelveMonths,
    summary: item.summary,
    body: portableTextFromParagraphs(
      item.slug,
      item.description,
      "description",
    ),
    davidsTake: portableTextFromParagraphs(
      item.slug,
      item.davidsTake,
      "davidsTake",
    ),
    responsibilities: item.responsibilities || [],
    mustHaves: item.mustHaves || [],
    niceToHaves: item.niceToHaves || [],
    whatGoodLooksLike: item.whatGoodLooksLike || [],
    requirements: item.requirements || [],
    benefits: item.benefits || [],
    interviewSteps: item.interviewSteps || [],
    interviewProcessConfirmed: item.interviewProcessConfirmed,
    interviewProcess: item.interviewProcess || [],
    processOverview: item.processOverview,
    processSteps: item.processSteps || [],
    expectedTimeline: item.expectedTimeline,
    taskRequired: item.taskRequired,
    presentationRequired: item.presentationRequired,
    firstStageFormat: item.firstStageFormat,
    finalStageFormat: item.finalStageFormat,
    feedbackExpectation: item.feedbackExpectation,
    applicationReviewTimeframe: item.applicationReviewTimeframe,
    applicationProcess: item.applicationProcess || [],
    applicationProcessNotes: item.applicationProcessNotes,
    applicationNotes: item.applicationNotes,
    candidatePrivacyNote: item.candidatePrivacyNote,
    candidateDataHandling: item.candidateDataHandling,
    quickQuestionEnabled: item.quickQuestionEnabled,
    whatsappQuestionEnabled: item.whatsappQuestionEnabled,
    quickQuestionRoute: item.quickQuestionRoute,
    applicationEmail: item.applicationEmail,
    applicationFormEnabled: item.applicationFormEnabled ?? true,
    postedDate: item.postedDate,
    publishedDate: item.publishedDate,
    updatedDate: item.updatedDate,
    seoTitle: item.seoTitle,
    metaDescription: item.metaDescription,
    noIndex: item.noIndex ?? false,
    status: item.status || "draft",
  });
}

async function main() {
  const existing = await client.fetch(
    `*[_type in $types]{_id,_type,name,title,"slug":slug.current,status}`,
    { types },
  );

  const slugToId = new Map();
  const docsByKey = new Map();
  let authorId;

  function registerDoc(doc) {
    if (doc._type === "person" && doc.name === "David Walsh") {
      authorId = doc._id;
    }
    if (!doc.slug) return;
    const key = `${doc._type}:${doc.slug}`;
    slugToId.set(key, doc._id);
    docsByKey.set(key, doc);
  }

  for (const doc of existing) {
    registerDoc(doc);
  }

  const sourceDocuments = [
    ...services.map((item) => ({
      key: `service:${item.slug}`,
      type: "service",
      slug: item.slug,
      title: item.title,
      status: item.status || "published",
    })),
    ...insights.map((item) => ({
      key: `insight:${item.slug}`,
      type: "insight",
      slug: item.slug,
      title: item.title,
      status: item.status || "published",
    })),
    ...caseStudies.map((item) => ({
      key: `caseStudy:${item.slug}`,
      type: "caseStudy",
      slug: item.slug,
      title: item.title,
      status: item.status || "draft",
    })),
    ...salarySnapshots.map((item) => ({
      key: `salarySnapshot:${item.slug}`,
      type: "salarySnapshot",
      slug: item.slug,
      title: item.title,
      status: item.status || "draft",
    })),
    ...jobs.map((item) => ({
      key: `job:${item.slug}`,
      type: "job",
      slug: item.slug,
      title: item.title,
      status: item.status || "draft",
    })),
  ];

  for (const source of sourceDocuments) {
    if (docsByKey.has(source.key)) continue;

    if (verifyOnly) {
      console.log(`Missing ${source.key}; run the sync before launch.`);
      continue;
    }

    console.log(`Missing ${source.key}; creating shell document first.`);
    const shellDoc = {
      _type: source.type,
      title: source.title,
      slug: slugField(source.slug),
      status: source.status,
    };

    if (dryRun) {
      registerDoc({
        _id: `dry-run-${stableKey(source.key)}`,
        ...shellDoc,
        slug: source.slug,
      });
      continue;
    }

    const created = await client.create(shellDoc);
    registerDoc({
      ...created,
      slug: source.slug,
    });
  }

  const patches = [
    ...services.map((item) => ({
      key: `service:${item.slug}`,
      type: "service",
      slug: item.slug,
      patch: servicePatch(item, slugToId),
    })),
    ...insights.map((item) => ({
      key: `insight:${item.slug}`,
      type: "insight",
      slug: item.slug,
      patch: insightPatch(item, slugToId, authorId),
    })),
    ...caseStudies.map((item) => ({
      key: `caseStudy:${item.slug}`,
      type: "caseStudy",
      slug: item.slug,
      patch: caseStudyPatch(item, slugToId),
    })),
    ...salarySnapshots.map((item) => ({
      key: `salarySnapshot:${item.slug}`,
      type: "salarySnapshot",
      slug: item.slug,
      patch: salarySnapshotPatch(item),
    })),
    ...jobs.map((item) => ({
      key: `job:${item.slug}`,
      type: "job",
      slug: item.slug,
      patch: jobPatch(item),
    })),
  ];

  if (verifyOnly) {
    const documentIds = patches
      .map((item) => docsByKey.get(item.key)?._id)
      .filter(Boolean);
    const fullDocuments = await client.fetch(`*[_id in $documentIds]`, {
      documentIds,
    });
    const fullDocumentById = new Map(
      fullDocuments.map((document) => [document._id, document]),
    );
    const failures = [];

    for (const item of patches) {
      const current = docsByKey.get(item.key);
      if (!current) {
        failures.push(`${item.key}: missing document`);
        continue;
      }

      const mismatchedFields = matchesApprovedCopy(
        fullDocumentById.get(current._id),
        item.patch,
      );
      if (mismatchedFields.length) {
        failures.push(`${item.key}: ${mismatchedFields.join(", ")}`);
      }
    }

    if (failures.length) {
      console.error(
        `Sanity approved copy verification failed for ${failures.length} document(s):`,
      );
      for (const failure of failures) console.error(`- ${failure}`);
      process.exit(1);
    }

    console.log(
      `Sanity approved copy verification passed for ${patches.length} documents.`,
    );
    return;
  }

  console.log(
    `${dryRun ? "Dry run" : "Syncing"} ${patches.length} approved public CMS documents.`,
  );

  for (const item of patches) {
    const current = docsByKey.get(item.key);
    if (!current) {
      console.log(`Missing ${item.key}; creating from approved copy.`);
      if (!dryRun) {
        await client.create({
          _type: item.type,
          ...item.patch,
        });
      }
      continue;
    }

    console.log(`Patching ${item.key} (${current._id}).`);
    if (!dryRun) {
      await client
        .patch(current._id)
        .set(item.patch)
        .commit({ autoGenerateArrayKeys: true });
    }
  }

  console.log(dryRun ? "Dry run complete." : "Sanity copy sync complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
