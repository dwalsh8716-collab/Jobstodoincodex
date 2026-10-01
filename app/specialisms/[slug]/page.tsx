import Link from "next/link";
import Image from "next/image";
import { InsightCard } from "@/components/Cards";
import styles from "@/components/SpecialismPage.module.css";
import {
  specialismEditorial,
  specialismServiceRoutes,
} from "@/lib/specialism-editorial";
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
  const insights = (await getPublicInsights())
    .filter(
      (item) =>
        item.status === "published" &&
        (item.slug === salaryGuideSlug ||
          (specialism.slug === "marketing-and-leadership" &&
            item.slug ===
              "marketing-recruitment-manchester-north-west-guide") ||
          (specialism.slug === "agency-client-services-leadership" &&
            item.slug ===
              "why-hiring-senior-agency-people-is-harder-than-matching-clients-and-job-titles")),
    )
    .slice(0, 2);
  const proof =
    specialism.slug === "agency-client-services-leadership"
      ? (await getPublicCaseStudies()).find(
          (item) =>
            item.status === "published" &&
            item.slug ===
              "havas-media-manchester-managing-partner-james-reddington",
        )
      : undefined;

  return (
    <div className={`specialism-detail-page ${styles.page}`}>
      <Breadcrumbs
        items={[
          { name: "Specialisms", href: "/specialisms" },
          { name: specialism.title, href: `/specialisms/${specialism.slug}` },
        ]}
      />

      <section className={`section dark ${styles.hero}`}>
        <div className="container section-heading">
          <p className="eyebrow">Specialism</p>
          <h1>{specialism.title}</h1>
          <p className="lede">
            {editorial.hero?.[0] ?? specialism.description}
          </p>
          <p className={`lede ${styles.heroScope}`}>
            {editorial.hero?.[1] ?? specialism.detail}
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-primary" href="/contact">
              Talk to David
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
          <p className={styles.intro}>
            Typical briefs sit across these areas. These are examples, not a
            fixed career ladder or an exhaustive list.
          </p>
          <div
            className={`${styles.taxonomy} ${specialism.slug === "agency-client-services-leadership" || specialism.slug === "pr-communications-content" ? styles.taxonomyRows : ""}`}
          >
            {editorial.groups.map((group, index) => (
              <div key={group.title}>
                <div>
                  <span className={styles.number} aria-hidden="true">
                    0{index + 1}
                  </span>
                  <h3>{group.title}</h3>
                </div>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section surface" aria-labelledby="specialism-summary">
        <div className={`container ${styles.editorial}`}>
          <div>
            <p className="eyebrow">Where this fits</p>
            <h2 id="specialism-summary">{editorial.summaryHeading}</h2>
          </div>
          <div className={styles.prose}>
            {editorial.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>
              Manchester-led. North West-rooted. UK-wide when the brief needs
              it.
            </p>
            <p>{editorial.boundary}</p>
            <Link
              className="text-link"
              href={`/specialisms/${editorial.adjacent}`}
            >
              Explore {getSpecialismBySlug(editorial.adjacent)?.title}
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="brief-judgement">
        <div className={`container ${styles.editorial}`}>
          <div>
            <p className="eyebrow">The job title isn’t the brief</p>
            <h2 id="brief-judgement">{editorial.heading}</h2>
          </div>
          <div className={styles.judgement}>
            <p>{editorial.judgement}</p>
            <ul>
              {editorial.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
            {editorial.closing ? <p>{editorial.closing}</p> : null}
          </div>
        </div>
      </section>

      <section className="section surface" aria-labelledby="hiring-routes">
        <div className="container">
          <p className="eyebrow">Which hiring route fits?</p>
          <h2 id="hiring-routes">
            Know the market. Then choose the right search.
          </h2>
          <ul className={styles.routes}>
            {specialismServiceRoutes.map((route) => (
              <li key={route.slug}>
                <Link href={`/services/${route.slug}`}>
                  <h3>{route.title}</h3>
                  <p>{route.text}</p>
                  <span className="text-link">Explore the service</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {proof ? (
        <section className="section">
          <div className={`container ${styles.proof}`}>
            <p className="eyebrow">Agency leadership in practice</p>
            {proof.proofLogo ? (
              <Image
                src={proof.proofLogo}
                alt={proof.proofLogoAlt || "Havas Media"}
                width={220}
                height={118}
              />
            ) : null}
            <h2>{proof.title}</h2>
            <p>{proof.challengeSummary}</p>
            <Link className="text-link" href={`/case-studies/${proof.slug}`}>
              Read the Havas case study
            </Link>
          </div>
        </section>
      ) : null}

      {insights.length ? (
        <section className="section">
          <div className="container">
            <p className="eyebrow">Useful reading</p>
            <h2>Market context for a better brief.</h2>
            <div className={styles.insights}>
              {insights.map((insight) => (
                <InsightCard key={insight.slug} insight={insight} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section
        className={`section-tight ${styles.candidate}`}
        aria-labelledby="candidate-route"
      >
        <div className="container">
          <p className="eyebrow">For candidates</p>
          <h2 id="candidate-route">Looking for your next move?</h2>
          <p>
            Have a look at the roles I&apos;m working on, or send me your
            details privately.
          </p>
          <div className="button-row">
            <Link className="text-link" href="/jobs">
              View current roles
            </Link>
            <Link className="text-link" href="/candidates#candidate-contact">
              Send David your details
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow={specialism.title}
        title="Tell me what you're actually trying to hire."
        text={
          "Send me the brief, even if it's rough.\n\nI'll give you a straight view on the role, salary, market, likely candidate pool and which hiring route makes sense."
        }
        ctaLabel="Talk to David"
        ctaHref="/contact"
        whatsAppIntent="hiring"
        whatsAppService={specialism.title}
        whatsAppLabel="Discuss this on WhatsApp"
      />
    </div>
  );
}
