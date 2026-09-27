import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  candidatePrivacyPath,
  candidateRetentionStatement,
} from "@/lib/candidate-trust";
import { dataSubjectRequestPath } from "@/lib/dsar";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Candidate Privacy Notice | Essential Resourcing",
  description:
    "How Essential Resourcing handles candidate information, applications, recruitment conversations and CVs.",
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
            This notice explains what happens when you contact David about a
            role, send your details or apply through Essential Resourcing.
          </p>
          <p className="form-note">Last reviewed: 22 September 2026.</p>
        </div>
      </section>

      <section className="section surface">
        <div className="container legal-content">
          <h2>Who is responsible for your information?</h2>
          <p>
            Essential Resourcing, operated by David Walsh, is the data
            controller for candidate information handled through its recruitment
            services.
          </p>
          <p>
            David handles candidate conversations directly. Your information is
            there to support genuine recruitment work, not to be fired around
            the market hoping somebody bites.
          </p>

          <h2>What information may be collected?</h2>
          <ul>
            <li>Your name, email address and optional phone number.</li>
            <li>
              Your LinkedIn profile, portfolio or other professional profile.
            </li>
            <li>
              Your CV, work history, skills, qualifications, salary information,
              availability and location preferences.
            </li>
            <li>
              Application details, recruitment conversations, interview
              feedback, references and notes relevant to a role.
            </li>
            <li>
              Your contact preferences and records showing the privacy choices
              or permissions you have given.
            </li>
          </ul>
          <p>
            Please do not include passwords, bank details or unnecessary health,
            diversity or other sensitive information in a CV or website message.
            If sensitive information is genuinely needed, David will explain why
            and how it will be handled.
          </p>

          <h2>Where might it come from?</h2>
          <p>
            Most candidate information comes from you. David may also identify
            or receive relevant professional information from:
          </p>
          <ul>
            <li>LinkedIn, professional profiles and company websites.</li>
            <li>Job boards and recruitment platforms.</li>
            <li>Clients, referees and professional introductions.</li>
            <li>Publicly available portfolios, articles or event profiles.</li>
          </ul>
          <p>
            If David approaches you using professional information obtained
            elsewhere, you will be given access to this notice at the
            appropriate time.
          </p>

          <h2>Why is it used?</h2>
          <p>Candidate information may be used to:</p>
          <ul>
            <li>Respond to you and understand what you are looking for.</li>
            <li>Assess whether a particular role may be relevant.</li>
            <li>Discuss opportunities, salary and the market with you.</li>
            <li>Manage applications, interviews, feedback and offers.</li>
            <li>
              Make an agreed introduction and provide appropriate information to
              a client.
            </li>
            <li>
              Keep accurate recruitment, consent and legally required records.
            </li>
            <li>
              Keep you in mind for relevant future opportunities where there is
              an appropriate basis to do so.
            </li>
          </ul>

          <h2>The lawful bases used</h2>
          <p>
            Essential Resourcing normally relies on legitimate interests to run
            a relevant professional recruitment service, respond to candidates
            and maintain proportionate records. It may also rely on steps taken
            at your request before a contract, performance of a contract, legal
            obligations or consent where a choice is genuinely optional.
          </p>
          <p>
            Agreeing to receive a WhatsApp reply or asking David to keep you in
            mind is separate from signing up to marketing. Essential Resourcing
            does not treat either choice as permission for broadcast marketing.
          </p>

          <h2>Sharing information with clients</h2>
          <p>
            Your identifiable CV or profile will not be sent to a client without
            a proper conversation and the appropriate permission for that
            introduction.
          </p>
          <p>
            Where an introduction goes ahead, a client may receive information
            relevant to assessing you for the role, such as your CV, experience,
            salary expectations, availability and David&apos;s recruitment
            notes. The client becomes responsible for its own use of that
            information.
          </p>

          <h2>CVs and private files</h2>
          <p>
            CVs submitted through the website are stored in approved private
            storage and delivered privately to David. They are not put in the
            public website, Sanity, GitHub or analytics.
          </p>
          <p>
            Uploaded files are checked for permitted format, file signature and
            size. David manually reviews candidate files before any client use.
          </p>

          <h2>Service providers</h2>
          <p>
            Candidate information may be processed using Railway for website
            hosting and private file storage, Resend and Google Workspace for
            email, Google Calendar for bookings, and WhatsApp where you choose
            that contact route. These providers act under their own terms and,
            where applicable, data-processing arrangements.
          </p>
          <p>
            Some providers may process information outside the UK. Where this is
            a restricted transfer, an applicable adequacy regulation or approved
            safeguard must be used.
          </p>

          <h2>How long is information kept?</h2>
          <p>{candidateRetentionStatement}</p>
          <p>
            Certain employment-agency records must be kept for at least 12
            months. A deletion request may therefore be limited where a record
            still has to be retained by law or is reasonably needed for a legal
            claim.
          </p>

          <h2>Automated decisions</h2>
          <p>
            Technology may help David search, organise or review professional
            information. Essential Resourcing does not use solely automated
            decision-making to decide whether you are introduced, interviewed or
            hired.
          </p>

          <h2>Your rights</h2>
          <p>
            Depending on the circumstances, you may ask for access, correction,
            deletion, restriction or portability of your information, object to
            processing based on legitimate interests, or withdraw consent where
            consent is being relied on.
          </p>
          <p>
            Use the{" "}
            <Link className="text-link" href={dataSubjectRequestPath}>
              candidate data request form
            </Link>
            , or email{" "}
            <Link className="text-link" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </Link>
            . Identity may need to be checked before private information is
            released, changed or deleted.
          </p>

          <h2>Questions or complaints</h2>
          <p>
            Contact David first and he will try to sort it properly. You can
            also complain to the{" "}
            <Link
              className="text-link"
              href="https://ico.org.uk/make-a-complaint/"
              rel="noreferrer"
              target="_blank"
            >
              Information Commissioner&apos;s Office
            </Link>
            .
          </p>
          <WhatsAppButton
            intent="candidates"
            label="Message David on WhatsApp"
            location="candidate_privacy"
            variant="secondary"
          />

          <h2>Full website privacy information</h2>
          <p>
            The{" "}
            <Link className="text-link" href="/privacy-policy">
              Privacy Policy
            </Link>{" "}
            explains website analytics, general enquiries, security and other
            service providers in more detail.
          </p>
        </div>
      </section>
    </>
  );
}
