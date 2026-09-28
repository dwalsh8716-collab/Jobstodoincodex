import Image from "next/image";
import styles from "./homepage.module.css";
import Link from "next/link";
import { BookingButton } from "@/components/BookingButton";
import { InsightCard } from "@/components/Cards";
import { HomeHeroVideo } from "@/components/HomeHeroVideo";
import { LinkedInProfileLink } from "@/components/LinkedInProfileLink";
import { LinkedInRecommendations } from "@/components/LinkedInRecommendations";
import { Reveal } from "@/components/Reveal";
import { RichMediaBlock } from "@/components/RichMedia";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { analyticsAttributes } from "@/lib/analytics";
import {
  getPublicCaseStudies,
  getPublicHomePage,
  getPublicInsights,
} from "@/lib/public-content";
import { createMetadata } from "@/lib/seo";
import { salaryGuideSlug } from "@/lib/salary-guide-2026";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: siteConfig.defaultTitle,
  description: siteConfig.defaultDescription,
});

function orderBySlug<T extends { slug: string }>(items: T[], slugs: string[]) {
  const ordered = slugs
    .map((slug) => items.find((item) => item.slug === slug))
    .filter((item): item is T => Boolean(item));
  const remaining = items.filter((item) => !slugs.includes(item.slug));
  return [...ordered, ...remaining];
}

function firstParagraph(value: string) {
  return value.split(/\n{2,}/)[0]?.trim() || value;
}

function splitHeroHeadline(headline: string) {
  const trimmed = headline.trim();

  if (trimmed === "Helping Businesses Make Better Hiring Decisions.") {
    return ["Helping Businesses", "Make Better Hiring Decisions."];
  }

  const words = trimmed.split(/\s+/);
  if (words.length < 5) return [trimmed];

  const midpoint = Math.ceil(words.length / 2);
  return [
    words.slice(0, midpoint).join(" "),
    words.slice(midpoint).join(" "),
  ];
}

function emphasiseTrailingPhrase(text: string, phrase: string) {
  if (!text.toLowerCase().endsWith(phrase.toLowerCase())) return text;

  const prefix = text.slice(0, text.length - phrase.length);
  const suffix = text.slice(text.length - phrase.length);

  return (
    <>
      {prefix}
      <em>{suffix}</em>
    </>
  );
}

function TickerRow({ disciplines }: { disciplines: string[] }) {
  return (
    <ul className="home-ticker-row">
      {disciplines.map((discipline) => (
        <li key={discipline}>
          <span>{discipline}</span>
          <span aria-hidden="true" className="home-ticker-star">
            *
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function HomePage() {
  const [homePage, insights, caseStudies] = await Promise.all([
    getPublicHomePage(),
    getPublicInsights(),
    getPublicCaseStudies(),
  ]);
  const [heroHeadlineFirstLine, heroHeadlineSecondLine] = splitHeroHeadline(
    homePage.heroHeadline,
  );
  const heroHeadlineSecondLineHasPeriod =
    heroHeadlineSecondLine?.endsWith(".");
  const heroHeadlineSecondLineText = heroHeadlineSecondLineHasPeriod
    ? heroHeadlineSecondLine.slice(0, -1)
    : heroHeadlineSecondLine;
  const featuredInsights = orderBySlug(
    insights,
    [...new Set([salaryGuideSlug, ...homePage.featuredInsightSlugs])],
  ).slice(0, 3);
  const publishedCaseStudies = caseStudies.filter(
    (caseStudy) => caseStudy.status === "published",
  );
  const featuredCases = orderBySlug(
    publishedCaseStudies,
    homePage.featuredCaseStudySlugs,
  )
    .filter(
      (caseStudy) =>
        homePage.featuredCaseStudySlugs.includes(caseStudy.slug) ||
        caseStudy.featured,
    )
    .slice(0, 3);
  const homeProofCase = featuredCases[0];

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/assets/video/homepage-hero-mobile-poster-v3.webp"
        type="image/webp"
        media="(max-width: 640px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/assets/video/homepage-hero-poster-v3.webp"
        type="image/webp"
        media="(min-width: 641px)"
        fetchPriority="high"
      />
      <section
        className="home-hero home-hero-video grain dark"
        aria-labelledby="hero-heading"
      >
        <picture className="home-hero-picture">
          <source
            media="(max-width: 640px)"
            srcSet="/assets/video/homepage-hero-mobile-poster-v3.webp"
            type="image/webp"
            width="828"
            height="466"
          />
          <img
            className="home-hero-poster"
            src="/assets/video/homepage-hero-poster-v3.webp"
            alt=""
            width="1920"
            height="1080"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        <HomeHeroVideo />
        <div className="home-hero-ambient" aria-hidden="true" />
        <div className="container home-hero-grid">
          <div className="home-hero-copy">
            <p className="eyebrow home-eyebrow home-eyebrow-light">
              {homePage.heroEyebrow}
            </p>
            <h1
              id="hero-heading"
              aria-label={homePage.heroHeadline}
            >
              <span>{heroHeadlineFirstLine}</span>{" "}
              {heroHeadlineSecondLineText ? (
                <span>
                  {heroHeadlineSecondLineText}
                  {heroHeadlineSecondLineHasPeriod ? (
                    <span className="home-punctuation">.</span>
                  ) : null}
                </span>
              ) : null}
            </h1>
            <h2 className="home-hero-subhead">
              {homePage.heroSubheadline}
            </h2>
            <p className="home-hero-lede">
              <em>{homePage.heroLede}</em>
            </p>
            <div className="button-row home-actions">
              <Link
                className={`button button-${homePage.heroPrimaryCta.variant || "primary"}`}
                href={homePage.heroPrimaryCta.href}
                prefetch={false}
                {...analyticsAttributes("cta_click", {
                  label: homePage.heroPrimaryCta.label,
                  href: homePage.heroPrimaryCta.href,
                  location: "home hero",
                })}
              >
                {homePage.heroPrimaryCta.label}
              </Link>
              <Link
                className={`button button-${homePage.heroSecondaryCta.variant || "secondary"}`}
                href={homePage.heroSecondaryCta.href}
                prefetch={false}
                {...analyticsAttributes("cta_click", {
                  label: homePage.heroSecondaryCta.label,
                  href: homePage.heroSecondaryCta.href,
                  location: "home hero",
                })}
              >
                {homePage.heroSecondaryCta.label}
              </Link>
              <WhatsAppButton
                intent="hiring"
                label="Message David on WhatsApp"
                location="homepage_hero"
                variant="secondary"
              />
            </div>
          </div>
        </div>

        <Reveal delay={640}>
          <ul className="container home-hero-proof" aria-label="Credibility">
            {homePage.proofPoints.slice(0, 3).map((point, index) => (
              <li key={point}>
                <span
                  aria-hidden="true"
                  className={`home-dot ${
                    ["home-dot-red", "home-dot-yellow", "home-dot-stone"][
                      index
                    ] || "home-dot-stone"
                  }`}
                />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="home-ticker" aria-label="Disciplines">
        <p className="sr-only">
          Disciplines: {homePage.disciplines.join(", ")}.
        </p>
        <div className="home-ticker-track" aria-hidden="true">
          <TickerRow disciplines={homePage.disciplines} />
          <TickerRow disciplines={homePage.disciplines} />
        </div>
      </section>

      <section className="section home-filter" aria-labelledby="filter-heading">
        <div className="container">
          <div className="home-intro-grid">
            <Reveal>
              <div>
                <p className="eyebrow home-eyebrow">
                  {homePage.filterSection.eyebrow}
                </p>
                <h2 id="filter-heading">
                  {homePage.filterSection.heading}
                </h2>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="lede home-large-copy">
                {homePage.filterSection.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          </div>

          <dl className="home-definition-list">
            {homePage.filterSection.definitions.map((definition, index) => (
              <Reveal key={definition.number} delay={index * 100}>
                <dt>
                  <span>{definition.number}</span>
                  <strong>{definition.phrase}</strong>
                </dt>
                <dd>{definition.copy}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <section
        className={`section home-difference ${styles.comparison}`}
        aria-labelledby="difference-heading"
      >
        <div className="container home-ledger-layout">
          <div>
            <div className="home-sticky-copy">
              <Reveal>
                <p className="eyebrow home-eyebrow">
                  {homePage.differenceSection.eyebrow}
                </p>
                <h2 id="difference-heading">
                  {homePage.differenceSection.heading}
                </h2>
                {homePage.differenceSection.paragraphs.map((paragraph) => (
                  <p className="lede" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </Reveal>
            </div>
          </div>

          <Reveal delay={200} className="home-ledger">
            <div className="home-ledger-head" aria-hidden="true">
              <span>{homePage.differenceSection.comparisonLabelLeft}</span>
              <span>{homePage.differenceSection.comparisonLabelRight}</span>
            </div>
            <ul>
              {homePage.differenceSection.rows.map((row) => (
                <li key={row.usual}>
                  <div className="home-ledger-old">
                    <span className={styles.comparisonLabel}>{homePage.differenceSection.comparisonLabelLeft}</span>
                    <p>{row.usual}</p>
                  </div>
                  <div className="home-ledger-new">
                    <span className={styles.comparisonLabel}>{homePage.differenceSection.comparisonLabelRight}</span>
                    <p>{row.essential}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section
        id="services"
        className="section home-services"
        aria-labelledby="services-heading"
      >
        <div className="container">
          <Reveal>
            <div className="home-section-header">
              <div>
                <p className="eyebrow home-eyebrow">
                  {homePage.servicesSection.eyebrow}
                </p>
                <h2 id="services-heading">
                  {homePage.servicesSection.heading}
                </h2>
              </div>
              <p>{homePage.servicesSection.intro}</p>
            </div>
          </Reveal>

          <ul className={styles.serviceGrid}>
            {homePage.servicesSection.cards.map((service, index) => (
              <li key={service.slug}>
                <Reveal delay={Math.min(index * 80, 400)}>
                  <Link href={service.href}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{service.title}</h3>
                    <p>{service.proposition}</p>
                    <p>{service.description}</p>
                    <span className={styles.serviceLink}>{service.linkLabel} <span aria-hidden="true">→</span></span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="david"
        className={`section home-founder dark grain ${styles.founder}`}
        aria-labelledby="founder-heading"
      >
        <div className="container home-founder-grid">
          <Reveal variant="mask" className="home-founder-media">
            <div className="home-media-plate">
              <RichMediaBlock media={homePage.premiumMedia} />
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="eyebrow home-eyebrow home-eyebrow-light">
                {homePage.founderSection.eyebrow}
              </p>
              <h2 id="founder-heading">
                {homePage.founderSection.heading}
              </h2>
            </Reveal>
            <Reveal delay={120}>
              {homePage.founderSection.paragraphs.map((paragraph) => (
                <p className="home-founder-copy" key={paragraph}>
                  {paragraph}
                </p>
              ))}
              <p className="home-founder-copy"><Link href="/about-david-walsh">Meet David Walsh, Essential&apos;s founder</Link></p>
            </Reveal>
            <Reveal delay={240}>
              <div className="home-straight-talk">
                <h3>{homePage.founderSection.straightTalkHeading}</h3>
                <ul>
                  {homePage.founderSection.straightTalkPoints.map((item) => (
                    <li key={item}>
                      <span aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={360}>
              <div className="button-row home-actions">
                <Link className="button button-primary" href="/contact">
                  Talk to David
                </Link>
                <LinkedInProfileLink
                  label="Connect on LinkedIn"
                  location="homepage_founder_block"
                />
                <BookingButton
                  label="Book 15 minutes"
                  location="homepage_founder_block"
                  intent="book_call"
                  variant="text"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section
        className={`home-audience-split ${styles.audience}`}
        aria-labelledby="audience-heading"
      >
        <h2 id="audience-heading" className="sr-only">
          {homePage.audienceSection.heading}
        </h2>
        <div className="home-audience-panel home-audience-client grain">
          <Reveal>
            <p className="eyebrow home-eyebrow home-eyebrow-light">
              {homePage.audienceSection.client.eyebrow}
            </p>
            <h3>{homePage.audienceSection.client.heading}</h3>
            <ul>
              {homePage.audienceSection.client.items.map((item) => (
                <li key={item}>
                  <span aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              className="home-large-link"
              href={homePage.audienceSection.client.ctaHref}
            >
              {homePage.audienceSection.client.ctaLabel}{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
        <div className="home-audience-panel home-audience-candidate">
          <Reveal delay={120}>
            <p className="eyebrow home-eyebrow">
              {homePage.audienceSection.candidate.eyebrow}
            </p>
            <h3>{homePage.audienceSection.candidate.heading}</h3>
            <ul>
              {homePage.audienceSection.candidate.items.map((item) => (
                <li key={item}>
                  <span aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              className="home-large-link"
              href={homePage.audienceSection.candidate.ctaHref}
            >
              {homePage.audienceSection.candidate.ctaLabel}{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className={`section home-proof ${styles.proof}`} aria-labelledby="proof-heading">
        <div className="container">
          <Reveal>
            <p className="eyebrow home-eyebrow">
              {homePage.proofSection.eyebrow}
            </p>
            <h2 id="proof-heading">{homePage.proofSection.heading}</h2>
          </Reveal>
          {homeProofCase ? (
            <Reveal delay={120}>
              <article className="home-proof-case">
                <div className="home-proof-case-header">
                  {homeProofCase.proofLogo ? (
                    <Image
                      alt={
                        homeProofCase.proofLogoAlt ||
                        `${homeProofCase.clientType} logo`
                      }
                      className="home-proof-case-logo"
                      height={96}
                      src={homeProofCase.proofLogo}
                      width={260}
                    />
                  ) : null}
                  <div>
                    <p className="eyebrow home-eyebrow">
                      {homePage.proofSection.caseStudyEyebrow}
                    </p>
                    <h3>{homeProofCase.title}</h3>
                  </div>
                </div>
                <div className="home-proof-case-points">
                  <div>
                    <span>Brief</span>
                    <p>{homeProofCase.roleHired}</p>
                  </div>
                  <div>
                    <span>Search</span>
                    <p>{homeProofCase.searchStory ? "Retained Search" : firstParagraph(homeProofCase.process)}</p>
                  </div>
                  <div>
                    <span>Outcome</span>
                    <p>{homeProofCase.searchStory ? `${homeProofCase.searchStory.outcome.heading} ${firstParagraph(homeProofCase.searchStory.outcome.text)}` : firstParagraph(homeProofCase.outcome)}</p>
                    {homeProofCase.searchStory ? <p className={styles.progression}>Later progressed to {homeProofCase.searchStory.progression.to}.</p> : null}
                  </div>
                </div>
                <Link
                  className="text-link"
                  href={`/case-studies/${homeProofCase.slug}`}
                >
                  {homePage.proofSection.caseStudyPrimaryLinkLabel}
                </Link>
                <Link className="text-link" href="/case-studies">
                  {homePage.proofSection.caseStudySecondaryLinkLabel}
                </Link>
              </article>
            </Reveal>
          ) : null}
        </div>
      </section>

      <LinkedInRecommendations
        copy={homePage.linkedInSection}
        recommendations={homePage.linkedInSection.recommendations}
        variant="home"
        className={styles.recommendations}
      />

      <section
        className={`section home-live-proof surface ${styles.insights}`}
        aria-labelledby="live-proof-heading"
      >
        <div className="container home-live-proof-grid">
          <div>
            <Reveal>
              <p className="eyebrow home-eyebrow">
                {homePage.liveProofSection.eyebrow}
              </p>
              <h2 id="live-proof-heading">
                {homePage.liveProofSection.heading}
              </h2>
              <p className="lede">{homePage.liveProofSection.intro}</p>
            </Reveal>
          </div>
          <div className="home-card-stack">
            {featuredInsights.map((insight) => (
              <InsightCard key={insight.slug} insight={insight} />
            ))}
          </div>
        </div>
      </section>

      <section
        className={`section home-specialisms ${styles.specialisms}`}
        aria-labelledby="specialisms-heading"
      >
        <div className="container">
          <Reveal>
            <p className="eyebrow home-eyebrow">
              {homePage.specialismsSection.eyebrow}
            </p>
            <h2 id="specialisms-heading">
              {homePage.specialismsSection.heading}
            </h2>
          </Reveal>
          <div className="home-specialism-grid">
            {homePage.specialismsSection.cards.map((specialism, index) => (
              <Reveal key={specialism.title} delay={(index % 4) * 80}>
                <article>
                  <h3>{specialism.title}</h3>
                  <p>{specialism.description}</p>
                  <Link className="text-link" href={specialism.href}>
                    {specialism.linkLabel}
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className="section home-manifesto dark grain"
        aria-labelledby="manifesto-heading"
      >
        <div className="container">
          <Reveal>
            <p className="eyebrow home-eyebrow home-eyebrow-light">
              {homePage.manifestoSection.eyebrow}
            </p>
          </Reveal>
          <h2 id="manifesto-heading" className="sr-only">
            {homePage.manifestoSection.heading}
          </h2>
          <div className="home-manifesto-lines">
            {homePage.manifestoSection.lines.map((line, index) => (
              <Reveal key={line} delay={index * 150}>
                <p
                  className={
                    index === homePage.manifestoSection.lines.length - 1
                      ? "is-yellow"
                      : ""
                  }
                >
                  {line}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={800}>
            <div className="home-signature">
              <p>{homePage.manifestoSection.signature}</p>
              <span aria-hidden="true" />
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="home-city-band"
        aria-label={homePage.citySection.ariaLabel}
      >
        <Reveal variant="mask">
          <figure className="grain">
            <Image
              src={homePage.citySection.imageSrc}
              alt={homePage.citySection.imageAlt}
              fill
              loading="lazy"
              quality={75}
              sizes="100vw"
            />
            <figcaption>
              {homePage.citySection.label} <em>{homePage.citySection.emphasis}</em>
            </figcaption>
          </figure>
        </Reveal>
      </section>

      <section
        id="contact"
        className={`section home-final-cta ${styles.finalCta}`}
        aria-labelledby="final-heading"
      >
        <div className="container">
          <Reveal>
            <h2 id="final-heading">
              {emphasiseTrailingPhrase(
                homePage.finalCtaSection.heading,
                "talk to David.",
              )}
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p>{homePage.finalCtaSection.body}</p>
          </Reveal>
          <Reveal delay={300}>
            <div className="button-row home-actions">
              <Link
                className={`button button-${
                  homePage.finalCtaSection.primaryCta.variant || "dark"
                }`}
                href={homePage.finalCtaSection.primaryCta.href}
                {...analyticsAttributes("cta_click", {
                  label: homePage.finalCtaSection.primaryCta.label,
                  href: homePage.finalCtaSection.primaryCta.href,
                  location: "home final cta",
                })}
              >
                {homePage.finalCtaSection.primaryCta.label}
              </Link>
              <WhatsAppButton
                intent="hiring"
                label="Message David on WhatsApp"
                location="homepage_final_cta"
                variant="secondary"
              />
              <BookingButton
                label="Book 15 minutes"
                location="homepage_final_cta"
                intent="book_call"
                variant="text"
              />
              <Link className="text-link" href={`mailto:${siteConfig.email}`}>
                {homePage.finalCtaSection.emailCtaLabel}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
