import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CaseStudyCard, InsightCard } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { SchemaScript } from "@/components/SchemaScript";
import { caseStudies, getService, insights, services } from "@/lib/content";
import { createMetadata, serviceSchema } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return createMetadata({
    title: service.seoTitle,
    description: service.metaDescription,
    path: `/services/${service.slug}`
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const relatedInsights = insights.filter((insight) => service.relatedInsightSlugs.includes(insight.slug));
  const relatedCases = caseStudies.filter(
    (caseStudy) => caseStudy.status === "published" && service.relatedCaseStudySlugs.includes(caseStudy.slug)
  );

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Services", href: "/services" },
          { name: service.title, href: `/services/${service.slug}` }
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
            <Link className="button button-secondary" href="/case-studies">
              View proof structure
            </Link>
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

      <section className="section">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Process</p>
            <h2>How Essential works.</h2>
            <p className="lede">
              The process is deliberately tight: sharper brief, better market read, direct candidate engagement and
              honest feedback.
            </p>
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

      {relatedCases.length ? (
        <section className="section surface">
          <div className="container section-heading">
            <p className="eyebrow">Related proof</p>
            <h2>Case study structure.</h2>
          </div>
          <div className="container grid grid-3">
            {relatedCases.map((caseStudy) => (
              <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
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
      <CTASection title={service.cta.label} ctaLabel={service.cta.label} />
      <SchemaScript data={serviceSchema(service)} />
    </>
  );
}
