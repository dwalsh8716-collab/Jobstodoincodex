import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { specialisms } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Marketing, PR & Digital Specialisms | Essential",
  description:
    "Specialist recruitment across marketing, PR, communications, digital, performance, eCommerce and agency client services.",
  path: "/specialisms",
});

export default function SpecialismsPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Specialisms", href: "/specialisms" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Specialisms</p>
          <h1>
            Marketing, PR, digital and agency recruitment. That&apos;s the
            patch.
          </h1>
          <p className="lede">
            Job titles change constantly. The underlying question doesn&apos;t:
            what does this person actually need to be good at?
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
              <Link
                className="text-link"
                href={`/specialisms/${specialism.slug}`}
              >
                Explore {specialism.title}
              </Link>
            </article>
          ))}
        </div>
      </section>
      <CTASection
        title="Can't see your exact job title?"
        text="That's probably because there are about 400 different ways to name marketing jobs these days 😂 Send David the brief and he'll tell you whether it's in his patch."
      />
    </>
  );
}
