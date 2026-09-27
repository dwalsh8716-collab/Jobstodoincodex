import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { specialisms, getSpecialismBySlug } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

const supportingCopy = {
  "marketing-and-leadership": [
    "This covers the people responsible for making marketing sharper, more commercial and easier to trust.",
    "It might be a hands-on Marketing Manager, a Head of Marketing building the function, or a CMO-level leader setting the direction.",
  ],
  "digital-performance-ecommerce": [
    "This is where the commercially focused digital roles sit: acquisition, performance, CRM, eCommerce, retention and the leadership around them.",
    "The title matters less than what the person is expected to change, measure and improve.",
  ],
  "pr-communications-content": [
    "This covers reputation, earned media, social, content and communications roles across agency and client-side teams.",
    "Paid social and performance-led roles usually sit under Digital, Performance & eCommerce. Social and content-led roles sit here.",
  ],
  "agency-client-services-leadership": [
    "This is the agency specialism that really matters: the people who lead clients, teams and commercial relationships.",
    "It covers client services and agency leadership across PR, digital, integrated, creative, media and performance agencies.",
  ],
} as const;

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

  return (
    <div className="specialism-detail-page">
      <Breadcrumbs
        items={[
          { name: "Specialisms", href: "/specialisms" },
          { name: specialism.title, href: `/specialisms/${specialism.slug}` },
        ]}
      />

      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Specialism</p>
          <h1>{specialism.title}</h1>
          <p className="lede">{specialism.description}</p>
          <p className="lede">{specialism.detail}</p>
          <div className="button-row hero-actions">
            <Link className="button button-primary" href="/contact">
              Contact David
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

      <section className="section surface" aria-labelledby="specialism-summary">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Where this fits</p>
            <h2 id="specialism-summary">
              Specialist, not generalist. That’s the point.
            </h2>
          </div>
          <div className="statement-list">
            {supportingCopy[specialism.slug].map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>
              Manchester-led. North West-rooted. UK-wide when the brief needs
              it.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="specialism-links">
        <div className="container section-heading">
          <p className="eyebrow">Useful next step</p>
          <h2 id="specialism-links">
            Start with what you’re trying to solve.
          </h2>
          <p className="lede">
            The same job title can mean something completely different from one
            business to the next. Send David the brief and he’ll give you a
            straight view.
          </p>
        </div>
        <div className="container process-related-grid">
          <Link className="card lift-card process-related-card" href="/clients">
            <span className="tag">For clients</span>
            <span>See how Essential helps employers</span>
          </Link>
          <Link className="card lift-card process-related-card" href="/services">
            <span className="tag">Services</span>
            <span>Explore the four ways to work together</span>
          </Link>
          <Link
            className="card lift-card process-related-card"
            href="/specialisms"
          >
            <span className="tag">Specialisms</span>
            <span>Back to all specialisms</span>
          </Link>
          <Link className="card lift-card process-related-card" href="/contact">
            <span className="tag">Contact David</span>
            <span>Talk through this kind of hire</span>
          </Link>
        </div>
      </section>

      <CTASection
        title="Want to discuss this kind of hire?"
        text="Tell David who you’re trying to hire, what’s not working and what this person needs to change."
        ctaLabel="Contact David"
        ctaHref="/contact"
        whatsAppIntent="hiring"
        whatsAppLabel="Discuss this on WhatsApp"
      />
    </div>
  );
}
