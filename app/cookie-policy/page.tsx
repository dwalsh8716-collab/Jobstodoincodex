import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CookiePreferencesButton } from "@/components/CookiePreferencesButton";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Cookie Policy | Essential Resourcing",
  description:
    "The essential storage and optional Google Analytics cookies used by the Essential Resourcing website.",
  path: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ name: "Cookie Policy", href: "/cookie-policy" }]}
      />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Cookie choices</p>
          <h1>Cookie Policy</h1>
          <p className="lede">
            The short version: essential site storage keeps things working.
            Google Analytics only loads if you say yes. Advertising trackers are
            not currently active.
          </p>
          <p className="form-note">Last reviewed: 22 September 2026.</p>
        </div>
      </section>

      <section className="section surface">
        <div className="container legal-content">
          <h2>What are cookies and similar technologies?</h2>
          <p>
            Cookies are small files stored by your browser. Websites can also
            use local storage, scripts, tags and similar technologies to
            remember choices or understand how a site is used.
          </p>
          <p>
            The same privacy rules can apply to these technologies even when
            they are not technically cookies.
          </p>

          <h2>What this website currently uses</h2>
          <h3>Essential preference storage</h3>
          <p>
            The website stores your cookie choices in your browser so it does
            not have to ask on every page. This is necessary to respect the
            choices you make.
          </p>
          <ul>
            <li>
              <code>essential.consent-preferences</code>: records whether you
              accepted analytics or marketing technologies.
            </li>
            <li>
              <code>essential.analytics-consent</code>: supports compatibility
              with the site&apos;s earlier consent setting.
            </li>
          </ul>
          <p>
            These preferences are kept for up to six months, unless you clear
            them sooner or change your choice.
          </p>

          <h3>Google Analytics 4</h3>
          <p>
            Google Analytics helps David understand which pages and content are
            useful. It only loads after you accept analytics.
          </p>
          <ul>
            <li>
              <code>_ga</code>: distinguishes visitors and may remain for up to
              two years.
            </li>
            <li>
              <code>_ga_&lt;container-id&gt;</code>: maintains session state and
              may remain for up to two years.
            </li>
          </ul>
          <p>
            The implementation uses IP anonymisation and must not send names,
            email addresses, phone numbers, CV filenames or enquiry text to
            Google Analytics.
          </p>

          <h3>Marketing technologies</h3>
          <p>
            Advertising and retargeting tags are not currently configured. If
            that changes, they will remain off unless you actively allow
            marketing technologies, and this policy will be updated.
          </p>

          <h2>Your choice</h2>
          <p>
            You can accept all, reject non-essential technologies, or choose
            analytics and marketing separately. Rejecting them will not stop you
            using the website, contacting David or applying for a role.
          </p>
          <CookiePreferencesButton />
          <p>
            You can also delete cookies and local storage through your browser.
            If you clear the saved preference, the website will ask again.
          </p>

          <h2>Links to other services</h2>
          <p>
            The website links to services such as LinkedIn, WhatsApp and Google
            Calendar. Simply seeing a link does not give those services consent
            to set tracking technologies on this website. If you follow the
            link, the destination service may use its own cookies under its own
            policy.
          </p>

          <h2>Changes</h2>
          <p>
            This policy and the consent controls will be reviewed if new
            analytics, advertising, embedded media or similar technology is
            introduced.
          </p>

          <h2>Questions</h2>
          <p>
            Email{" "}
            <Link className="text-link" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </Link>{" "}
            or read the{" "}
            <Link className="text-link" href="/privacy-policy">
              Privacy Policy
            </Link>{" "}
            for the wider picture.
          </p>
        </div>
      </section>
    </>
  );
}
