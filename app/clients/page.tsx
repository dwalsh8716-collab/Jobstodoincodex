import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { specialisms } from "@/lib/content";
import { getPublicCaseStudies } from "@/lib/public-content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Marketing Recruitment Agency Manchester | Essential Resourcing",
  description:
    "Specialist marketing recruitment for agencies, brands and growth businesses across Manchester, the North West and UK.",
  path: "/clients",
});

const recruiterValueTriggers = [
  "The best people aren’t applying",
  "You’ve had 200 applications and somehow still haven’t found the right person",
  "The role is senior, specialist or difficult to fill",
  "You don’t have time to properly search the market",
  "The brief or salary needs challenging",
  "Confidentiality matters",
  "You need to understand who’s genuinely good, not just who’s good at interviewing",
  "Getting the hire wrong would be bloody expensive",
] as const;

const betterSearchBlocks = [
  {
    number: "01",
    title: "A better brief",
    copy: "Before searching for anybody, get underneath what the business actually needs this person to change.",
  },
  {
    number: "02",
    title: "An honest market view",
    copy: "Does the salary stack up? Do the people you’re describing exist? And what will make somebody good actually listen?",
  },
  {
    number: "03",
    title: "Access to people who aren’t applying",
    copy: "Strong candidates are often already employed and reasonably happy. They need finding and approaching properly.",
  },
  {
    number: "04",
    title: "Assessment beyond the CV",
    copy: "Where somebody worked matters. What they actually achieved when they got there matters more.",
  },
  {
    number: "05",
    title: "A shortlist worth your time",
    copy: "Fewer people. More context. No CV padding.",
  },
] as const;

const clientQuestions = [
  {
    title: "How much does marketing recruitment cost?",
    answer:
      "It depends on the search model, salary and complexity of the hire. Permanent recruitment is generally success-based; retained search and Fractional work differently.",
    linkLabel: "Read: How much does senior marketing recruitment cost?",
    href: "/insights/how-much-does-senior-marketing-recruitment-cost",
  },
  {
    title: "Retained or contingency recruitment?",
    answer:
      "If the candidate market is accessible and the role is straightforward, permanent contingency recruitment may be enough. Retained Search becomes more useful when the role is senior, confidential, difficult or commercially important.",
    linkLabel: "Read: Retained Search vs Contingent Recruitment",
    href: "/insights/retained-search-vs-contingent-recruitment",
  },
  {
    title: "How long does recruitment take?",
    answer:
      "There isn’t an honest universal answer. A specialist manager search and a confidential CMO appointment are completely different. What we can control is the quality of the brief, market approach, communication and process pace.",
  },
  {
    title: "Do you only recruit in Manchester?",
    answer:
      "No. Essential Resourcing is Manchester-led and North West-rooted, with UK-wide reach when the brief needs it.",
  },
  {
    title: "What if I don’t know exactly what I need?",
    answer:
      "Good. Speak to David before writing the job description. The first job is working out the problem, level, salary and type of hire, not forcing the brief into a recruitment product.",
  },
] as const;

export default async function ClientsPage() {
  const caseStudies = await getPublicCaseStudies();
  const havasCaseStudy = caseStudies.find(
    (caseStudy) =>
      caseStudy.status === "published" &&
      caseStudy.slug ===
        "havas-media-manchester-managing-partner-james-reddington",
  );

  return (
    <div className="clients-page">
      <Breadcrumbs items={[{ name: "Clients", href: "/clients" }]} />

      <section className="section dark clients-hero">
        <div className="container clients-hero-grid">
          <div className="section-heading">
            <p className="eyebrow">For clients</p>
            <h1>Better marketing hires start with a better brief.</h1>
          </div>
          <div className="clients-hero-copy">
            <p className="lede">
              When a hire actually matters to the business, you need more than
              another pile of CVs.
            </p>
            <p>
              Essential Resourcing helps agencies, brands and growth businesses
              recruit marketing, digital, PR, communications and agency talent,
              from specialist permanent hires through to CMOs, Marketing
              Directors, Managing Partners and Fractional leaders.
            </p>
            <p>But finding people is only part of it.</p>
            <p>
              The real job is understanding who you actually need, who’s
              genuinely good and who’s right for your business.
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="/contact">
                Sense-check a brief
              </Link>
              <Link className="button button-secondary" href="/contact">
                Talk to David
              </Link>
              <WhatsAppButton
                intent="hiring"
                label="Message David on WhatsApp"
                location="clients_hero"
                variant="secondary"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section surface" aria-labelledby="client-hire-areas">
        <div className="container section-heading clients-section-intro">
          <p className="eyebrow">What I recruit</p>
          <h2 id="client-hire-areas">
            Need good marketing people? You’re in the right place.
          </h2>
          <p className="lede">
            Marketing. Digital. PR. Communications. Agency.
          </p>
          <p>
            Essential Resourcing is a Manchester-based marketing recruitment
            agency working across the North West and UK.
          </p>
          <p>
            From specialist hires through to Marketing Directors, CMOs,
            Managing Partners and Fractional leaders.
          </p>
          <p>
            <strong>Agency-side. Client-side. Manchester-led. UK-wide.</strong>
          </p>
          <p>
            I’ve spent years in this market. I know the people, I know the
            agencies and I know that the same job title can mean something
            completely different from one business to the next.
          </p>
          <p className="lede">
            Specialist, not generalist. That’s the point.
          </p>
        </div>
        <div className="container clients-core-specialism-grid">
          {specialisms.map((area, index) => (
            <Link
              className="card lift-card clients-core-specialism-card"
              href={`/specialisms/${area.slug}`}
              key={area.slug}
            >
              <span className="tag">
                {String(index + 1).padStart(2, "0")} — Specialism
              </span>
              <h3>{area.title}</h3>
              <p className="clients-core-specialism-summary">
                {area.description}
              </p>
            </Link>
          ))}
        </div>
        <div className="container clients-subtle-link-row">
          <p>For the full picture, explore the specialisms in more detail.</p>
          <Link className="text-link" href="/specialisms">
            Explore Specialisms
          </Link>
        </div>
      </section>

      <section className="section muted" aria-labelledby="recruiter-value">
        <div className="container clients-recruiter-value">
          <div className="clients-recruiter-copy">
            <p className="eyebrow">When recruitment earns its money</p>
            <h2 id="recruiter-value">
              Why use a recruiter when I can advertise the role myself?
            </h2>
            <p className="lede">Sometimes you shouldn’t.</p>
            <p>
              There. Probably not what you’d expect on a recruitment website. 😂
            </p>
            <p>
              If you’ve got a straightforward role, a strong employer brand and
              plenty of relevant applicants, recruit it yourself. Seriously.
            </p>
            <p>That’s when recruitment should add value.</p>
            <p>Not by creating more activity.</p>
            <p>By helping you make a better decision.</p>
          </div>
          <div className="clients-trigger-panel">
            <h3>Where a specialist recruiter starts earning their money:</h3>
            <ul className="clients-check-list">
              {recruiterValueTriggers.map((trigger) => (
                <li key={trigger}>{trigger}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="search-value">
        <div className="container section-heading clients-section-intro">
          <p className="eyebrow">A better search</p>
          <h2 id="search-value">
            What does a good recruitment search actually give you?
          </h2>
        </div>
        <div className="container clients-benefit-grid">
          {betterSearchBlocks.map((block) => (
            <article className="card clients-benefit-card" key={block.title}>
              <span className="tag">
                {block.number} — {block.title}
              </span>
              <p>{block.copy}</p>
            </article>
          ))}
        </div>
        <div className="container clients-closing-line">
          <p>Fewer CVs. Better conversations. Better hiring decisions.</p>
          <Link className="text-link" href="/how-essential-resourcing-works">
            See exactly how I recruit
          </Link>
        </div>
      </section>

      <section className="section" aria-labelledby="client-proof">
        <div className="container section-heading">
          <p className="eyebrow">Proof</p>
          <h2 id="client-proof">What does that look like in the real world?</h2>
        </div>
        <div className="container clients-proof-grid">
          {havasCaseStudy ? (
            <article className="card lift-card clients-proof-card">
              <span className="tag">Case study</span>
              {havasCaseStudy.proofLogo ? (
                <Image
                  alt={
                    havasCaseStudy.proofLogoAlt ||
                    `${havasCaseStudy.clientType} logo`
                  }
                  className="clients-proof-logo"
                  height={88}
                  src={havasCaseStudy.proofLogo}
                  width={250}
                />
              ) : null}
              <h3>{havasCaseStudy.title}</h3>
              <p>{havasCaseStudy.challengeSummary}</p>
              <Link
                className="text-link"
                href={`/case-studies/${havasCaseStudy.slug}`}
              >
                Read the Havas Media Manchester case study
              </Link>
              <Link className="text-link" href="/case-studies">
                View all case studies
              </Link>
            </article>
          ) : null}
        </div>
      </section>

      <section className="section surface" aria-labelledby="client-questions">
        <div className="container section-heading">
          <p className="eyebrow">Quick client questions</p>
          <h2 id="client-questions">The questions clients normally ask me.</h2>
        </div>
        <div className="container clients-question-grid">
          {clientQuestions.map((question) => (
            <article
              className="card clients-question-card"
              key={question.title}
            >
              <h3>{question.title}</h3>
              <p>{question.answer}</p>
              {"href" in question ? (
                <Link className="text-link" href={question.href}>
                  {question.linkLabel}
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <CTASection
        eyebrow="Next step"
        title="Start with the problem."
        text={"Tell me who you’re thinking about hiring, why you need them and what you need them to change.\n\nI’ll give you a straight view on the brief, salary, market and how I’d approach it.\n\nIf Essential is the right answer, brilliant. If it isn’t, I’ll tell you that too."}
        ctaLabel="Sense-check a brief"
        ctaHref="/contact"
        whatsAppIntent="hiring"
        whatsAppLabel="Message David on WhatsApp"
      />
    </div>
  );
}
