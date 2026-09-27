import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { SchemaScript } from "@/components/SchemaScript";
import { getPublicServices } from "@/lib/public-content";
import { createMetadata, itemListSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Marketing Recruitment Services | Essential",
  description:
    "Permanent recruitment, retained search, fractional leadership and market intelligence for marketing, digital, PR, communications and agency hiring.",
  path: "/services",
});

const serviceProductOrder = [
  "permanent-recruitment",
  "retained-search",
  "fractional",
  "market-intelligence-advisory",
] as const;

const serviceProductCopy = {
  "permanent-recruitment": {
    number: "01",
    title: "Permanent Recruitment",
    proposition: "Good people. Properly recruited.",
    description:
      "Success-based recruitment for permanent marketing, digital, PR, communications and agency hires. I get underneath the brief, search properly and give you fewer, better candidates who are actually worth meeting.",
    ctaLabel: "Explore Permanent Recruitment",
  },
  "retained-search": {
    number: "02",
    title: "Retained Search",
    proposition: "When the hire matters enough to search the market properly.",
    description:
      "For senior, confidential, difficult or commercially important appointments where waiting for the right person to apply isn’t enough. Proper market mapping, direct approaches and deeper assessment.",
    ctaLabel: "Explore Retained Search",
  },
  fractional: {
    number: "03",
    title: "Fractional",
    proposition: "Senior experience. Without another full-time salary.",
    description:
      "Experienced CMOs, Marketing Directors and agency leaders embedded into the business for the time you actually need them. Senior capability, just not necessarily five days a week.",
    ctaLabel: "Explore Fractional",
  },
  "market-intelligence-advisory": {
    number: "04",
    title: "Market Intelligence & Advisory",
    proposition: "Before you recruit, make sure the brief actually stacks up.",
    description:
      "Salary benchmarking, talent mapping, competitor intelligence and hiring advice to help you understand what you need, whether the people exist and what they’re going to cost.",
    ctaLabel: "Explore Market Intelligence & Advisory",
  },
} as const;

export default async function ServicesPage() {
  const publicServices = await getPublicServices();
  const serviceWays = serviceProductOrder.map((slug) => {
    const publicService = publicServices.find(
      (service) => service.slug === slug,
    );
    const card = serviceProductCopy[slug];

    return {
      ...card,
      title: publicService?.title || card.title,
      href: `/services/${slug}`,
    };
  });

  return (
    <div className="services-page">
      <Breadcrumbs items={[{ name: "Services", href: "/services" }]} />

      <section className="section dark services-hero">
        <div className="container services-hero-grid">
          <div className="section-heading">
            <p className="eyebrow">Services</p>
            <h1>Start with the problem. Not the recruitment product.</h1>
          </div>
          <div className="services-hero-copy">
            <p className="lede">
              You don’t need to know whether you need Permanent Recruitment,
              Retained Search, Fractional or some market intelligence before we
              speak.
            </p>
            <p>
              Tell me what you’re trying to hire, what’s not working and what
              the business actually needs this person to change.
            </p>
            <p>Then we’ll work out the right way to solve it.</p>
          </div>
        </div>
      </section>

      <section className="section surface" aria-labelledby="service-ways">
        <div className="container">
          <div className="services-section-head">
            <p className="eyebrow">Services</p>
            <h2 id="service-ways">Four ways I can help.</h2>
          </div>

          <div className="service-way-grid">
            {serviceWays.map((service) => (
              <Link
                aria-labelledby={`service-product-${service.number}`}
                className="service-way-card service-product-card"
                href={service.href}
                key={service.href}
              >
                <div>
                  <span className="service-way-number">{service.number}</span>
                  <h3 id={`service-product-${service.number}`}>
                    {service.title}
                  </h3>
                </div>
                <p className="service-way-proposition">{service.proposition}</p>
                <p className="service-way-description">{service.description}</p>
                <span className="text-link service-way-link">
                  {service.ctaLabel}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark services-region-band">
        <div className="container services-region-copy">
          <p className="eyebrow">Agency-side. Client-side. UK-wide.</p>
          <h2>Manchester-led. North West-rooted. UK-wide.</h2>
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

      <CTASection
        title="Need good people?"
        text="Before you put another job description into the market and hope for the best, give me a shout.\n\nOne straight conversation about what you’re trying to achieve.\n\nIf I can help, I’ll tell you how. If I can’t, I’ll tell you that too."
        ctaLabel="Sense-check a brief"
        ctaHref="/contact"
        whatsAppIntent="hiring"
        whatsAppLabel="Message David on WhatsApp"
      />

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
