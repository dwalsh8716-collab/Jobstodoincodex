import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { LinkedInProfileLink } from "@/components/LinkedInProfileLink";
import { RichMediaBlock } from "@/components/RichMedia";
import { SchemaScript } from "@/components/SchemaScript";
import {
  getPublicInsight,
  getPublicInsights,
  getPublicServices,
} from "@/lib/public-content";
import { articleSchema, createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

function orderBySlug<T extends { slug: string }>(items: T[], slugs: string[]) {
  const uniqueSlugs = Array.from(new Set(slugs));
  const ordered = uniqueSlugs
    .map((slug) => items.find((item) => item.slug === slug))
    .filter((item): item is T => Boolean(item));
  const remaining = items.filter((item) => !uniqueSlugs.includes(item.slug));
  return [...ordered, ...remaining];
}

export async function generateStaticParams() {
  const insights = await getPublicInsights();
  return insights
    .filter((insight) => insight.status === "published")
    .map((insight) => ({ slug: insight.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const insight = await getPublicInsight(slug);
  if (!insight || insight.status !== "published") return {};
  return createMetadata({
    title: insight.seoTitle,
    description: insight.metaDescription,
    path: `/insights/${insight.slug}`,
    noIndex: insight.noIndex,
  });
}

export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const insight = await getPublicInsight(slug);
  if (!insight || insight.status !== "published") notFound();

  const [services, insights] = await Promise.all([
    getPublicServices(),
    getPublicInsights(),
  ]);
  const relatedServices = orderBySlug(
    services.filter((service) =>
      insight.relatedServiceSlugs.includes(service.slug),
    ),
    insight.relatedServiceSlugs,
  );
  const relatedInsights = orderBySlug(
    insights.filter(
      (item) =>
        item.status === "published" &&
        !item.noIndex &&
        insight.relatedInsightSlugs.includes(item.slug),
    ),
    insight.relatedInsightSlugs,
  );
  const isDavidAuthored = insight.author
    .trim()
    .toLowerCase() === siteConfig.founder.toLowerCase();

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Insights", href: "/insights" },
          { name: insight.title, href: `/insights/${insight.slug}` },
        ]}
      />
      <article>
        <section className="section dark">
          <div className="container section-heading">
            <p className="eyebrow">
              {insight.cardCategory || insight.category}
            </p>
            <h1>{insight.title}</h1>
            <p className="lede">{insight.excerpt}</p>
            <p className="meta">
              {isDavidAuthored ? (
                <>By <Link href="/about-david-walsh">David Walsh</Link>, Founder, Essential Resourcing</>
              ) : (
                <>By {insight.author}</>
              )} · Published {insight.publishedDate} · Updated{" "}
              {insight.updatedDate} · {insight.readingTime}
            </p>
            {isDavidAuthored ? (
              <LinkedInProfileLink
                label="Connect with David on LinkedIn"
                location="author_bio"
                profileType="author"
              />
            ) : null}
          </div>
        </section>
        <section className="section surface">
          <div className="container split split-start">
            <div className="article-body">
              {insight.body.map((section) => (
                <section key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.content.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
              {insight.pullQuote ? (
                <blockquote className="pull-quote">
                  {insight.pullQuote}
                </blockquote>
              ) : null}
            </div>
            <aside className="grid">
              {insight.media ? <RichMediaBlock media={insight.media} /> : null}
              <div className="card">
                <span className="tag">Related services</span>
                <div className="grid">
                  {relatedServices.map((service) => (
                    <Link
                      className="text-link"
                      href={`/services/${service.slug}`}
                      key={service.slug}
                    >
                      {service.title}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="card">
                <span className="tag">How David recruits</span>
                <Link
                  className="text-link"
                  href="/how-essential-resourcing-works"
                >
                  See the search and assessment process
                </Link>
              </div>
              {relatedInsights.length ? (
                <div className="card">
                  <span className="tag">Related insights</span>
                  <div className="grid">
                    {relatedInsights.map((item) => (
                      <Link
                        className="text-link"
                        href={`/insights/${item.slug}`}
                        key={item.slug}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </section>
      </article>
      <FAQAccordion faqs={insight.faqs} />
      <CTASection
        title={
          insight.ctaHeading || "Need this thinking applied to a real brief?"
        }
        text={insight.ctaText}
        whatsAppIntent="hiring"
        whatsAppLabel="Message David on WhatsApp"
      />
      <SchemaScript data={articleSchema(insight)} />
    </>
  );
}
