import Image from "next/image";
import Link from "next/link";
import { BookingButton } from "@/components/BookingButton";
import { CaseStudyCard, InsightCard } from "@/components/Cards";
import { LinkedInProfileLink } from "@/components/LinkedInProfileLink";
import { Reveal } from "@/components/Reveal";
import { RichMediaBlock } from "@/components/RichMedia";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { analyticsAttributes } from "@/lib/analytics";
import {
  homepageFeatureVideo,
  richMediaExamples,
  specialisms,
} from "@/lib/content";
import {
  getPublicCaseStudies,
  getPublicInsights,
  getPublicServices,
} from "@/lib/public-content";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: siteConfig.defaultTitle,
  description: siteConfig.defaultDescription,
});

const disciplines = [
  "Marketing",
  "Comms",
  "PR",
  "Digital",
  "Agency-side",
  "Client-side",
  "Leadership",
  "Strategic Interim",
];

const filterDefinitions = [
  {
    number: "01",
    phrase: "No faff.",
    copy: "Straight answers, fast feedback and a process that respects everyone's time. No padded shortlists, no invented urgency, no surprises at offer stage.",
  },
  {
    number: "02",
    phrase: "No dickheads.",
    copy: "It cuts both ways. Clients who respect candidates' time, and candidates who turn up properly. Work with decent people and recruitment gets remarkably simple.",
  },
  {
    number: "03",
    phrase: "No CV flinging.",
    copy: "Nothing goes to market until the brief survives scrutiny. If the role, the salary or the expectations are off, you'll hear it before the search starts.",
  },
];

const hiringLedger = [
  {
    usual: "A vague brief, taken at face value",
    essential: "The brief gets sense-checked before anything moves",
  },
  {
    usual: "The same recycled CVs within the hour",
    essential: "A market mapped properly, approached personally",
  },
  {
    usual: "Salary advice that flatters, not informs",
    essential: "Honest numbers, even when they're unwelcome",
  },
  {
    usual: "Fifteen CVs to make the pile look busy",
    essential: "Fewer, better candidates, with honest notes on each",
  },
  {
    usual: "Six weeks gone. Role back to square one.",
    essential: "Direct feedback at every stage. Judgement, not volume.",
  },
];

const serviceDetails: Record<string, { meta: string; problem: string }> = {
  "leadership-search": {
    meta: "Heads of, directors and board-visible leaders",
    problem:
      "Senior hires fail on fit and mandate, not skills. The search starts with the real mandate.",
  },
  "strategic-interim": {
    meta: "Senior cover and momentum, fast",
    problem:
      "Change, growth, gaps and cover, with senior capability while the permanent answer is scoped.",
  },
  "agency-recruitment": {
    meta: "Creative, digital, PR and integrated agencies",
    problem:
      "Agency hiring moves fast and mis-hires cost clients. David knows both sides of the pitch table.",
  },
  "client-side-marketing-recruitment": {
    meta: "Client-side teams, manager to director",
    problem:
      "Proper marketing capability, not a job spec copied from the last hire.",
  },
  "senior-recruitment": {
    meta: "Senior specialist roles with commercial consequence",
    problem:
      "A smaller, sharper shortlist beats a busy pile of almost-right CVs.",
  },
};

const processSteps = [
  {
    title: "Sense-check the brief",
    copy: "Before anything goes near the market. If the brief is really two jobs, or the salary won't land it, you'll hear that on day one.",
  },
  {
    title: "Clarify the real problem",
    copy: "The job title is not the brief. What does the business actually need this person to fix, grow or change?",
  },
  {
    title: "Map the market",
    copy: "Who's genuinely good, who's genuinely available, and what they're genuinely paid. Specialist focus makes the map sharper.",
  },
  {
    title: "Approach properly",
    copy: "Direct, considered conversations with the right people. No scattergun job ads, no copy-paste outreach.",
  },
  {
    title: "Present a considered shortlist",
    copy: "A handful of people who fit the actual problem, with honest notes on each. Not fifteen CVs to make the pile look busy.",
  },
  {
    title: "Keep the process moving",
    copy: "Fast feedback both ways, sensible scheduling and straight answers on offers. Good candidates are lost to slow processes.",
  },
];

const clientItems = [
  "Get a brief sense-checked before it goes anywhere near the market",
  "Hire senior marketing, comms, PR or digital talent",
  "Bring in strategic interim support at short notice",
  "Get honest market and salary advice, no flattery",
];

const candidateItems = [
  "See roles that are actually relevant to your specialism",
  "Get honest advice on your market, salary and next move",
  "No vague job ads. No competitive salary mysteries.",
  "Clear process and straight feedback, wherever possible",
];

const interimSituations = [
  "A marketing director resigns mid-campaign",
  "Growth is outpacing the team's seniority",
  "Transformation needs leading, not just surviving",
  "Maternity or long-term cover at senior level",
  "A restructure leaves a gap the business can't carry",
  "The permanent search is right, but slow",
];

const commercialProofFramework = [
  {
    title: "The role",
    copy: "What was hard about the brief, market or mandate.",
  },
  {
    title: "The search",
    copy: "How the market was mapped, approached and shortlisted.",
  },
  {
    title: "The outcome",
    copy: "What changed: hire made, time saved, risk reduced, team strengthened or leadership gap covered.",
  },
];

const manifestoLines = [
  "The job title is not the brief.",
  "Salary advice should be honest, not flattering.",
  "Feedback is basic respect, not a favour.",
  "Fewer, better candidates.",
  "Hiring done properly.",
];

function TickerRow() {
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
  const [services, insights, caseStudies] = await Promise.all([
    getPublicServices(),
    getPublicInsights(),
    getPublicCaseStudies(),
  ]);
  const featuredInsights = insights.slice(0, 3);
  const featuredCases = caseStudies
    .filter(
      (caseStudy) => caseStudy.status === "published" && caseStudy.featured,
    )
    .slice(0, 3);

  return (
    <>
      <section className="home-hero grain dark" aria-labelledby="hero-heading">
        <div className="home-hero-ambient" aria-hidden="true" />
        <div className="container home-hero-grid">
          <div className="home-hero-copy">
            <Reveal>
              <p className="eyebrow home-eyebrow home-eyebrow-light">
                Founder-led search · Marketing · Comms · PR · Digital · Agency
              </p>
            </Reveal>
            <h1 id="hero-heading" aria-label="No faff. No dickheads.">
              <Reveal delay={120}>
                <span>
                  No faff<span className="home-punctuation">.</span>
                </span>
              </Reveal>
              <Reveal delay={280}>
                <span>
                  <em>No dickheads</em>
                  <span className="home-punctuation">.</span>
                </span>
              </Reveal>
            </h1>
            <Reveal delay={360}>
              <p className="home-hero-subhead">
                Founder-led recruitment for senior marketing, PR,
                communications, digital and agency hires.
              </p>
            </Reveal>
            <Reveal delay={480}>
              <p className="home-hero-lede">
                It&rsquo;s not a slogan. It&rsquo;s the filter. David Walsh
                finds premium marketing, comms, PR and digital talent for
                serious clients, and serious roles for serious candidates.{" "}
                <strong>Hiring done properly.</strong>
              </p>
            </Reveal>
            <Reveal delay={620}>
              <div className="button-row home-actions">
                <Link
                  className="button button-primary"
                  href="/contact"
                  {...analyticsAttributes("cta_click", {
                    label: "Sense-check a brief",
                    href: "/contact",
                    location: "home hero",
                  })}
                >
                  Sense-check a brief
                </Link>
                <Link
                  className="button button-secondary"
                  href="/about-david-walsh"
                  {...analyticsAttributes("cta_click", {
                    label: "Talk to David",
                    href: "/about-david-walsh",
                    location: "home hero",
                  })}
                >
                  Talk to David
                </Link>
                <WhatsAppButton
                  intent="hiring"
                  label="Message David on WhatsApp"
                  location="homepage_hero"
                  variant="secondary"
                />
              </div>
            </Reveal>
          </div>

          <Reveal variant="mask" delay={380} className="home-hero-plate-wrap">
            <div className="home-plate-offset" aria-hidden="true" />
            <figure className="home-plate home-hero-plate">
              <Image
                src="https://images.unsplash.com/photo-1638178350556-a7385a77981a?auto=format&fit=crop&w=1280&q=85"
                alt="Cinematic Manchester architecture used as an editorial recruitment image"
                fill
                priority
                sizes="(min-width: 1024px) 28rem, (min-width: 640px) 24rem, 92vw"
              />
              <span className="home-plate-rule" aria-hidden="true" />
              <figcaption>
                <span>Plate 01 - Manchester</span>
                <span>The standard. Uncompromised.</span>
              </figcaption>
            </figure>
            <blockquote className="home-note">
              <p>
                &ldquo;The job title is <em>not</em> the brief.&rdquo;
              </p>
              <cite>- D. Walsh</cite>
            </blockquote>
          </Reveal>
        </div>

        <Reveal delay={640}>
          <ul className="container home-hero-proof" aria-label="Credibility">
            <li>
              <span aria-hidden="true" className="home-dot home-dot-red" />
              Manchester-based, UK-wide
            </li>
            <li>
              <span aria-hidden="true" className="home-dot home-dot-yellow" />
              Senior hires, specialist roles and strategic interim
            </li>
            <li>
              <span aria-hidden="true" className="home-dot home-dot-stone" />
              Agency-side and client-side
            </li>
          </ul>
        </Reveal>
      </section>

      <section className="home-ticker" aria-label="Disciplines">
        <p className="sr-only">Disciplines: {disciplines.join(", ")}.</p>
        <div className="home-ticker-track" aria-hidden="true">
          <TickerRow />
          <TickerRow />
        </div>
      </section>

      <section className="section home-filter" aria-labelledby="filter-heading">
        <div className="container">
          <div className="home-intro-grid">
            <Reveal>
              <div>
                <p className="eyebrow home-eyebrow">The filter</p>
                <h2 id="filter-heading">
                  A filter, <em>not</em> a punchline.
                </h2>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="lede home-large-copy">
                Recruitment has a reputation problem, and it earned it.
                Essential Resourcing runs on a shorter rulebook: three lines,
                applied to clients and candidates alike.
              </p>
            </Reveal>
          </div>

          <dl className="home-definition-list">
            {filterDefinitions.map((definition, index) => (
              <Reveal key={definition.number} delay={index * 100}>
                <div>
                  <dt>
                    <span>{definition.number}</span>
                    <strong>{definition.phrase}</strong>
                  </dt>
                  <dd>{definition.copy}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <section
        className="section home-difference"
        aria-labelledby="difference-heading"
      >
        <div className="container home-ledger-layout">
          <div>
            <div className="home-sticky-copy">
              <Reveal>
                <p className="eyebrow home-eyebrow">Why it&rsquo;s different</p>
                <h2 id="difference-heading">
                  Most hiring goes wrong <em>before</em> the search starts.
                </h2>
                <p className="lede">
                  Not because the candidates aren&rsquo;t out there. Because the
                  brief was never really interrogated. That&rsquo;s the bit most
                  recruiters skip. It&rsquo;s the bit David starts with.
                </p>
              </Reveal>
            </div>
          </div>

          <Reveal delay={200} className="home-ledger">
            <div className="home-ledger-head" aria-hidden="true">
              <span>The industry default</span>
              <span>Essential Resourcing</span>
            </div>
            <ul>
              {hiringLedger.map((row) => (
                <li key={row.usual}>
                  <div className="home-ledger-old">
                    <span aria-hidden="true">x</span>
                    <p>{row.usual}</p>
                  </div>
                  <div className="home-ledger-new">
                    <span aria-hidden="true">✓</span>
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
                <p className="eyebrow home-eyebrow">What David recruits</p>
                <h2 id="services-heading">
                  Specialist, not generalist. <em>That&rsquo;s the point.</em>
                </h2>
              </div>
              <p>
                Senior hires, specialist roles and strategic interim support
                across marketing, comms, PR, digital and agency.
              </p>
            </div>
          </Reveal>

          <ul className="home-service-list">
            {services.map((service, index) => {
              const details = serviceDetails[service.slug];
              return (
                <li key={service.slug}>
                  <Reveal delay={Math.min(index * 80, 400)}>
                    <Link href={`/services/${service.slug}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <h3>{service.title}</h3>
                      <p>{details?.meta || service.shortDescription}</p>
                      <p>{details?.problem || service.shortDescription}</p>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        className="section home-process"
        aria-labelledby="process-heading"
      >
        <div className="home-process-number" aria-hidden="true">
          01
        </div>
        <div className="container">
          <Reveal>
            <div className="home-section-header home-section-header-simple">
              <div>
                <p className="eyebrow home-eyebrow">How David works</p>
                <h2 id="process-heading">
                  Methodical. Direct. <em>Built to save you weeks.</em>
                </h2>
              </div>
            </div>
          </Reveal>
          <ol className="home-process-list">
            {processSteps.map((step, index) => (
              <li key={step.title}>
                <Reveal delay={(index % 2) * 150}>
                  <span aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="david"
        className="section home-founder dark grain"
        aria-labelledby="founder-heading"
      >
        <div className="container home-founder-grid">
          <Reveal variant="mask" className="home-founder-media">
            <div className="home-media-plate">
              <RichMediaBlock media={homepageFeatureVideo} />
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="eyebrow home-eyebrow home-eyebrow-light">
                Founder-led search
              </p>
              <h2 id="founder-heading">
                A name on the door, <em>not a logo on a lanyard.</em>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="home-founder-copy">
                Essential Resourcing is David Walsh. A specialist recruiter in
                marketing, comms, PR, digital and agency hiring. Manchester
                roots, North West market knowledge, UK-wide reach. When you work
                with Essential Resourcing, you work with David.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="home-straight-talk">
                <h3>
                  Things David will tell you straight
                  <span className="home-punctuation">.</span>
                </h3>
                <ul>
                  {[
                    "If the salary will not get you the person you are describing",
                    "If the brief is actually two different jobs in a trench coat",
                    "If your process will lose the best people before second stage",
                    "If, honestly, you do not need a recruiter for this one",
                  ].map((item) => (
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
        className="home-audience-split"
        aria-labelledby="audience-heading"
      >
        <h2 id="audience-heading" className="sr-only">
          For clients and candidates
        </h2>
        <div className="home-audience-panel home-audience-client grain">
          <Reveal>
            <p className="eyebrow home-eyebrow home-eyebrow-light">
              For clients
            </p>
            <h3>
              Hire properly, <em>first time.</em>
            </h3>
            <ul>
              {clientItems.map((item) => (
                <li key={item}>
                  <span aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link className="home-large-link" href="/clients">
              Sense-check a brief <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
        <div className="home-audience-panel home-audience-candidate">
          <Reveal delay={120}>
            <p className="eyebrow home-eyebrow">For candidates</p>
            <h3>
              Your career, <em>taken seriously.</em>
            </h3>
            <ul>
              {candidateItems.map((item) => (
                <li key={item}>
                  <span aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link className="home-large-link" href="/jobs">
              See current roles <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section
        id="interim"
        className="section home-interim dark grain"
        aria-labelledby="interim-heading"
      >
        <div className="container home-interim-grid">
          <div>
            <Reveal>
              <p className="eyebrow home-eyebrow home-eyebrow-light">
                Strategic interim
              </p>
              <h2 id="interim-heading">
                Senior cover, in <em>weeks</em>, not months.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="home-founder-copy">
                Sometimes the business needs senior marketing or comms
                leadership now. Strategic Interim puts proven capability in the
                chair fast: commercially practical, properly scoped and honest
                about whether interim is even the right answer.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="button-row home-actions">
                <Link
                  className="button button-primary"
                  href="/services/strategic-interim"
                >
                  Explore Strategic Interim
                </Link>
                <WhatsAppButton
                  intent="strategicInterim"
                  label="Need interim help quickly? WhatsApp David"
                  location="homepage_strategic_interim"
                  service="Strategic Interim"
                  variant="secondary"
                />
              </div>
            </Reveal>
          </div>

          <Reveal variant="mask" delay={180}>
            <div className="home-interim-card">
              <h3>When interim earns its keep</h3>
              <ul>
                {interimSituations.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
        <div className="container home-interim-media">
          <Reveal delay={260}>
            <RichMediaBlock media={richMediaExamples[0]} />
          </Reveal>
        </div>
      </section>

      <section className="section home-proof" aria-labelledby="proof-heading">
        <div className="container">
          <Reveal>
            <p className="eyebrow home-eyebrow">Why trust it</p>
            <h2 id="proof-heading">Proof has to earn its place here.</h2>
            <p className="lede home-proof-intro">
              No borrowed logos. No made-up placement numbers. Each case study
              only goes live when the role, process, outcome and permission are
              clear.
            </p>
          </Reveal>

          <ul className="home-proof-grid">
            {commercialProofFramework.map((proofItem, index) => (
              <li key={proofItem.title}>
                <Reveal delay={(index % 3) * 120}>
                  <h3>{proofItem.title}</h3>
                  <p>{proofItem.copy}</p>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal delay={420}>
            <p className="home-proof-caveat">
              Real metrics only go live once verified. Until then, the site
              shows the standard of proof David will hold himself to.
            </p>
          </Reveal>
        </div>
      </section>

      <section
        className="section home-live-proof surface"
        aria-labelledby="live-proof-heading"
      >
        <div className="container home-live-proof-grid">
          <div>
            <Reveal>
              <p className="eyebrow home-eyebrow">Case studies and insight</p>
              <h2 id="live-proof-heading">
                Specific proof beats anonymous waffle.
              </h2>
              <p className="lede">
                The homepage still uses the published content pipeline: live
                case studies when approved, and current insight pieces for SEO,
                AI discovery and proper first-party expertise.
              </p>
            </Reveal>
          </div>
          <div className="home-card-stack">
            {featuredCases.length ? (
              featuredCases.map((caseStudy) => (
                <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
              ))
            ) : (
              <article className="card proof-card">
                <span className="tag">Proof standard</span>
                <h3>Permission first</h3>
                <p>
                  Named proof, logos and quotes only go live when permission is
                  clear.
                </p>
              </article>
            )}
            {featuredInsights.map((insight) => (
              <InsightCard key={insight.slug} insight={insight} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="section home-specialisms"
        aria-labelledby="specialisms-heading"
      >
        <div className="container">
          <Reveal>
            <p className="eyebrow home-eyebrow">Specialisms</p>
            <h2 id="specialisms-heading">Not a boring list of functions.</h2>
          </Reveal>
          <div className="home-specialism-grid">
            {specialisms.map((specialism, index) => (
              <Reveal key={specialism.title} delay={(index % 4) * 80}>
                <article>
                  <h3>{specialism.title}</h3>
                  <p>{specialism.description}</p>
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
              What Essential Resourcing believes
            </p>
          </Reveal>
          <h2 id="manifesto-heading" className="sr-only">
            The Essential Resourcing manifesto
          </h2>
          <div className="home-manifesto-lines">
            {manifestoLines.map((line, index) => (
              <Reveal key={line} delay={index * 150}>
                <p
                  className={
                    index === manifestoLines.length - 1 ? "is-yellow" : ""
                  }
                >
                  {line}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={800}>
            <div className="home-signature">
              <p>- David Walsh</p>
              <span aria-hidden="true" />
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="home-city-band"
        aria-label="Manchester, where Essential Resourcing is based"
      >
        <Reveal variant="mask">
          <figure className="grain">
            <Image
              src="https://images.unsplash.com/photo-1638178350556-a7385a77981a?auto=format&fit=crop&w=2400&q=85"
              alt="Manchester towers at dusk, windows catching the last of the light"
              fill
              sizes="100vw"
            />
            <span>Plate 03 - Deansgate at dusk</span>
            <figcaption>
              Made in Manchester<span className="home-punctuation">.</span>{" "}
              <em>At work UK-wide.</em>
            </figcaption>
          </figure>
        </Reveal>
      </section>

      <section
        id="contact"
        className="section home-final-cta"
        aria-labelledby="final-heading"
      >
        <div className="container">
          <Reveal>
            <h2 id="final-heading">
              Before you waste six weeks on the wrong brief,{" "}
              <em>talk to David.</em>
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p>
              One straight conversation. If Essential Resourcing isn&rsquo;t the
              right answer, you&rsquo;ll be told that too.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="button-row home-actions">
              <Link
                className="button button-dark"
                href="/contact"
                {...analyticsAttributes("cta_click", {
                  label: "Sense-check a brief",
                  href: "/contact",
                  location: "home final cta",
                })}
              >
                Sense-check a brief
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
                {siteConfig.email}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
