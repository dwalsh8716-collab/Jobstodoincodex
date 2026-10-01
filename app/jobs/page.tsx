import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobListingCard } from "@/components/JobListingCard";
import { CTASection } from "@/components/CTASection";
import { SchemaScript } from "@/components/SchemaScript";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { isJobLive } from "@/lib/content";
import { getPublicContentHubPages, getPublicJobs } from "@/lib/public-content";
import { createMetadata, itemListSchema } from "@/lib/seo";
import styles from "@/components/JobsIndex.module.css";

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
    <div className={styles.page}>
      <Breadcrumbs items={[{ name: "Jobs", href: "/jobs" }]} />
      <section className={`section dark ${styles.hero}`}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <p className="eyebrow">{copy?.eyebrow}</p>
            <h1>{copy?.title}</h1>
          </div>
          <div className={`${styles.copy} ${styles.heroCopy}`}>
            {copy?.intro?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {liveJobs.length ? (
              <div>
                <Link className="button button-primary" href="#live-roles">
                  View live roles
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <section
        className="section surface"
        id="live-roles"
        aria-labelledby="live-roles-title"
      >
        <div className={`container ${styles.heading}`}>
          <p className="eyebrow">{copy?.rolesEyebrow}</p>
          <h2 id="live-roles-title">
            {liveJobs.length ? copy?.rolesHeading : copy?.emptyHeading}
          </h2>
        </div>
        {liveJobs.length ? (
          <div className="container">
            <ul className={styles.grid}>
              {liveJobs.map((job) => (
                <li key={job.slug}>
                  <JobListingCard job={job} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={`container ${styles.emptyCopy}`}>
            <div className={styles.copy}>
              {copy?.rolesIntro?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}
        <div className="container">
          <div className={`${styles.split} ${styles.confidential}`}>
            <div>
              <p className="eyebrow">{copy?.emptyEyebrow}</p>
              <h2>{copy?.emptyCtaHeading}</h2>
            </div>
            <div className={styles.copy}>
              {liveJobs.length
                ? copy?.rolesIntro?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))
                : null}
              {copy?.emptyText?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
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
          </div>
        </div>
      </section>
      <section className="section muted">
        <div className={`container ${styles.split}`}>
          <div>
            <p className="eyebrow">{copy?.roleStandardTag}</p>
            <h2>{copy?.roleStandardHeading}</h2>
          </div>
          <ol className={styles.principles}>
            {copy?.roleStandardPoints?.map((point, index) => (
              <li key={point}>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="section surface">
        <div className={`container ${styles.heading}`}>
          <p className="eyebrow">{copy?.standardsEyebrow}</p>
          <h2>{copy?.standardsHeading}</h2>
        </div>
        <div className="container">
          <ol className={styles.checklist}>
            {copy?.standards?.map((standard, index) => (
              <li key={standard}>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{standard}</span>
              </li>
            ))}
          </ol>
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
    </div>
  );
}
