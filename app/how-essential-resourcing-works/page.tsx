import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FourRouteSelector } from "@/components/FourRouteSelector";
import { SchemaScript } from "@/components/SchemaScript";
import { ServiceComparison } from "@/components/ServiceComparison";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import styles from "@/components/EssentialApproach.module.css";
import { analyticsAttributes } from "@/lib/analytics";
import {
  commonSearchStages,
  comparisonDimensions,
  essentialPrinciples,
  essentialRoutes,
} from "@/lib/essential-approach";
import { createMetadata, itemListSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "How Essential Resourcing Works | Recruitment, Search & Advisory",
  description:
    "How Essential Resourcing helps businesses make better hiring decisions through Permanent Recruitment, Retained Search, Fractional Leadership and Market Intelligence & Advisory.",
  path: "/how-essential-resourcing-works",
});

function ContactActions({
  label,
  location,
}: {
  label: string;
  location: string;
}) {
  return (
    <div className={`button-row ${styles.actions}`}>
      <Link
        className="button button-primary"
        href="/contact"
        {...analyticsAttributes("cta_click", {
          label,
          href: "/contact",
          location,
        })}
      >
        {label}
      </Link>
      <WhatsAppButton
        intent="hiring"
        label="WhatsApp David"
        location={location}
      />
    </div>
  );
}

export default function HowEssentialResourcingWorksPage() {
  return (
    <div className={styles.page}>
      <Breadcrumbs
        items={[
          {
            name: "How Essential Resourcing Works",
            href: "/how-essential-resourcing-works",
          },
        ]}
      />

      <section
        className={`section dark ${styles.hero}`}
        aria-labelledby="approach-title"
      >
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <p className="eyebrow">How Essential Resourcing works</p>
            <h1 id="approach-title">
              Start with the problem. Not the recruitment product.
            </h1>
          </div>
          <div className={styles.heroCopy}>
            <p className="lede">
              You don&apos;t need to know whether you need Permanent
              Recruitment, Retained Search, Fractional Leadership or Market
              Intelligence before we speak.
            </p>
            <p>You need to know what you&apos;re trying to solve.</p>
            <p>
              Maybe you need somebody permanently. Maybe it&apos;s a senior hire
              that needs a proper search of the market. Maybe you need
              experienced leadership, just not five days a week. Or maybe the
              brief isn&apos;t ready to recruit at all.
            </p>
            <p>
              <strong>My job is to help work that out first.</strong>
            </p>
            <ContactActions
              label="Sense-check a brief"
              location="how_essential_works_hero"
            />
          </div>
        </div>
      </section>

      <section
        className="section surface"
        aria-labelledby="essential-philosophy"
      >
        <div className={`container ${styles.editorialSplit}`}>
          <div>
            <p className="eyebrow">The Essential approach</p>
            <h2 id="essential-philosophy">
              Finding people is getting easier. Knowing who&apos;s genuinely
              good isn&apos;t.
            </h2>
          </div>
          <div className={styles.prose}>
            <p className={styles.lead}>
              LinkedIn can find people. AI can find people. A job advert can
              definitely find you people.
            </p>
            <p>
              The valuable bit is understanding what the business actually
              needs, knowing where to look, getting good people interested and
              working out who&apos;s genuinely bloody good.
            </p>
            <p>
              And sometimes the valuable bit is telling you not to start
              recruiting yet.
            </p>
            <p>
              <strong>That&apos;s what Essential is built around.</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="essential-routes">
        <div className={`container ${styles.heading}`}>
          <p className="eyebrow">Four ways to work with Essential</p>
          <h2 id="essential-routes">Which route actually makes sense?</h2>
          <p>
            Start with what you&apos;re trying to solve. We&apos;ll work out the
            recruitment product afterwards.
          </p>
        </div>
        <div className="container">
          <FourRouteSelector routes={essentialRoutes} />
        </div>
      </section>

      <section
        className="section surface"
        aria-labelledby="essential-principles"
      >
        <div className={`container ${styles.heading}`}>
          <p className="eyebrow">What doesn&apos;t change</p>
          <h2 id="essential-principles">
            Different routes. Same basic principles.
          </h2>
          <p>
            The service changes depending on the problem. The judgement behind
            it doesn&apos;t.
          </p>
          <p>
            Whether I&apos;m running a Permanent search, mapping the market for
            a Retained assignment, finding a Fractional leader or helping you
            work out what to hire in the first place, a few things don&apos;t
            change.
          </p>
        </div>
        <ul className={`container ${styles.principles}`}>
          {essentialPrinciples.map((principle, index) => (
            <li key={principle.title}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{principle.title}</h3>
              <div className={styles.prose}>
                {principle.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="service-comparison">
        <div className={`container ${styles.heading}`}>
          <p className="eyebrow">The bit that changes</p>
          <h2 id="service-comparison">
            Same thinking. Different depth, mandate and outcome.
          </h2>
          <p>
            The principles stay consistent. The route changes depending on what
            you&apos;re actually trying to solve.
          </p>
        </div>
        <div className="container">
          <ServiceComparison
            dimensions={comparisonDimensions}
            services={essentialRoutes}
          />
        </div>
      </section>

      <section className="section surface" aria-labelledby="search-methodology">
        <div className={`container ${styles.editorialSplit}`}>
          <div className={styles.methodIntro}>
            <p className="eyebrow">When we&apos;re searching for somebody</p>
            <h2 id="search-methodology">
              How I actually find the right people.
            </h2>
            <div className={styles.prose}>
              <p>
                Not every Essential service follows this exact seven-stage
                journey.
              </p>
              <p>
                Retained Search has its own more formal seven-stage methodology.
                Fractional starts by defining the leadership model. Market
                Intelligence may finish with a decision rather than a hire.
              </p>
              <p>
                <strong>
                  This is the common search thinking underneath the recruitment
                  work.
                </strong>
              </p>
            </div>
          </div>
          <ol className={styles.method}>
            {commonSearchStages.map((stage, index) => (
              <li id={stage.id} key={stage.id}>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{stage.title}</h3>
                  <div className={styles.prose}>
                    {stage.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section dark" aria-labelledby="technology-judgement">
        <div className="container">
          <div className={styles.heading}>
            <p className="eyebrow">Technology + judgement</p>
            <h2 id="technology-judgement">
              Technology helps me search. Judgement decides what happens next.
            </h2>
            <p>
              I&apos;m not trying to remove humans from recruitment. I&apos;m
              trying to use better technology to spend more time on the bits
              where humans actually add value.
            </p>
          </div>
          <div className={styles.judgementGrid}>
            <ul className={styles.technology}>
              <li>Research faster.</li>
              <li>Search wider.</li>
              <li>Organise information better.</li>
            </ul>
            <div className={styles.prose}>
              <p>
                Then use experience and judgement for the things technology
                still doesn&apos;t decide for you:
              </p>
              <ul className={styles.questions}>
                <li>Is the brief right?</li>
                <li>Is this person genuinely good?</li>
                <li>Will they work here?</li>
                <li>Is this move right for them?</li>
                <li>Is this actually the right hire?</li>
              </ul>
            </div>
          </div>
          <p className={styles.cadence}>
            Better brief. Better conversations. Better assessment. Better
            decision. Fewer CVs. <strong>Better hiring decisions.</strong>
          </p>
        </div>
      </section>

      <section
        className="section surface"
        aria-labelledby="founder-involvement"
      >
        <div className={`container ${styles.editorialSplit}`}>
          <div>
            <p className="eyebrow">Founder-led means founder-led</p>
            <h2 id="founder-involvement">
              When you work with Essential, you work with me.
            </h2>
          </div>
          <div className={styles.prose}>
            <p className={styles.lead}>
              I&apos;m not taking the brief and handing it to somebody
              you&apos;ve never met.
            </p>
            <p>
              I stay involved from the first conversation through the search,
              the market feedback, the candidate conversations and the eventual
              decision.
            </p>
            <p>
              If something doesn&apos;t stack up, I&apos;ll tell you. If I think
              you need a different route, I&apos;ll tell you that too.
            </p>
            <p>
              And if I don&apos;t think you should recruit yet, that&apos;s a
              perfectly valid answer.
            </p>
            <Link className="text-link" href="/about-david-walsh">
              David Walsh
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="choose-your-route">
        <div className={`container ${styles.heading}`}>
          <p className="eyebrow">Choose your route</p>
          <h2 id="choose-your-route">Know what you need?</h2>
        </div>
        <div className="container">
          <ul className={styles.routeLinks}>
            {essentialRoutes.map((route, index) => (
              <li key={route.href}>
                <Link href={route.href}>
                  <span className={styles.number} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{route.title}</h3>
                    <p>{route.summary}</p>
                  </div>
                  <span className={styles.arrow} aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.secondaryLinks}>
            <Link className="text-link" href="/case-studies">
              See client case studies
            </Link>
            <Link className="text-link" href="/clients">
              For Clients
            </Link>
          </div>
        </div>
      </section>

      <section className="section-tight dark" aria-labelledby="next-step">
        <div className={`container ${styles.finalCta}`}>
          <p className="eyebrow">Next step</p>
          <h2 id="next-step">
            Got a hiring problem you&apos;re trying to work out?
          </h2>
          <div className={styles.prose}>
            <p>Tell me what&apos;s going on.</p>
            <p>
              What are you trying to change? What do you think you need?
              What&apos;s not stacking up?
            </p>
            <p>
              I&apos;ll give you a straight view on the market and which route
              &mdash; if any &mdash; I think makes sense.
            </p>
          </div>
          <ContactActions
            label="Sense-check it with David"
            location="how_essential_works_final"
          />
          <p className={styles.closing}>
            Start with the problem. We&apos;ll work out the recruitment product
            afterwards.
          </p>
        </div>
      </section>

      <SchemaScript
        data={itemListSchema({
          name: "How Essential Resourcing Works",
          description:
            "How Essential Resourcing approaches recruitment, retained search, fractional leadership search and market intelligence for marketing, digital, PR, communications and agency hiring.",
          items: essentialRoutes.map((route) => ({
            name: route.title,
            url: route.href,
            description: route.description,
          })),
        })}
      />
    </div>
  );
}
