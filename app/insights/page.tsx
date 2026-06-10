import { InsightCard } from "@/components/Cards";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { SchemaScript } from "@/components/SchemaScript";
import {
  aiSearchQuestions,
  insightCategories,
  insightSeeds,
  insights,
} from "@/lib/content";
import { createMetadata, itemListSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Marketing Recruitment Insights | Essential Resourcing",
  description:
    "Hiring advice, market commentary, strategic interim explainers and senior marketing recruitment insight from David Walsh.",
  path: "/insights",
});

export default function InsightsPage() {
  const published = insights.filter(
    (insight) => insight.status === "published",
  );
  const categories = insightCategories.map((category) => ({
    category,
    count: published.filter((insight) => insight.category === category).length,
  }));

  return (
    <>
      <Breadcrumbs items={[{ name: "Insights", href: "/insights" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Insights</p>
          <h1>Marketing recruitment insight without vague brochure copy.</h1>
          <p className="lede">
            Clear, structured answers to real hiring questions, written for
            clients, candidates and AI-search visibility.
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
      <section className="section">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Categories</p>
            <h2>Grouped by the question behind the search.</h2>
            <p className="lede">
              The point is not to produce more articles. It is to answer the
              questions clients and candidates are already asking.
            </p>
          </div>
          <div className="grid">
            {categories.map((item) => (
              <article className="card" key={item.category}>
                <span className="tag">{item.count} published</span>
                <h3>{item.category}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section muted">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Article ideas</p>
            <h2>Useful topics, not SEO sludge.</h2>
            <p className="lede">
              These only become articles when they have a clear point of view
              and something useful to say.
            </p>
          </div>
          <div className="grid">
            {insightSeeds.map((seed) => (
              <article className="card" key={seed}>
                <span className="tag">Article idea</span>
                <h3>{seed}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section surface">
        <div className="container grid grid-3">
          <article className="card">
            <span className="tag">Author</span>
            <h2>Every article has a visible point of view.</h2>
            <p>
              Byline, dates, related services and FAQs are part of the
              publishing standard.
            </p>
          </article>
          <article className="card">
            <span className="tag">Structure</span>
            <h2>Answers first. Detail after.</h2>
            <p>
              Articles should answer a buyer question clearly before drifting
              into background detail.
            </p>
          </article>
          <article className="card">
            <span className="tag">Usefulness</span>
            <h2>No content for the sake of it.</h2>
            <p>
              Draft ideas stay draft until they are worth publishing under
              David&apos;s name.
            </p>
          </article>
        </div>
      </section>
      <section className="section">
        <div className="container section-heading">
          <p className="eyebrow">Quick answers</p>
          <h2>Clear answers to the hiring questions people actually ask.</h2>
          <p className="lede">
            Useful search visibility starts with first-party answers, not
            keyword padding.
          </p>
        </div>
        <div className="container grid grid-3">
          {aiSearchQuestions.map((item) => (
            <article className="card" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
      <CTASection title="Want a market view before you hire?" />
      {published.length ? (
        <SchemaScript
          data={itemListSchema({
            name: "Essential Resourcing insights",
            description:
              "Published hiring advice, market commentary and senior marketing recruitment insight from David Walsh.",
            items: published.map((insight) => ({
              name: insight.title,
              url: `/insights/${insight.slug}`,
              description: insight.excerpt,
            })),
          })}
        />
      ) : null}
    </>
  );
}
