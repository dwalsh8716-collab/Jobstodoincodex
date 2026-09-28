import Link from "next/link";
import type { Service } from "@/lib/types";
import styles from "./ServicePresentation.module.css";

type Steps = NonNullable<Service["processSteps"]>;

function StageNumber({ index }: { index: number }) {
  return (
    <span className={styles.stageNumber} aria-hidden="true">
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

function PermanentProcess({ steps }: { steps: Steps }) {
  return (
    <div className={styles.chapters}>
      {["Understand", "Find", "Get it right"].map((chapter, index) => (
        <section
          className={styles.chapter}
          key={chapter}
          aria-labelledby={`chapter-${index}`}
        >
          <h3 className={styles.chapterHeading} id={`chapter-${index}`}>
            {chapter}
          </h3>
          <ol className={styles.chapterSteps} start={index * 2 + 1}>
            {steps.slice(index * 2, index * 2 + 2).map((step, stepIndex) => (
              <li key={step.title}>
                <StageNumber index={index * 2 + stepIndex} />
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function RetainedSearchTimeline({ steps }: { steps: Steps }) {
  return (
    <ol className={styles.timeline}>
      {steps.map((step, index) => (
        <li className={styles.timelineStep} key={step.title}>
          <StageNumber index={index} />
          <span className={styles.timelineMarker} aria-hidden="true">
            <span />
          </span>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </li>
      ))}
    </ol>
  );
}

function FractionalLeadershipProcess({ service }: { service: Service }) {
  return (
    <>
      <ol className={styles.territories}>
        {service.leadershipStages?.map((stage, index) => (
          <li className={styles.territory} key={stage.title}>
            <StageNumber index={index} />
            <h3>{stage.title}</h3>
            <p className={styles.territoryLabel}>{stage.label}</p>
            <div className={styles.territoryCopy}>
              {stage.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <div className={styles.supportingProcess}>
        <h3>What happens underneath those two stages?</h3>
        <ol className={styles.compactSteps}>
          {service.processSteps?.map((step, index) => (
            <li key={step.title}>
              <StageNumber index={index} />
              <div>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

function MarketIntelligenceDecision({ service }: { service: Service }) {
  return (
    <>
      <div className={styles.evidenceDiagram}>
        <svg
          className={styles.evidenceConnectors}
          viewBox="0 0 1000 768"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <marker
              id="decision-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 1 1 L 8 5 L 1 9" />
            </marker>
          </defs>
          <g markerEnd="url(#decision-arrow)">
            <path d="M 500 240 L 500 264" />
            <path d="M 725 384 L 620 384" />
            <path d="M 275 384 L 380 384" />
            <path d="M 330 555 L 417 474" />
            <path d="M 670 555 L 583 474" />
          </g>
        </svg>
        <ul className={styles.evidenceList}>
          {service.evidenceAreas?.map((area) => (
            <li className={styles.evidenceNode} key={area.title}>
              <h3>{area.title}</h3>
              <p>{area.description}</p>
            </li>
          ))}
        </ul>
        <div className={styles.decision}>
          <h3>Decision</h3>
        </div>
      </div>
      <p className={styles.decisionClosing}>
        A clearer picture. A better hiring decision.
      </p>
      {service.advisoryAreas?.length ? (
        <div className={styles.investigation}>
          <h2>What we can investigate</h2>
          <ul className={styles.investigationGrid}>
            {service.advisoryAreas.map((area) => (
              <li className={styles.investigationCard} key={area.title}>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

export function ServiceProcess({ service }: { service: Service }) {
  const steps = service.processSteps || [];
  const isAdvisory = service.slug === "market-intelligence-advisory";

  return (
    <section className="section" aria-labelledby="service-process-heading">
      <div className="container">
        <div className={styles.processHeading}>
          <p className="eyebrow">{service.processEyebrow || "Process"}</p>
          <h2 id="service-process-heading">{service.processHeading}</h2>
          {service.processIntro ? (
            <p className="lede">{service.processIntro}</p>
          ) : null}
        </div>
        {service.slug === "permanent-recruitment" ? (
          <PermanentProcess steps={steps} />
        ) : service.slug === "retained-search" ? (
          <RetainedSearchTimeline steps={steps} />
        ) : service.slug === "fractional" ? (
          <FractionalLeadershipProcess service={service} />
        ) : isAdvisory ? (
          <MarketIntelligenceDecision service={service} />
        ) : null}
        <div className={styles.processLink}>
          <Link className="text-link" href="/how-essential-resourcing-works">
            See exactly how I recruit
          </Link>
        </div>
      </div>
    </section>
  );
}
