import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About Essential Resourcing | Senior Marketing & Comms Recruitment",
  description:
    "Essential Resourcing is a founder-led specialist recruitment and search business for marketing, communications, digital and agency/client-side hiring.",
  path: "/about-essential"
});

export default function AboutEssentialPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "About Essential", href: "/about-essential" }]} />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">About Essential</p>
          <h1>A specialist recruitment and search business for marketing, communications, digital and agency hiring.</h1>
          <p className="lede">
            Founder-led, Manchester-rooted and UK-wide. Built for clients who want proper judgement, not recruitment
            noise.
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Positioning</p>
            <h2>Senior enough for the boardroom. Human enough for a real conversation.</h2>
          </div>
          <div className="grid">
            {[
              "Founder-led judgement without turning the business into a personality act",
              "Genuine agency and communications credibility",
              "Client-side marketing recruitment with commercial context",
              "Straight-talking advice on salary, brief, market and process",
              "No CV flinging. No recruitment theatre."
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
          <div className="founder-photo-slot">
            <span>Brand principle</span>
            <strong>Robust company. Human judgement.</strong>
          </div>
          <div>
            <p className="eyebrow">How it works</p>
            <h2>Essential is built around fewer roles, deeper work.</h2>
            <p className="lede">
              The business is not trying to look like a general recruiter. It is built as a serious, founder-led
              specialist for senior marketing, comms and agency leadership hiring.
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="/clients">
                For clients
              </Link>
              <Link className="button button-secondary" href="/about-david-walsh">
                About David
              </Link>
            </div>
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
