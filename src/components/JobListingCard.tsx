import Link from "next/link";
import type { Job } from "@/lib/types";
import styles from "./JobsIndex.module.css";

const employmentLabels: Record<string, string> = {
  "permanent-full-time": "Permanent, full-time",
  "permanent-part-time": "Permanent, part-time",
  "fixed-term": "Fixed-term",
  contractor: "Contractor / freelance",
  temporary: "Temporary",
  interim: "Interim",
  other: "Other",
};

export function JobListingCard({ job }: { job: Job }) {
  const publishedPay =
    job.salaryVisibility === "public_range" ||
    job.salaryVisibility === "indicative_range";

  return (
    <article className={styles.card} aria-labelledby={`job-${job.slug}`}>
      <div className={styles.cardIntro}>
        {job.specialism ? (
          <p className={styles.descriptor}>{job.specialism}</p>
        ) : null}
        <h3 id={`job-${job.slug}`}>{job.title}</h3>
        <p className={styles.summary}>{job.summary}</p>
      </div>
      <dl className={styles.details}>
        <div className={styles.pay}>
          <dt>Salary / rate</dt>
          <dd>
            {publishedPay ? job.salaryRange : "Speak to David about the salary"}
          </dd>
          {job.salaryVisibility === "indicative_range" ? (
            <dd className={styles.payNote}>Indicative range</dd>
          ) : null}
        </div>
        <div>
          <dt>Location</dt>
          <dd>{job.location}</dd>
        </div>
        <div>
          <dt>Working arrangement</dt>
          <dd>{job.hybridPattern}</dd>
        </div>
        <div>
          <dt>Employment</dt>
          <dd>{employmentLabels[job.employmentType] || job.employmentType}</dd>
        </div>
      </dl>
      <Link
        className={`text-link ${styles.roleLink}`}
        href={`/jobs/${job.slug}`}
        aria-label={`View role: ${job.title}`}
      >
        View role
      </Link>
    </article>
  );
}
