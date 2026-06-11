import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ServiceCard } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { SchemaScript } from "@/components/SchemaScript";
import { getPublicServices } from "@/lib/public-content";
import { createMetadata, itemListSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Recruitment Services | Essential Resourcing",
  description:
    "Leadership search, strategic interim, agency recruitment, client-side marketing recruitment and senior recruitment services.",
  path: "/services",
});

export default async function ServicesPage() {
  const services = await getPublicServices();

  return (
    <>
      <Breadcrumbs items={[{ name: "Services", href: "/services" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Services</p>
          <h1>Marketing and comms hiring where the brief actually matters.</h1>
          <p className="lede">
            Clear service routes for senior hiring, retained search, strategic
            interim, agency recruitment and client-side marketing roles.
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container grid grid-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>
      <section className="section muted">
        <div className="container split">
          <div>
            <p className="eyebrow">How to choose</p>
            <h2>If everything is a service, nothing is a proposition.</h2>
          </div>
          <div className="grid">
            <article className="card">
              <h3>Use Leadership Search</h3>
              <p>
                When the role is senior, sensitive, retained, hard to fill or
                commercially important.
              </p>
            </article>
            <article className="card">
              <h3>Use Strategic Interim</h3>
              <p>
                When you need senior brains in the business without another
                full-time salary.
              </p>
            </article>
            <article className="card">
              <h3>Use Agency Recruitment</h3>
              <p>
                When the hire needs agency pace, client maturity, commercial
                sense and cultural fit.
              </p>
            </article>
            <article className="card">
              <h3>Use Client-side Marketing Recruitment</h3>
              <p>
                When the hire needs to connect demand, performance, brand and
                wider business growth.
              </p>
            </article>
            <article className="card">
              <h3>Use Senior Recruitment</h3>
              <p>
                When the role is specialist or mid-to-senior and quality matters
                more than CV volume.
              </p>
            </article>
          </div>
        </div>
      </section>
      <CTASection />
      <SchemaScript
        data={itemListSchema({
          name: "Essential Resourcing services",
          description:
            "Visible recruitment services for senior marketing, communications, digital and agency hiring.",
          items: services.map((service) => ({
            name: service.title,
            url: `/services/${service.slug}`,
            description: service.shortDescription,
          })),
        })}
      />
    </>
  );
}
