import Image from "next/image";
import Link from "next/link";
import { CookiePreferencesButton } from "@/components/CookiePreferencesButton";
import { analyticsAttributes } from "@/lib/analytics";
import { serviceNavigation, siteConfig } from "@/lib/site";
import styles from "./Footer.module.css";

const explore = [
  ["Clients", "/clients"],
  ["Candidates", "/candidates"],
  ["Jobs", "/jobs"],
  ["Insight", "/insights"],
  ["Specialisms", "/specialisms"],
  ["Case Studies", "/case-studies"],
] as const;
const legal = [
  ["Sitemap", "/sitemap"],
  ["Privacy", "/privacy-policy"],
  ["Candidate Privacy", "/candidate-privacy"],
  ["Data Request", "/candidate-privacy/request"],
  ["Cookies", "/cookie-policy"],
  ["Terms", "/terms"],
] as const;
type SocialKind = "linkedin" | "facebook" | "instagram" | "whatsapp" | "email";

function SocialIcon({ kind }: { kind: SocialKind }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      focusable="false"
    >
      {kind === "linkedin" && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M7.5 10v7M11.5 17v-7m0 3a3 3 0 0 1 6 0v4" />
          <circle cx="7.5" cy="7" r=".8" fill="currentColor" stroke="none" />
        </>
      )}
      {kind === "facebook" && (
        <path d="M14 21v-8h3l.5-4H14V7c0-1.1.4-2 2-2h2V1.5A24 24 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v8" />
      )}
      {kind === "instagram" && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </>
      )}
      {kind === "whatsapp" && (
        <>
          <path d="M20.5 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.2-4.5a8.5 8.5 0 1 1 16.3-4Z" />
          <path d="m8 7 2 3-1 1c.8 1.6 2 2.8 3.5 3.5l1-1 3 1.5c-.5 2-2 2.5-4 1.5C9 15 6.5 12 7 9c0-1 .5-1.5 1-2Z" />
        </>
      )}
      {kind === "email" && (
        <>
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <path d="m3 6 9 7 9-7" />
        </>
      )}
    </svg>
  );
}

function SocialLink({
  kind,
  href,
  label,
}: {
  kind: SocialKind;
  href: string;
  label: string;
}) {
  const external = !href.startsWith("mailto:");
  return (
    <li>
      <a
        href={href}
        aria-label={label}
        title={label}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        {...analyticsAttributes(
          kind === "whatsapp"
            ? "whatsapp_click"
            : kind === "linkedin"
              ? "linkedin_click"
              : "cta_click",
          {
            label,
            href,
            location: "footer",
            cta_text: label,
            ...(kind === "whatsapp" ? { intent: "general" } : {}),
            ...(kind === "linkedin" && href === siteConfig.linkedIn
              ? { destination: "linkedin_profile", profile_type: "founder" }
              : {}),
          },
        )}
      >
        <SocialIcon kind={kind} />
      </a>
    </li>
  );
}

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
    <footer className={`${styles.footer} dark`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Link href="/" aria-label="Essential Resourcing home">
            <Image
              src={siteConfig.logoLight}
              width={300}
              height={83}
              alt="Essential Resourcing"
            />
          </Link>
          <p>Marketing recruitment and leadership search, done properly.</p>
          <p>Manchester roots. North West market knowledge. UK-wide search.</p>
        </div>
        <nav aria-label="Footer explore">
          <h2>Explore</h2>
          <ul className={styles.links}>
            {explore.map(([label, href]) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Footer services">
          <h2>Work with Essential</h2>
          <ul className={styles.links}>
            {serviceNavigation
              .filter((item) => item.href !== "/services")
              .map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
          </ul>
        </nav>
        <nav aria-label="Footer connect" className={styles.connect}>
          <h2>Connect</h2>
          <p>Essential Resourcing</p>
          <ul className={styles.socials} aria-label="Company channels">
            <SocialLink
              kind="linkedin"
              href={siteConfig.companyLinkedIn}
              label="Essential Resourcing on LinkedIn"
            />
            <SocialLink
              kind="facebook"
              href={siteConfig.companyFacebook}
              label="Essential Resourcing on Facebook"
            />
            <SocialLink
              kind="instagram"
              href={siteConfig.companyInstagram}
              label="Essential Resourcing on Instagram"
            />
          </ul>
          <div className={styles.direct}>
            <p>Direct to David</p>
            <ul className={styles.socials} aria-label="Contact David">
              <SocialLink
                kind="linkedin"
                href={siteConfig.linkedIn}
                label="Connect with David Walsh on LinkedIn"
              />
              {siteConfig.whatsApp.enabled && (
                <SocialLink
                  kind="whatsapp"
                  href={siteConfig.whatsApp.url}
                  label="Message David on WhatsApp"
                />
              )}
              <SocialLink
                kind="email"
                href={`mailto:${siteConfig.email}`}
                label="Email David"
              />
            </ul>
          </div>
        </nav>
      </div>
      <div className={`container ${styles.utility}`}>
        <nav aria-label="Footer legal">
          <ul>
            {legal.map(([label, href]) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
            {hasTrackingConfig && (
              <li>
                <CookiePreferencesButton />
              </li>
            )}
          </ul>
        </nav>
        <div className={styles.signoff}>
          <p>© {new Date().getFullYear()} Essential Resourcing</p>
          <p>Made in Manchester. Working UK-wide.</p>
        </div>
      </div>
    </footer>
  );
}
