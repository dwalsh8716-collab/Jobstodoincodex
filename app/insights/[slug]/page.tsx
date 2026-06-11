import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { RichMediaBlock } from "@/components/RichMedia";
import { SchemaScript } from "@/components/SchemaScript";
import {
  getPublicInsight,
  getPublicInsights,
  getPublicServices,
} from "@/lib/public-content";
import { articleSchema, createMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

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
  const relatedServices = services.filter((service) =>
    insight.relatedServiceSlugs.includes(service.slug),
  );
  const relatedInsights = insights.filter(
    (item) =>
      item.status === "published" &&
      insight.relatedInsightSlugs.includes(item.slug),
  );

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
            <p className="eyebrow">{insight.category}</p>
            <h1>{insight.title}</h1>
            <p className="lede">{insight.excerpt}</p>
            <p className="meta">
              {insight.author} · Published {insight.publishedDate} · Updated{" "}
              {insight.updatedDate} · {insight.readingTime}
            </p>
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
        title="Need this thinking applied to a real brief?"
        whatsAppIntent="hiring"
        whatsAppLabel="Message David on WhatsApp"
      />
      <SchemaScript data={articleSchema(insight)} />
    </>
  );
}
