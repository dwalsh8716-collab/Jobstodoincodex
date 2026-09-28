import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CaseStudyCard } from "@/components/Cards";
import { ClientProofCards } from "@/components/ClientProofCards";
import { LinkedInRecommendations } from "@/components/LinkedInRecommendations";
import { SchemaScript } from "@/components/SchemaScript";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  getPublicCaseStudies,
  getPublicContentHubPages,
} from "@/lib/public-content";
import { createMetadata, itemListSchema } from "@/lib/seo";

export async function generateMetadata() {
  const { caseStudies } = await getPublicContentHubPages();
  return createMetadata({
    title:
      caseStudies?.seoTitle ||
      "Marketing Recruitment Case Studies | Essential Resourcing",
    description:
      caseStudies?.metaDescription ||
      "Real marketing recruitment, leadership search and fractional case studies from Essential Resourcing, published with permission.",
    path: "/case-studies",
  });
}

export default async function CaseStudiesPage() {
  const [{ caseStudies: copy }, caseStudies] = await Promise.all([
    getPublicContentHubPages(),
    getPublicCaseStudies(),
  ]);
  const publishedCaseStudies = caseStudies.filter(
    (caseStudy) => caseStudy.status === "published" && !caseStudy.noIndex,
  );

  return (
    <>
      <Breadcrumbs items={[{ name: "Case Studies", href: "/case-studies" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">{copy?.eyebrow}</p>
          <h1>{copy?.title}</h1>
          {copy?.intro?.map((paragraph) => (
            <p className="lede" key={paragraph}>
              {paragraph}
            </p>
          ))}
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
            <p className="eyebrow">{copy?.emptyEyebrow}</p>
            <h2>{copy?.emptyHeading}</h2>
            {copy?.emptyText?.map((paragraph) => (
              <p className="lede" key={paragraph}>
                {paragraph}
              </p>
            ))}
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
