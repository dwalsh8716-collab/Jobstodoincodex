import { Breadcrumbs } from "@/components/Breadcrumbs";
import { candidatePrivacyPath } from "@/lib/candidate-trust";
import { createMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = createMetadata({
  title: "Privacy Policy | Essential Resourcing",
  description:
    "Privacy policy template for Essential Resourcing. Review before publication.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ name: "Privacy Policy", href: "/privacy-policy" }]}
      />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Legal</p>
          <h1>Privacy Policy</h1>
          <p className="lede">
            This page is structured and editable, but should be reviewed against
            the final form provider, analytics setup, consent management and data
            handling processes by a qualified adviser before launch.
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container legal-content">
          <p>
            Essential Resourcing collects the information you choose to submit
            through enquiry, candidate and job application forms.
          </p>
          <h2>Information collected</h2>
          <p>
            This may include your name, email address, phone number, company,
            LinkedIn URL, role brief, application note and message content.
          </p>
          <h2>How information is used</h2>
          <p>
            Information is used to respond to enquiries, discuss recruitment
            briefs, manage candidate conversations, handle job applications and
            improve the website.
          </p>
          <h2>CVs and sensitive documents</h2>
          <p>
            CV upload is not enabled in phase one. CVs should only be requested
            and handled through a secure, agreed process.
          </p>
          <h2>Candidate data</h2>
          <p>
            Candidate notes, job applications and future CV handling are covered
            in the{" "}
            <Link className="text-link" href={candidatePrivacyPath}>
              Candidate Privacy Notice
            </Link>
            . Candidate data must not be sent to Sanity or analytics.
          </p>
          <h2>Analytics and cookies</h2>
          <p>
            Analytics and marketing tools only load when environment variables
            are configured and the relevant consent choice has been accepted.
            Google Consent Mode V2 is used to communicate consent choices to
            Google tags where GA4 or GTM is enabled.
          </p>
          <h2>WhatsApp and third-party services</h2>
          <p>
            If you choose to message David through WhatsApp, the conversation
            opens in WhatsApp and is handled under WhatsApp&apos;s own terms and
            privacy policy as well as Essential Resourcing&apos;s normal contact
            process.
          </p>
          <h2>Legal review</h2>
          <p>
            This policy is not legal advice. It must be checked against the
            final live tools, providers, retention process and any candidate data
            handling requirements before launch.
          </p>
          <h2>Your rights</h2>
          <p>
            You can request access, correction or deletion of personal data by
            contacting Essential Resourcing.
          </p>
        </div>
      </section>
    </>
  );
}
