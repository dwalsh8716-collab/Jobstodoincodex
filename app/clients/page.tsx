import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ServiceCard } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { services } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "For Clients | Senior Marketing Hiring | Essential Resourcing",
  description:
    "Senior marketing, PR, comms and digital hiring support for agencies, brands and growth businesses that need commercial judgement.",
  path: "/clients",
});

export default function ClientsPage() {
  const clientNextSteps = [
    {
      title: "Send the useful context",
      copy: "Role title, why it matters, salary reality, timing and what has already been tried.",
    },
    {
      title: "David sense-checks it",
      copy: "If the brief, market, process or salary needs challenging, you hear that before the search starts.",
    },
    {
      title: "Choose the right route",
      copy: "Retained search, Strategic Interim, senior recruitment or a straight answer that this is not one for Essential.",
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ name: "Clients", href: "/clients" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">For clients</p>
          <h1>
            Marketing and comms hiring that actually moves the business forward.
          </h1>
          <p className="lede">
            When the next senior hire has consequences, the brief needs sharper
            thinking than another pile of CVs. Essential keeps the work focused
            on the person who can solve the problem.
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container split split-start">
          <div>
            <h2>What a sharper search gives you.</h2>
            <p className="lede">
              A sharper brief, honest challenge, stronger candidate engagement
              and a shortlist that is worth your time.
            </p>
          </div>
          <div className="statement-list">
            <p>
              Strong candidates require good positioning, salary, process and
              timing
            </p>
            <p>The best people are not sitting waiting on job boards</p>
            <p>Recruitment should reduce risk, not create noise</p>
            <p>Senior hires need judgement, not CV volume</p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container section-heading">
          <p className="eyebrow">Relevant services</p>
          <h2>Choose the route that fits the brief.</h2>
        </div>
        <div className="container grid grid-3">
          {services.slice(0, 4).map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>
      <section className="section muted">
        <div className="container section-heading">
          <p className="eyebrow">What happens next</p>
          <h2>
            A senior brief should feel calmer after the first conversation.
          </h2>
          <p className="lede">
            No sales sequence. No pretending every role needs a search. The
            first job is to work out what the business actually needs.
          </p>
        </div>
        <div className="container grid grid-3">
          {clientNextSteps.map((step) => (
            <article className="card" key={step.title}>
              <span className="tag">Next step</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>
      <CTASection
        title="Talk through a brief"
        ctaLabel="Talk through a brief"
        showBooking
        bookingLabel="Book a hiring health check"
      />
    </>
  );
}
