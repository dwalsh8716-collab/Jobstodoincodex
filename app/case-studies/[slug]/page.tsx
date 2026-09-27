import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { SchemaScript } from "@/components/SchemaScript";
import {
  getPublicCaseStudies,
  getPublicCaseStudy,
  getPublicService,
} from "@/lib/public-content";
import { caseStudySchema, createMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

function paragraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function ParagraphText({ value }: { value: string }) {
  return (
    <>
      {paragraphs(value).map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </>
  );
}

export async function generateStaticParams() {
  const caseStudies = await getPublicCaseStudies();
  return caseStudies
    .filter((caseStudy) => caseStudy.status === "published")
    .map((caseStudy) => ({ slug: caseStudy.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const caseStudy = await getPublicCaseStudy(slug);
  if (!caseStudy || caseStudy.status !== "published") return {};
  return createMetadata({
    title: caseStudy.seoTitle,
    description: caseStudy.metaDescription,
    path: `/case-studies/${caseStudy.slug}`,
    noIndex: caseStudy.noIndex,
  });
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const caseStudy = await getPublicCaseStudy(slug);
  if (!caseStudy || caseStudy.status !== "published") notFound();
  const service = await getPublicService(caseStudy.serviceSlug);

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
            <Link
              className="text-link case-study-service-link"
              href={`/services/${service.slug}`}
            >
              Related service / hiring challenge: {service.title}
            </Link>
          ) : null}
          {caseStudy.proofLogo ? (
            <div className="case-study-hero-proof">
              <Image
                alt={caseStudy.proofLogoAlt || `${caseStudy.clientType} logo`}
                className="case-study-hero-logo"
                height={112}
                priority
                src={caseStudy.proofLogo}
                width={320}
              />
              <div className="case-study-hero-links">
                {caseStudy.proofLinkedInUrl ? (
                  <Link
                    className="text-link"
                    href={caseStudy.proofLinkedInUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {caseStudy.proofLinkedInLabel || "View LinkedIn profile"}
                  </Link>
                ) : null}
                {caseStudy.externalSourceUrl ? (
                  <Link
                    className="text-link"
                    href={caseStudy.externalSourceUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {caseStudy.externalSourceLabel || "View source"}
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>
      <section className="section surface">
        <div className="container grid grid-3">
          <article className="card">
            <span className="tag">Context</span>
            <h2>Business context</h2>
            <ParagraphText value={caseStudy.clientContext} />
          </article>
          <article className="card">
            <span className="tag">Problem</span>
            <h2>The business problem</h2>
            <ParagraphText value={caseStudy.businessProblem} />
          </article>
          <article className="card">
            <span className="tag">Impact</span>
            <h2>Why the hire mattered</h2>
            <ParagraphText value={caseStudy.whyHireMattered} />
          </article>
        </div>
      </section>
      <section className="section muted">
        <div className="container grid grid-3">
          <article className="card">
            <span className="tag">Challenge</span>
            <h2>What made it tricky</h2>
            <ParagraphText value={caseStudy.whatMadeItTricky} />
          </article>
          <article className="card">
            <span className="tag">Profile</span>
            <h2>The kind of person needed</h2>
            <ParagraphText value={caseStudy.whatKindOfPerson} />
          </article>
          <article className="card">
            <span className="tag">Hiring challenge</span>
            <h2>Related service / hiring challenge</h2>
            <ParagraphText value={caseStudy.hiringChallenge} />
          </article>
        </div>
      </section>
      <section className="section">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Approach</p>
            <h2>Approach</h2>
          </div>
          <div className="article-body">
            <section>
              <h3>Approach</h3>
              <ul className="case-study-approach-list">
                {caseStudy.approach.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Shortlist / Process</h3>
              <ParagraphText value={caseStudy.process} />
              <p>
                <Link
                  className="text-link"
                  href="/how-essential-resourcing-works"
                >
                  See the search and assessment process
                </Link>
              </p>
            </section>
            <section>
              <h3>The Outcome</h3>
              <ParagraphText value={caseStudy.outcome} />
            </section>
            <section>
              <h3>{caseStudy.whatChangedHeading || "What changed"}</h3>
              <ParagraphText value={caseStudy.whatChanged} />
            </section>
            <section>
              <h3>{caseStudy.impactHeading || "Commercial impact"}</h3>
              <ParagraphText value={caseStudy.impact} />
            </section>
            {caseStudy.quote ? (
              <blockquote className="pull-quote">{caseStudy.quote}</blockquote>
            ) : null}
            {caseStudy.essentialView?.length ? (
              <section>
                <h3>The Essential View</h3>
                {caseStudy.essentialView.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </section>
            ) : null}
          </div>
        </div>
      </section>
      <CTASection
        title={caseStudy.ctaHeading || "Need this kind of hiring work?"}
        text={caseStudy.ctaText}
        ctaLabel={caseStudy.ctaLabel || "Talk to David"}
        whatsAppIntent="hiring"
        whatsAppLabel="Message David on WhatsApp"
      />
      <SchemaScript data={caseStudySchema(caseStudy)} />
    </>
  );
}
