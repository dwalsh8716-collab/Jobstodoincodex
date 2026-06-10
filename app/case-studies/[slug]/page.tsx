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
  return caseStudies.filter((caseStudy) => caseStudy.status === "published").map((caseStudy) => ({ slug: caseStudy.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  if (!caseStudy || caseStudy.status !== "published") return {};
  return createMetadata({
    title: caseStudy.seoTitle,
    description: caseStudy.metaDescription,
    path: `/case-studies/${caseStudy.slug}`
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
          { name: caseStudy.title, href: `/case-studies/${caseStudy.slug}` }
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
            <span className="tag">Client context</span>
            <h2>{caseStudy.clientType}</h2>
            <p>{caseStudy.clientContext}</p>
          </article>
          <article className="card">
            <span className="tag">Role</span>
            <h2>{caseStudy.roleHired}</h2>
            <p>{caseStudy.hiringChallenge}</p>
          </article>
          <article className="card">
            <span className="tag">Why hard</span>
            <h2>Why the brief was hard</h2>
            <p>{caseStudy.whyHard}</p>
          </article>
        </div>
      </section>
      <section className="section">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Approach</p>
            <h2>How the brief should be written up.</h2>
          </div>
          <div className="article-body">
            <section>
              <h3>Approach</h3>
              {caseStudy.approach.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </section>
            <section>
              <h3>Shortlist / process</h3>
              <p>{caseStudy.process}</p>
            </section>
            <section>
              <h3>Outcome</h3>
              <p>{caseStudy.outcome}</p>
            </section>
            <section>
              <h3>Commercial impact</h3>
              <p>{caseStudy.impact}</p>
            </section>
          </div>
        </div>
      </section>
      <CTASection title="Need this kind of hiring work?" />
    </>
  );
}
