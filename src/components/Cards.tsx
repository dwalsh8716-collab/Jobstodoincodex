import Link from "next/link";
import type { CaseStudy, Insight, Job, Service } from "@/lib/types";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="card lift-card">
      <span className="tag">Service</span>
      <h3>{service.title}</h3>
      <p>{service.shortDescription}</p>
      <Link className="text-link" href={`/services/${service.slug}`}>
        Explore the service
      </Link>
    </article>
  );
}

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <article className="card lift-card">
      <span className="tag">{insight.category}</span>
      <h3>{insight.title}</h3>
      <p>{insight.excerpt}</p>
      <p className="meta">
        {insight.author} · {insight.updatedDate} · {insight.readingTime}
      </p>
      <Link className="text-link" href={`/insights/${insight.slug}`}>
        Read insight
      </Link>
    </article>
  );
}

export function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <article className="card lift-card">
      <span className="tag">
        {caseStudy.status === "draft" ? "Proof being checked" : "Case study"}
      </span>
      <h3>{caseStudy.title}</h3>
      <p>
        <strong>Role:</strong> {caseStudy.roleHired}
      </p>
      <p>{caseStudy.challengeSummary}</p>
      <Link className="text-link" href={`/case-studies/${caseStudy.slug}`}>
        {caseStudy.status === "draft"
          ? "View proof standard"
          : "Read case study"}
      </Link>
    </article>
  );
}

export function JobCard({ job }: { job: Job }) {
  return (
    <article className="card lift-card">
      <span className="tag">
        {job.status === "live" ? "Live role" : `${job.status} role`}
      </span>
      <h3>{job.title}</h3>
      <p>{job.summary}</p>
      <p className="meta">
        {job.location} · {job.workingPattern} · {job.salaryRange}
      </p>
      <p className="meta">
        Salary: {job.salaryStatus}. Process:{" "}
        {job.interviewProcessConfirmed === "confirmed"
          ? "confirmed"
          : job.interviewSteps.length
            ? "shown"
            : "not ready"}
      </p>
      <Link className="text-link" href={`/jobs/${job.slug}`}>
        Read the role
      </Link>
    </article>
  );
}
