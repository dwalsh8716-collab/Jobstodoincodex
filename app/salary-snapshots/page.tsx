import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { SchemaScript } from "@/components/SchemaScript";
import { salarySnapshots } from "@/lib/content";
import { createMetadata, itemListSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Salary & Market Snapshots | Essential Resourcing",
  description:
    "Practical salary and market snapshots for marketing, PR, communications and digital hiring across the North West.",
  path: "/salary-snapshots",
});

export default function SalarySnapshotsPage() {
  const publishedSnapshots = salarySnapshots.filter(
    (snapshot) => snapshot.status === "published",
  );
  const draftSnapshots = salarySnapshots.filter(
    (snapshot) => snapshot.status === "draft",
  );

  return (
    <>
      <Breadcrumbs
        items={[{ name: "Salary Snapshots", href: "/salary-snapshots" }]}
      />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Salary snapshots</p>
          <h1>Salary and market insight that can be updated properly.</h1>
          <p className="lede">
            Salary pages are published only when the ranges and commentary have
            been validated against current briefs and market conversations.
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
                <Link
                  className="text-link"
                  href={`/salary-snapshots/${snapshot.slug}`}
                >
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
              For now, salary advice is handled directly so the numbers reflect
              the role, seniority, team context and current market rather than a
              generic table.
            </p>
          </div>
        )}
      </section>
      {draftSnapshots.length ? (
        <section className="section muted">
          <div className="container section-heading">
            <p className="eyebrow">Planned snapshots</p>
            <h2>Draft tables stay draft until the numbers are checked.</h2>
            <p className="lede">
              These are the market pages prepared in the CMS. They should only
              become public when the salary ranges, notes and commentary have
              been validated against current conversations.
            </p>
          </div>
          <div className="container grid grid-3">
            {draftSnapshots.map((snapshot) => (
              <article className="card" key={snapshot.slug}>
                <span className="tag">Draft snapshot</span>
                <h3>{snapshot.title}</h3>
                <p>{snapshot.market}</p>
                <p className="meta">{snapshot.quarter}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <section className="section">
        <div className="container grid grid-3">
          <article className="card">
            <span className="tag">Format</span>
            <h2>Real tables, not flat images.</h2>
            <p>
              Published snapshots use semantic HTML tables so people, screen
              readers and search systems can read them.
            </p>
          </article>
          <article className="card">
            <span className="tag">Context</span>
            <h2>Titles are not enough.</h2>
            <p>
              Salary ranges need role scope, seniority, location, hybrid
              expectations and decision rights.
            </p>
          </article>
          <article className="card">
            <span className="tag">Review</span>
            <h2>Market data dates quickly.</h2>
            <p>
              Snapshots should be reviewed before they are used in a live brief
              or public salary discussion.
            </p>
          </article>
        </div>
      </section>
      <CTASection title="Need salary advice for a real brief?" />
      {publishedSnapshots.length ? (
        <SchemaScript
          data={itemListSchema({
            name: "Essential Resourcing salary snapshots",
            description:
              "Published salary and market snapshots for marketing, PR, communications and digital hiring.",
            items: publishedSnapshots.map((snapshot) => ({
              name: snapshot.title,
              url: `/salary-snapshots/${snapshot.slug}`,
              description: snapshot.intro,
            })),
          })}
        />
      ) : null}
    </>
  );
}
