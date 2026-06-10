import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { getCaseStudy, getService, caseStudies } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return caseStudies
    .filter((caseStudy) => caseStudy.status === "published")
    .map((caseStudy) => ({ slug: caseStudy.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  if (!caseStudy || caseStudy.status !== "published") return {};
  return createMetadata({
    title: caseStudy.seoTitle,
    description: caseStudy.metaDescription,
    path: `/case-studies/${caseStudy.slug}`,
  });
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  if (!caseStudy || caseStudy.status !== "published") notFound();
  const service = getService(caseStudy.serviceSlug);

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Case Studies", href: "/case-studies" },
          { name: caseStudy.title, href: `/case-studies/${caseStudy.slug}` },
        ]}
      />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Case study</p>
          <h1>{caseStudy.title}</h1>
          <p className="lede">{caseStudy.challengeSummary}</p>
          {service ? (
            <Link className="text-link" href={`/services/${service.slug}`}>
              Related service: {service.title}
            </Link>
          ) : null}
        </div>
      </section>
      <section className="section surface">
        <div className="container grid grid-3">
          <article className="card">
            <span className="tag">Business context</span>
            <h2>{caseStudy.clientType}</h2>
            <p>{caseStudy.clientContext}</p>
          </article>
          <article className="card">
            <span className="tag">The business problem</span>
            <h2>{caseStudy.roleHired}</h2>
            <p>{caseStudy.businessProblem}</p>
          </article>
          <article className="card">
            <span className="tag">Why the hire mattered</span>
            <h2>Why it mattered</h2>
            <p>{caseStudy.whyHireMattered}</p>
          </article>
        </div>
      </section>
      <section className="section muted">
        <div className="container grid grid-3">
          <article className="card">
            <span className="tag">What made it tricky</span>
            <h2>The difficult bit.</h2>
            <p>{caseStudy.whatMadeItTricky}</p>
          </article>
          <article className="card">
            <span className="tag">Person needed</span>
            <h2>The kind of person needed.</h2>
            <p>{caseStudy.whatKindOfPerson}</p>
          </article>
          <article className="card">
            <span className="tag">Related service</span>
            <h2>{service?.title || "Service used"}</h2>
            <p>{caseStudy.hiringChallenge}</p>
          </article>
        </div>
      </section>
      <section className="section">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Approach</p>
            <h2>How we de-risked it.</h2>
          </div>
          <div className="article-body">
            <section>
              <h3>How we de-risked it</h3>
              {caseStudy.approach.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </section>
            <section>
              <h3>Shortlist / process</h3>
              <p>{caseStudy.process}</p>
            </section>
            <section>
              <h3>The outcome</h3>
              <p>{caseStudy.outcome}</p>
            </section>
            <section>
              <h3>What changed</h3>
              <p>{caseStudy.whatChanged}</p>
            </section>
            <section>
              <h3>Commercial impact</h3>
              <p>{caseStudy.impact}</p>
            </section>
            {caseStudy.quote ? (
              <blockquote className="pull-quote">{caseStudy.quote}</blockquote>
            ) : null}
          </div>
        </div>
      </section>
      <CTASection
        title="Need this kind of hiring work?"
        whatsAppIntent="hiring"
        whatsAppLabel="Message David on WhatsApp"
      />
    </>
  );
}
