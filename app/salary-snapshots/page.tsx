import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { salarySnapshots } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Salary & Market Snapshots | Essential Resourcing",
  description:
    "CMS-editable salary and market snapshots for marketing, PR, communications and digital hiring across the North West.",
  path: "/salary-snapshots"
});

export default function SalarySnapshotsPage() {
  const publishedSnapshots = salarySnapshots.filter((snapshot) => snapshot.status === "published");

  return (
    <>
      <Breadcrumbs items={[{ name: "Salary Snapshots", href: "/salary-snapshots" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Salary snapshots</p>
          <h1>Salary and market insight that can be updated properly.</h1>
          <p className="lede">
            Salary pages are published only when the ranges and commentary have been validated against current briefs
            and market conversations.
          </p>
        </div>
      </section>
      <section className="section surface">
        {publishedSnapshots.length ? (
          <div className="container grid grid-3">
            {publishedSnapshots.map((snapshot) => (
              <article className="card lift-card" key={snapshot.slug}>
                <span className="tag">Market snapshot</span>
                <h2>{snapshot.title}</h2>
                <p>{snapshot.intro}</p>
                <p className="meta">
                  {snapshot.quarter} · {snapshot.market}
                </p>
                <Link className="text-link" href={`/salary-snapshots/${snapshot.slug}`}>
                  View snapshot
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="container empty-state">
            <p className="eyebrow">Validation first</p>
            <h2>No public salary snapshots are published yet.</h2>
            <p className="lede">
              For now, salary advice is handled directly so the numbers reflect the role, seniority, team context and
              current market rather than a generic table.
            </p>
          </div>
        )}
      </section>
      <CTASection title="Need salary advice for a real brief?" />
    </>
  );
}
