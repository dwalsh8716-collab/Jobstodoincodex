import { getCliClient } from "sanity/cli";
import {
  primaryNavigation,
  siteConfig,
} from "../src/lib/site.ts";
import { insights, services } from "../src/lib/content.ts";
import { defaultHomePageContent } from "../src/lib/homepage-content.ts";

const client = getCliClient({ apiVersion: "2026-06-09" });

const currentServiceSlugs = new Set(services.map((service) => service.slug));
const retiredServiceSlugs = [
  "agency-recruitment",
  "client-side-marketing-recruitment",
  "leadership-search",
  "senior-recruitment",
  "strategic-interim",
];

const currentInsightSlugs = new Set(insights.map((insight) => insight.slug));
const retiredInsightSlugs = ["what-is-a-strategic-interim-marketing-leader"];
const retiredCaseStudySlugs = ["integrated-agency-strategic-interim"];

function keyFor(prefix, item, index) {
  const basis =
    item?.slug ||
    item?.number ||
    item?.title ||
    item?.name ||
    item?.phrase ||
    item?.heading ||
    String(index + 1);
  return `${prefix}-${String(basis)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48)}-${index}`;
}

function withKeys(items, prefix) {
  return items.map((item, index) => ({
    _key: item._key || keyFor(prefix, item, index),
    ...item,
  }));
}

function navigationDocId(label) {
  return `navigation.${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

async function upsertNavigation(items) {
  const existing = await client.fetch(`*[_type == "navigation"]{_id,label,url}`);
  const keepIds = new Set();

  for (const [index, item] of items.entries()) {
    const id = navigationDocId(item.label);
    keepIds.add(id);
    const matched = existing.find((doc) => doc._id === id || doc.label === item.label);
    const document = {
      _id: matched?._id || id,
      _type: "navigation",
      label: item.label,
      url: item.href,
      order: (index + 1) * 10,
      isCta: false,
      openInNewTab: false,
    };

    await client.createOrReplace(document);
  }

  const stale = existing.filter(
    (doc) =>
      !keepIds.has(doc._id) &&
      !items.some((item) => item.label === doc.label && item.href === doc.url),
  );

  for (const doc of stale) {
    await client.delete(doc._id);
  }
}

async function main() {
  const home = defaultHomePageContent;
  const existingHomePage = await client.fetch(
    `*[_id == "homePage"][0]{premiumVideo, citySection{image}, contentBlocks, featuredProof, openGraphImage, canonicalUrlOverride, redirectFrom}`,
  );
  const serviceRefs = await client.fetch(
    `*[_type == "service" && slug.current in $slugs]{_id,"slug":slug.current}`,
    { slugs: [...currentServiceSlugs] },
  );
  const insightRefs = await client.fetch(
    `*[_type == "insight" && slug.current in $slugs]{_id,"slug":slug.current}`,
    { slugs: home.featuredInsightSlugs },
  );
  const caseStudyRefs = await client.fetch(
    `*[_type == "caseStudy" && slug.current == "havas-media-manchester-managing-partner-james-reddington"]{_id,"slug":slug.current}`,
  );

  await client.createOrReplace({
    _id: "homePage",
    _type: "homePage",
    title: "Homepage",
    heroEyebrow: home.heroEyebrow,
    heroHeadline: home.heroHeadline,
    heroSubheadline: home.heroSubheadline,
    heroLede: home.heroLede,
    heroPrimaryCta: home.heroPrimaryCta,
    heroSecondaryCta: home.heroSecondaryCta,
    proofPoints: home.proofPoints,
    disciplines: home.disciplines,
    filterSection: {
      ...home.filterSection,
      definitions: withKeys(home.filterSection.definitions, "filter"),
    },
    differenceSection: {
      ...home.differenceSection,
      rows: withKeys(home.differenceSection.rows, "difference"),
    },
    servicesSection: {
      eyebrow: home.servicesSection.eyebrow,
      heading: home.servicesSection.heading,
      intro: home.servicesSection.intro,
    },
    serviceCards: withKeys(home.servicesSection.cards, "service"),
    founderSection: home.founderSection,
    audienceSection: home.audienceSection,
    proofSection: {
      ...home.proofSection,
      framework: withKeys(home.proofSection.framework, "proof"),
    },
    linkedInSection: {
      ...home.linkedInSection,
      recommendations: withKeys(
        home.linkedInSection.recommendations,
        "linkedin",
      ),
    },
    liveProofSection: home.liveProofSection,
    specialismsSection: {
      ...home.specialismsSection,
      cards: withKeys(home.specialismsSection.cards, "specialism"),
    },
    manifestoSection: home.manifestoSection,
    citySection: {
      ariaLabel: home.citySection.ariaLabel,
      label: home.citySection.label,
      emphasis: home.citySection.emphasis,
      ...(existingHomePage?.citySection?.image
        ? { image: existingHomePage.citySection.image }
        : {}),
    },
    finalCtaSection: home.finalCtaSection,
    ...(existingHomePage?.premiumVideo
      ? { premiumVideo: existingHomePage.premiumVideo }
      : {}),
    featuredServices: serviceRefs.map((service) => ({
      _type: "reference",
      _ref: service._id,
      _key: service.slug,
    })),
    featuredInsights: insightRefs.map((insight) => ({
      _type: "reference",
      _ref: insight._id,
      _key: insight.slug,
    })),
    featuredCaseStudies: caseStudyRefs.map((caseStudy) => ({
      _type: "reference",
      _ref: caseStudy._id,
      _key: caseStudy.slug,
    })),
    ...(existingHomePage?.featuredProof?.length
      ? { featuredProof: existingHomePage.featuredProof }
      : {}),
    ...(existingHomePage?.contentBlocks?.length
      ? { contentBlocks: existingHomePage.contentBlocks }
      : {}),
    ctaHeading: "Need good marketing people?",
    ctaText: "Start with the problem. Tell me who you are trying to hire and what they need to change.",
    cta: {
      label: "Sense-check a brief",
      href: "/contact",
      variant: "primary",
    },
    seoTitle: siteConfig.defaultTitle,
    metaDescription: siteConfig.defaultDescription,
    ...(existingHomePage?.openGraphImage
      ? { openGraphImage: existingHomePage.openGraphImage }
      : {}),
    ...(existingHomePage?.canonicalUrlOverride
      ? { canonicalUrlOverride: existingHomePage.canonicalUrlOverride }
      : {}),
    ...(existingHomePage?.redirectFrom?.length
      ? { redirectFrom: existingHomePage.redirectFrom }
      : {}),
    noIndex: false,
    status: "published",
  });

  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    siteName: siteConfig.name,
    seoTitle: siteConfig.defaultTitle,
    metaDescription: siteConfig.defaultDescription,
    footerCopy:
      "Founder-led recruitment for marketing, digital, PR, communications and agency hires across Manchester, the North West and UK.",
    footerCtaHeading: "Need good marketing people?",
    footerCtaText: "Start with the problem. Tell me who you need and what they need to change.",
    showLinkedInInFooter: true,
    showLinkedInOnContactPage: true,
    showLinkedInInFounderBlock: true,
    addressRegion: siteConfig.region,
  });

  await upsertNavigation(primaryNavigation);

  const retiredServices = await client.fetch(
    `*[_type == "service" && slug.current in $slugs]{_id,title,"slug":slug.current}`,
    { slugs: retiredServiceSlugs },
  );
  for (const service of retiredServices) {
    await client.patch(service._id).set({ status: "draft", noIndex: true }).commit();
  }

  const retiredInsights = await client.fetch(
    `*[_type == "insight" && slug.current in $slugs]{_id,title,"slug":slug.current}`,
    { slugs: retiredInsightSlugs.filter((slug) => !currentInsightSlugs.has(slug)) },
  );
  for (const insight of retiredInsights) {
    await client.patch(insight._id).set({ status: "draft", noIndex: true }).commit();
  }

  const staleDocs = await client.fetch(
    `*[
      (_type == "service" && slug.current in $serviceSlugs) ||
      (_type == "insight" && slug.current in $insightSlugs) ||
      (_type == "caseStudy" && slug.current in $caseStudySlugs)
    ]{_id,_type,title,"slug":slug.current}`,
    {
      serviceSlugs: retiredServiceSlugs,
      insightSlugs: retiredInsightSlugs,
      caseStudySlugs: retiredCaseStudySlugs,
    },
  );

  for (const doc of staleDocs) {
    await client
      .patch(doc._id)
      .unset([
        "relatedServices",
        "relatedInsights",
        "relatedCaseStudies",
        "serviceUsed",
        "featuredServices",
        "featuredInsights",
        "featuredCaseStudies",
      ])
      .commit();
  }

  for (const doc of staleDocs) {
    try {
      await client.delete(doc._id);
      console.log(`Deleted stale ${doc._type}:${doc.slug}.`);
    } catch {
      await client
        .patch(doc._id)
        .set({ status: "draft", noIndex: true })
        .commit();
      console.log(`Kept stale ${doc._type}:${doc.slug} as draft/noindex.`);
    }
  }

  console.log("Sanity launch shell synced.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
