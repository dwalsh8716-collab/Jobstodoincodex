import "server-only";

import {
  CASE_STUDIES_QUERY,
  CASE_STUDY_BY_SLUG_QUERY,
  CONTENT_HUB_PAGES_QUERY,
  HOME_PAGE_QUERY,
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
import {
  defaultHomePageContent,
  type HomeAudiencePanel,
  type HomeComparisonRow,
  type HomeDefinition,
  type HomePageContent,
  type HomeProofItem,
  type HomeRecommendation,
  type HomeServiceCard,
  type HomeSpecialismCard,
} from "./homepage-content";
import type {
  SanityCaseStudy,
  SanityContentHubPages,
  SanityInsight,
  SanityJob,
  SanityCardReference,
  SanityHomePage,
  SanitySalarySnapshot,
  SanityService,
  SanityVideo,
  SanityPortableTextBlock,
} from "./sanity-types";
import { fallbackContentHubPages } from "./content-hub-pages";
import {
  caseStudies as fallbackCaseStudies,
  homepageFeatureVideo,
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
  RichMedia,
  SalarySnapshot,
  Service,
} from "./types";

type VideoMedia = Extract<RichMedia, { type: "video" }>;
type SanityHomeDefinition = NonNullable<
  NonNullable<SanityHomePage["filterSection"]>["definitions"]
>[number];
type SanityHomeComparisonRow = NonNullable<
  NonNullable<SanityHomePage["differenceSection"]>["rows"]
>[number];
type SanityHomeAudiencePanel = NonNullable<
  NonNullable<SanityHomePage["audienceSection"]>["client"]
>;
type SanityHomeProofItem = NonNullable<
  NonNullable<SanityHomePage["proofSection"]>["framework"]
>[number];
type SanityHomeRecommendation = NonNullable<
  NonNullable<SanityHomePage["linkedInSection"]>["recommendations"]
>[number];
type SanityHomeSpecialismCard = NonNullable<
  NonNullable<SanityHomePage["specialismsSection"]>["cards"]
>[number];

const fallbackHomepageVideo = homepageFeatureVideo as VideoMedia;

const defaultCta: CTA = {
  label: "Talk to David",
  href: "/contact",
  variant: "primary",
};

const retiredInsightSlugs = new Set([
  "what-is-a-strategic-interim-marketing-leader",
]);

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
  return value == null ? fallback : strings(value);
}

function referenceSlugs(items: SanityCardReference[] | undefined) {
  return (
    items
      ?.map((item) => item.slug)
      .filter((slug): slug is string => Boolean(slug)) ?? []
  );
}

function valueOrFallback(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function imageUrl(image: SanityVideo["posterImage"]) {
  return image?.asset?.url;
}

function mapSanityHomepageMedia(
  media: SanityVideo | undefined,
  fallback: VideoMedia = fallbackHomepageVideo,
): RichMedia {
  const title =
    media?.title ||
    fallback.title ||
    "David Walsh, founder of Essential Resourcing";
  const stillImageUrl = imageUrl(media?.stillImage);

  if (stillImageUrl) {
    return {
      type: "image",
      title,
      src: stillImageUrl,
      alt:
        media?.stillImage?.alt ||
        "David Walsh, founder of Essential Resourcing and marketing recruitment specialist in Manchester",
      caption: media?.stillImage?.caption,
    };
  }

  const uploadedVideoUrl = media?.uploadedVideo?.asset?.url;
  const url = uploadedVideoUrl || media?.url;
  const thumbnail = imageUrl(media?.posterImage);

  if (!url && !thumbnail) return fallback;

  return {
    type: "video",
    provider: media?.provider || (uploadedVideoUrl ? "upload" : "youtube"),
    title,
    url,
    description: media?.description || fallback.description,
    thumbnail: thumbnail || fallback.thumbnail,
    thumbnailAlt:
      media?.posterImage?.alt ||
      fallback.thumbnailAlt ||
      "David Walsh, founder of Essential Resourcing",
    captionsUrl: media?.captionsUrl,
    transcript: media?.transcript,
  };
}

function cta(value?: CTA, fallback: CTA = defaultCta): CTA {
  return {
    label: value?.label || fallback.label,
    href: value?.href || fallback.href,
    variant: value?.variant || fallback.variant,
  };
}

function arrayOrFallback<T>(value: T[] | undefined, fallback: T[]) {
  return value?.length ? value : fallback;
}

function cleanDefinitions(
  value: SanityHomeDefinition[] | undefined,
  fallback: HomeDefinition[],
) {
  const items =
    value
      ?.map((item) => ({
        number: item.number || "",
        phrase: item.phrase || "",
        copy: item.copy || "",
      }))
      .filter((item) => item.number && item.phrase && item.copy) ?? [];

  return items.length ? items : fallback;
}

function cleanRows(
  value: SanityHomeComparisonRow[] | undefined,
  fallback: HomeComparisonRow[],
) {
  const items =
    value
      ?.map((item) => ({
        usual: item.usual || "",
        essential: item.essential || "",
      }))
      .filter((item) => item.usual && item.essential) ?? [];

  return items.length ? items : fallback;
}

function cleanServiceCards(
  value: SanityHomePage["serviceCards"],
  fallback: HomeServiceCard[],
) {
  const items =
    value
      ?.map((item) => ({
        slug: item.slug || "",
        title: item.title || "",
        proposition: item.proposition || "",
        description: item.description || "",
        linkLabel: item.linkLabel || "",
        href: item.href || (item.slug ? `/services/${item.slug}` : ""),
      }))
      .filter((item) => item.slug && item.title && item.href) ?? [];

  return items.length ? items : fallback;
}

function cleanProofItems(
  value: SanityHomeProofItem[] | undefined,
  fallback: HomeProofItem[],
) {
  const items =
    value
      ?.map((item) => ({
        title: item.title || "",
        copy: item.copy || "",
      }))
      .filter((item) => item.title && item.copy) ?? [];

  return items.length ? items : fallback;
}

function cleanRecommendations(
  value: SanityHomeRecommendation[] | undefined,
  fallback: HomeRecommendation[],
) {
  const items =
    value
      ?.map((item) => ({
        proofPoint: item.proofPoint || "",
        name: item.name || "",
        role: item.role || "",
        date: item.date || "",
        quote: item.quote || "",
      }))
      .filter((item) => item.proofPoint && item.name && item.quote) ?? [];

  return items.length ? items : fallback;
}

function cleanSpecialismCards(
  value: SanityHomeSpecialismCard[] | undefined,
  fallback: HomeSpecialismCard[],
) {
  const items =
    value
      ?.map((item) => ({
        slug: item.slug || "",
        title: item.title || "",
        description: item.description || "",
        linkLabel: item.linkLabel || "",
        href: item.href || (item.slug ? `/specialisms/${item.slug}` : ""),
      }))
      .filter((item) => item.slug && item.title && item.href) ?? [];

  return items.length ? items : fallback;
}

function audiencePanel(
  value: SanityHomeAudiencePanel | undefined,
  fallback: HomeAudiencePanel,
) {
  return {
    eyebrow: valueOrFallback(value?.eyebrow, fallback.eyebrow),
    heading: valueOrFallback(value?.heading, fallback.heading),
    items: arrayOrFallback(value?.items, fallback.items),
    ctaLabel: valueOrFallback(value?.ctaLabel, fallback.ctaLabel),
    ctaHref: valueOrFallback(value?.ctaHref, fallback.ctaHref),
  };
}

export async function getPublicHomePage(): Promise<HomePageContent> {
  const item = await sanityFetchWithFallback<SanityHomePage | null>({
    query: HOME_PAGE_QUERY,
    fallback: null,
    tags: ["homePage"],
  });
  const fallback = defaultHomePageContent;
  const cityImageUrl = item?.citySection?.image?.asset?.url;
  const linkedInSection = item?.linkedInSection;
  const specialismsSection = item?.specialismsSection;

  return {
    ...fallback,
    heroEyebrow: item?.heroEyebrow || fallback.heroEyebrow,
    heroHeadline: item?.heroHeadline || fallback.heroHeadline,
    heroSubheadline: item?.heroSubheadline || fallback.heroSubheadline,
    heroLede: item?.heroLede || fallback.heroLede,
    heroPrimaryCta: cta(item?.heroPrimaryCta, fallback.heroPrimaryCta),
    heroSecondaryCta: cta(item?.heroSecondaryCta, fallback.heroSecondaryCta),
    premiumMedia: mapSanityHomepageMedia(item?.premiumVideo),
    proofPoints: item?.proofPoints?.length
      ? item.proofPoints
      : fallback.proofPoints,
    disciplines: arrayOrFallback(item?.disciplines, fallback.disciplines),
    filterSection: {
      eyebrow: valueOrFallback(
        item?.filterSection?.eyebrow,
        fallback.filterSection.eyebrow,
      ),
      heading: valueOrFallback(
        item?.filterSection?.heading,
        fallback.filterSection.heading,
      ),
      paragraphs: arrayOrFallback(
        item?.filterSection?.paragraphs,
        fallback.filterSection.paragraphs,
      ),
      definitions: cleanDefinitions(
        item?.filterSection?.definitions,
        fallback.filterSection.definitions,
      ),
    },
    differenceSection: {
      eyebrow: valueOrFallback(
        item?.differenceSection?.eyebrow,
        fallback.differenceSection.eyebrow,
      ),
      heading: valueOrFallback(
        item?.differenceSection?.heading,
        fallback.differenceSection.heading,
      ),
      paragraphs: arrayOrFallback(
        item?.differenceSection?.paragraphs,
        fallback.differenceSection.paragraphs,
      ),
      comparisonLabelLeft: valueOrFallback(
        item?.differenceSection?.comparisonLabelLeft,
        fallback.differenceSection.comparisonLabelLeft,
      ),
      comparisonLabelRight: valueOrFallback(
        item?.differenceSection?.comparisonLabelRight,
        fallback.differenceSection.comparisonLabelRight,
      ),
      rows: cleanRows(
        item?.differenceSection?.rows,
        fallback.differenceSection.rows,
      ),
    },
    servicesSection: {
      eyebrow: valueOrFallback(
        item?.servicesSection?.eyebrow,
        fallback.servicesSection.eyebrow,
      ),
      heading: valueOrFallback(
        item?.servicesSection?.heading,
        fallback.servicesSection.heading,
      ),
      intro: valueOrFallback(
        item?.servicesSection?.intro,
        fallback.servicesSection.intro,
      ),
      cards: cleanServiceCards(
        item?.serviceCards,
        fallback.servicesSection.cards,
      ),
    },
    founderSection: {
      eyebrow: valueOrFallback(
        item?.founderSection?.eyebrow,
        fallback.founderSection.eyebrow,
      ),
      heading: valueOrFallback(
        item?.founderSection?.heading,
        fallback.founderSection.heading,
      ),
      paragraphs: arrayOrFallback(
        item?.founderSection?.paragraphs,
        fallback.founderSection.paragraphs,
      ),
      straightTalkHeading: valueOrFallback(
        item?.founderSection?.straightTalkHeading,
        fallback.founderSection.straightTalkHeading,
      ),
      straightTalkPoints: arrayOrFallback(
        item?.founderSection?.straightTalkPoints,
        fallback.founderSection.straightTalkPoints,
      ),
    },
    audienceSection: {
      heading: valueOrFallback(
        item?.audienceSection?.heading,
        fallback.audienceSection.heading,
      ),
      client: audiencePanel(
        item?.audienceSection?.client,
        fallback.audienceSection.client,
      ),
      candidate: audiencePanel(
        item?.audienceSection?.candidate,
        fallback.audienceSection.candidate,
      ),
    },
    proofSection: {
      eyebrow: valueOrFallback(
        item?.proofSection?.eyebrow,
        fallback.proofSection.eyebrow,
      ),
      heading: valueOrFallback(
        item?.proofSection?.heading,
        fallback.proofSection.heading,
      ),
      intro: valueOrFallback(
        item?.proofSection?.intro,
        fallback.proofSection.intro,
      ),
      framework: cleanProofItems(
        item?.proofSection?.framework,
        fallback.proofSection.framework,
      ),
      caseStudyEyebrow: valueOrFallback(
        item?.proofSection?.caseStudyEyebrow,
        fallback.proofSection.caseStudyEyebrow,
      ),
      caseStudyPrimaryLinkLabel: valueOrFallback(
        item?.proofSection?.caseStudyPrimaryLinkLabel,
        fallback.proofSection.caseStudyPrimaryLinkLabel,
      ),
      caseStudySecondaryLinkLabel: valueOrFallback(
        item?.proofSection?.caseStudySecondaryLinkLabel,
        fallback.proofSection.caseStudySecondaryLinkLabel,
      ),
      caveat: valueOrFallback(
        item?.proofSection?.caveat,
        fallback.proofSection.caveat,
      ),
    },
    linkedInSection: {
      eyebrow: valueOrFallback(
        linkedInSection?.eyebrow,
        fallback.linkedInSection.eyebrow,
      ),
      heading: valueOrFallback(
        linkedInSection?.heading,
        fallback.linkedInSection.heading,
      ),
      intro: valueOrFallback(
        linkedInSection?.intro,
        fallback.linkedInSection.intro,
      ),
      linkLabel: valueOrFallback(
        linkedInSection?.linkLabel,
        fallback.linkedInSection.linkLabel,
      ),
      recommendations: cleanRecommendations(
        linkedInSection?.recommendations,
        fallback.linkedInSection.recommendations,
      ),
    },
    liveProofSection: {
      eyebrow: valueOrFallback(
        item?.liveProofSection?.eyebrow,
        fallback.liveProofSection.eyebrow,
      ),
      heading: valueOrFallback(
        item?.liveProofSection?.heading,
        fallback.liveProofSection.heading,
      ),
      intro: valueOrFallback(
        item?.liveProofSection?.intro,
        fallback.liveProofSection.intro,
      ),
    },
    specialismsSection: {
      eyebrow: valueOrFallback(
        specialismsSection?.eyebrow,
        fallback.specialismsSection.eyebrow,
      ),
      heading: valueOrFallback(
        specialismsSection?.heading,
        fallback.specialismsSection.heading,
      ),
      cards: cleanSpecialismCards(
        specialismsSection?.cards,
        fallback.specialismsSection.cards,
      ),
    },
    manifestoSection: {
      eyebrow: valueOrFallback(
        item?.manifestoSection?.eyebrow,
        fallback.manifestoSection.eyebrow,
      ),
      heading: valueOrFallback(
        item?.manifestoSection?.heading,
        fallback.manifestoSection.heading,
      ),
      lines: arrayOrFallback(
        item?.manifestoSection?.lines,
        fallback.manifestoSection.lines,
      ),
      signature: valueOrFallback(
        item?.manifestoSection?.signature,
        fallback.manifestoSection.signature,
      ),
    },
    citySection: {
      ariaLabel: valueOrFallback(
        item?.citySection?.ariaLabel,
        fallback.citySection.ariaLabel,
      ),
      imageSrc: cityImageUrl || fallback.citySection.imageSrc,
      imageAlt: valueOrFallback(
        item?.citySection?.image?.alt,
        fallback.citySection.imageAlt,
      ),
      label: valueOrFallback(
        item?.citySection?.label,
        fallback.citySection.label,
      ),
      emphasis: valueOrFallback(
        item?.citySection?.emphasis,
        fallback.citySection.emphasis,
      ),
    },
    finalCtaSection: {
      heading: valueOrFallback(
        item?.finalCtaSection?.heading,
        fallback.finalCtaSection.heading,
      ),
      body: valueOrFallback(
        item?.finalCtaSection?.body,
        fallback.finalCtaSection.body,
      ),
      primaryCta: cta(
        item?.finalCtaSection?.primaryCta,
        fallback.finalCtaSection.primaryCta,
      ),
      emailCtaLabel: valueOrFallback(
        item?.finalCtaSection?.emailCtaLabel,
        fallback.finalCtaSection.emailCtaLabel,
      ),
    },
    featuredInsightSlugs: item?.featuredInsights?.length
      ? referenceSlugs(item.featuredInsights)
      : fallback.featuredInsightSlugs,
    featuredCaseStudySlugs: item?.featuredCaseStudies?.length
      ? referenceSlugs(item.featuredCaseStudies)
      : fallback.featuredCaseStudySlugs,
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
  if (body == null) return fallback;

  const sections: Insight["body"] = [];
  let current: Insight["body"][number] | undefined;

  for (const block of body) {
    if (block._type !== "block") continue;

    const text = block.children
      ?.map((child) => child.text)
      .filter(Boolean)
      .join("")
      .trim();

    if (!text) continue;

    if (block.style === "h2" || block.style === "h3") {
      current = { heading: text, content: [] };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = { heading: "Overview", content: [] };
      sections.push(current);
    }

    current.content.push(text);
  }

  const completeSections = sections.filter((section) => section.content.length);
  return completeSections.length ? completeSections : fallback;
}

function mapService(item: SanityService, fallback?: Service): Service {
  // Older CMS records predate the approved service redesign. Activate CMS
  // ownership only after the current copy has been migrated and verified.
  if (item.contentVersion === 2 && fallback) {
    return {
      title: item.title || fallback.title,
      slug: item.slug || fallback.slug,
      status: item.status === "draft" ? "draft" : "published",
      noIndex: item.noIndex ?? fallback.noIndex ?? false,
      shortDescription: item.shortDescription || fallback.shortDescription,
      heroHeadline: item.heroHeadline || fallback.heroHeadline,
      heroSubheadline: item.heroSubheadline || fallback.heroSubheadline,
      audience: item.whoFor ?? fallback.audience,
      problemsSolved: item.problemsSolved ?? fallback.problemsSolved,
      whenToUse: item.whenToUse ?? fallback.whenToUse,
      howEssentialWorks: item.howEssentialWorks ?? fallback.howEssentialWorks,
      mistakes: item.commonMistakes ?? fallback.mistakes,
      processEyebrow: item.processEyebrow ?? fallback.processEyebrow,
      processHeading: item.processHeading ?? fallback.processHeading,
      processIntro: item.processIntro ?? fallback.processIntro,
      processSteps:
        item.processSteps?.map((step) => ({
          title: step.title || "",
          description: step.text || "",
        })) ?? fallback.processSteps,
      leadershipStages: item.leadershipStages ?? fallback.leadershipStages,
      evidenceAreas: item.evidenceAreas ?? fallback.evidenceAreas,
      advisoryAreas: item.advisoryAreas ?? fallback.advisoryAreas,
      marketFitEyebrow: item.marketFitEyebrow ?? fallback.marketFitEyebrow,
      marketFitHeading: item.marketFitHeading ?? fallback.marketFitHeading,
      judgementEyebrow: item.judgementEyebrow ?? fallback.judgementEyebrow,
      judgementHeading: item.judgementHeading ?? fallback.judgementHeading,
      faqs: item.faqs ?? fallback.faqs,
      relatedServiceSlugs: item.relatedServices
        ? referenceSlugs(item.relatedServices)
        : fallback.relatedServiceSlugs,
      relatedInsightSlugs: item.relatedInsights
        ? referenceSlugs(item.relatedInsights)
        : fallback.relatedInsightSlugs,
      relatedCaseStudySlugs: item.relatedCaseStudies
        ? referenceSlugs(item.relatedCaseStudies)
        : fallback.relatedCaseStudySlugs,
      cta: cta(item.cta, fallback.cta),
      ctaHeading: item.ctaHeading ?? fallback.ctaHeading,
      ctaText: item.ctaText ?? fallback.ctaText,
      searchSummary: item.searchSummary ?? fallback.searchSummary,
      searchPhrases: item.searchPhrases ?? fallback.searchPhrases,
      seoTitle: item.seoTitle || fallback.seoTitle,
      metaDescription: item.metaDescription || fallback.metaDescription,
    };
  }
  return {
    title: fallback?.title || item.title || "Untitled service",
    slug: item.slug || fallback?.slug || "",
    status: item.status === "draft" ? "draft" : "published",
    noIndex: item.noIndex ?? fallback?.noIndex ?? false,
    shortDescription: fallback?.shortDescription || item.shortDescription || "",
    heroHeadline: fallback?.heroHeadline || item.heroHeadline || item.title,
    heroSubheadline: fallback?.heroSubheadline || item.heroSubheadline || "",
    audience: fallback ? fallback.audience : strings(item.whoFor),
    problemsSolved: fallback
      ? fallback.problemsSolved
      : strings(item.problemsSolved),
    whenToUse: fallback ? fallback.whenToUse : strings(item.whenToUse),
    howEssentialWorks: fallback
      ? fallback.howEssentialWorks
      : strings(item.howEssentialWorks),
    mistakes: fallback ? fallback.mistakes : strings(item.commonMistakes),
    processEyebrow: fallback?.processEyebrow,
    processHeading: fallback?.processHeading,
    processIntro: fallback?.processIntro,
    processSteps: fallback?.processSteps?.length
      ? fallback.processSteps
      : item.processSteps?.length
        ? item.processSteps
            .filter((step) => step.title && step.text)
            .map((step) => ({
              title: step.title || "",
              description: step.text || "",
            }))
        : undefined,
    leadershipStages: fallback?.leadershipStages,
    evidenceAreas: fallback?.evidenceAreas,
    advisoryAreas: fallback?.advisoryAreas,
    marketFitEyebrow: fallback?.marketFitEyebrow,
    marketFitHeading: fallback?.marketFitHeading,
    judgementEyebrow: fallback?.judgementEyebrow,
    judgementHeading: fallback?.judgementHeading,
    faqs: fallback ? fallback.faqs : item.faqs || [],
    relatedServiceSlugs: fallback
      ? fallback.relatedServiceSlugs
      : referenceSlugs(item.relatedServices),
    relatedInsightSlugs: fallback
      ? fallback.relatedInsightSlugs
      : referenceSlugs(item.relatedInsights),
    relatedCaseStudySlugs: fallback
      ? fallback.relatedCaseStudySlugs
      : referenceSlugs(item.relatedCaseStudies),
    cta: cta(fallback?.cta || item.cta),
    ctaHeading: fallback?.ctaHeading || item.ctaHeading,
    ctaText: fallback?.ctaText || item.ctaText,
    searchSummary: fallback?.searchSummary || item.searchSummary || "",
    searchPhrases: fallback
      ? fallback.searchPhrases
      : strings(item.searchPhrases),
    seoTitle: fallback?.seoTitle || item.seoTitle || item.title,
    metaDescription:
      fallback?.metaDescription ||
      item.metaDescription ||
      item.shortDescription ||
      "",
  };
}

function mapInsight(item: SanityInsight, fallback?: Insight): Insight {
  const featuredImage = item.heroImage?.asset?.url
    ? {
        type: "image" as const,
        title: item.heroImage.caption || item.title,
        src: item.heroImage.asset.url,
        alt: item.heroImage.alt || item.title,
        caption: item.heroImage.caption,
      }
    : undefined;
  const video = item.media?.url
    ? {
        type: "video" as const,
        provider: item.media.provider || "youtube",
        title: item.media.title || item.title,
        url: item.media.url,
        description: item.media.description,
        thumbnail: item.media.posterImage?.asset?.url,
        thumbnailAlt: item.media.posterImage?.alt,
        captionsUrl: item.media.captionsUrl,
        transcript: item.media.transcript,
      }
    : featuredImage;
  return {
    title: item.title || fallback?.title || "Untitled insight",
    slug: item.slug || fallback?.slug || "",
    status: item.status || fallback?.status || "draft",
    noIndex: item.noIndex ?? fallback?.noIndex ?? false,
    category: item.category ?? fallback?.category ?? "Insight",
    cardCategory: item.cardCategory ?? fallback?.cardCategory,
    excerpt: item.excerpt || fallback?.excerpt || "",
    cardExcerpt: item.cardExcerpt ?? fallback?.cardExcerpt,
    publishedDate: item.publishedDate || fallback?.publishedDate || "",
    updatedDate:
      item.updatedDate || fallback?.updatedDate || item.publishedDate || "",
    readingTime: item.readingTime || fallback?.readingTime || "5 min read",
    author: item.author?.name || fallback?.author || "David Walsh",
    body: bodySections(item.body, fallback?.body),
    faqs: item.faqs ?? fallback?.faqs ?? [],
    relatedServiceSlugs: item.relatedServices
      ? referenceSlugs(item.relatedServices)
      : fallback?.relatedServiceSlugs || [],
    relatedInsightSlugs: item.relatedInsights
      ? referenceSlugs(item.relatedInsights)
      : fallback?.relatedInsightSlugs || [],
    media: video || fallback?.media,
    ctaHeading: item.ctaHeading || fallback?.ctaHeading,
    ctaText: item.ctaText || fallback?.ctaText,
    seoTitle: item.seoTitle || fallback?.seoTitle || item.title,
    metaDescription:
      item.metaDescription || fallback?.metaDescription || item.excerpt || "",
  };
}

function mapCaseStudy(item: SanityCaseStudy, fallback?: CaseStudy): CaseStudy {
  const approach = item.howWeDeriskedIt ?? fallback?.approach ?? [];

  return {
    searchStory: item.searchStory ?? fallback?.searchStory,
    title: item.title ?? fallback?.title ?? "Untitled case study",
    slug: item.slug ?? fallback?.slug ?? "",
    status: item.status ?? fallback?.status ?? "draft",
    noIndex: item.noIndex ?? fallback?.noIndex ?? false,
    clientType: item.clientType ?? fallback?.clientType ?? "Client",
    sector: item.sector ?? fallback?.sector ?? "",
    roleHired: item.roleHired ?? fallback?.roleHired ?? "",
    serviceSlug: item.serviceUsed?.slug ?? fallback?.serviceSlug ?? "",
    challengeSummary: item.challengeSummary ?? fallback?.challengeSummary ?? "",
    clientContext:
      item.clientContext ??
      fallback?.clientContext ??
      item.clientType ??
      item.sector ??
      "",
    hiringChallenge:
      item.hiringChallenge ??
      fallback?.hiringChallenge ??
      item.challengeSummary ??
      "",
    whyHard: item.whyHard ?? fallback?.whyHard ?? item.whatMadeItTricky ?? "",
    businessProblem: item.businessProblem ?? fallback?.businessProblem ?? "",
    whyHireMattered: item.whyHireMattered ?? fallback?.whyHireMattered ?? "",
    whatMadeItTricky: item.whatMadeItTricky ?? fallback?.whatMadeItTricky ?? "",
    whatKindOfPerson:
      item.whatKindOfPerson ??
      fallback?.whatKindOfPerson ??
      item.roleHired ??
      "",
    approach,
    process: item.process ?? fallback?.process ?? approach.join(" "),
    outcome: item.outcome ?? fallback?.outcome ?? "",
    whatChangedHeading: item.whatChangedHeading ?? fallback?.whatChangedHeading,
    whatChanged: item.whatChanged ?? fallback?.whatChanged ?? "",
    impactHeading: item.impactHeading ?? fallback?.impactHeading,
    impact: item.commercialImpact ?? fallback?.impact ?? "",
    quote: item.testimonialQuote ?? fallback?.quote,
    essentialView: item.essentialView ?? fallback?.essentialView,
    ctaHeading: item.ctaHeading ?? fallback?.ctaHeading,
    ctaText: item.ctaText ?? fallback?.ctaText,
    ctaLabel: item.ctaLabel ?? fallback?.ctaLabel,
    proofLogo: item.proofLogoPath ?? fallback?.proofLogo,
    proofLogoAlt: item.proofLogoAlt ?? fallback?.proofLogoAlt,
    proofLinkedInUrl: item.proofLinkedInUrl ?? fallback?.proofLinkedInUrl,
    proofLinkedInLabel: item.proofLinkedInLabel ?? fallback?.proofLinkedInLabel,
    externalSourceUrl: item.externalSourceUrl ?? fallback?.externalSourceUrl,
    externalSourceLabel:
      item.externalSourceLabel ?? fallback?.externalSourceLabel,
    featured: item.featured ?? fallback?.featured ?? false,
    seoTitle: item.seoTitle ?? fallback?.seoTitle ?? item.title,
    metaDescription:
      item.metaDescription ??
      fallback?.metaDescription ??
      item.challengeSummary ??
      "",
  };
}

function mapSalarySnapshot(
  item: SanitySalarySnapshot,
  fallback?: SalarySnapshot,
): SalarySnapshot {
  return {
    title: fallback?.title || item.title || "Untitled salary snapshot",
    slug: item.slug || fallback?.slug || "",
    status: item.status || fallback?.status || "draft",
    noIndex: item.noIndex ?? fallback?.noIndex ?? false,
    contentFormat: fallback?.contentFormat || item.contentFormat || "snapshot",
    quarter: fallback?.quarter || item.quarterDate || "",
    market: fallback?.market || item.market || "",
    intro: fallback?.intro || item.introSummary || "",
    commentary: fallback?.commentary?.length
      ? fallback.commentary
      : item.marketCommentary || [],
    rows: fallback?.rows?.length
      ? fallback.rows
      : (item.salaryTableRows?.map((row) => ({
          role: row.roleTitle || "",
          low: row.lowSalary || "",
          mid: row.midSalary || "",
          high: row.highSalary || "",
          notes: row.notes || "",
        })) ?? []),
    hiringNotes: fallback?.hiringNotes?.length
      ? fallback.hiringNotes
      : item.hiringNotes || [],
    candidateAvailability: fallback?.candidateAvailability?.length
      ? fallback.candidateAvailability
      : item.candidateAvailabilityNotes || [],
    takeaways: fallback?.takeaways?.length
      ? fallback.takeaways
      : item.keyTakeaways || [],
    seoTitle: fallback?.seoTitle || item.seoTitle || item.title,
    metaDescription:
      fallback?.metaDescription ||
      item.metaDescription ||
      item.introSummary ||
      "",
  };
}

function mapJob(item: SanityJob, fallback?: Job): Job {
  if (item.contentVersion === 2) fallback = undefined;

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
    salaryCurrency: (
      item.salaryCurrency ||
      fallback?.salaryCurrency ||
      "GBP"
    ).toUpperCase(),
    salaryPeriod:
      item.salaryPeriod || fallback?.salaryPeriod || "to_be_confirmed",
    salaryVisibility:
      item.salaryVisibility || fallback?.salaryVisibility || "to_be_confirmed",
    rateMin: item.rateMin ?? fallback?.rateMin,
    rateMax: item.rateMax ?? fallback?.rateMax,
    ratePeriod: item.ratePeriod || fallback?.ratePeriod || "to_be_confirmed",
    salary: salaryRange,
    salaryStatus: item.salaryStatus || fallback?.salaryStatus || "unverified",
    salaryTransparencyNote:
      item.salaryTransparencyNote ||
      fallback?.salaryTransparencyNote ||
      "Salary/rate details need confirming before this role goes live.",
    hiringOrganizationName:
      item.hiringOrganizationName ||
      fallback?.hiringOrganizationName ||
      "confidential",
    location: item.location || fallback?.location || "Location to confirm",
    locationRegion: item.locationRegion || fallback?.locationRegion || "",
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
    travelExpectation:
      item.travelExpectation ||
      fallback?.travelExpectation ||
      item.locationExpectation ||
      "Travel expectations to confirm.",
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
    successInThreeMonths:
      item.successInThreeMonths || fallback?.successInThreeMonths || "",
    successInSixMonths:
      item.successInSixMonths || fallback?.successInSixMonths || "",
    successInTwelveMonths:
      item.successInTwelveMonths || fallback?.successInTwelveMonths || "",
    summary: item.summary || fallback?.summary || "",
    description:
      item.contentVersion === 2
        ? description
        : description.length
          ? description
          : fallback?.description || [],
    davidsTake:
      item.contentVersion === 2
        ? davidsTake
        : davidsTake.length
          ? davidsTake
          : fallback?.davidsTake || [],
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
    applicationProcessNotes:
      item.applicationProcessNotes ||
      item.applicationNotes ||
      fallback?.applicationProcessNotes ||
      "",
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
    applicationFormEnabled:
      item.applicationFormEnabled ?? fallback?.applicationFormEnabled ?? true,
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
  if (!items.length) return fallbackServices;

  return fallbackServices.map((fallback) =>
    mapService(
      items.find((item) => item.slug === fallback.slug) || {
        _id: fallback.slug,
        title: fallback.title,
        slug: fallback.slug,
      },
      fallback,
    ),
  );
}

export async function getPublicContentHubPages() {
  const pages = await sanityFetchWithFallback<SanityContentHubPages | null>({
    query: CONTENT_HUB_PAGES_QUERY,
    fallback: null,
    tags: ["jobsPage", "insightsPage", "caseStudiesPage"],
  });

  return {
    ...fallbackContentHubPages,
    ...pages,
    jobs: { ...fallbackContentHubPages.jobs, ...pages?.jobs },
    insights: { ...fallbackContentHubPages.insights, ...pages?.insights },
    caseStudies: {
      ...fallbackContentHubPages.caseStudies,
      ...pages?.caseStudies,
    },
  } satisfies SanityContentHubPages;
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
  const items = await sanityFetchWithFallback<SanityInsight[] | null>({
    query: INSIGHTS_QUERY,
    fallback: null,
    fallbackOnEmpty: false,
    tags: ["insight"],
  });
  if (items === null) return fallbackInsights;

  const published = items
    .filter((item) => !retiredInsightSlugs.has(item.slug))
    .map((item) =>
      mapInsight(
        item,
        item.contentVersion === 2
          ? undefined
          : bySlug(fallbackInsights, item.slug),
      ),
    );

  // This page still uses its bespoke salary-guide model, so keep its approved
  // hub card visible until the editorial body is migrated into Sanity.
  const salaryGuideFallback = fallbackInsights.find(
    (item) => item.slug === "manchester-north-west-marketing-salary-guide-2026",
  );
  if (
    salaryGuideFallback &&
    !published.some((item) => item.slug === salaryGuideFallback.slug)
  ) {
    published.unshift(salaryGuideFallback);
  }

  return published;
}

export async function getPublicInsight(slug: string) {
  if (retiredInsightSlugs.has(slug)) return undefined;

  const fallback = bySlug(fallbackInsights, slug);
  const item = await sanityFetchWithFallback<SanityInsight | null | undefined>({
    query: INSIGHT_BY_SLUG_QUERY,
    params: { slug },
    fallback: undefined,
    fallbackOnEmpty: false,
    tags: [`insight:${slug}`, "insight"],
  });

  return item === undefined
    ? fallback
    : item
      ? mapInsight(item, item.contentVersion === 2 ? undefined : fallback)
      : undefined;
}

export async function getPublicCaseStudies() {
  const items = await sanityFetchWithFallback<SanityCaseStudy[] | null>({
    query: CASE_STUDIES_QUERY,
    fallback: null,
    fallbackOnEmpty: false,
    tags: ["caseStudy"],
  });
  if (items === null) return fallbackCaseStudies;

  return items.map((item) =>
    mapCaseStudy(
      item,
      item.contentVersion === 2
        ? undefined
        : bySlug(fallbackCaseStudies, item.slug),
    ),
  );
}

export async function getPublicCaseStudy(slug: string) {
  const fallback = bySlug(fallbackCaseStudies, slug);
  const item = await sanityFetchWithFallback<
    SanityCaseStudy | null | undefined
  >({
    query: CASE_STUDY_BY_SLUG_QUERY,
    params: { slug },
    fallback: undefined,
    fallbackOnEmpty: false,
    tags: [`caseStudy:${slug}`, "caseStudy"],
  });

  return item === undefined
    ? fallback
    : item
      ? mapCaseStudy(item, item.contentVersion === 2 ? undefined : fallback)
      : undefined;
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
  const items = await sanityFetchWithFallback<SanityJob[] | null>({
    query: JOBS_QUERY,
    fallback: null,
    fallbackOnEmpty: false,
    tags: ["job"],
  });
  return items === null
    ? fallbackJobs
    : items.map((item) =>
        mapJob(
          item,
          item.contentVersion === 2
            ? undefined
            : bySlug(fallbackJobs, item.slug),
        ),
      );
}

export async function getPublicJob(slug: string) {
  const fallback = bySlug(fallbackJobs, slug);
  const item = await sanityFetchWithFallback<SanityJob | null | undefined>({
    query: JOB_BY_SLUG_QUERY,
    params: { slug },
    fallback: undefined,
    fallbackOnEmpty: false,
    tags: [`job:${slug}`, "job"],
  });

  return item === undefined
    ? fallback
    : item
      ? mapJob(item, item.contentVersion === 2 ? undefined : fallback)
      : undefined;
}
