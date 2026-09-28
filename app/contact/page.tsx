import Link from "next/link";
import styles from "@/components/AboutConversion.module.css";
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
    <div className={`${styles.page} ${styles.contact}`}>
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
              No pretending every vacancy needs Retained Search.
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
              <p className="eyebrow">What happens next?</p>
              <h2>A straight reply. Not a sales sequence.</h2>
              <p>
                I read it. If I can help, I&apos;ll suggest the most sensible
                next step. If I don&apos;t think I&apos;m the right recruiter
                for it, I&apos;ll tell you that too.
              </p>
            </div>
            <div className={styles.contactRoutes}>
              <p className="eyebrow">How do you want to get in touch?</p>
              <h2>Quick question or proper brief?</h2>
              <div><h3>Quick question</h3><p>WhatsApp is normally quickest if you just want to ask something or sense-check a role.</p></div>
              <div><h3>More context to share</h3><p>Use the form if you’ve got a brief, salary, role detail or a bit more context you want David to read properly.</p><Link className="text-link" href="#contact-form">Send the brief</Link></div>
            </div>
          </div>
          <div id="contact-form">
            <div className="contact-options-card">
              <p className="eyebrow">Direct with David</p>
              <h2>Share the useful context.</h2>
              <p>
                You’ll get a straight reply, not a sales sequence.
              </p>
              <div className="contact-secondary-routes">
                <h3>Other useful routes</h3>
                <div className="button-row">
                  <Link
                    className="text-link"
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
                    className="text-link"
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
                      className="text-link"
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
                    variant="text"
                  />
                </div>
              </div>
            </div>
            <ContactForm type="client" />
          </div>
        </div>
      </section>
    </div>
  );
}
