import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DataSubjectRequestForm } from "@/components/DataSubjectRequestForm";
import { candidatePrivacyPath } from "@/lib/candidate-trust";
import { dataSubjectRequestPath } from "@/lib/dsar";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Candidate Data Request | Essential Resourcing",
  description:
    "Ask Essential Resourcing for a copy, correction, deletion or review of candidate data. Identity checks may be required.",
  path: dataSubjectRequestPath,
});

export default function CandidatePrivacyRequestPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Candidate Privacy Notice", href: candidatePrivacyPath },
          { name: "Data Request", href: dataSubjectRequestPath },
        ]}
      />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Candidate data request</p>
          <h1>Ask for a copy, correction or deletion.</h1>
          <p className="lede">
            Use this route if you want David to review personal data Essential
            Resourcing may hold about you. It is deliberately careful: no public
            lookup, no automatic export, no one-click deletion.
          </p>
        </div>
      </section>

      <section className="section surface">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">What happens next</p>
            <h2>Clear, private and reviewed by a human.</h2>
            <p className="lede">
              If the details match records held by Essential Resourcing, David
              will review the request and respond using the contact details you
              provide.
            </p>
            <div className="mini-process">
              <h3>Important safeguards</h3>
              <ol>
                <li>
                  If email confirmation is available, you will be asked to
                  confirm the request from your inbox.
                </li>
                <li>
                  Identity may need to be verified before data is released.
                </li>
                <li>
                  Deletion requests are reviewed before records are changed.
                </li>
                <li>
                  Some records may need to be retained where there is a lawful
                  reason. This is not legal advice.
                </li>
              </ol>
            </div>
            <p className="form-note">
              If the form cannot be used, email{" "}
              <Link className="text-link" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </Link>
              .
            </p>
          </div>
          <DataSubjectRequestForm />
        </div>
      </section>
    </>
  );
}
