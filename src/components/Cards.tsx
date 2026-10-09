import Image from "next/image";
import Link from "next/link";
import type { CaseStudy, Insight, Job, Service } from "@/lib/types";
import editorialStyles from "./Editorial.module.css";
import { salaryGuideSlug } from "@/lib/salary-guide-2026";

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

export function InsightCard({ insight, editorial = false }: { insight: Insight; editorial?: boolean }) {
  return (
    <article className={editorial ? editorialStyles.card : "card lift-card"}>
      <span className="tag">{insight.cardCategory || insight.category}</span>
      <h3>
        <Link
          className={editorialStyles.titleLink}
          href={`/insights/${insight.slug}`}
        >
          {insight.title}
        </Link>
      </h3>
      <p>{insight.cardExcerpt || insight.excerpt}</p>
      <p className="meta">
        {insight.author} · {insight.publishedDate}
        {insight.slug !== salaryGuideSlug && insight.readingTime ? ` · ${insight.readingTime}` : null}
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
      {caseStudy.proofLogo ? (
        <div className="case-study-card-logo-wrap">
          <Image
            alt={caseStudy.proofLogoAlt || `${caseStudy.clientType} logo`}
            className="case-study-card-logo"
            height={82}
            src={caseStudy.proofLogo}
            width={220}
          />
        </div>
      ) : null}
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
      <h3>
        <Link className={editorialStyles.titleLink} href={`/jobs/${job.slug}`}>
          {job.title}
        </Link>
      </h3>
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
