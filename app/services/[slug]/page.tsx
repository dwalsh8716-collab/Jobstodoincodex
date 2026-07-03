import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingButton } from "@/components/BookingButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CaseStudyCard, InsightCard, ServiceCard } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { SchemaScript } from "@/components/SchemaScript";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  getPublicCaseStudies,
  getPublicInsights,
  getPublicService,
  getPublicServices,
} from "@/lib/public-content";
import { createMetadata, serviceSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import type { WhatsAppIntent } from "@/lib/whatsapp";

type Props = {
  params: Promise<{ slug: string }>;
};

const serviceProcessSteps = [
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
  const relatedInsights = allInsights.filter((insight) =>
    service.relatedInsightSlugs.includes(insight.slug),
  );
  const relatedServices = allServices.filter((item) =>
    service.relatedServiceSlugs.includes(item.slug),
  );
  const relatedCases = allCaseStudies.filter((caseStudy) =>
    service.relatedCaseStudySlugs.includes(caseStudy.slug),
  );
  const publishedCases = relatedCases.filter(
    (caseStudy) => caseStudy.status === "published",
  );
  const draftCases = relatedCases.filter(
    (caseStudy) => caseStudy.status === "draft",
  );
  const whatsAppIntent: WhatsAppIntent =
    service.slug === "strategic-interim" ? "strategicInterim" : "hiring";
  const whatsAppLabel =
    service.slug === "strategic-interim"
      ? "Need interim help quickly? WhatsApp David"
      : "Message David on WhatsApp";
  const bookingLabel =
    service.slug === "strategic-interim"
      ? "Need interim help quickly? Book 15 minutes"
      : "Sense-check the brief";

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
            <BookingButton
              label={bookingLabel}
              location={`${service.slug}_hero`}
              intent="hiring"
              service={service.title}
              variant="secondary"
            />
            {siteConfig.booking.enabled ? null : (
              <Link className="button button-secondary" href="/case-studies">
                View proof standards
              </Link>
            )}
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
              <p className="eyebrow">Market fit</p>
              <h2>Where this service fits.</h2>
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
            <p className="eyebrow">Process</p>
            <h2>How Essential works.</h2>
            <p className="lede">
              The process is deliberately tight because weak briefs and slow
              decisions cost you the strongest people.
            </p>
          </div>
          <div className="grid grid-2">
            {serviceProcessSteps.map((step) => (
              <article className="card" key={step.title}>
                <span className="tag">Process</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section surface">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Service judgement</p>
            <h2>What changes on this kind of brief.</h2>
          </div>
          <div className="statement-list">
            {service.howEssentialWorks.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </section>

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

      <section className="section surface">
        <div className="container section-heading">
          <p className="eyebrow">Related proof</p>
          <h2>Proof only works when it is specific.</h2>
          <p className="lede">
            Case studies stay unpublished until the outcome and permission are
            clear. Until then, the useful proof is the shape of the brief, the
            pressure behind it and the standard David would hold it to.
          </p>
        </div>
        <div className="container grid grid-3">
          {publishedCases.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
          ))}
          {draftCases.map((caseStudy) => (
            <article className="card lift-card" key={caseStudy.slug}>
              <span className="tag">Proof being checked</span>
              <h3>{caseStudy.title}</h3>
              <p>
                <strong>Role:</strong> {caseStudy.roleHired}
              </p>
              <p>{caseStudy.challengeSummary}</p>
              <p className="meta">
                Full case study held back until the detail is verified.
              </p>
            </article>
          ))}
          {!relatedCases.length ? (
            <article className="card lift-card">
              <span className="tag">Proof standard</span>
              <h3>No recycled logos.</h3>
              <p>
                David will talk through relevant context directly rather than
                publishing loose claims that have not been checked.
              </p>
              <Link className="text-link" href="/case-studies">
                View proof standards
              </Link>
            </article>
          ) : null}
        </div>
      </section>

      {relatedServices.length ? (
        <section className="section muted">
          <div className="container section-heading">
            <p className="eyebrow">Related services</p>
            <h2>Other routes that may fit the brief.</h2>
          </div>
          <div className="container grid grid-3">
            {relatedServices.map((item) => (
              <ServiceCard key={item.slug} service={item} />
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
              <InsightCard key={insight.slug} insight={insight} />
            ))}
          </div>
        </section>
      ) : null}

      <FAQAccordion faqs={service.faqs} />
      <CTASection
        title={service.cta.label}
        ctaLabel={service.cta.label}
        whatsAppIntent={whatsAppIntent}
        whatsAppLabel={whatsAppLabel}
        whatsAppService={service.title}
      />
      <SchemaScript data={serviceSchema(service)} />
    </>
  );
}
