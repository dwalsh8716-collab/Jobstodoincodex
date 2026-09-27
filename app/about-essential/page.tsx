import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About Essential Resourcing | Marketing Recruitment Manchester",
  description:
    "Essential Resourcing is a founder-led marketing recruitment and leadership search specialist based in Manchester, working across the North West and UK.",
  path: "/about-essential",
});

export default function AboutEssentialPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ name: "About Essential", href: "/about-essential" }]}
      />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">About Essential</p>
          <h1>
            {
              "Specialist marketing recruitment. Without the usual recruitment noise."
            }
          </h1>
          <p className="lede">
            Essential Resourcing is a founder-led marketing recruitment and
            search business based in Manchester, working across the North West
            and UK.
          </p>
          <p className="lede">It was built around a fairly simple idea:</p>
          <p className="lede">
            <strong>Helping Businesses Make Better Hiring Decisions.</strong>
          </p>
          <p className="lede">
            That means getting clearer on what you actually need, reaching the
            right people and doing more than matching keywords on a CV.
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Positioning</p>
            <h2>
              Specialist enough to know the market. Human enough to have a
              proper conversation.
            </h2>
          </div>
          <div className="grid">
            {[
              "Founder-led from brief to hire",
              "Specialist experience across marketing, PR, communications, digital and agencies",
              "Agency-side and client-side market knowledge",
              "Permanent, retained and Fractional hiring",
              "Straight advice on the brief, salary, market and process",
              "Fewer CVs. Better conversations. Better hiring decisions.",
            ].map((item) => (
              <article className="card" key={item}>
                <h3>{item}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container split">
          <div className="founder-photo-slot founder-photo-image-card">
            <Image
              src="/assets/images/david-walsh-founder.jpg"
              alt="David Walsh, founder of Essential Resourcing and marketing recruitment specialist in Manchester"
              fill
              sizes="(max-width: 980px) 100vw, 48vw"
            />
          </div>
          <div>
            <p className="eyebrow">How it works</p>
            <h2>Fewer roles. Deeper work. More accountability.</h2>
            <p className="lede">
              Essential isn&apos;t trying to be everything to everyone.
            </p>
            <p className="lede">
              It&apos;s a specialist recruitment business built around marketing
              and the disciplines around it, with David directly involved in the
              work.
            </p>
            <p className="lede">
              That means properly understanding the problem behind the hire,
              challenging the bits that don&apos;t stack up and getting behind
              the CV before somebody reaches your interview room.
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="/clients">
                For clients
              </Link>
              <Link
                className="button button-secondary"
                href="/about-david-walsh"
              >
                About David
              </Link>
            </div>
          </div>
        </div>
      </section>
      <CTASection
        title="Need good people?"
        text="Tell David what you're trying to hire. He'll tell you honestly whether Essential can help."
      />
    </>
  );
}
