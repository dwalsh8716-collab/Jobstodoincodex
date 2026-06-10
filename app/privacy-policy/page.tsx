import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Privacy Policy | Essential Resourcing",
  description: "Privacy policy template for Essential Resourcing. Review before publication.",
  path: "/privacy-policy"
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Privacy Policy", href: "/privacy-policy" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Legal</p>
          <h1>Privacy Policy</h1>
          <p className="lede">
            This page is structured and editable, but should be reviewed against the final form provider, analytics
            setup and data handling processes by a qualified adviser before launch.
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container legal-content">
          <p>Essential Resourcing collects the information you choose to submit through enquiry and candidate forms.</p>
          <h2>Information collected</h2>
          <p>This may include your name, email address, company, LinkedIn URL, role brief and message content.</p>
          <h2>How information is used</h2>
          <p>Information is used to respond to enquiries, discuss recruitment briefs, manage candidate conversations and improve the website.</p>
          <h2>CVs and sensitive documents</h2>
          <p>CV upload is not enabled in phase one. CVs should only be requested and handled through a secure, agreed process.</p>
          <h2>Analytics and cookies</h2>
          <p>Analytics tools only load when environment variables are configured and analytics consent has been accepted.</p>
          <h2>Your rights</h2>
          <p>You can request access, correction or deletion of personal data by contacting Essential Resourcing.</p>
        </div>
      </section>
    </>
  );
}
