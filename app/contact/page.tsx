import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Contact David | Essential Resourcing",
  description:
    "Tell David Walsh what you are trying to hire and he will tell you honestly whether Essential Resourcing can help.",
  path: "/contact"
});

export default function ContactPage() {
  const phoneHref = siteConfig.phone ? `tel:${siteConfig.phone.replace(/[^+\d]/g, "")}` : "";
  const hasBookingUrl = siteConfig.bookingUrl && siteConfig.bookingUrl !== "/contact";

  return (
    <>
      <Breadcrumbs items={[{ name: "Contact", href: "/contact" }]} />
      <section className="section dark">
        <div className="container split">
          <div>
            <p className="eyebrow">Contact</p>
            <h1>Need good people?</h1>
            <p className="lede">Tell me what you’re trying to hire and I’ll tell you honestly whether I can help.</p>
            <div className="statement-list hero-actions">
              <p>Confidential briefs handled directly</p>
              <p>Candidate conversations without pressure</p>
              <p>A straight answer if the role, salary or process needs fixing</p>
            </div>
            <div className="button-row hero-actions">
              <Link className="button button-secondary" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </Link>
              {phoneHref ? (
                <Link className="button button-secondary" href={phoneHref}>
                  Call David
                </Link>
              ) : null}
              {siteConfig.linkedIn ? (
                <Link className="button button-secondary" href={siteConfig.linkedIn}>
                  LinkedIn
                </Link>
              ) : null}
              {hasBookingUrl ? (
                <Link className="button button-primary" href={siteConfig.bookingUrl}>
                  Talk to David
                </Link>
              ) : null}
            </div>
            <div className="trust-callout hero-actions">
              <h2>What happens next?</h2>
              <p>
                David reviews the note personally. If Essential can help, you will get a practical next step. If it is
                not the right fit, you will get that answer quickly too.
              </p>
            </div>
          </div>
          <ContactForm type="client" />
        </div>
      </section>
    </>
  );
}
