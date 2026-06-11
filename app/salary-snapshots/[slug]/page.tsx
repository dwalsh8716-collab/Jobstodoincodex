import { notFound } from "next/navigation";
import { AnalyticsPageEvent } from "@/components/AnalyticsPageEvent";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { SalaryTable } from "@/components/SalaryTable";
import {
  getPublicSalarySnapshot,
  getPublicSalarySnapshots,
} from "@/lib/public-content";
import { createMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const salarySnapshots = await getPublicSalarySnapshots();
  return salarySnapshots
    .filter((snapshot) => snapshot.status === "published")
    .map((snapshot) => ({ slug: snapshot.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const snapshot = await getPublicSalarySnapshot(slug);
  if (!snapshot || snapshot.status !== "published") return {};
  return createMetadata({
    title: snapshot.seoTitle,
    description: snapshot.metaDescription,
    path: `/salary-snapshots/${snapshot.slug}`,
    noIndex: snapshot.noIndex,
  });
}

export default async function SalarySnapshotPage({ params }: Props) {
  const { slug } = await params;
  const snapshot = await getPublicSalarySnapshot(slug);
  if (!snapshot || snapshot.status !== "published") notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Salary Snapshots", href: "/salary-snapshots" },
          { name: snapshot.title, href: `/salary-snapshots/${snapshot.slug}` },
        ]}
      />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Market snapshot</p>
          <h1>{snapshot.title}</h1>
          <p className="lede">{snapshot.intro}</p>
          <p className="meta">
            {snapshot.quarter} · {snapshot.market}
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container article-body">
          {snapshot.commentary.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <SalaryTable snapshot={snapshot} />
        </div>
      </section>
      <section className="section muted">
        <div className="container grid grid-3">
          <article className="card">
            <h2>Hiring notes</h2>
            {snapshot.hiringNotes.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </article>
          <article className="card">
            <h2>Candidate availability</h2>
            {snapshot.candidateAvailability.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </article>
          <article className="card">
            <h2>Key takeaways</h2>
            {snapshot.takeaways.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </article>
        </div>
      </section>
      <CTASection
        title="Want salary advice on a live role?"
        whatsAppIntent="hiring"
        whatsAppLabel="Check a salary range on WhatsApp"
      />
      <AnalyticsPageEvent
        event="salary_snapshot_view"
        snapshotSlug={snapshot.slug}
      />
    </>
  );
}
