import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Cookie Policy | Essential Resourcing",
  description:
    "Cookie policy template for Essential Resourcing. Review when analytics tools are enabled.",
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
          <p className="eyebrow">Legal</p>
          <h1>Cookie Policy</h1>
          <p className="lede">
            Cookie and tracking copy should be reviewed by a qualified adviser
            when GA4, GTM, LinkedIn Insight Tag or other tools are enabled.
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container legal-content">
          <p>
            The site uses essential browser functionality to deliver pages and
            forms. This page is a structured launch placeholder and needs legal
            review before the site goes fully live.
          </p>
          <h2>Essential storage</h2>
          <p>
            Essential storage supports site security, form operation and basic
            browser behaviour. It is not used for advertising.
          </p>
          <h2>Analytics cookies</h2>
          <p>
            GA4, Google Tag Manager, Microsoft Clarity or Hotjar may be enabled
            through environment variables. Where analytics is configured, it is
            controlled by the consent banner and Google Consent Mode V2.
          </p>
          <h2>Marketing cookies</h2>
          <p>
            LinkedIn Insight Tag, Meta Pixel or advertising tags may be enabled
            only when approved and configured. Marketing tags should stay off
            unless marketing consent is given.
          </p>
          <h2>Google Consent Mode V2</h2>
          <p>
            Consent Mode tells Google tags whether analytics or advertising
            storage has been granted or denied. It is not a cookie banner by
            itself, and it does not replace legal review.
          </p>
          <h2>Managing choices</h2>
          <p>
            You can accept, reject or manage non-essential cookies in the banner.
            You can also reopen Cookie preferences from the footer or manage
            cookies through your browser settings.
          </p>
          <h2>Changes</h2>
          <p>
            This policy should be reviewed whenever new tracking, pixels,
            third-party embeds or consent management tools are added.
          </p>
        </div>
      </section>
    </>
  );
}
