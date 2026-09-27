import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { SchemaScript } from "@/components/SchemaScript";
import { getPublicSalarySnapshots } from "@/lib/public-content";
import { createMetadata, itemListSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Marketing Salary Guides Manchester & North West | Essential Resourcing",
  description:
    "Current marketing, PR, communications, digital and agency salary insight for Manchester and the North West from Essential Resourcing.",
  path: "/salary-snapshots",
  noIndex: true,
});

const salarySnapshotOrder = [
  "agency-hiring-market-snapshot",
  "digital-performance-marketing-salary-snapshot",
  "north-west-marketing-salary-snapshot",
  "pr-communications-salary-snapshot",
  "senior-marketing-leadership-salary-snapshot",
];

function orderSalarySnapshots<T extends { slug: string }>(items: T[]) {
  const ordered = salarySnapshotOrder
    .map((slug) => items.find((item) => item.slug === slug))
    .filter((item): item is T => Boolean(item));
  const remaining = items.filter(
    (item) => !salarySnapshotOrder.includes(item.slug),
  );
  return [...ordered, ...remaining];
}

export default async function SalarySnapshotsPage() {
  const salarySnapshots = await getPublicSalarySnapshots();
  const publishedSnapshots = orderSalarySnapshots(
    salarySnapshots.filter((snapshot) => snapshot.status === "published"),
  );
  const draftSnapshots = orderSalarySnapshots(
    salarySnapshots.filter((snapshot) => snapshot.status === "draft"),
  );

  return (
    <>
      <Breadcrumbs
        items={[{ name: "Salary Snapshots", href: "/salary-snapshots" }]}
      />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Salary snapshots</p>
          <h1>Marketing salary insight without the false precision.</h1>
          <p className="lede">
            A job title on its own doesn&apos;t tell you what somebody should earn.
          </p>
          <p className="lede">
            Scope, team size, budget, commercial responsibility, sector,
            location, hybrid expectations and business stage all matter.
          </p>
          <p className="lede">
            So Essential only publishes salary ranges when they&apos;re backed by
            current market conversations and live hiring evidence.
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
            <h2>No public salary snapshots are live yet.</h2>
            <p className="lede">
              For now, David handles salary questions directly so the advice
              reflects the actual role rather than giving you a generic number
              from a spreadsheet.
            </p>
          </div>
        )}
      </section>
      {draftSnapshots.length ? (
        <section className="section muted">
          <div className="container section-heading">
            <p className="eyebrow">Planned snapshots</p>
          </div>
          <div className="container grid grid-3">
            {draftSnapshots.map((snapshot) => (
              <article className="card" key={snapshot.slug}>
                <h3>{snapshot.title}</h3>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <section className="section">
        <div className="container grid grid-3">
          <article className="card">
            <span className="tag">Why context matters</span>
            <h2>Titles aren&apos;t enough.</h2>
            <p>
              Two Heads of Marketing can have wildly different jobs. One might
              manage a £5m budget and a team of 15. Another might be the entire
              marketing department.
            </p>
          </article>
          <article className="card">
            <span className="tag">Context</span>
            <h2>A useful benchmark needs the detail.</h2>
            <p>
              A useful salary benchmark needs to understand the difference
              between title, scope, budget, sector, location and business stage.
            </p>
          </article>
          <article className="card">
            <span className="tag">Keeping it current</span>
            <h2>Marketing salaries move.</h2>
            <p>
              Every published snapshot will carry a clear review date and should
              be treated as market context, not gospel.
            </p>
          </article>
        </div>
      </section>
      <CTASection
        title="Got a live role and need a salary sense-check?"
        text="Ask David."
      />
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
