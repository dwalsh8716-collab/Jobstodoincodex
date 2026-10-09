import Link from "next/link";
import styles from "@/components/Editorial.module.css";
import { salaryGuideSlug } from "@/lib/salary-guide-2026";
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
  const featured = published.find((item) => item.slug === salaryGuideSlug);

  return (
    <div className={styles.page}>
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
        <div className="container">
          {featured ? (
            <div className={styles.featured}>
              <p className="eyebrow">
                Salary Guide · Manchester &amp; North West · 2026
              </p>
              <h2>
                <Link
                  className={styles.titleLink}
                  href={`/insights/${featured.slug}`}
                >
                  {featured.title}
                </Link>
              </h2>
              <p>{featured.cardExcerpt || featured.excerpt}</p>
              <p className="meta">
                {featured.author} · {featured.updatedDate || featured.publishedDate}
              </p>
              <Link className="text-link" href={`/insights/${featured.slug}`}>
                View Salary Guide
              </Link>
            </div>
          ) : null}
        </div>
      </section>
      <section className="section">
        <div className="container"><h2>Useful insights</h2><div className={styles.cards}>
          {published.filter((item) => item.slug !== featured?.slug).map((insight) => (
            <InsightCard editorial key={insight.slug} insight={insight} />
          ))}
        </div></div>
      </section>
      <section className="section">
        <div className="container">
          <div>
            <p className="eyebrow">{copy?.categoryEyebrow}</p>
            <h2>{copy?.categoryHeading}</h2>
          </div>
          <div className={styles.topics}>
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
                <article className={styles.topic} key={category}>
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
        <div className={`container ${styles.answers}`}>
          {copy?.questions?.map((item) => (
            <details className={styles.answer} key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
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
    </div>
  );
}
