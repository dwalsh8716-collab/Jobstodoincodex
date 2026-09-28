import Link from "next/link";
import { InsightCard } from "@/components/Cards";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { SchemaScript } from "@/components/SchemaScript";
import {
  getPublicCaseStudies,
  getPublicContentHubPages,
  getPublicInsights,
} from "@/lib/public-content";
import { createMetadata, itemListSchema } from "@/lib/seo";

export async function generateMetadata() {
  const { insights } = await getPublicContentHubPages();
  return createMetadata({
    title:
      insights?.seoTitle ||
      "Marketing Recruitment & Hiring Insights | David Walsh",
    description:
      insights?.metaDescription ||
      "Practical marketing recruitment advice, market commentary, salary insight and fractional guidance from recruiter David Walsh.",
    path: "/insights",
  });
}

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
  const [{ insights: copy }, insights, caseStudies] = await Promise.all([
    getPublicContentHubPages(),
    getPublicInsights(),
    getPublicCaseStudies(),
  ]);
  const published = orderBySlug(
    insights.filter((insight) => insight.status === "published"),
    copy?.displayOrder || [],
  );
  const publishedCaseStudies = caseStudies.filter(
    (caseStudy) => caseStudy.status === "published" && !caseStudy.noIndex,
  );

  return (
    <>
      <Breadcrumbs items={[{ name: "Insights", href: "/insights" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">{copy?.eyebrow}</p>
          <h1>{copy?.title}</h1>
          {copy?.intro?.map((paragraph) => (
            <p className="lede" key={paragraph}>
              {paragraph}
            </p>
          ))}
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
            <p className="eyebrow">{copy?.categoryEyebrow}</p>
            <h2>{copy?.categoryHeading}</h2>
          </div>
          <div className="grid">
            {copy?.categories?.map((category) => {
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
                    <p className="meta">{copy?.categoryEmptyMessage}</p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container section-heading">
          <p className="eyebrow">{copy?.quickAnswersEyebrow}</p>
          <h2>{copy?.quickAnswersHeading}</h2>
        </div>
        <div className="container grid grid-3">
          {copy?.questions?.map((item) => (
            <article className="card" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
      <CTASection title={copy?.ctaHeading} text={copy?.ctaText} />
      {published.length ? (
        <SchemaScript
          data={itemListSchema({
            name: "Essential Resourcing insights",
            description:
              copy?.metaDescription ||
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
