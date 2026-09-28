import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SchemaScript } from "@/components/SchemaScript";
import { ServiceProductCards } from "@/components/ServiceProductCards";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import styles from "@/components/ServicesLanding.module.css";
import { analyticsAttributes } from "@/lib/analytics";
import { getPublicServices } from "@/lib/public-content";
import { createMetadata, itemListSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Marketing Recruitment Services | Essential",
  description:
    "Permanent recruitment, retained search, fractional leadership and market intelligence for marketing, digital, PR, communications and agency hiring.",
  path: "/services",
});

const serviceProducts = [
  {
    slug: "permanent-recruitment",
    title: "Permanent Recruitment",
    proposition: "Permanent marketing recruitment. Done properly.",
    clientNeed: "We know roughly what we need and want somebody permanently.",
    description: [
      "Specialist, success-based recruitment for marketing, digital, PR, communications and agency hires.",
      "Get underneath the brief. Pressure-test the market. Search beyond applicants. Introduce fewer, better candidates who are actually worth meeting.",
    ],
    ctaLabel: "Explore Permanent Recruitment",
  },
  {
    slug: "retained-search",
    title: "Retained Search",
    proposition: "When the hire matters enough to search the market properly.",
    clientNeed:
      "This hire really matters. We need a committed search of the market.",
    description: [
      "A research-led search for senior, confidential, difficult or commercially important appointments.",
      "Deeper briefing. Market mapping. Direct approaches. Transparent calibration. Proper assessment.",
    ],
    ctaLabel: "Explore Retained Search",
  },
  {
    slug: "fractional",
    title: "Fractional Leadership",
    proposition:
      "Senior marketing leadership. Just not necessarily five days a week.",
    clientNeed:
      "We need senior capability, but another full-time permanent hire isn't necessarily the answer.",
    description: [
      "Work out what leadership the business actually needs, then find an experienced CMO, Marketing Director or senior agency leader who can deliver it.",
    ],
    ctaLabel: "Explore Fractional Leadership",
  },
  {
    slug: "market-intelligence-advisory",
    title: "Market Intelligence & Advisory",
    proposition: "Before you recruit, make sure the brief actually stacks up.",
    clientNeed:
      "We're not ready to search yet. We need to understand the market first.",
    description: [
      "Salary intelligence, talent mapping, competitor insight, brief design and practical hiring advice to help you decide what — or whether — to hire.",
    ],
    ctaLabel: "Explore Market Intelligence & Advisory",
  },
] as const;

function ContactActions({ final = false }: { final?: boolean }) {
  const label = final ? "Sense-check it with David" : "Talk to David";
  const location = final ? "services_final" : "services_hero";
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
        location={location}
        label={final ? "Message David on WhatsApp" : "WhatsApp David"}
      />
    </div>
  );
}

export default async function ServicesPage() {
  const publicServices = await getPublicServices();
  const serviceWays = serviceProducts.map((product) => ({
    ...product,
    title:
      publicServices.find((service) => service.slug === product.slug)?.title ||
      product.title,
    href: `/services/${product.slug}`,
  }));

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[{ name: "Services", href: "/services" }]} />

      <section
        className={`section dark ${styles.hero}`}
        aria-labelledby="services-title"
      >
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <p className="eyebrow">Services</p>
            <h1 id="services-title">
              Start with the problem. Not the recruitment product.
            </h1>
          </div>
          <div className={styles.heroCopy}>
            <p>
              You don&apos;t need to know whether you need Permanent
              Recruitment, Retained Search, Fractional Leadership or Market
              Intelligence &amp; Advisory before we speak.
            </p>
            <p>
              Tell me what you&apos;re trying to solve, what&apos;s not working
              and what the business actually needs.
            </p>
            <p>Then we&apos;ll work out the right route.</p>
            <ContactActions />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="service-ways">
        <div className="container">
          <div className={styles.heading}>
            <p className="eyebrow">Find your route</p>
            <h2 id="service-ways">Four ways I can help.</h2>
            <p>
              You know the problem. You don&apos;t need to know what recruitment
              product it&apos;s called.
            </p>
          </div>
          <ServiceProductCards services={serviceWays} />
          <div className={styles.selectorClose}>
            <div>
              <h3>Still not sure? Good.</h3>
              <p>
                You don&apos;t need to diagnose the recruitment product
                yourself.
              </p>
              <p>
                Tell me what you&apos;re trying to solve and I&apos;ll give you
                a straight view — including if I think the answer is not to
                recruit yet.
              </p>
            </div>
            <Link className="text-link" href="/contact">
              Talk to David
            </Link>
          </div>
        </div>
      </section>

      <section className="section surface" aria-labelledby="services-approach">
        <div className={`container ${styles.bridge}`}>
          <div>
            <p className="eyebrow">How Essential works</p>
            <h2 id="services-approach">
              Different routes. Same basic principles.
            </h2>
            <p className={styles.bridgeCopy}>
              Whichever route makes sense, the thinking underneath it
              doesn&apos;t change.
            </p>
            <Link className="text-link" href="/how-essential-resourcing-works">
              See how Essential Resourcing works
            </Link>
          </div>
          <ul className={styles.principles}>
            <li>Get underneath the problem.</li>
            <li>Reality-check the market.</li>
            <li>Look beyond who&apos;s available.</li>
            <li>Get behind the evidence.</li>
            <li>Help you make the decision.</li>
          </ul>
        </div>
      </section>

      <section className="section dark" aria-labelledby="services-coverage">
        <div className={`container ${styles.coverage}`}>
          <p className="eyebrow">Agency-side. Client-side. UK-wide.</p>
          <h2 id="services-coverage">
            Manchester-led. North West-rooted. UK-wide.
          </h2>
          <p>
            Essential Resourcing has its roots in Manchester and the North West,
            with particularly deep experience across the marketing and agency
            market.
          </p>
          <p>But the search doesn’t stop at the M60.</p>
          <p>
            I recruit agency-side and client-side marketing talent across the UK
            when the brief needs it.
          </p>
        </div>
      </section>

      <section
        className="section-tight dark"
        aria-labelledby="services-next-step"
      >
        <div className="container">
          <p className="eyebrow">Next step</p>
          <h2 id="services-next-step">Not sure which route you need?</h2>
          <div className={styles.finalCopy}>
            <p>Good.</p>
            <p>Tell me what you&apos;re trying to solve.</p>
            <p>
              If it&apos;s a straightforward Permanent search, I&apos;ll tell
              you.
            </p>
            <p>
              If it needs Retained Search, Fractional Leadership or some market
              work first, I&apos;ll tell you that too.
            </p>
            <p>
              And if I don&apos;t think you should recruit yet, that&apos;s a
              perfectly valid answer.
            </p>
          </div>
          <ContactActions final />
          <p className={styles.closing}>
            Start with the problem. We&apos;ll work out the recruitment product
            afterwards.
          </p>
        </div>
      </section>

      <SchemaScript
        data={itemListSchema({
          name: "Essential Resourcing recruitment services",
          description:
            "Permanent recruitment, retained search, fractional leadership and market intelligence for senior and specialist marketing hiring.",
          items: serviceWays.map((service) => ({
            name: service.title,
            url: service.href,
            description: service.proposition,
          })),
        })}
      />
    </div>
  );
}
