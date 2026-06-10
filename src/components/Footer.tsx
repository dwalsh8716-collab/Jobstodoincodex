import Image from "next/image";
import Link from "next/link";
import { analyticsAttributes } from "@/lib/analytics";
import { serviceNavigation, siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer dark">
      <div className="container footer-grid">
        <div>
          <Image src={siteConfig.logoLight} width={300} height={83} alt="Essential Resourcing" />
          <p className="footer-line">Senior marketing and comms hiring, done properly.</p>
        </div>
        <div>
          <h2>Need good marketing, PR or digital people?</h2>
          <p>Give David a shout before it becomes a hiring headache.</p>
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
          <Link href="/cookie-policy">Cookie Policy</Link>
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
