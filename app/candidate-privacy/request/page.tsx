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
    "Request access to, correction of or deletion of candidate information held by Essential Resourcing.",
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
          <h1>Ask to access, correct or delete your information.</h1>
          <p className="lede">
            Use this form if you want Essential Resourcing to review personal
            information it may hold about you.
          </p>
          <p className="lede">
            Requests are reviewed by a human. Information isn&apos;t automatically
            displayed, exported or deleted through the public website.
          </p>
        </div>
      </section>

      <section className="section surface">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">What happens next</p>
            <h2>Private and properly checked.</h2>
            <p className="lede">
              David will review the request and respond using the contact
              details you provide.
            </p>
            <p className="lede">
              Identity may need to be verified before information is released,
              changed or deleted.
            </p>
            <div className="mini-process">
              <h3>Important safeguards</h3>
              <ol>
                <li>
                  The form won&apos;t confirm publicly whether your email address
                  exists in Essential&apos;s records.
                </li>
                <li>
                  Private information won&apos;t be released without appropriate
                  identity checks.
                </li>
                <li>
                  Deletion requests are reviewed before records are changed.
                </li>
                <li>
                  Some information may need to be retained where there is a
                  lawful reason to do so.
                </li>
              </ol>
            </div>
            <p className="form-note">
              If you can&apos;t use the form, email{" "}
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
