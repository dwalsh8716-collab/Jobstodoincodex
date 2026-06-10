import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  candidateNextSteps,
  candidatePrivacyPath,
  candidateRetentionStatement,
} from "@/lib/candidate-trust";
import { dataSubjectRequestPath } from "@/lib/dsar";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Candidate Privacy Notice | Essential Resourcing",
  description:
    "Plain-English candidate privacy notice for Essential Resourcing. Explains how candidate notes, applications and CVs are handled.",
  path: candidatePrivacyPath,
});

export default function CandidatePrivacyPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Candidate Privacy Notice", href: candidatePrivacyPath },
        ]}
      />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Candidate privacy</p>
          <h1>Your details should be handled properly.</h1>
          <p className="lede">
            This notice explains what happens when you send David a note, ask
            about a role or apply through Essential Resourcing.
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container legal-content">
          <p>
            Essential Resourcing is a founder-led recruitment business run by
            David Walsh. If you share candidate details, they are used for
            recruitment conversations and relevant opportunities, not for
            pointless CV flinging.
          </p>

          <h2>What may be collected</h2>
          <p>
            You may choose to share your name, email address, phone number,
            LinkedIn URL, current role context, application note, message
            content and, later, a CV if David asks for it through an approved
            secure route.
          </p>

          <h2>Why it is collected</h2>
          <p>
            Candidate data is used to reply to you, review fit for a role,
            discuss relevant opportunities, manage applications and keep a
            basic record of candidate conversations.
          </p>

          <h2>Who may receive it</h2>
          <p>
            David handles candidate conversations directly. Your details should
            not be sent to a client or third party without a genuine recruitment
            reason and your permission.
          </p>

          <h2>What happens after you apply</h2>
          <ol>
            {candidateNextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>
            No black hole. No nonsense. If it looks relevant, David will come
            back to you. This does not promise a reply to every speculative
            note or application.
          </p>

          <h2>CVs and private files</h2>
          <p>
            CV upload is not enabled on the public website until secure private
            storage, signed admin-only access, retention rules and deletion
            handling are approved. Do not use public links or public upload
            folders for CVs.
          </p>

          <h2>How long details may be kept</h2>
          <p>{candidateRetentionStatement}</p>

          <h2>Deletion, export and withdrawal</h2>
          <p>
            To ask for a copy of your details, withdraw consent or request
            deletion, use the{" "}
            <Link className="text-link" href={dataSubjectRequestPath}>
              candidate data request form
            </Link>
            . If the form cannot be used, email{" "}
            <Link className="text-link" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </Link>
            . You can also ask David directly on WhatsApp if that is the route
            you used.
          </p>
          <WhatsAppButton
            intent="candidates"
            label="Message David on WhatsApp"
            location="candidate_privacy"
            variant="secondary"
          />

          <h2>WhatsApp acknowledgements</h2>
          <p>
            If you choose WhatsApp as your preferred contact method, Essential
            Resourcing may send a short transactional acknowledgement through
            the official WhatsApp Business setup. It should not be used for
            marketing broadcasts without separate approval.
          </p>

          <h2>Legal review</h2>
          <p>
            This is clear launch wording, not legal advice. It must be checked
            against the final live database, email provider, storage provider,
            retention policy and client-sharing process before full launch.
          </p>
        </div>
      </section>
    </>
  );
}
