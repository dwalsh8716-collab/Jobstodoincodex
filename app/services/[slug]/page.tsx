import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CaseStudyCard } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { LinkedInRecommendations } from "@/components/LinkedInRecommendations";
import { SchemaScript } from "@/components/SchemaScript";
import { ServiceOverviewCards } from "@/components/ServiceOverviewCards";
import { ServiceProcess } from "@/components/ServiceProcess";
import serviceStyles from "@/components/ServicePresentation.module.css";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  getPublicCaseStudies,
  getPublicInsights,
  getPublicService,
  getPublicServices,
} from "@/lib/public-content";
import { createMetadata, serviceSchema } from "@/lib/seo";
import type { WhatsAppIntent } from "@/lib/whatsapp";

type Props = {
  params: Promise<{ slug: string }>;
};

function orderBySlug<T extends { slug: string }>(items: T[], slugs: string[]) {
  const uniqueSlugs = Array.from(new Set(slugs));
  const ordered = uniqueSlugs
    .map((slug) => items.find((item) => item.slug === slug))
    .filter((item): item is T => Boolean(item));
  const remaining = items.filter((item) => !uniqueSlugs.includes(item.slug));
  return [...ordered, ...remaining];
}

export async function generateStaticParams() {
  const services = await getPublicServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = await getPublicService(slug);
  if (!service) return {};
  return createMetadata({
    title: service.seoTitle,
    description: service.metaDescription,
    path: `/services/${service.slug}`,
    noIndex: service.noIndex || service.status === "draft",
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getPublicService(slug);
  if (!service) notFound();

  const [allInsights, allServices, allCaseStudies] = await Promise.all([
    getPublicInsights(),
    getPublicServices(),
    getPublicCaseStudies(),
  ]);
  const relatedInsights = orderBySlug(
    allInsights.filter(
      (insight) =>
        service.relatedInsightSlugs.includes(insight.slug) ||
        insight.relatedServiceSlugs.includes(service.slug),
    ),
    service.relatedInsightSlugs,
  );
  const relatedServices = orderBySlug(
    allServices.filter((item) =>
      service.relatedServiceSlugs.includes(item.slug),
    ),
    service.relatedServiceSlugs,
  );
  const publishedCases = allCaseStudies.filter(
    (caseStudy) => caseStudy.status === "published",
  );
  const relatedPublishedCases = orderBySlug(
    publishedCases.filter((caseStudy) =>
      service.relatedCaseStudySlugs.includes(caseStudy.slug),
    ),
    service.relatedCaseStudySlugs,
  );
  const whatsAppIntent: WhatsAppIntent =
    service.slug === "fractional" ? "strategicInterim" : "hiring";
  const whatsAppLabel = "WhatsApp David";

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Services", href: "/services" },
          { name: service.title, href: `/services/${service.slug}` },
        ]}
      />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">{service.title}</p>
          <h1>{service.heroHeadline}</h1>
          <div className={serviceStyles.heroCopy}>
            {service.heroSubheadline.split(/\n{2,}/).map((paragraph) => (
              <p className="lede" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
          <div className="button-row hero-actions">
            <Link className="button button-primary" href={service.cta.href}>
              {service.cta.label}
            </Link>
            <WhatsAppButton
              intent={whatsAppIntent}
              label={whatsAppLabel}
              location={`${service.slug}_hero`}
              service={service.title}
              variant="secondary"
            />
          </div>
        </div>
      </section>

      <ServiceOverviewCards service={service} />

      {service.searchSummary ? (
        <section className="section muted">
          <div className="container split split-start">
            <div>
              <p className="eyebrow">
                {service.marketFitEyebrow || "Where this service fits"}
              </p>
              {service.marketFitHeading ? (
                <h2>{service.marketFitHeading}</h2>
              ) : null}
            </div>
            <div className="statement-list">
              {service.searchSummary.split(/\n{2,}/).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ServiceProcess service={service} />

      {service.howEssentialWorks.length ? (
        <section className="section surface">
          <div className="container split split-start">
            <div>
              <p className="eyebrow">
                {service.judgementEyebrow || "Service judgement"}
              </p>
              {service.judgementHeading ? (
                <h2>{service.judgementHeading}</h2>
              ) : null}
            </div>
            <div className="statement-list">
              {service.howEssentialWorks.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <LinkedInRecommendations variant="service" serviceSlug={service.slug} />

      <section className="section muted">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Common mistakes</p>
            <h2>What usually gets in the way.</h2>
          </div>
          <div className="grid">
            {service.mistakes.map((mistake) => (
              <article className="card" key={mistake}>
                <h3>{mistake}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {relatedPublishedCases.length ? (
        <section className="section surface">
          <div className="container section-heading">
            <p className="eyebrow">Related proof</p>
            <h2>Proof only works when it is specific.</h2>
          </div>
          <div className="container grid grid-3">
            {relatedPublishedCases.map((caseStudy) => (
              <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedServices.length ? (
        <section className="section muted">
          <div className="container section-heading">
            <p className="eyebrow">Related services</p>
            <h2>Other routes that may fit the brief.</h2>
          </div>
          <div className="container grid grid-3">
            {relatedServices.map((item) => (
              <article className="card" key={item.slug}>
                <h3>{item.title}</h3>
                <Link className="text-link" href={`/services/${item.slug}`}>
                  {item.title}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {relatedInsights.length ? (
        <section className="section">
          <div className="container section-heading">
            <p className="eyebrow">Related insight</p>
            <h2>Useful reading before you hire.</h2>
          </div>
          <div className="container grid grid-3">
            {relatedInsights.map((insight) => (
              <article className="card" key={insight.slug}>
                <h3>{insight.title}</h3>
                <Link className="text-link" href={`/insights/${insight.slug}`}>
                  {insight.title}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <FAQAccordion faqs={service.faqs} />
      <CTASection
        title={service.ctaHeading || `${service.cta.label}.`}
        text={service.ctaText}
        ctaLabel={service.cta.label}
        ctaHref={service.cta.href}
        whatsAppIntent={whatsAppIntent}
        whatsAppLabel={whatsAppLabel}
        whatsAppService={service.title}
      />
      <SchemaScript data={serviceSchema(service)} />
    </>
  );
}
