import { InsightCard } from "@/components/Cards";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { insightSeeds, insights } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Marketing Recruitment Insights | Essential Resourcing",
  description:
    "Hiring advice, market commentary, strategic interim explainers and senior marketing recruitment insight from David Walsh.",
  path: "/insights"
});

export default function InsightsPage() {
  const published = insights.filter((insight) => insight.status === "published");

  return (
    <>
      <Breadcrumbs items={[{ name: "Insights", href: "/insights" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Insights</p>
          <h1>Marketing recruitment insight without vague brochure copy.</h1>
          <p className="lede">
            Clear, structured answers to real hiring questions, written for clients, candidates and AI-search visibility.
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container grid grid-3">
          {published.map((insight) => (
            <InsightCard key={insight.slug} insight={insight} />
          ))}
        </div>
      </section>
      <section className="section muted">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Content seeds</p>
            <h2>Draft ideas ready for CMS planning.</h2>
            <p className="lede">These are not published as articles until they are written properly.</p>
          </div>
          <div className="grid">
            {insightSeeds.map((seed) => (
              <article className="card" key={seed}>
                <span className="tag">Draft article idea</span>
                <h3>{seed}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CTASection title="Want a market view before you hire?" />
    </>
  );
}
