import type { Job } from "@/lib/types";

type JobRoleSnapshotProps = {
  job: Job;
};

const salaryVisibilityLabels: Record<Job["salaryVisibility"], string> = {
  public_range: "Published range",
  indicative_range: "Indicative range",
  confidential: "Confidential / withheld",
  to_be_confirmed: "To be confirmed",
};

const remotePossibleLabels: Record<Job["remotePossible"], string> = {
  yes: "Remote possible",
  limited: "Limited remote",
  no: "Not remote",
  to_be_confirmed: "To be confirmed",
};

function formatDate(value?: string) {
  if (!value) return "To be confirmed";
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatSide(value: Job["agencyOrClientSide"]) {
  if (value === "client-side") return "Client-side";
  if (value === "agency") return "Agency-side";
  if (value === "either") return "Either / mixed";
  return "To be confirmed";
}

export function JobRoleSnapshot({ job }: JobRoleSnapshotProps) {
  const items = [
    {
      label: "Salary / rate",
      value: job.salaryRange,
      note: `${salaryVisibilityLabels[job.salaryVisibility]} · ${job.salaryStatus}`,
    },
    {
      label: "Location",
      value: job.location,
      note: job.officeLocation,
    },
    {
      label: "Hybrid / remote",
      value: job.hybridPattern,
      note: remotePossibleLabels[job.remotePossible],
    },
    {
      label: "Travel",
      value: job.travelExpectation,
      note: job.locationExpectation,
    },
    {
      label: "Role shape",
      value: job.roleType,
      note: `${job.seniority} · ${job.workingPattern}`,
    },
    {
      label: "Sector / side",
      value: job.sector,
      note: formatSide(job.agencyOrClientSide),
    },
    {
      label: "Status",
      value: job.status === "live" ? "Open" : job.status,
      note: job.closingDate
        ? `Closes ${formatDate(job.closingDate)}`
        : "May close early if filled",
    },
    {
      label: "Dates",
      value: `Posted ${formatDate(job.postedDate)}`,
      note: `Updated ${formatDate(job.updatedDate)}`,
    },
  ];

  return (
    <article className="job-role-snapshot" aria-label="Role snapshot">
      <div>
        <p className="eyebrow">Role snapshot</p>
        <h2>The basics, without the fog.</h2>
      </div>
      <dl>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>
              <strong>{item.value}</strong>
              <span>{item.note}</span>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
