import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Terms of Website Use | Essential Resourcing",
  description:
    "Terms governing use of the Essential Resourcing website, jobs, recruitment content and market information.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Terms", href: "/terms" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Website terms</p>
          <h1>Terms of Website Use</h1>
          <p className="lede">
            These terms cover the website. Client recruitment terms and any
            candidate work-finding terms are dealt with separately where they
            apply.
          </p>
          <p className="form-note">Last reviewed: 22 September 2026.</p>
        </div>
      </section>

      <section className="section surface">
        <div className="container legal-content">
          <h2>About Essential Resourcing</h2>
          <p>
            Essential Resourcing is a founder-led recruitment business operated
            by David Walsh. When introducing candidates to hirers for direct
            employment, Essential Resourcing operates as an employment agency.
            The precise basis of any Fractional, interim or contract assignment
            will be explained in the relevant written terms.
          </p>

          <h2>Using the website</h2>
          <p>
            You may use the website for lawful personal and business purposes.
            You must not:
          </p>
          <ul>
            <li>
              Attempt to gain unauthorised access to the website or systems.
            </li>
            <li>
              Introduce malware, scrape private areas or interfere with security
              controls.
            </li>
            <li>
              Submit information you do not have the right to provide or pretend
              to be somebody else.
            </li>
            <li>
              Use website content in a misleading, unlawful or commercially
              exploitative way.
            </li>
          </ul>

          <h2>Recruitment services</h2>
          <p>
            Website content does not itself create a client engagement,
            candidate representation agreement, employment relationship or
            guarantee of work. Recruitment services are subject to the relevant
            written terms agreed with the client or candidate where required.
          </p>
          <p>
            Candidates are not charged a fee by Essential Resourcing for finding
            or trying to find them work.
          </p>

          <h2>Jobs and applications</h2>
          <p>
            Essential Resourcing aims to publish genuine, authorised and current
            opportunities. A vacancy may change, close or be withdrawn, and an
            application does not guarantee an interview, introduction or offer.
          </p>
          <p>
            Job information should identify whether a role is permanent,
            temporary, contract or Fractional where relevant. If anything is
            unclear, ask David before relying on it.
          </p>
          <p>
            You are responsible for making sure information you provide is
            accurate and that you have permission to share any third-party
            information included in it.
          </p>

          <h2>Website and market content</h2>
          <p>
            Articles, salary information, market commentary, calculators and
            hiring guidance are general information, not legal, financial, tax
            or HR advice.
          </p>
          <p>
            Markets move. Salaries vary. A useful guide is not a substitute for
            checking the facts around a live hiring or career decision.
          </p>

          <h2>No guarantee of outcome</h2>
          <p>
            Essential Resourcing will use reasonable care in providing its
            services, but cannot guarantee that a candidate will be hired, a
            vacancy will remain open, an employer will make an offer or a
            placement will succeed.
          </p>

          <h2>Intellectual property</h2>
          <p>
            Unless stated otherwise, the website&apos;s copy, design, branding
            and original materials belong to Essential Resourcing or are used
            with permission.
          </p>
          <p>
            You may link to public pages and share brief extracts with clear
            attribution. You may not reproduce substantial content, remove
            branding or present it as your own without permission.
          </p>

          <h2>External links</h2>
          <p>
            The website links to services and websites operated by other
            organisations, including LinkedIn, WhatsApp and Google. Those
            services are responsible for their own availability, content and
            terms.
          </p>

          <h2>Availability and changes</h2>
          <p>
            Essential Resourcing may update, suspend or remove website content
            without notice. Reasonable efforts are made to keep the website
            available and accurate, but uninterrupted access cannot be
            guaranteed.
          </p>

          <h2>Liability</h2>
          <p>
            Nothing in these terms excludes liability that cannot legally be
            excluded, including liability for fraud or for death or personal
            injury caused by negligence.
          </p>
          <p>
            Subject to that, Essential Resourcing is not responsible for losses
            caused by relying on general website content instead of obtaining
            advice for the specific decision, or by third-party websites and
            services outside its control.
          </p>

          <h2>Privacy</h2>
          <p>
            The{" "}
            <Link className="text-link" href="/privacy-policy">
              Privacy Policy
            </Link>
            ,{" "}
            <Link className="text-link" href="/candidate-privacy">
              Candidate Privacy Notice
            </Link>{" "}
            and{" "}
            <Link className="text-link" href="/cookie-policy">
              Cookie Policy
            </Link>{" "}
            explain how personal information and browser technologies are
            handled.
          </p>

          <h2>Governing law</h2>
          <p>
            These website terms are governed by the law of England and Wales.
            The courts of England and Wales will have jurisdiction, subject to
            any mandatory rights that apply to you.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms can be sent to{" "}
            <Link className="text-link" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
