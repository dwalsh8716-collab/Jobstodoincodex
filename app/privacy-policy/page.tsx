import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { candidatePrivacyPath } from "@/lib/candidate-trust";
import { dataSubjectRequestPath } from "@/lib/dsar";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Privacy Policy | Essential Resourcing",
  description:
    "How Essential Resourcing collects, uses, shares and protects personal information through its website and recruitment services.",
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
          <p className="eyebrow">Privacy</p>
          <h1>Privacy Policy</h1>
          <p className="lede">
            Privacy policies are rarely anybody&apos;s favourite read. This one
            explains, as plainly as possible, what Essential Resourcing
            collects, why it is needed and what control you have over it.
          </p>
          <p className="form-note">Last reviewed: 22 September 2026.</p>
        </div>
      </section>

      <section className="section surface">
        <div className="container legal-content">
          <h2>Who is responsible for your information?</h2>
          <p>
            Essential Resourcing, operated by David Walsh, is the data
            controller for personal information handled through this website and
            the recruitment services described here.
          </p>
          <p>
            For privacy questions, complaints or rights requests, email{" "}
            <Link className="text-link" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </Link>
            . Candidates can also use the{" "}
            <Link className="text-link" href={dataSubjectRequestPath}>
              candidate data request form
            </Link>
            .
          </p>

          <h2>What information may be collected?</h2>
          <p>
            The information depends on why you contact Essential Resourcing.
          </p>
          <ul>
            <li>
              Contact details such as your name, email address, phone number and
              preferred contact method.
            </li>
            <li>
              Professional information such as your employer, role, LinkedIn or
              portfolio URL, employment history, salary expectations and CV.
            </li>
            <li>
              Client information such as company details, hiring requirements,
              role briefs and messages you choose to send.
            </li>
            <li>
              Recruitment records such as conversations, applications, interview
              feedback, introductions and placement information.
            </li>
            <li>
              Technical information needed to keep the website secure and, where
              you consent, understand how the website is used.
            </li>
          </ul>
          <p>
            Please do not send passwords, bank details or unnecessary sensitive
            information through a website form.
          </p>

          <h2>Where does the information come from?</h2>
          <p>
            Most information comes directly from you. It may also come from:
          </p>
          <ul>
            <li>Clients discussing a role or recruitment process.</li>
            <li>
              Public professional sources such as LinkedIn, company websites and
              published portfolios.
            </li>
            <li>
              Job boards, professional networks, referrals or people who
              recommend an introduction.
            </li>
            <li>
              Service providers used to operate the website, forms, email,
              bookings and analytics.
            </li>
          </ul>
          <p>
            Where information is obtained from somewhere other than you,
            Essential Resourcing will provide appropriate privacy information
            when required.
          </p>

          <h2>Why is it used?</h2>
          <p>Personal information may be used to:</p>
          <ul>
            <li>Reply to enquiries and arrange conversations.</li>
            <li>Understand and manage client recruitment requirements.</li>
            <li>
              Discuss roles and provide recruitment services to candidates.
            </li>
            <li>
              Assess suitability and manage applications or introductions.
            </li>
            <li>Keep accurate recruitment, consent and compliance records.</li>
            <li>Operate, secure and improve the website.</li>
            <li>
              Deal with privacy requests, complaints and legal obligations.
            </li>
          </ul>

          <h2>The lawful bases used</h2>
          <p>
            Data protection law requires a lawful basis for each use. Depending
            on the circumstances, Essential Resourcing relies on:
          </p>
          <ul>
            <li>
              <strong>Legitimate interests</strong> to provide a relevant,
              properly run recruitment service, maintain professional records,
              protect the website and respond to business enquiries, where those
              interests are not overridden by your rights.
            </li>
            <li>
              <strong>
                Steps before a contract or performance of a contract
              </strong>{" "}
              where you ask Essential Resourcing to provide recruitment or
              hiring services.
            </li>
            <li>
              <strong>Legal obligations</strong> where records or action are
              required by recruitment, tax, data protection or other applicable
              law.
            </li>
            <li>
              <strong>Consent</strong> for genuinely optional activities, such
              as non-essential analytics, marketing or keeping a candidate in
              mind where consent is the basis being used. Consent can be
              withdrawn at any time.
            </li>
          </ul>

          <h2>Candidate information</h2>
          <p>
            Candidate applications, CVs, introductions and recruitment
            conversations are explained in more detail in the{" "}
            <Link className="text-link" href={candidatePrivacyPath}>
              Candidate Privacy Notice
            </Link>
            .
          </p>
          <p>
            Candidate information is not sent to a client simply because it is
            sitting in a database. David will discuss a relevant opportunity and
            obtain the appropriate permission before making an identifiable
            introduction.
          </p>

          <h2>Who may receive information?</h2>
          <p>Information may be shared with:</p>
          <ul>
            <li>
              Clients and prospective employers where there is a genuine
              recruitment purpose and the appropriate candidate permission.
            </li>
            <li>
              Hosting, private file storage, email, calendar, analytics and
              other technology providers used to run the service.
            </li>
            <li>
              Professional advisers, insurers, regulators, courts or public
              authorities where reasonably necessary or legally required.
            </li>
          </ul>
          <p>
            Essential Resourcing does not sell personal information or hand it
            to unrelated businesses for their own marketing.
          </p>

          <h2>Current service providers</h2>
          <p>
            The website and recruitment workflow currently use providers that
            may include Railway for hosting and private CV storage, Resend for
            email delivery, Google Workspace and Google Calendar, Google
            Analytics where consent is given, Sanity for public website content,
            and WhatsApp where you choose to use it.
          </p>
          <p>
            Sanity is used for public website content and must not be used to
            store private candidate CVs, application messages or recruitment
            notes.
          </p>

          <h2>International processing</h2>
          <p>
            Some technology providers may process information outside the UK.
            Where UK data protection law treats this as a restricted transfer,
            Essential Resourcing will rely on an applicable adequacy regulation
            or approved contractual and organisational safeguards.
          </p>

          <h2>How long is information kept?</h2>
          <p>
            Information is kept only while there is a genuine business,
            recruitment or legal reason for it.
          </p>
          <ul>
            <li>
              Candidate records are reviewed no later than 24 months after the
              last meaningful contact, unless the relationship remains active,
              you ask to stay in touch or a legal reason requires longer.
            </li>
            <li>
              Certain recruitment-agency records must be retained for at least
              12 months under applicable conduct regulations.
            </li>
            <li>
              Client, contractual, financial and compliance records may be kept
              for longer where required for legal, tax or dispute purposes.
            </li>
            <li>
              Privacy request and complaint records are retained for as long as
              reasonably needed to show that the matter was handled properly.
            </li>
          </ul>
          <p>
            Information that is no longer needed should be deleted or anonymised
            securely.
          </p>

          <h2>Security</h2>
          <p>
            Reasonable technical and organisational measures are used to protect
            information. CVs use approved private storage and delivery routes;
            they are not placed in the public website, analytics or Sanity.
          </p>
          <p>
            No internet service is completely risk-free, but access is limited
            and the amount of information collected is kept proportionate to the
            job being done.
          </p>

          <h2>Analytics, cookies and external services</h2>
          <p>
            Google Analytics only loads after analytics consent. Advertising or
            retargeting tags are not currently active. More detail is available
            in the{" "}
            <Link className="text-link" href="/cookie-policy">
              Cookie Policy
            </Link>
            .
          </p>
          <p>
            If you use LinkedIn, WhatsApp or Google&apos;s booking interface,
            those services also process information under their own privacy
            terms.
          </p>

          <h2>Automated decisions</h2>
          <p>
            Essential Resourcing does not use solely automated decision-making
            to decide whether a candidate is introduced, interviewed or hired.
            Technology may help organise or search information. David&apos;s
            judgement remains involved in recruitment decisions made by
            Essential Resourcing.
          </p>

          <h2>Your rights</h2>
          <p>Depending on the circumstances, you may have the right to:</p>
          <ul>
            <li>Ask for a copy of your personal information.</li>
            <li>Correct inaccurate or incomplete information.</li>
            <li>Ask for information to be deleted or restricted.</li>
            <li>Object to processing based on legitimate interests.</li>
            <li>Receive eligible information in a portable format.</li>
            <li>Withdraw consent where processing relies on consent.</li>
          </ul>
          <p>
            Rights are not absolute, and a request may be limited where the law
            permits or requires information to be retained. Identity may need to
            be checked before private information is released or changed.
          </p>

          <h2>Complaints</h2>
          <p>
            Please contact David first so the issue can be understood and put
            right where possible. You also have the right to complain to the{" "}
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

          <h2>Changes to this policy</h2>
          <p>
            This policy will be reviewed when the website, recruitment workflow
            or service providers change materially. The review date at the top
            will be updated when that happens.
          </p>
        </div>
      </section>
    </>
  );
}
