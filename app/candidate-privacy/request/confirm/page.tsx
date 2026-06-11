import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DataSubjectRequestConfirmForm } from "@/components/DataSubjectRequestConfirmForm";
import {
  candidatePrivacyPath,
  candidateRetentionStatement,
} from "@/lib/candidate-trust";
import { dataSubjectRequestPath } from "@/lib/dsar";
import { dataSubjectRequestVerificationPath } from "@/lib/dsar-verification";
import { createMetadata } from "@/lib/seo";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = createMetadata({
  title: "Confirm Data Request | Essential Resourcing",
  description:
    "Confirm the email address used for an Essential Resourcing candidate data request.",
  path: dataSubjectRequestVerificationPath,
  noIndex: true,
});

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DataSubjectRequestConfirmPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const token = stringParam(params?.token);

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Candidate Privacy Notice", href: candidatePrivacyPath },
          { name: "Data Request", href: dataSubjectRequestPath },
          { name: "Confirm Email", href: dataSubjectRequestVerificationPath },
        ]}
      />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Candidate data request</p>
          <h1>Confirm your email.</h1>
          <p className="lede">
            This step checks that the request came from the email address used
            on the form. David still reviews the request before any data is
            released, changed or deleted.
          </p>
        </div>
      </section>

      <section className="section surface">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Careful by design</p>
            <h2>No public lookup. No automatic deletion.</h2>
            <p className="lede">
              Confirming your email moves the request into review. It does not
              prove identity by itself and it does not trigger any automated
              data action.
            </p>
            <div className="mini-process">
              <h3>What stays protected</h3>
              <ol>
                <li>
                  The site does not say whether your email is in the database.
                </li>
                <li>Exports need verification before anything is shared.</li>
                <li>Deletion or anonymisation needs admin review first.</li>
              </ol>
            </div>
            <p className="form-note">{candidateRetentionStatement}</p>
          </div>
          <DataSubjectRequestConfirmForm token={token} />
        </div>
      </section>
    </>
  );
}
