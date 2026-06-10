import Image from "next/image";
import Link from "next/link";
import { CaseStudyCard, InsightCard, ServiceCard } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { RichMediaBlock } from "@/components/RichMedia";
import { analyticsAttributes } from "@/lib/analytics";
import { imageSizes } from "@/lib/images";
import { caseStudies, homepageFeatureVideo, insights, proofPoints, richMediaExamples, services, specialisms, whyEssential } from "@/lib/content";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: siteConfig.defaultTitle,
  description: siteConfig.defaultDescription
});

export default function HomePage() {
  const coreServices = services.filter((service) =>
    ["leadership-search", "strategic-interim", "senior-recruitment"].includes(service.slug)
  );
  const featuredInsights = insights.slice(0, 3);
  const featuredCases = caseStudies
    .filter((caseStudy) => caseStudy.status === "published" && caseStudy.featured)
    .slice(0, 3);

  return (
    <>
      <section className="hero dark">
        <div className="container split">
          <div className="hero-copy">
            <p className="eyebrow">Manchester-led. UK-wide. Founder-led.</p>
            <h1 aria-label="Hire good people. No faff. No d!ckheads.">
              <span aria-hidden="true">Hire good</span>{" "}
              <span aria-hidden="true">people.</span>{" "}
              <span aria-hidden="true">No faff.</span>{" "}
              <span aria-hidden="true">No d!ckheads.</span>
            </h1>
            <p className="lede">
              Straight-talking search and recruitment for marketing, communications and agency leadership across
              Manchester, the North West and beyond.
            </p>
            <p className="hero-reassurance">Direct with David. Confidential when needed. No CVs sent without context.</p>
            <div className="button-row hero-actions">
              <Link
                className="button button-primary"
                href="/contact"
                {...analyticsAttributes("cta_click", {
                  label: "I'm hiring",
                  href: "/contact",
                  location: "home hero",
                })}
              >
                I&apos;m hiring
              </Link>
              <Link
                className="button button-secondary"
                href="/candidates"
                {...analyticsAttributes("cta_click", {
                  label: "I'm looking for work",
                  href: "/candidates",
                  location: "home hero",
                })}
              >
                I&apos;m looking for work
              </Link>
              <Link className="text-link" href="/services/strategic-interim">
                Explore Strategic Interim
              </Link>
            </div>
            <dl className="hero-proof">
              <div>
                <dt>10+</dt>
                <dd>years in the market</dd>
              </div>
              <div>
                <dt>Senior</dt>
                <dd>marketing, PR, digital and comms</dd>
              </div>
              <div>
                <dt>UK-wide</dt>
                <dd>with Manchester judgement</dd>
              </div>
            </dl>
          </div>
          <div className="hero-visual">
            <Image
              src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=85"
              alt="A sharp modern workspace used as an editorial recruitment image"
              width={1200}
              height={900}
              sizes={imageSizes.hero}
              priority
            />
            <Image
              className="hero-mark"
              src={siteConfig.iconLight}
              alt=""
              width={789}
              height={689}
              sizes={imageSizes.mark}
              aria-hidden
            />
            <div className="hero-card primary">
              <span>Fewer roles.</span>
              <strong>Deeper work.</strong>
            </div>
            <div className="hero-card secondary">
              <span>No CV flinging.</span>
              <strong>Hires that stick.</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-strip" aria-label="Essential Resourcing proof points">
        {proofPoints.map((point) => (
          <p key={point}>{point}</p>
        ))}
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <p className="eyebrow">Founder video</p>
            <h2>A quick word before you brief the market.</h2>
            <p className="lede">
              The useful bit usually sits behind the job title: growth pressure, founder overload, a team that needs
              direction, or a market that will not buy a vague brief. Start there and the hiring gets sharper.
            </p>
            <div className="button-row hero-actions">
              <Link
                className="button button-primary"
                href="/contact"
                {...analyticsAttributes("cta_click", {
                  label: "Sense-check a brief",
                  href: "/contact",
                  location: "founder video",
                })}
              >
                Sense-check a brief
              </Link>
              <Link className="text-link" href="/services/strategic-interim">
                Explore Strategic Interim
              </Link>
            </div>
          </div>
          <RichMediaBlock media={homepageFeatureVideo} />
        </div>
      </section>

      <section className="section surface">
        <div className="container section-heading">
          <p className="eyebrow">What we do</p>
          <h2>Senior marketing and comms hiring, done properly.</h2>
          <p className="lede">
            Essential Resourcing helps agencies, brands and growth businesses hire marketing and communications people
            who actually move the business forward.
          </p>
        </div>
        <div className="container grid grid-3">
          {coreServices.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Who we work with</p>
            <h2>For businesses where the next hire has consequences.</h2>
          </div>
          <div className="grid">
            {[
              {
                title: "Agencies",
                text:
                  "For independent, integrated, PR, digital, creative and performance agencies that need people who can handle clients, teams and commercial pressure."
              },
              {
                title: "Brands",
                text:
                  "For in-house marketing teams hiring senior marketers, comms leaders, digital specialists and growth talent."
              },
              {
                title: "Growth Businesses",
                text: "For businesses where the next marketing hire needs to make a measurable commercial difference."
              }
            ].map((audience) => (
              <article className="card" key={audience.title}>
                <h3>{audience.title}</h3>
                <p>{audience.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="container split">
          <div>
            <p className="eyebrow">Why Essential</p>
            <h2>Recruitment should reduce risk, not create noise.</h2>
            <p className="lede">
              Good senior candidates are rarely sitting there waiting to apply. They need the right brief, the right
              timing, and someone who can talk to them like a grown-up.
            </p>
          </div>
          <div className="statement-list">
            {whyEssential.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="section surface">
        <div className="container split">
          <div className="founder-photo-slot">
            <span>Founder-led</span>
            <strong>Direct with David, not a hand-off.</strong>
          </div>
          <div>
            <p className="eyebrow">About David Walsh</p>
            <h2>Founder-led recruitment. Without the founder ego.</h2>
            <p className="lede">
              I’m David Walsh, founder of Essential Resourcing. I’ve spent over a decade helping agencies, brands and
              marketing teams hire properly. That usually means being honest about the brief, the salary, the process
              and whether the market will actually buy what you’re selling.
            </p>
            <p className="lede">
              No CV flinging. No recruitment theatre. Just straight advice and good people.
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-dark" href="/about-david-walsh">
                About David
              </Link>
              <Link className="text-link" href="/contact">
                Talk to David
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container section-heading">
          <p className="eyebrow">Case studies</p>
          <h2>Specific proof beats anonymous waffle.</h2>
          <p className="lede">
            Case studies are only published when the outcome, quote and client permission are solid enough to stand up.
          </p>
        </div>
        {featuredCases.length ? (
          <div className="container grid grid-3">
            {featuredCases.map((caseStudy) => (
              <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
            ))}
          </div>
        ) : (
          <div className="container grid grid-3">
            {[
              ["Permission first", "Named proof, logos and quotes only go live when permission is clear."],
              ["Outcome-led", "A useful case study explains context, constraints, approach and commercial impact."],
              ["No theatre", "Until proof is verified, the site talks about the working method rather than pretending."]
            ].map(([title, text]) => (
              <article className="card proof-card" key={title}>
                <span className="tag">Proof standard</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section surface">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Insights and salary snapshots</p>
            <h2>Built for SEO, AI discovery and proper first-party expertise.</h2>
            <p className="lede">
              Every article is crawlable, structured and authored. Salary snapshots use semantic tables, not flat images.
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="/insights">
                View insights
              </Link>
              <Link className="button button-secondary" href="/salary-snapshots">
                View salary snapshots
              </Link>
            </div>
          </div>
          <div className="grid">
            {featuredInsights.map((insight) => (
              <InsightCard key={insight.slug} insight={insight} />
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="container split">
          <div>
            <p className="eyebrow">Strategic Interim</p>
            <h2>Senior brains in the business. Without another full-time salary.</h2>
            <p className="lede">
              Strategic Interim is for founders, MDs and marketing leaders who need experienced senior support, but do
              not necessarily need another full-time hire.
            </p>
            <ul className="statement-list">
              <li>When the team needs senior direction</li>
              <li>When the founder is still carrying too much</li>
              <li>When hiring full-time feels too expensive or too early</li>
              <li>When the business needs execution, not another slide deck</li>
            </ul>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="/services/strategic-interim">
                Explore Strategic Interim
              </Link>
            </div>
          </div>
          <RichMediaBlock media={richMediaExamples[0]} />
        </div>
      </section>

      <section className="section surface">
        <div className="container section-heading">
          <p className="eyebrow">Specialisms</p>
          <h2>Not a boring list of functions.</h2>
          <p className="lede">Each hiring area is framed around context, judgement and commercial consequence.</p>
        </div>
        <div className="container grid grid-4">
          {specialisms.map((specialism) => (
            <article className="card" key={specialism.title}>
              <h3>{specialism.title}</h3>
              <p>{specialism.description}</p>
            </article>
          ))}
        </div>
      </section>

      <CTASection
        title="Need good marketing, PR or digital people?"
        text="Give me a shout before it becomes a hiring headache."
        ctaLabel="Talk to David"
      />
    </>
  );
}
