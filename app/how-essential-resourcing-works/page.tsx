import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { SchemaScript } from "@/components/SchemaScript";
import { createMetadata, itemListSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "How Essential Resourcing Finds Candidates | Essential",
  description:
    "How Essential Resourcing finds, approaches and assesses marketing, digital, PR and agency candidates, from the brief to behind the CV.",
  path: "/how-essential-resourcing-works",
});

const processStages = [
  {
    id: "get-underneath-the-brief",
    number: "01",
    title: "Get underneath the brief.",
    summary: "The job title isn’t the brief.",
    body: [
      "Before I look for anybody, I need to understand what you’re actually trying to fix.",
      "Not just the job title and a six-page job description.",
      "Why are you hiring? What’s not working now? What does this person need to have changed in 12 months? What are they inheriting? And what does genuinely good look like?",
      "If the salary, expectations or brief don’t stack up, this is where I’ll tell you.",
    ],
  },
  {
    id: "map-the-market",
    number: "02",
    title: "Work out where the good people are.",
    body: [
      "Then we build the market rather than just post the job.",
      "I’ll look at relevant businesses, competitors, adjacent sectors and people who’ve done something genuinely comparable.",
      "Technology and AI help me search wider and faster. My network helps. Years in the market definitely help.",
      "But the point isn’t to produce a spreadsheet containing 300 names. It’s to work out who’s actually worth approaching.",
    ],
  },
  {
    id: "approach-people-properly",
    number: "03",
    title: "Approach people properly.",
    body: [
      "The best candidate might not be looking for a job.",
      "So a generic LinkedIn message saying “I have an exciting opportunity that matches your profile” probably isn’t going to cut it.",
      "Why might this opportunity make sense for them? What’s interesting about the business? Why now?",
      "And if they’re happy where they are, what would genuinely make them listen?",
      "Recruitment is a two-way sell.",
    ],
  },
  {
    id: "get-behind-the-cv",
    number: "04",
    title: "Get behind the CV.",
    body: [
      "This is where the interesting bit starts.",
      "A CV tells me where somebody worked. I want to know what they actually did when they got there.",
      "What did they inherit? What did they change? What were the results? What was genuinely their contribution?",
      "What went wrong? How did they respond? How did they lead? How commercially strong are they?",
      "Finding somebody who looks right is increasingly easy. Working out who’s genuinely bloody good isn’t.",
    ],
  },
  {
    id: "focused-shortlist",
    number: "05",
    title: "Fewer people. More context.",
    body: [
      "I’m not interested in winning the award for Most CVs Sent Before Lunch.",
      "You’ll get a considered shortlist of people I genuinely think are worth your time. And I’ll tell you why.",
      "Strengths. Questions. Motivation. Salary. Availability. And any concerns I’ve got.",
      "If there’s something you’re going to discover at final interview, I’d much rather we knew about it before first stage.",
    ],
  },
  {
    id: "help-you-assess",
    number: "06",
    title: "Help you make the decision.",
    body: [
      "Introducing the candidate isn’t where my job ends.",
      "I’ll keep both sides talking. Help structure the interview process where useful. Challenge feedback. Dig into concerns. Keep good candidates engaged.",
      "Depending on the search, structured assessment or psychometric tools can also be added where they genuinely give us better evidence.",
      "Not another hoop because recruitment apparently needed more admin. Something useful that helps you make the decision.",
    ],
  },
  {
    id: "get-it-over-the-line",
    number: "07",
    title: "Get the bloody thing over the line.",
    body: [
      "Good candidates get lost in bad processes.",
      "Slow feedback. Fourteen interview stages. Radio silence. An offer nobody has properly discussed.",
      "I’ll keep things moving, deal with the awkward conversations, help manage the offer and make sure both sides know where they stand.",
      "Because finding the right person and then losing them through a crap process is a fairly spectacular waste of everyone’s time.",
    ],
  },
] as const;

const relatedLinks = [
  {
    label: "Explore Permanent Recruitment",
    href: "/services/permanent-recruitment",
  },
  { label: "Explore Retained Search", href: "/services/retained-search" },
  { label: "Explore Fractional", href: "/services/fractional" },
  {
    label: "See the Havas Media Manchester case study",
    href: "/case-studies/havas-media-manchester-managing-partner-james-reddington",
  },
  { label: "For Clients", href: "/clients" },
] as const;

export default function HowEssentialResourcingWorksPage() {
  return (
    <div className="process-page">
      <Breadcrumbs
        items={[
          {
            name: "How Essential Resourcing Works",
            href: "/how-essential-resourcing-works",
          },
        ]}
      />

      <section className="section dark process-hero">
        <div className="container process-hero-grid">
          <div className="section-heading">
            <p className="eyebrow">How Essential Resourcing works</p>
            <h1>How I actually find the right people.</h1>
          </div>
          <div className="process-hero-copy">
            <p className="lede">Finding people is getting easier.</p>
            <p>LinkedIn can find people.</p>
            <p>AI can find people.</p>
            <p>A job advert can definitely find you people.</p>
            <p>
              The valuable bit is knowing who to look for, getting good people
              interested and working out who’s genuinely bloody good.
            </p>
            <p className="process-hero-kicker">
              That’s what the process is built around.
            </p>
          </div>
        </div>
      </section>

      <section className="section surface" aria-labelledby="process-stages">
        <div className="container section-heading">
          <p className="eyebrow">The method</p>
          <h2 id="process-stages">Seven stages. No recruitment theatre.</h2>
        </div>
        <div className="container process-stage-list">
          {processStages.map((stage) => (
            <article
              className="process-stage-card"
              id={stage.id}
              key={stage.number}
            >
              <div className="process-stage-number">{stage.number}</div>
              <div className="process-stage-copy">
                <h2>{stage.title}</h2>
                {"summary" in stage && stage.summary ? (
                  <p className="process-stage-summary">{stage.summary}</p>
                ) : null}
                {stage.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section muted" aria-labelledby="process-principle">
        <div className="container process-principle">
          <p className="eyebrow">Closing principle</p>
          <h2 id="process-principle">
            Technology helps me search. Judgement decides who gets put in front
            of you.
          </h2>
          <p className="lede">
            I’m not trying to remove humans from recruitment. I’m trying to use
            better technology to spend more time on the bits where humans
            actually add value.
          </p>
          <div className="process-principle-lines">
            <p>Better brief.</p>
            <p>Better conversations.</p>
            <p>Better assessment.</p>
            <p>Better decision.</p>
            <p>Fewer CVs.</p>
            <p>Better hiring decisions.</p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="process-related-links">
        <div className="container section-heading">
          <p className="eyebrow">Related links</p>
          <h2 id="process-related-links">Go deeper where it’s useful.</h2>
        </div>
        <div className="container process-related-grid">
          {relatedLinks.map((link) => (
            <Link
              className="card lift-card process-related-card"
              href={link.href}
              key={link.href}
            >
              <span className="tag">Read next</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <CTASection
        title="Got a role that needs this level of attention?"
        text={"Start with the problem.\n\nTell me what you’re trying to hire and what you need that person to change.\n\nI’ll tell you how I’d approach it."}
        ctaLabel="Sense-check a brief"
        ctaHref="/contact"
        whatsAppIntent="hiring"
        whatsAppLabel="Message David on WhatsApp"
      />

      <SchemaScript
        data={itemListSchema({
          name: "Essential Resourcing recruitment process",
          description:
            "How Essential Resourcing finds, approaches and assesses marketing, digital, PR and agency candidates.",
          items: processStages.map((stage) => ({
            name: stage.title,
            url: `/how-essential-resourcing-works#${stage.id}`,
            description: stage.body[0],
          })),
        })}
      />
    </div>
  );
}
