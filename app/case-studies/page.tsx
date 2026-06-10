import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CaseStudyCard } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { caseStudies } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Marketing Recruitment Case Studies | Essential Resourcing",
  description:
    "Permissioned marketing recruitment case studies for agency, client-side and strategic interim hiring.",
  path: "/case-studies",
});

export default function CaseStudiesPage() {
  const publishedCaseStudies = caseStudies.filter(
    (caseStudy) => caseStudy.status === "published",
  );
  const draftCaseStudies = caseStudies.filter(
    (caseStudy) => caseStudy.status === "draft",
  );

  return (
    <>
      <Breadcrumbs items={[{ name: "Case Studies", href: "/case-studies" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Case studies</p>
          <h1>Specific proof beats anonymous waffle.</h1>
          <p className="lede">
            Permissioned case studies will only appear here when the context,
            process, outcome and quote are verified.
          </p>
        </div>
      </section>
      <section className="section surface">
        {publishedCaseStudies.length ? (
          <div className="container grid grid-3">
            {publishedCaseStudies.map((caseStudy) => (
              <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
            ))}
          </div>
        ) : (
          <div className="container empty-state">
            <p className="eyebrow">Proof in progress</p>
            <h2>No permissioned case studies are published yet.</h2>
            <p className="lede">
              That is intentional. Essential only publishes proof when the
              outcome and permission are both clear. If you want to understand
              how David would handle a live brief, start with a direct
              conversation.
            </p>
          </div>
        )}
      </section>
      {draftCaseStudies.length ? (
        <section className="section muted">
          <div className="container section-heading">
            <p className="eyebrow">Proof being checked</p>
            <h2>
              Draft case-study structures are ready, but not published as proof.
            </h2>
            <p className="lede">
              These are anonymised working structures. They should only become
              public case studies when the outcome, quote and permission are
              clear.
            </p>
          </div>
          <div className="container grid grid-3">
            {draftCaseStudies.map((caseStudy) => (
              <article className="card" key={caseStudy.slug}>
                <span className="tag">Draft case study</span>
                <h3>{caseStudy.title}</h3>
                <p>{caseStudy.challengeSummary}</p>
                <p className="meta">{caseStudy.roleHired}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <CTASection title="Have a brief that needs this level of focus?" />
    </>
  );
}
