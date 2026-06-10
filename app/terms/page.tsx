import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Terms of Website Use | Essential Resourcing",
  description: "Terms of website use template for Essential Resourcing. Review before publication.",
  path: "/terms"
});

export default function TermsPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Terms", href: "/terms" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Legal</p>
          <h1>Terms of Website Use</h1>
          <p className="lede">Structured terms page ready for final review by a qualified adviser before launch.</p>
        </div>
      </section>
      <section className="section surface">
        <div className="container legal-content">
          <p>By using this website, you agree to use it lawfully and responsibly.</p>
          <h2>Website content</h2>
          <p>Content is provided for general recruitment and market information. It is not legal, financial or HR advice.</p>
          <h2>Accuracy</h2>
          <p>Essential Resourcing aims to keep information current, but salary data, market commentary and job information should be verified before decisions are made.</p>
          <h2>External links</h2>
          <p>The site may link to third-party services such as WhatsApp, LinkedIn, video providers or booking tools. Essential Resourcing is not responsible for third-party content.</p>
          <h2>Contact</h2>
          <p>For questions about these terms, contact Essential Resourcing through the contact page.</p>
        </div>
      </section>
    </>
  );
}
