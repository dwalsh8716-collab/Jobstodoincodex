import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { specialisms } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Marketing & Comms Specialisms | Essential Resourcing",
  description:
    "Specialist recruitment across marketing leadership, PR, communications, digital, performance, content, client services, growth and agency operations.",
  path: "/specialisms"
});

export default function SpecialismsPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Specialisms", href: "/specialisms" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Specialisms</p>
          <h1>Marketing and communications roles, grouped by judgement rather than job-board noise.</h1>
          <p className="lede">
            Titles vary across agencies and client-side teams. The important question is what the hire needs to change.
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container grid grid-3">
          {specialisms.map((specialism) => (
            <article className="card lift-card" key={specialism.title}>
              <span className="tag">Specialism</span>
              <h2>{specialism.title}</h2>
              <p>{specialism.description}</p>
              <Link className="text-link" href="/contact">
                Discuss this area
              </Link>
            </article>
          ))}
        </div>
      </section>
      <CTASection title="Not sure where your role fits?" text="Send the brief. David will help sharpen the role before it goes to market." />
    </>
  );
}
