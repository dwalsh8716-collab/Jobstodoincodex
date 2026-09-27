import Link from "next/link";
import { InsightCard } from "@/components/Cards";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { SchemaScript } from "@/components/SchemaScript";
import { aiSearchQuestions, insightCategories } from "@/lib/content";
import { getPublicCaseStudies, getPublicInsights } from "@/lib/public-content";
import { createMetadata, itemListSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Marketing Recruitment & Hiring Insights | David Walsh",
  description:
    "Practical marketing recruitment advice, market commentary, salary insight and fractional guidance from recruiter David Walsh.",
  path: "/insights",
});

const insightOrder = [
  "manchester-north-west-marketing-salary-guide-2026",
  "marketing-recruitment-manchester-north-west-guide",
  "retained-search-vs-contingent-recruitment",
  "how-much-does-senior-marketing-recruitment-cost",
  "the-job-title-isnt-the-brief-senior-marketing-hire",
  "marketing-recruitment-market-isnt-dead-businesses-hiring-differently",
  "what-should-you-pay-a-senior-marketing-hire-in-2026",
  "do-you-actually-need-a-full-time-marketing-director",
  "your-first-marketing-director-what-should-you-actually-be-hiring-for",
  "why-hiring-senior-agency-people-is-harder-than-matching-clients-and-job-titles",
  "your-cv-tells-me-where-youve-worked-what-you-actually-did",
  "how-to-hire-a-marketing-director-without-wasting-six-weeks",
  "what-is-a-fractional-marketing-leader",
  "when-should-an-agency-use-retained-search",
  "why-senior-marketing-hiring-goes-wrong",
];

function orderBySlug<T extends { slug: string }>(items: T[], slugs: string[]) {
  const ordered = slugs
    .map((slug) => items.find((item) => item.slug === slug))
    .filter((item): item is T => Boolean(item));
  const remaining = items.filter((item) => !slugs.includes(item.slug));
  return [...ordered, ...remaining];
}

function insightMatchesCategory(
  insight: { category: string; cardCategory?: string },
  category: string,
) {
  const labels = [insight.category, insight.cardCategory]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split("/").map((item) => item.trim()));

  return labels.includes(category);
}

export default async function InsightsPage() {
  const [insights, caseStudies] = await Promise.all([
    getPublicInsights(),
    getPublicCaseStudies(),
  ]);
  const published = orderBySlug(
    insights.filter((insight) => insight.status === "published"),
    insightOrder,
  );
  const publishedCaseStudies = caseStudies.filter(
    (caseStudy) => caseStudy.status === "published" && !caseStudy.noIndex,
  );

  return (
    <>
      <Breadcrumbs items={[{ name: "Insights", href: "/insights" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Insights</p>
          <h1>Useful thinking on marketing hiring. No SEO sludge.</h1>
          <p className="lede">
            Nearly 13 years of conversations with candidates, clients, agencies
            and marketing teams creates a fair few opinions.
          </p>
          <p className="lede">This is where David puts the useful ones.</p>
          <p className="lede">
            Hiring advice, market observations and straight answers to the
            questions businesses and candidates are actually asking.
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
            <h2>Find the useful stuff.</h2>
          </div>
          <div className="grid">
            {insightCategories.map((category) => {
              const categoryInsights = published.filter((insight) =>
                insightMatchesCategory(insight, category),
              );
              const categoryLinks =
                category === "Case studies"
                  ? publishedCaseStudies.map((caseStudy) => ({
                      href: `/case-studies/${caseStudy.slug}`,
                      title: caseStudy.title,
                    }))
                  : categoryInsights.map((insight) => ({
                      href: `/insights/${insight.slug}`,
                      title: insight.title,
                    }));

              return (
                <article className="card insight-category-card" key={category}>
                  <h3>{category}</h3>
                  {categoryLinks.length ? (
                    <div className="insight-category-links">
                      {categoryLinks.map((item) => (
                        <Link
                          className="text-link"
                          href={item.href}
                          key={item.href}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="meta">
                      Case studies and proof-led articles will sit here once the
                      facts and permissions are ready.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container section-heading">
          <p className="eyebrow">Quick answers</p>
          <h2>Straight answers to common marketing recruitment questions.</h2>
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
      <CTASection
        title="Want a market view before you hire?"
        text="Tell David what you're trying to hire."
      />
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
