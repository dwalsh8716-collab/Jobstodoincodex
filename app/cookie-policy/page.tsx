import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Cookie Policy | Essential Resourcing",
  description: "Cookie policy template for Essential Resourcing. Review when analytics tools are enabled.",
  path: "/cookie-policy"
});

export default function CookiePolicyPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Cookie Policy", href: "/cookie-policy" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Legal</p>
          <h1>Cookie Policy</h1>
          <p className="lede">Cookie and tracking copy should be updated when GA4, LinkedIn Insight Tag or other tools are enabled.</p>
        </div>
      </section>
      <section className="section surface">
        <div className="container legal-content">
          <p>The site uses essential browser functionality to deliver pages and forms.</p>
          <h2>Analytics cookies</h2>
          <p>Analytics scripts are environment-variable controlled and are not hardcoded. Add consent tooling if required by the final tracking setup.</p>
          <h2>Managing cookies</h2>
          <p>You can manage or delete cookies through your browser settings.</p>
          <h2>Changes</h2>
          <p>This policy should be reviewed whenever new tracking, pixels or third-party embeds are added.</p>
        </div>
      </section>
    </>
  );
}
