import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { isJobLive, jobs } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Marketing, PR & Digital Jobs | Essential Resourcing",
  description:
    "Live marketing, PR, communications and digital roles handled by Essential Resourcing.",
  path: "/jobs",
});

export default function JobsPage() {
  const liveJobs = jobs.filter((job) => isJobLive(job));

  return (
    <>
      <Breadcrumbs items={[{ name: "Jobs", href: "/jobs" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Jobs</p>
          <h1>
            Marketing, PR and digital roles without the recruitment nonsense.
          </h1>
          <p className="lede">
            Live roles will appear here. If there is nothing public, senior
            candidates can still start a confidential conversation.
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
            If you are senior and want a confidential conversation, use the
            candidate route rather than waiting for the perfect role to appear.
          </p>
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
            <h2>No live roles are published today.</h2>
            <p className="lede">
              Good senior roles are not always public. Send a short note or
              LinkedIn URL and David can tell you whether there is a sensible
              conversation to have.
            </p>
          </div>
        )}
      </section>
      <section className="section muted">
        <div className="container grid grid-3">
          <article className="card">
            <span className="tag">Live roles</span>
            <h2>Only real roles go live.</h2>
            <p>
              Drafts stay hidden until the salary, brief, location and process
              are ready to show properly.
            </p>
          </article>
          <article className="card">
            <span className="tag">Closed roles</span>
            <h2>Closed means closed.</h2>
            <p>
              Closed or expired roles are not marked up as active jobs, and they
              do not ask candidates to apply.
            </p>
          </article>
          <article className="card">
            <span className="tag">Confidential route</span>
            <h2>Not everything is public.</h2>
            <p>
              Senior conversations often start before a role is advertised,
              especially when the brief is sensitive.
            </p>
          </article>
        </div>
      </section>
      <CTASection
        title="Looking for your next move?"
        text="Send a note or LinkedIn URL and David can come back to you properly."
        ctaLabel="Send a confidential note"
        ctaHref="/candidates"
      />
    </>
  );
}
