import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "David Walsh, Founder | Essential Resourcing",
  description:
    "Meet David Walsh, founder of Essential Resourcing and specialist recruiter for marketing, communications, agency and client-side leadership hiring.",
  path: "/about-david-walsh"
});

export default function AboutDavidPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "About David Walsh", href: "/about-david-walsh" }]} />
      <section className="section dark">
        <div className="container split">
          <div>
            <p className="eyebrow">David Walsh</p>
            <h1>Founder-led recruitment. Without the founder ego.</h1>
            <p className="lede">
              David brings over a decade of specialist recruitment judgement across agencies, brands, marketing teams,
              PR, communications, digital and senior leadership hiring.
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="/contact">
                Talk to David
              </Link>
            </div>
          </div>
          <div className="founder-photo-slot">
            <span>Founder-led</span>
            <strong>Human, direct, commercially sharp.</strong>
          </div>
        </div>
      </section>
      <section className="section surface">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Why he works differently</p>
            <h2>Good recruitment starts before the shortlist.</h2>
          </div>
          <div className="article-body">
            <section>
              <h3>Honest market advice</h3>
              <p>
                David challenges briefs where needed. That means talking plainly about salary, process, candidate
                availability and whether the market will actually buy what the client is selling.
              </p>
            </section>
            <section>
              <h3>Long-term candidate relationships</h3>
              <p>
                Candidates are treated like people, not inventory. No pointless CV sending. No pushing people into roles
                that are wrong for them.
              </p>
            </section>
            <section>
              <h3>Manchester perspective, UK reach</h3>
              <p>
                The business has a strong Manchester and North West point of view, but the work is not provincial. Senior
                marketing and comms hiring is UK-wide when the brief needs it.
              </p>
            </section>
          </div>
        </div>
      </section>
      <CTASection title="Want a straight view on a role?" text="Tell David what you are trying to hire and he will tell you honestly whether he can help." />
    </>
  );
}
