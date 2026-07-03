import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CandidateApplicationDrop } from "@/components/CandidateApplicationDrop";
import { FAQAccordion } from "@/components/FAQAccordion";
import { JobCard } from "@/components/Cards";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { candidateTrustQuestions } from "@/lib/candidate-transparency-content";
import {
  candidatePrivacyPath,
  candidateRetentionStatement,
} from "@/lib/candidate-trust";
import { isJobLive, jobs } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

const candidateFaqs = [
  {
    question: "Will my CV be sent anywhere without permission?",
    answer:
      "No. Essential does not do pointless CV sending or push candidates into wrong roles.",
  },
  {
    question: "Can I have a confidential conversation?",
    answer:
      "Yes. If you are senior, visible in your market or not actively looking, the conversation can stay confidential.",
  },
  {
    question: "Why is there no CV upload?",
    answer:
      "Because CVs should be handled properly. Send a LinkedIn URL or short note first; if a CV is useful, David will ask for it directly.",
  },
];

const candidateNextStepsPreview = [
  {
    title: "Send a short note",
    copy: "A LinkedIn/profile URL and a few useful lines is enough. No cover-letter theatre.",
  },
  {
    title: "David checks relevance",
    copy: "If there is a sensible role or market conversation, he will come back to you directly.",
  },
  {
    title: "Nothing goes anywhere without permission",
    copy: "Your details are not fired around the market or added to a noisy mailing list.",
  },
];

export const metadata = createMetadata({
  title: "Marketing, PR & Digital Careers | Essential Resourcing",
  description:
    "Honest candidate support for senior marketing, PR, communications and digital roles. No pointless CV sending.",
  path: "/candidates",
});

export default function CandidatesPage() {
  const liveJobs = jobs.filter((job) => isJobLive(job));

  return (
    <>
      <Breadcrumbs items={[{ name: "Candidates", href: "/candidates" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">For candidates</p>
          <h1>Good roles. Honest advice. No recruitment nonsense.</h1>
          <p className="lede">
            If the right role is not live today, you can still get honest
            salary/process advice and a proper conversation without your CV
            being fired around the market.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-primary" href="/jobs">
              View live roles
            </Link>
            <Link className="button button-secondary" href="#candidate-contact">
              Send a note
            </Link>
            <Link
              className="button button-secondary"
              href={candidatePrivacyPath}
            >
              Candidate privacy
            </Link>
            <WhatsAppButton
              intent="candidates"
              label="Message David on WhatsApp"
              location="candidate_hero"
              variant="secondary"
            />
          </div>
        </div>
      </section>
      <section className="section surface">
        <div className="container grid grid-3">
          {[
            "No pointless CV sending",
            "No pushing people into wrong roles",
            "Proper advice on salary, market and process",
          ].map((item) => (
            <article className="card" key={item}>
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="container section-heading">
          <p className="eyebrow">Candidate transparency</p>
          <h2>You should not have to guess.</h2>
          <p className="lede">
            A decent candidate process answers the practical questions before
            you waste time on a role that was never right.
          </p>
        </div>
        <div className="container grid grid-3">
          {candidateTrustQuestions.slice(0, 9).map((question) => (
            <article className="card" key={question}>
              <h3>{question}</h3>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="container section-heading">
          <p className="eyebrow">Current roles</p>
          <h2>
            {liveJobs.length
              ? "Live roles."
              : "No live roles published right now."}
          </h2>
          <p className="lede">
            Draft and closed roles stay out of this list. If the right role is
            sensitive or not public, use the confidential route.
          </p>
        </div>
        {liveJobs.length ? (
          <div className="container grid grid-3">
            {liveJobs.map((job) => (
              <JobCard key={job.slug} job={job} />
            ))}
          </div>
        ) : (
          <div className="container empty-state">
            <p className="eyebrow">Confidential route</p>
            <h2>No live roles are published today.</h2>
            <p className="lede">
              Good senior roles are not always public. Send a short note or
              LinkedIn URL and David can tell you whether there is a sensible
              conversation to have.
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="#candidate-contact">
                Send a confidential note
              </Link>
              <WhatsAppButton
                intent="candidates"
                label="Quick WhatsApp to David"
                location="candidate_empty_state"
                variant="secondary"
              />
            </div>
          </div>
        )}
      </section>
      <section className="section surface">
        <div className="container section-heading">
          <p className="eyebrow">What happens next</p>
          <h2>Simple, private and not over-engineered.</h2>
          <p className="lede">
            The candidate route is deliberately light because good people do not
            need another portal to remember.
          </p>
        </div>
        <div className="container grid grid-3">
          {candidateNextStepsPreview.map((step) => (
            <article className="card" key={step.title}>
              <span className="tag">Candidate route</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section muted" id="candidate-contact">
        <div className="container split">
          <div>
            <p className="eyebrow">Confidential note</p>
            <h2>Send your details without the nonsense.</h2>
            <p className="lede">
              Add a note and LinkedIn URL. If a CV is useful, David will ask for
              it directly and handle it properly.
            </p>
            <p className="form-note">{candidateRetentionStatement}</p>
            <WhatsAppButton
              intent="candidates"
              label="Quick WhatsApp to David"
              location="candidate_contact"
              variant="secondary"
            />
          </div>
          <CandidateApplicationDrop type="candidate" />
        </div>
      </section>
      <FAQAccordion faqs={candidateFaqs} />
    </>
  );
}
