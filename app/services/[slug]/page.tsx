import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CaseStudyCard } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { LinkedInRecommendations } from "@/components/LinkedInRecommendations";
import { SchemaScript } from "@/components/SchemaScript";
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

const defaultServiceProcessSteps = [
  {
    title: "Work out what you are really hiring for",
    description: "Not just the job title. The problem behind it.",
  },
  {
    title: "Define what good actually looks like",
    description:
      "Experience, judgement, behaviours, salary, expectations and what the person needs to deliver.",
  },
  {
    title: "Position the opportunity properly",
    description:
      "Strong people need a reason to care. A job spec on its own rarely does the job.",
  },
  {
    title: "Build a focused shortlist",
    description: "Fewer CVs. Better fit. Proper context.",
  },
  {
    title: "Keep the process moving",
    description: "Clear feedback, honest advice and no recruitment theatre.",
  },
];

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
    allInsights.filter((insight) =>
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
  const whatsAppLabel =
    service.slug === "fractional"
      ? "Need fractional help quickly? WhatsApp David"
      : "Message David on WhatsApp";
  const processSteps = service.processSteps?.length
    ? service.processSteps
    : defaultServiceProcessSteps;

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
          <p className="lede">{service.heroSubheadline}</p>
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

      <section className="section surface">
        <div className="container grid grid-3">
          <article className="card">
            <span className="tag">Who it is for</span>
            <h2>Audience</h2>
            <ul>
              {service.audience.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="card">
            <span className="tag">Problem</span>
            <h2>What it solves</h2>
            <ul>
              {service.problemsSolved.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="card">
            <span className="tag">Use case</span>
            <h2>When this makes sense</h2>
            <ul>
              {service.whenToUse.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

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
              <p>{service.searchSummary}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">{service.processEyebrow || "Process"}</p>
            {service.processHeading ? <h2>{service.processHeading}</h2> : null}
            {service.processIntro ? (
              <p className="lede">{service.processIntro}</p>
            ) : null}
            <Link className="text-link" href="/how-essential-resourcing-works">
              See exactly how I recruit
            </Link>
          </div>
          <div className="grid grid-2">
            {processSteps.map((step, index) => (
              <article className="card" key={step.title}>
                <span className="tag">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                {step.description ? <p>{step.description}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </section>

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
        whatsAppIntent={whatsAppIntent}
        whatsAppLabel={whatsAppLabel}
        whatsAppService={service.title}
      />
      <SchemaScript data={serviceSchema(service)} />
    </>
  );
}
