import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { LinkedInProfileLink } from "@/components/LinkedInProfileLink";
import { SchemaScript } from "@/components/SchemaScript";
import { createMetadata, profilePageSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "David Walsh | Founder of Essential Resourcing",
  description:
    "Meet David Walsh, founder of Essential Resourcing. More than a decade in marketing, PR, digital and agency recruitment. Manchester-based, UK-wide.",
  path: "/about-david-walsh",
});

export default function AboutDavidPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ name: "About David Walsh", href: "/about-david-walsh" }]}
      />
      <section className="section dark">
        <div className="container split">
          <div>
            <p className="eyebrow">David Walsh</p>
            <h1>
              Meet David Walsh. Recruiter, founder and the person actually doing
              the work.
            </h1>
            <p className="lede">
              David has more than a decade of specialist recruitment experience
              across marketing, digital, PR, communications and agencies. He started
              recruiting in 2013 and went independent in 2017; Essential Resourcing Ltd was incorporated in
              2019 — the paperwork caught up later.
            </p>
            <p className="lede">
              Based in Manchester, he works across the North West and takes on
              specialist and senior marketing searches across the UK.
            </p>
            <p className="lede">
              He&apos;s spent those years talking to thousands of candidates and
              businesses, seeing what good hires look like, what bad ones cost
              and why recruitment processes so often make life harder than they
              need to.
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="/contact">
                Talk to David
              </Link>
              <LinkedInProfileLink
                label="Connect with David on LinkedIn"
                location="about_page"
                variant="secondary"
              />
            </div>
          </div>
          <div className="founder-photo-slot founder-photo-image-card">
            <Image
              src="/assets/images/david-walsh-founder.jpg"
              alt="David Walsh, founder of Essential Resourcing and marketing recruitment specialist in Manchester"
              fill
              sizes="(max-width: 980px) 100vw, 48vw"
              priority
            />
          </div>
        </div>
      </section>
      <section className="section surface">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Why he works differently</p>
            <h2>
              The CV is the start of the conversation, not the hiring decision.
            </h2>
          </div>
          <div className="article-body">
            <section>
              <p>
                Getting a list of people whose LinkedIn profiles contain the
                right keywords is becoming easier by the day.
              </p>
              <p>The valuable bit is working out who&apos;s genuinely good.</p>
              <p>
                What did they actually achieve? What was their contribution? Why
                did it work? What happened when things went wrong? What kind of
                business will get the best out of them?
              </p>
              <p>That&apos;s the bit David enjoys.</p>
              <p>
                <Link
                  className="text-link"
                  href="/how-essential-resourcing-works"
                >
                  See how David recruits
                </Link>
              </p>
            </section>
            <section>
              <h3>Honest market advice</h3>
              <p>
                If the salary is wrong, the brief doesn&apos;t make sense or the
                process is likely to lose good people, David will tell you.
              </p>
              <p>
                Not because being difficult is the point. Because finding out
                six weeks later helps nobody.
              </p>
            </section>
            <section>
              <h3>Long-term candidate relationships</h3>
              <p>Good recruitment is a people business.</p>
              <p>
                Candidates aren&apos;t inventory and relationships don&apos;t
                begin when a vacancy lands. David has spent years building a
                network across marketing and agencies, often knowing people
                through several moves in their careers.
              </p>
            </section>
            <section>
              <h3>Manchester roots. UK-wide reach.</h3>
              <p>
                David is based in Manchester and has particularly deep roots
                across the North West marketing and agency market.
              </p>
              <p>But the work isn&apos;t limited by the M60.</p>
              <p>
                Essential supports senior and specialist hiring across the UK
                when the brief and market call for it.
              </p>
            </section>
            <section>
              <h3>A bit about the human behind it</h3>
              <p>
                David&apos;s a dad, a retired rugby player, an old-school raver
                at heart and somebody who&apos;d still rather have a proper
                conversation over a coffee than hide behind another automated
                sequence.
              </p>
              <p>
                He loves technology and AI when it makes recruitment better.
              </p>
              <p>He just doesn&apos;t think it replaces knowing people.</p>
            </section>
          </div>
        </div>
      </section>
      <nav className="section surface" aria-label="Explore Essential Resourcing">
        <div className="container article-body">
          <p>
            See <Link href="/">Essential Resourcing</Link>, explore the{" "}
            <Link href="/services">services</Link> and{" "}
            <Link href="/specialisms">specialisms</Link>, or read David&apos;s{" "}
            <Link href="/insights">hiring insights</Link>. If you&apos;ve got a
            role to discuss, <Link href="/clients">see how Essential works with clients</Link>{" "}
            or <Link href="/contact">talk to David</Link>.
          </p>
        </div>
      </nav>
      <CTASection
        title="Want a straight view on a role?"
        text="Tell David what you're trying to hire and he'll tell you honestly whether he can help."
      />
      <SchemaScript data={profilePageSchema()} />
    </>
  );
}
