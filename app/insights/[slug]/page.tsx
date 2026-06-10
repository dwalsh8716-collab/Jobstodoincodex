import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { RichMediaBlock } from "@/components/RichMedia";
import { SchemaScript } from "@/components/SchemaScript";
import { getInsight, insights, services } from "@/lib/content";
import { articleSchema, createMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return insights.filter((insight) => insight.status === "published").map((insight) => ({ slug: insight.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) return {};
  return createMetadata({
    title: insight.seoTitle,
    description: insight.metaDescription,
    path: `/insights/${insight.slug}`
  });
}

export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) notFound();

  const relatedServices = services.filter((service) => insight.relatedServiceSlugs.includes(service.slug));

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Insights", href: "/insights" },
          { name: insight.title, href: `/insights/${insight.slug}` }
        ]}
      />
      <article>
        <section className="section dark">
          <div className="container section-heading">
            <p className="eyebrow">{insight.category}</p>
            <h1>{insight.title}</h1>
            <p className="lede">{insight.excerpt}</p>
            <p className="meta">
              {insight.author} · Published {insight.publishedDate} · Updated {insight.updatedDate} · {insight.readingTime}
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
              {insight.pullQuote ? <blockquote className="pull-quote">{insight.pullQuote}</blockquote> : null}
            </div>
            <aside className="grid">
              {insight.media ? <RichMediaBlock media={insight.media} /> : null}
              <div className="card">
                <span className="tag">Related services</span>
                <div className="grid">
                  {relatedServices.map((service) => (
                    <Link className="text-link" href={`/services/${service.slug}`} key={service.slug}>
                      {service.title}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </article>
      <FAQAccordion faqs={insight.faqs} />
      <CTASection title="Need this thinking applied to a real brief?" />
      <SchemaScript data={articleSchema(insight)} />
    </>
  );
}
