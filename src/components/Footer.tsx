import Image from "next/image";
import Link from "next/link";
import { CookiePreferencesButton } from "@/components/CookiePreferencesButton";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { analyticsAttributes } from "@/lib/analytics";
import { serviceNavigation, siteConfig } from "@/lib/site";

export function Footer() {
  const hasTrackingConfig = Boolean(
    process.env.NEXT_PUBLIC_GA_ID ||
      process.env.NEXT_PUBLIC_GTM_ID ||
      process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID ||
      process.env.NEXT_PUBLIC_META_PIXEL_ID ||
      process.env.NEXT_PUBLIC_CLARITY_ID ||
      process.env.NEXT_PUBLIC_HOTJAR_ID,
  );

  return (
    <footer className="site-footer dark">
      <div className="container footer-grid">
        <div>
          <Image
            src={siteConfig.logoLight}
            width={300}
            height={83}
            alt="Essential Resourcing"
          />
          <p className="footer-line">
            Senior marketing and comms hiring, done properly.
          </p>
          <p className="footer-brand-note">
            Manchester-led judgement. North West roots. UK-wide senior hiring
            support.
          </p>
        </div>
        <div>
          <h2>Need good marketing, PR or digital people?</h2>
          <p>Give David a shout before it becomes a hiring headache.</p>
          <div className="footer-contact" aria-label="Contact details">
            <WhatsAppButton
              intent="general"
              label="Message David on WhatsApp"
              location="footer"
              variant="text"
            />
            <Link href={`mailto:${siteConfig.email}`}>{siteConfig.email}</Link>
            {siteConfig.linkedIn ? (
              <Link
                href={siteConfig.linkedIn}
                {...analyticsAttributes("linkedin_click", {
                  label: "David on LinkedIn",
                  href: siteConfig.linkedIn,
                  location: "footer",
                })}
              >
                David on LinkedIn
              </Link>
            ) : null}
          </div>
          <Link
            className="button button-primary"
            href="/contact"
            {...analyticsAttributes("cta_click", {
              label: "Talk to David",
              href: "/contact",
              location: "footer",
            })}
          >
            Talk to David
          </Link>
        </div>
        <nav aria-label="Footer services">
          <h3>Services</h3>
          {serviceNavigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Footer navigation">
          <h3>Site</h3>
          <Link href="/clients">Clients</Link>
          <Link href="/candidates">Candidates</Link>
          <Link href="/case-studies">Case Studies</Link>
          <Link href="/salary-snapshots">Salary Snapshots</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/candidate-privacy">Candidate Privacy Notice</Link>
          <Link href="/cookie-policy">Cookie Policy</Link>
          {hasTrackingConfig ? <CookiePreferencesButton /> : null}
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Essential Resourcing. Founder-led recruitment, search and strategic interim.</p>
        <p>
          Manchester-led. UK-wide. <Link href="/cms">Editor login</Link>
        </p>
      </div>
    </footer>
  );
}
