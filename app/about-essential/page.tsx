import Image from "next/image";
import Link from "next/link";
import styles from "@/components/AboutConversion.module.css";
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
    <div className={styles.page}>
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
            Essential Resourcing is a founder-led marketing recruitment, search
            and advisory business based in Manchester, working across the North West
            and UK.
          </p>
          <p className="lede">It was built around a fairly simple idea:</p>
          <p className={`lede ${styles.proposition}`}>
            <strong>Helping Businesses Make Better Hiring Decisions.</strong>
          </p>
          <p className="lede">
            That means getting clearer on what you actually need, reaching the
            right people and doing more than matching keywords on a CV.
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container">
          <div>
            <p className="eyebrow">Positioning</p>
            <h2>
              Specialist enough to know the market. Human enough to have a
              proper conversation.
            </h2>
          </div>
          <ol className={styles.positioning}>
            {[
              "Founder-led from brief to decision",
              "Specialist experience across marketing, PR, communications, digital and agencies",
              "Agency-side and client-side market knowledge",
              "Permanent Recruitment, Retained Search, Fractional Leadership and Market Intelligence & Advisory",
              "Straight advice on the brief, salary, market and process",
              "Fewer CVs. Better conversations. Better hiring decisions.",
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
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
              It&apos;s a specialist recruitment, search and advisory business built around marketing
              and the disciplines around it, with David directly involved in the
              work.
            </p>
            <p className="lede">
              That means properly understanding the problem behind the hire,
              challenging the bits that don&apos;t stack up and getting behind
              the evidence before somebody reaches your interview room.
            </p>
            <p>And sometimes it means telling you not to recruit yet.</p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="/clients">
                For clients
              </Link>
              <Link
                className="button button-secondary"
                href="/how-essential-resourcing-works"
              >
                See how Essential Resourcing works
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="section surface">
        <div className={`container ${styles.founderBridge}`}>
          <p className="eyebrow">Founder-led</p>
          <h2>Essential is the business. David is the person doing the work.</h2>
          <p>The brief isn’t handed to somebody you’ve never met once the call finishes.</p>
          <p>David stays involved in the market research, candidate conversations, feedback and eventual decision.</p>
          <Link className="text-link" href="/about-david-walsh">Meet David Walsh</Link>
        </div>
      </section>
      <CTASection
        title="Got a hiring problem you're trying to work out?"
        text="Tell David what you're trying to solve. He'll give you a straight view on whether Essential can help — and which route actually makes sense."
      />
    </div>
  );
}
