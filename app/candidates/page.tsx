import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { FAQAccordion } from "@/components/FAQAccordion";
import { JobCard } from "@/components/Cards";
import { jobs } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

const candidateFaqs = [
  {
    question: "Will my CV be sent anywhere without permission?",
    answer: "No. Essential does not do pointless CV sending or push candidates into wrong roles."
  },
  {
    question: "Can I have a confidential conversation?",
    answer:
      "Yes. If you are senior, visible in your market or not actively looking, the conversation can stay confidential."
  },
  {
    question: "Why is there no CV upload?",
    answer:
      "Because CVs should be handled properly. Send a LinkedIn URL or short note first; if a CV is useful, David will ask for it directly."
  }
];

export const metadata = createMetadata({
  title: "Marketing, PR & Digital Careers | Essential Resourcing",
  description:
    "Honest candidate support for senior marketing, PR, communications and digital roles. No pointless CV sending.",
  path: "/candidates"
});

export default function CandidatesPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Candidates", href: "/candidates" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">For candidates</p>
          <h1>Good roles. Honest advice. No recruitment nonsense.</h1>
          <p className="lede">
            If the right role is not live today, you can still get honest salary/process advice and a proper
            conversation without your CV being fired around the market.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-primary" href="/jobs">
              View live roles
            </Link>
            <Link className="button button-secondary" href="#candidate-contact">
              Send a note
            </Link>
          </div>
        </div>
      </section>
      <section className="section surface">
        <div className="container grid grid-3">
          {["No pointless CV sending", "No pushing people into wrong roles", "Proper advice on salary, market and process"].map((item) => (
            <article className="card" key={item}>
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="container section-heading">
          <p className="eyebrow">Current roles</p>
          <h2>Live and draft roles.</h2>
          <p className="lede">Draft roles are clearly marked and are not presented as open vacancies.</p>
        </div>
        <div className="container grid grid-3">
          {jobs.map((job) => (
            <JobCard key={job.slug} job={job} />
          ))}
        </div>
      </section>
      <section className="section muted" id="candidate-contact">
        <div className="container split">
          <div>
          <p className="eyebrow">Confidential note</p>
          <h2>Send your details without the nonsense.</h2>
          <p className="lede">
              Add a note and LinkedIn URL. If a CV is useful, David will ask for it directly and handle it properly.
          </p>
          </div>
          <ContactForm type="candidate" />
        </div>
      </section>
      <FAQAccordion faqs={candidateFaqs} />
    </>
  );
}
