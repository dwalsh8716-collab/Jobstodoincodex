import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { SchemaScript } from "@/components/SchemaScript";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { isJobLive } from "@/lib/content";
import { getPublicContentHubPages, getPublicJobs } from "@/lib/public-content";
import { createMetadata, itemListSchema } from "@/lib/seo";

export async function generateMetadata() {
  const { jobs } = await getPublicContentHubPages();
  return createMetadata({
    title:
      jobs?.seoTitle || "Marketing, PR & Digital Jobs | Essential Resourcing",
    description:
      jobs?.metaDescription ||
      "Current marketing, PR, communications, digital and agency jobs handled by specialist recruiter Essential Resourcing.",
    path: "/jobs",
  });
}

export default async function JobsPage() {
  const [{ jobs: copy }, jobs] = await Promise.all([
    getPublicContentHubPages(),
    getPublicJobs(),
  ]);
  const liveJobs = jobs.filter((job) => isJobLive(job));

  return (
    <>
      <Breadcrumbs items={[{ name: "Jobs", href: "/jobs" }]} />
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
        <div className="container section-heading">
          <p className="eyebrow">{copy?.rolesEyebrow}</p>
          <h2>{liveJobs.length ? copy?.rolesHeading : copy?.emptyHeading}</h2>
          {copy?.rolesIntro?.map((paragraph) => (
            <p className="lede" key={paragraph}>
              {paragraph}
            </p>
          ))}
          <div className="button-row hero-actions">
            <WhatsAppButton
              intent="candidates"
              label="Message David on WhatsApp"
              location="jobs_page"
              variant="secondary"
            />
          </div>
        </div>
        {liveJobs.length ? (
          <div className="container grid grid-3">
            {liveJobs.map((job) => (
              <JobCard key={job.slug} job={job} />
            ))}
          </div>
        ) : (
          <div className="container empty-state">
            <p className="eyebrow">{copy?.emptyEyebrow}</p>
            <h2>{copy?.emptyCtaHeading}</h2>
            {copy?.emptyText?.map((paragraph) => (
              <p className="lede" key={paragraph}>
                {paragraph}
              </p>
            ))}
            <div className="button-row hero-actions">
              <Link
                className="button button-primary"
                href="/candidates#candidate-contact"
              >
                {copy?.emptyCtaLabel}
              </Link>
              <WhatsAppButton
                intent="candidates"
                label="Quick WhatsApp to David"
                location="jobs_empty_state"
                variant="secondary"
              />
            </div>
          </div>
        )}
      </section>
      <section className="section muted">
        <div className="container grid grid-3">
          <article className="card">
            <span className="tag">{copy?.roleStandardTag}</span>
            <h2>{copy?.roleStandardHeading}</h2>
            {copy?.roleStandardPoints?.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </article>
        </div>
      </section>
      <section className="section surface">
        <div className="container section-heading">
          <p className="eyebrow">{copy?.standardsEyebrow}</p>
          <h2>{copy?.standardsHeading}</h2>
        </div>
        <div className="container grid grid-3">
          {copy?.standards?.map((standard) => (
            <article className="card" key={standard}>
              <p>{standard}</p>
            </article>
          ))}
        </div>
      </section>
      <CTASection
        title={copy?.ctaHeading}
        text={copy?.ctaText}
        ctaLabel={copy?.emptyCtaLabel}
        ctaHref="/candidates#candidate-contact"
        whatsAppIntent="candidates"
        whatsAppLabel="Quick WhatsApp to David"
      />
      {liveJobs.length ? (
        <SchemaScript
          data={itemListSchema({
            name: "Essential Resourcing live jobs",
            description:
              "Visible live marketing, PR, communications and digital roles handled by Essential Resourcing.",
            items: liveJobs.map((job) => ({
              name: job.title,
              url: `/jobs/${job.slug}`,
              description: job.summary,
            })),
          })}
        />
      ) : null}
    </>
  );
}
