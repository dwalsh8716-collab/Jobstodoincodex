import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { SchemaScript } from "@/components/SchemaScript";
import { getJob, jobs } from "@/lib/content";
import { createMetadata, jobPostingSchema } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return jobs.filter((job) => job.status === "live").map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job || job.status !== "live") return {};
  return createMetadata({
    title: job.seoTitle,
    description: job.metaDescription,
    path: `/jobs/${job.slug}`
  });
}

export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job || job.status !== "live") notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Jobs", href: "/jobs" },
          { name: job.title, href: `/jobs/${job.slug}` }
        ]}
      />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Live role</p>
          <h1>{job.title}</h1>
          <p className="lede">{job.summary}</p>
          <p className="meta">
            {job.salary} · {job.location} · {job.hybrid} · {job.employmentType}
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container split split-start">
          <article className="article-body">
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
          <aside>
            <ContactForm type="job" jobTitle={job.title} />
          </aside>
        </div>
      </section>
      {job.status === "live" ? <SchemaScript data={jobPostingSchema(job)} /> : null}
    </>
  );
}
