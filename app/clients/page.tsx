import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ServiceCard } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { services } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "For Clients | Senior Marketing Hiring | Essential Resourcing",
  description:
    "Senior marketing, PR, comms and digital hiring support for agencies, brands and growth businesses that need commercial judgement.",
  path: "/clients"
});

export default function ClientsPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Clients", href: "/clients" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">For clients</p>
          <h1>Marketing and comms hiring that actually moves the business forward.</h1>
          <p className="lede">
            When the next senior hire has consequences, the brief needs sharper thinking than another pile of CVs.
            Essential keeps the work focused on the person who can solve the problem.
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container split split-start">
          <div>
            <h2>What a sharper search gives you.</h2>
            <p className="lede">
              A sharper brief, honest challenge, stronger candidate engagement and a shortlist that is worth your time.
            </p>
          </div>
          <div className="statement-list">
            <p>Strong candidates require good positioning, salary, process and timing</p>
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
      <CTASection title="Talk through a brief" ctaLabel="Talk through a brief" />
    </>
  );
}
