import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "./Breadcrumbs";
import { CTASection } from "./CTASection";
import { SchemaScript } from "./SchemaScript";
import { caseStudySchema } from "@/lib/seo";
import type { CaseStudySearchStory } from "@/lib/havas-search-story";
import type { CaseStudy } from "@/lib/types";
import styles from "./HavasCaseStudy.module.css";

function Prose({
  text,
  emphasizeLast = false,
}: {
  text: string;
  emphasizeLast?: boolean;
}) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  return (
    <div className={styles.prose}>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>
          {emphasizeLast && index === paragraphs.length - 1 ? (
            <strong>{paragraph}</strong>
          ) : (
            paragraph
          )}
        </p>
      ))}
    </div>
  );
}

function SourceLink({ study }: { study: CaseStudy }) {
  return study.externalSourceUrl ? (
    <a
      className="text-link"
      href={study.externalSourceUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      {study.externalSourceLabel || "Read the source"}
    </a>
  ) : null;
}

export function HavasCaseStudy({
  study,
  story,
  serviceTitle,
}: {
  study: CaseStudy;
  story: CaseStudySearchStory;
  serviceTitle: string;
}) {
  const serviceHref = `/services/${study.serviceSlug}`;
  const briefCards = [
    { label: "Context", title: "Business context", text: study.clientContext },
    {
      label: "Problem",
      title: "The business problem",
      text: study.businessProblem,
    },
    {
      label: "Impact",
      title: "Why the hire mattered",
      text: story.brief.impact,
    },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumbs
        items={[
          { name: "Case Studies", href: "/case-studies" },
          { name: study.title, href: `/case-studies/${study.slug}` },
        ]}
      />
      <section
        className={`section dark ${styles.hero}`}
        aria-labelledby="case-title"
      >
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <p className="eyebrow">Case study</p>
            <h1 id="case-title">{study.title}</h1>
            <p className={`lede ${styles.summary}`}>{study.challengeSummary}</p>
            <Link
              className={`text-link ${styles.serviceLink}`}
              href={serviceHref}
            >
              Related service: {serviceTitle}
            </Link>
          </div>
          <aside className={styles.proof} aria-label="Case study at a glance">
            <dl className={styles.facts}>
              <div>
                <dt>Client</dt>
                <dd>{study.clientType}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{study.roleHired}</dd>
              </div>
              <div>
                <dt>Service</dt>
                <dd>{serviceTitle}</dd>
              </div>
              <div>
                <dt>Outcome</dt>
                <dd>{story.outcome.summary}</dd>
              </div>
            </dl>
            {study.proofLogo ? (
              <Image
                className={styles.logo}
                src={study.proofLogo}
                alt={study.proofLogoAlt || `${study.clientType} logo`}
              width={1200}
              height={647}
                sizes="240px"
                priority
              />
            ) : null}
            <div className={styles.sources}>
              {study.proofLinkedInUrl ? (
                <a
                  className="text-link"
                  href={study.proofLinkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {study.proofLinkedInLabel || "View LinkedIn profile"}
                </a>
              ) : null}
              <SourceLink study={study} />
            </div>
          </aside>
        </div>
      </section>

      <section className="section surface" aria-labelledby="brief-heading">
        <div className="container">
          <div className={styles.heading}>
            <p className="eyebrow">The brief</p>
            <h2 id="brief-heading">{story.brief.heading}</h2>
          </div>
          <div className={styles.briefGrid}>
            {briefCards.map((card, index) => (
              <article className={styles.briefCard} key={card.label}>
                <div className={styles.cardLabel}>
                  <span className={styles.number} aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span>{card.label}</span>
                </div>
                <h3>{card.title}</h3>
                <Prose text={card.text} emphasizeLast={index === 1} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="challenge-heading">
        <div className="container">
          <div className={styles.heading}>
            <p className="eyebrow">The search challenge</p>
            <h2 id="challenge-heading">{story.challenge.heading}</h2>
          </div>
          <div className={styles.editorialGrid}>
            <div>
              <h3 className={styles.subheading}>What made it tricky</h3>
              <Prose text={study.whatMadeItTricky} />
            </div>
            <div>
              <h3 className={styles.subheading}>
                {story.challenge.questionsHeading}
              </h3>
              <ol className={styles.questions}>
                {story.challenge.questions.map((question, index) => (
                  <li key={question}>
                    <span aria-hidden="true">0{index + 1}</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ol>
              <p className={styles.closing}>
                <strong>{story.challenge.closing}</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section-tight surface"
        aria-labelledby="approach-heading"
      >
        <div className="container">
          <div className={styles.heading}>
            <p className="eyebrow">The approach</p>
            <h2 id="approach-heading">{story.approach.heading}</h2>
            <p>{story.approach.intro}</p>
          </div>
          <ol className={styles.stages}>
            {story.approach.steps.map((step, index) => (
              <li key={step._key}>
                <span className={styles.stageNumber} aria-hidden="true">
                  0{index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <Link
            className={`text-link ${styles.processLink}`}
            href={serviceHref}
          >
            {story.approach.linkLabel}
          </Link>
        </div>
      </section>

      <section className="section dark" aria-labelledby="outcome-heading">
        <div className={`container ${styles.proofGrid}`}>
          <div>
            <p className="eyebrow">The outcome</p>
            <h2 id="outcome-heading">{story.outcome.heading}</h2>
            <Prose text={story.outcome.text} />
          </div>
          <div className={`${styles.stat} ${styles.tenure}`}>
            <span className={styles.qualifier}>
              {story.outcome.tenureQualifier}
            </span>
            <strong>{story.outcome.tenure}</strong>
            <p>{story.outcome.tenureLabel}</p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="progression-heading">
        <div className="container">
          <div className={styles.heading}>
            <p className="eyebrow">What happened next</p>
            <h2 id="progression-heading">{story.progression.heading}</h2>
          </div>
          <div className={styles.editorialGrid}>
            <Prose text={story.progression.text} />
            <div className={styles.progression}>
              <p>{study.clientType}</p>
              <ol aria-label="Career progression">
                <li>
                  <span className={styles.progressionLabel}>Appointed</span>
                  <strong>{story.progression.from}</strong>
                </li>
                <li>
                  <span className={styles.progressionLabel}>
                    Later progressed to
                  </span>
                  <strong>{story.progression.to}</strong>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="section surface" aria-labelledby="impact-heading">
        <div className="container">
          <div className={styles.heading}>
            <p className="eyebrow">The wider business impact</p>
            <h2 id="impact-heading">
              {study.impactHeading || "The wider business impact"}
            </h2>
          </div>
          <div className={styles.impactGrid}>
            <div className={styles.stat}>
              <strong>{story.impact.value}</strong>
              <p>{story.impact.attribution}</p>
              <SourceLink study={study} />
            </div>
            <Prose text={study.impact} />
          </div>
        </div>
      </section>

      {study.quote ? (
        <div className={`section-tight ${styles.quoteSection}`}>
          <div className="container">
            <blockquote className={styles.quote}>{study.quote}</blockquote>
          </div>
        </div>
      ) : null}

      <section className="section-tight" aria-labelledby="view-heading">
        <div className={`container ${styles.editorialGrid}`}>
          <div>
            <p className="eyebrow">The Essential view</p>
            <h2 id="view-heading">{story.view.heading}</h2>
          </div>
          <div className={styles.prose}>
            {story.view.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title={study.ctaHeading}
        text={study.ctaText}
        ctaLabel={study.ctaLabel}
        whatsAppIntent="hiring"
        whatsAppLabel="Message David on WhatsApp"
      />
      <SchemaScript data={caseStudySchema(study)} />
    </div>
  );
}
