import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { analyticsAttributes } from "@/lib/analytics";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Contact David | Essential Resourcing",
  description:
    "Tell David Walsh what you are trying to hire and he will tell you honestly whether Essential Resourcing can help.",
  path: "/contact",
});

export default function ContactPage() {
  const phoneHref = siteConfig.phone
    ? `tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`
    : "";
  const hasBookingUrl =
    siteConfig.bookingUrl && siteConfig.bookingUrl !== "/contact";

  return (
    <>
      <Breadcrumbs items={[{ name: "Contact", href: "/contact" }]} />
      <section className="section dark">
        <div className="container split">
          <div>
            <p className="eyebrow">Contact</p>
            <h1>Need good people?</h1>
            <p className="lede">
              Tell me what you’re trying to hire and I’ll tell you honestly
              whether I can help.
            </p>
            <div className="statement-list hero-actions">
              <p>Confidential briefs handled directly</p>
              <p>Candidate conversations without pressure</p>
              <p>
                A straight answer if the role, salary or process needs fixing
              </p>
            </div>
            <div className="button-row hero-actions">
              <WhatsAppButton
                intent="hiring"
                label="Fastest way to reach me? Message me on WhatsApp"
                location="contact_page"
                variant="primary"
              />
              <Link
                className="button button-secondary"
                href="#contact-form"
                {...analyticsAttributes("cta_click", {
                  label: "I'm hiring",
                  href: "#contact-form",
                  location: "contact hero",
                })}
              >
                I&apos;m hiring
              </Link>
              <Link
                className="button button-secondary"
                href="/candidates#candidate-contact"
                {...analyticsAttributes("cta_click", {
                  label: "I'm looking for work",
                  href: "/candidates#candidate-contact",
                  location: "contact hero",
                })}
              >
                I&apos;m looking for work
              </Link>
              <Link
                className="button button-secondary"
                href={`mailto:${siteConfig.email}`}
                {...analyticsAttributes("email_click", {
                  label: siteConfig.email,
                  href: `mailto:${siteConfig.email}`,
                  location: "contact hero",
                })}
              >
                {siteConfig.email}
              </Link>
              {phoneHref ? (
                <Link
                  className="button button-secondary"
                  href={phoneHref}
                  {...analyticsAttributes("phone_click", {
                    label: "Call David",
                    href: phoneHref,
                    location: "contact hero",
                  })}
                >
                  Call David
                </Link>
              ) : null}
              {siteConfig.linkedIn ? (
                <Link
                  className="button button-secondary"
                  href={siteConfig.linkedIn}
                  {...analyticsAttributes("linkedin_click", {
                    label: "LinkedIn",
                    href: siteConfig.linkedIn,
                    location: "contact hero",
                  })}
                >
                  LinkedIn
                </Link>
              ) : null}
              {hasBookingUrl ? (
                <Link
                  className="button button-primary"
                  href={siteConfig.bookingUrl}
                  {...analyticsAttributes("book_call_click", {
                    label: "Talk to David",
                    href: siteConfig.bookingUrl,
                    location: "contact hero",
                  })}
                >
                  Talk to David
                </Link>
              ) : null}
            </div>
            <div className="trust-callout hero-actions">
              <h2>What happens next?</h2>
              <p>
                David reviews the note personally. If Essential can help, you
                will get a practical next step. If it is not the right fit, you
                will get that answer quickly too.
              </p>
            </div>
          </div>
          <div id="contact-form">
            <div className="contact-options-card">
              <p className="eyebrow">Fast route</p>
              <h2>Message David directly.</h2>
              <p>
                Fastest way to reach me? Message me on WhatsApp. Forms and
                email still work if you prefer to send more detail.
              </p>
              <WhatsAppButton
                intent="hiring"
                label="Message David on WhatsApp"
                location="contact_options"
                variant="primary"
              />
              <p className="meta">
                Opens WhatsApp. WhatsApp has its own terms and privacy policy.
              </p>
            </div>
            <ContactForm type="client" />
          </div>
        </div>
      </section>
    </>
  );
}
