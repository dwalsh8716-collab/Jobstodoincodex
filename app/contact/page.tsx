import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { LinkedInProfileLink } from "@/components/LinkedInProfileLink";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { analyticsAttributes } from "@/lib/analytics";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Contact David Walsh | Essential Resourcing",
  description:
    "Talk directly to David Walsh about permanent recruitment, retained search, fractional leadership or hiring advisory support across Manchester and the UK.",
  path: "/contact",
});

export default function ContactPage() {
  const phoneHref = siteConfig.phone
    ? `tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`
    : "";

  return (
    <>
      <Breadcrumbs items={[{ name: "Contact", href: "/contact" }]} />
      <section className="section dark">
        <div className="container split">
          <div>
            <p className="eyebrow">Contact</p>
            <h1>Need good people?</h1>
            <p className="lede">
              Tell me what you&apos;re trying to hire and I&apos;ll tell you
              honestly whether I can help.
            </p>
            <p className="lede">No sales sequence.</p>
            <p className="lede">
              No pretending every vacancy needs retained search.
            </p>
            <p className="lede">
              And if I think the brief, salary or process needs fixing before
              you recruit anybody, I&apos;ll tell you that too.
            </p>
            <div className="button-row hero-actions">
              <WhatsAppButton
                intent="hiring"
                label="Fastest way to reach me? WhatsApp."
                location="contact_page"
                variant="primary"
              />
              <Link
                className="button button-secondary"
                href="#contact-form"
                {...analyticsAttributes("cta_click", {
                  label: "Send the brief",
                  href: "#contact-form",
                  location: "contact hero",
                })}
              >
                Send the brief
              </Link>
            </div>
            <div className="trust-callout hero-actions">
              <h2>What happens next?</h2>
              <p>
                I read it. If I can help, I&apos;ll suggest the most sensible
                next step. If I don&apos;t think I&apos;m the right recruiter
                for it, I&apos;ll tell you that too.
              </p>
            </div>
          </div>
          <div id="contact-form">
            <div className="contact-options-card">
              <p className="eyebrow">Fast route</p>
              <h2>Message David directly.</h2>
              <p>
                WhatsApp is normally quickest. If you&apos;ve got more context
                to share, use the form or email.
              </p>
              <WhatsAppButton
                intent="hiring"
                label="Message David on WhatsApp"
                location="contact_options"
                variant="primary"
              />
              <div className="contact-secondary-routes">
                <h3>Other useful routes</h3>
                <div className="button-row">
                  <Link
                    className="button button-secondary"
                    href="/candidates#candidate-contact"
                    {...analyticsAttributes("cta_click", {
                      label: "I'm looking for work",
                      href: "/candidates#candidate-contact",
                      location: "contact options",
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
                      location: "contact options",
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
                        location: "contact options",
                      })}
                    >
                      Call David
                    </Link>
                  ) : null}
                  <LinkedInProfileLink
                    label="Connect with David on LinkedIn"
                    location="contact_options"
                    variant="secondary"
                  />
                </div>
              </div>
            </div>
            <ContactForm type="client" />
          </div>
        </div>
      </section>
    </>
  );
}
