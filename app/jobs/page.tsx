import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { SchemaScript } from "@/components/SchemaScript";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { candidateJobPageStandards } from "@/lib/candidate-transparency-content";
import { isJobLive } from "@/lib/content";
import { getPublicJobs } from "@/lib/public-content";
import { createMetadata, itemListSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Marketing, PR & Digital Jobs | Essential Resourcing",
  description:
    "Current marketing, PR, communications, digital and agency jobs handled by specialist recruiter Essential Resourcing.",
  path: "/jobs",
});

export default async function JobsPage() {
  const jobs = await getPublicJobs();
  const liveJobs = jobs.filter((job) => isJobLive(job));

  return (
    <>
      <Breadcrumbs items={[{ name: "Jobs", href: "/jobs" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Jobs</p>
          <h1>Marketing, PR and digital jobs. Without the mystery.</h1>
          <p className="lede">
            Live roles handled by Essential appear here.
          </p>
          <p className="lede">
            Wherever possible, you&apos;ll see the useful stuff upfront: salary,
            location, hybrid setup, what the role actually involves and what the
            process looks like.
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container section-heading">
          <p className="eyebrow">Live roles</p>
          <h2>
            {liveJobs.length
              ? "Current live roles."
              : "No live roles published right now."}
          </h2>
          <p className="lede">
            If you&apos;re open to something senior or specialist, don&apos;t wait
            for the perfect advert to appear.
          </p>
          <p className="lede">
            Some searches are confidential and some conversations start before a
            role ever reaches a job board.
          </p>
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
            <p className="eyebrow">Confidential route</p>
            <h2>Open to the right thing?</h2>
            <p className="lede">
              Send David your LinkedIn profile and a few lines about what
              you&apos;d consider next.
            </p>
            <div className="button-row hero-actions">
              <Link
                className="button button-primary"
                href="/candidates#candidate-contact"
              >
                Send a confidential note
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
            <span className="tag">Live role standard</span>
            <h2>Only real roles go live.</h2>
            <p>
              No fake evergreen vacancies designed to collect CVs.
            </p>
            <p>
              No closed roles pretending they&apos;re still available.
            </p>
            <p>
              No &quot;competitive salary&quot; when a proper range can be shared.
            </p>
          </article>
        </div>
      </section>
      <section className="section surface">
        <div className="container section-heading">
          <p className="eyebrow">Candidate standards</p>
          <h2>What a good job ad should tell you.</h2>
        </div>
        <div className="container grid grid-3">
          {candidateJobPageStandards.map((standard) => (
            <article className="card" key={standard}>
              <p>{standard}</p>
            </article>
          ))}
        </div>
      </section>
      <CTASection
        title="Looking for your next move?"
        text="Send David a note or LinkedIn URL."
        ctaLabel="Send a confidential note"
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
