import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CaseStudyCard } from "@/components/Cards";
import { ClientProofCards } from "@/components/ClientProofCards";
import { LinkedInRecommendations } from "@/components/LinkedInRecommendations";
import { SchemaScript } from "@/components/SchemaScript";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getPublicCaseStudies } from "@/lib/public-content";
import { createMetadata, itemListSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Marketing Recruitment Case Studies | Essential Resourcing",
  description:
    "Real marketing recruitment, leadership search and fractional case studies from Essential Resourcing, published with permission.",
  path: "/case-studies",
});

export default async function CaseStudiesPage() {
  const caseStudies = await getPublicCaseStudies();
  const publishedCaseStudies = caseStudies.filter(
    (caseStudy) => caseStudy.status === "published" && !caseStudy.noIndex,
  );

  return (
    <>
      <Breadcrumbs items={[{ name: "Case Studies", href: "/case-studies" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Case studies</p>
          <h1>Proper proof. Not a page full of logos.</h1>
          <p className="lede">
            Real marketing recruitment, leadership search and fractional
            case studies, published when the facts and permission are clear.
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
            <h2>The first case studies are currently being verified.</h2>
            <p className="lede">
              Rather than publishing anonymous success stories with suspiciously
              perfect outcomes, Essential only publishes case studies when the
              facts and permission are clear.
            </p>
            <p className="lede">
              If you want to understand how David would approach a live brief in
              the meantime, have a conversation with him.
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="/contact">
                Talk to David
              </Link>
              <WhatsAppButton
                intent="hiring"
                label="Message David on WhatsApp"
                location="case_studies_empty_state"
                variant="secondary"
              />
            </div>
          </div>
        )}
      </section>
      <ClientProofCards location="case_studies_page" variant="section" />
      <LinkedInRecommendations variant="caseStudies" />
      {publishedCaseStudies.length ? (
        <SchemaScript
          data={itemListSchema({
            name: "Essential Resourcing case studies",
            description:
              "Permissioned marketing recruitment case studies published by Essential Resourcing.",
            items: publishedCaseStudies.map((caseStudy) => ({
              name: caseStudy.title,
              url: `/case-studies/${caseStudy.slug}`,
              description: caseStudy.challengeSummary,
            })),
          })}
        />
      ) : null}
    </>
  );
}
