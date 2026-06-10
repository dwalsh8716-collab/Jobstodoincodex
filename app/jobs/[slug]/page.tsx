import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { SchemaScript } from "@/components/SchemaScript";
import { getJob, isJobClosed, isJobLive, jobs } from "@/lib/content";
import { createMetadata, jobPostingSchema } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return jobs
    .filter((job) => job.status !== "draft")
    .map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job || job.status === "draft") return {};
  const closed = isJobClosed(job);
  return createMetadata({
    title: closed
      ? `${job.title} - Role Closed | Essential Resourcing`
      : job.seoTitle,
    description: job.metaDescription,
    path: `/jobs/${job.slug}`,
    noIndex: closed,
  });
}

export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job || job.status === "draft") notFound();
  const live = isJobLive(job);
  const closed = isJobClosed(job);
  const relatedLiveJobs = jobs
    .filter((item) => item.slug !== job.slug && isJobLive(item))
    .slice(0, 3);

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Jobs", href: "/jobs" },
          { name: job.title, href: `/jobs/${job.slug}` },
        ]}
      />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">{live ? "Live role" : "Role closed"}</p>
          <h1>{job.title}</h1>
          <p className="lede">{job.summary}</p>
          <p className="meta">
            {job.salary} · {job.location} · {job.hybrid} · {job.employmentType}{" "}
            · {job.roleType}
          </p>
        </div>
      </section>
      {closed ? (
        <section className="section surface">
          <div className="container empty-state">
            <p className="eyebrow">Closed role</p>
            <h2>This role is not open for applications.</h2>
            <p className="lede">
              It is kept here only so old links do not mislead people. For
              current roles, use the jobs page or send a confidential note.
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="/jobs">
                View live roles
              </Link>
              <Link className="button button-secondary" href="/candidates">
                Send a confidential note
              </Link>
            </div>
          </div>
        </section>
      ) : null}
      <section className="section surface">
        <div className="container split split-start">
          <article className="article-body">
            <section>
              <h2>Why this role matters</h2>
              <p>{job.whyThisRoleMatters}</p>
            </section>
            <section>
              <h2>Overview</h2>
              {job.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
            <section>
              <h2>Responsibilities</h2>
              {job.responsibilities.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </section>
            <section>
              <h2>Requirements</h2>
              {job.requirements.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </section>
            <section>
              <h2>Benefits</h2>
              {job.benefits.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </section>
          </article>
          <aside className="grid">
            {live ? (
              <>
                <div className="card">
                  <span className="tag">Apply</span>
                  <h2>{job.applicationCta.label}</h2>
                  <p>
                    Applications are handled by David directly at{" "}
                    {job.applicationEmail}.
                  </p>
                </div>
                <ContactForm type="job" jobTitle={job.title} />
              </>
            ) : (
              <div className="card">
                <span className="tag">No applications</span>
                <h2>Applications are closed.</h2>
                <p>
                  David will not invite applications for a role that is no
                  longer live.
                </p>
                <Link className="text-link" href="/candidates">
                  Send a confidential note
                </Link>
              </div>
            )}
            {relatedLiveJobs.length ? (
              <div className="card">
                <span className="tag">Other live roles</span>
                <div className="grid">
                  {relatedLiveJobs.map((item) => (
                    <Link
                      className="text-link"
                      href={`/jobs/${item.slug}`}
                      key={item.slug}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
      {live ? <SchemaScript data={jobPostingSchema(job)} /> : null}
    </>
  );
}
