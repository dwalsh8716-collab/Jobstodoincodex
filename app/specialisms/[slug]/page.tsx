import Link from "next/link";
import Image from "next/image";
import { InsightCard } from "@/components/Cards";
import styles from "@/components/SpecialismPage.module.css";
import { specialismEditorial, specialismServiceRoutes } from "@/lib/specialism-editorial";
import { getPublicInsights, getPublicCaseStudies } from "@/lib/public-content";
import { salaryGuideSlug } from "@/lib/salary-guide-2026";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { specialisms, getSpecialismBySlug } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

const supportingCopy = {
  "marketing-and-leadership": [
    "This covers the people responsible for making marketing sharper, more commercial and easier to trust.",
    "It might be a hands-on Marketing Manager, a Head of Marketing building the function, or a CMO-level leader setting the direction.",
  ],
  "digital-performance-ecommerce": [
    "This is where the commercially focused digital roles sit: acquisition, performance, CRM, eCommerce, retention and the leadership around them.",
    "The title matters less than what the person is expected to change, measure and improve.",
  ],
  "pr-communications-content": [
    "This covers reputation, earned media, social, content and communications roles across agency and client-side teams.",
    "Paid social and performance-led roles usually sit under Digital, Performance & eCommerce. Social and content-led roles sit here.",
  ],
  "agency-client-services-leadership": [
    "This is the agency specialism that really matters: the people who lead clients, teams and commercial relationships.",
    "It covers client services and agency leadership across PR, digital, integrated, creative, media and performance agencies.",
  ],
} as const;

export function generateStaticParams() {
  return specialisms.map((specialism) => ({ slug: specialism.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const specialism = getSpecialismBySlug(slug);
  if (!specialism) return {};

  return createMetadata({
    title: specialism.seoTitle,
    description: specialism.metaDescription,
    path: `/specialisms/${specialism.slug}`,
  });
}

export default async function SpecialismPage({ params }: Props) {
  const { slug } = await params;
  const specialism = getSpecialismBySlug(slug);
  if (!specialism) notFound();
  const editorial = specialismEditorial[specialism.slug];
  const insights = (await getPublicInsights()).filter((item) => item.status === "published" && (item.slug === salaryGuideSlug || (specialism.slug === "marketing-and-leadership" && item.slug === "marketing-recruitment-manchester-north-west-guide"))).slice(0, 2);
  const proof = specialism.slug === "agency-client-services-leadership" ? (await getPublicCaseStudies()).find((item) => item.status === "published" && item.slug === "havas-media-manchester-managing-partner-james-reddington") : undefined;

  return (
    <div className={`specialism-detail-page ${styles.page}`}>
      <Breadcrumbs
        items={[
          { name: "Specialisms", href: "/specialisms" },
          { name: specialism.title, href: `/specialisms/${specialism.slug}` },
        ]}
      />

      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Specialism</p>
          <h1>{specialism.title}</h1>
          <p className="lede">{specialism.description}</p>
          <p className="lede">{specialism.detail}</p>
          <div className="button-row hero-actions">
            <Link className="button button-primary" href="/contact">
              Contact David
            </Link>
            <WhatsAppButton
              intent="hiring"
              label="Discuss this on WhatsApp"
              location={`${specialism.slug}_hero`}
              service={specialism.title}
              variant="secondary"
            />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="market-glance">
        <div className="container">
          <p className="eyebrow">Market at a glance</p>
          <h2 id="market-glance">The people and work inside this market.</h2>
          <p className={styles.intro}>Typical briefs sit across these areas. These are examples, not a fixed career ladder or an exhaustive list.</p>
          <div className={styles.taxonomy}>
            {editorial.groups.map((group) => <div key={group.title}><h3>{group.title}</h3><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></div>)}
          </div>
        </div>
      </section>

      <section className="section surface" aria-labelledby="specialism-summary">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Where this fits</p>
            <h2 id="specialism-summary">
              Specialist, not generalist. That’s the point.
            </h2>
          </div>
          <div className="statement-list">
            {supportingCopy[specialism.slug].map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>
              Manchester-led. North West-rooted. UK-wide when the brief needs
              it.
            </p>
            <p>{editorial.boundary}</p>
            <Link className="text-link" href={`/specialisms/${editorial.adjacent}`}>Explore {getSpecialismBySlug(editorial.adjacent)?.title}</Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="brief-judgement">
        <div className="container split split-start">
          <div><p className="eyebrow">The job title isn’t the brief</p><h2 id="brief-judgement">{editorial.heading}</h2></div>
          <div className={styles.judgement}><p>{editorial.judgement}</p><ul>{editorial.questions.map((question) => <li key={question}>{question}</li>)}</ul></div>
        </div>
      </section>

      <section className="section surface" aria-labelledby="hiring-routes">
        <div className="container">
          <p className="eyebrow">Which hiring route fits?</p><h2 id="hiring-routes">Know the market. Then choose the right search.</h2>
          <ul className={styles.routes}>{specialismServiceRoutes.filter((route) => specialism.slug !== "pr-communications-content" || route.slug !== "fractional").map((route) => <li key={route.slug}><Link href={`/services/${route.slug}`}><h3>{route.title}</h3><p>{route.text}</p><span className="text-link">Explore the service</span></Link></li>)}</ul>
        </div>
      </section>

      {proof ? <section className="section"><div className={`container ${styles.proof}`}><p className="eyebrow">Agency leadership in practice</p>{proof.proofLogo ? <Image src={proof.proofLogo} alt={proof.proofLogoAlt || "Havas Media"} width={220} height={118} /> : null}<h2>{proof.title}</h2><p>{proof.challengeSummary}</p><Link className="text-link" href={`/case-studies/${proof.slug}`}>Read the Havas case study</Link></div></section> : null}

      {insights.length ? <section className="section"><div className="container"><p className="eyebrow">Useful reading</p><h2>Market context for a better brief.</h2><div className={styles.insights}>{insights.map((insight) => <InsightCard key={insight.slug} insight={insight} />)}</div><p className={styles.intro}>Looking for your next move? <Link href="/jobs">View current roles</Link> or <Link href="/candidates#candidate-contact">send David your details privately</Link>.</p></div></section> : null}

      <CTASection
        title="Start with what you’re trying to solve."
        text={"The same job title can mean something completely different from one business to the next.\n\nTell David who you’re trying to hire, what’s not working and what this person needs to change. He’ll give you a straight view on the brief, market and most sensible route."}
        ctaLabel="Contact David"
        ctaHref="/contact"
        whatsAppIntent="hiring"
        whatsAppLabel="Discuss this on WhatsApp"
      />
    </div>
  );
}
