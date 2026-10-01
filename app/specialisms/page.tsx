import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { specialisms } from "@/lib/content";
import { createMetadata } from "@/lib/seo";
import { specialismEditorial } from "@/lib/specialism-editorial";
import styles from "@/components/SpecialismPage.module.css";

export const metadata = createMetadata({
  title: "Marketing, PR & Digital Specialisms | Essential",
  description:
    "Specialist recruitment across marketing, PR, communications, digital, performance, eCommerce and agency client services.",
  path: "/specialisms",
});

export default function SpecialismsPage() {
  return (
    <div className={styles.page}>
      <Breadcrumbs items={[{ name: "Specialisms", href: "/specialisms" }]} />
      <section className={`section dark ${styles.hero}`}>
        <div className={`container ${styles.hubHero}`}>
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
        <div className={`container ${styles.hubGrid}`}>
          {specialisms.map((specialism, index) => (
            <article className={styles.marketCard} key={specialism.slug}>
              <span className={styles.number} aria-hidden="true">
                0{index + 1}
              </span>
              <h2>{specialism.title}</h2>
              {specialismEditorial[specialism.slug].hub.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
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
      <section className="section" aria-labelledby="title-not-specialism">
        <div className={`container ${styles.editorial}`}>
          <div>
            <p className="eyebrow">The job title isn&apos;t the specialism</p>
            <h2 id="title-not-specialism">
              Same title. Completely different job.
            </h2>
          </div>
          <div className={styles.prose}>
            <p>
              A Marketing Director in a founder-led business can have a
              completely different brief from a Marketing Director inside a
              £500m organisation.
            </p>
            <p>
              An Account Director in a PR agency isn&apos;t doing the same job
              as an Account Director in a performance agency.
            </p>
            <p>
              And a Head of Digital might own everything from acquisition and
              CRM to eCommerce, or barely touch half of it.
            </p>
            <p>That&apos;s why I don&apos;t recruit from job titles alone.</p>
            <p>The useful question is:</p>
            <p>
              <strong>
                What does this person actually need to own, change or improve?
              </strong>
            </p>
          </div>
        </div>
      </section>
      <section className="section surface" aria-label="Clients and candidates">
        <div className="container">
          <div className={styles.audiences}>
            <div>
              <p className="eyebrow">For clients</p>
              <h2>Trying to work out who you actually need?</h2>
              <div className={styles.prose}>
                <p>Send me the brief, even if it&apos;s rough.</p>
                <p>
                  I&apos;ll tell you whether the role sits in my patch, whether
                  the level and salary stack up and which hiring route makes
                  sense.
                </p>
              </div>
              <Link className="text-link" href="/contact">
                Sense-check a brief
              </Link>
            </div>
            <div>
              <p className="eyebrow">For candidates</p>
              <h2>Not sure which box you fit into?</h2>
              <div className={styles.prose}>
                <p>Good. Most good careers don&apos;t fit neatly into one.</p>
                <p>
                  Send me your LinkedIn profile or have a look at the roles
                  I&apos;m working on.
                </p>
              </div>
              <div className="button-row">
                <Link className="text-link" href="/jobs">
                  View current roles
                </Link>
                <Link
                  className="text-link"
                  href="/candidates#candidate-contact"
                >
                  Send David your details
                </Link>
              </div>
            </div>
          </div>
          <div className={styles.bridge}>
            <p>
              I recruit across these markets through Permanent Recruitment,
              Retained Search and Fractional Leadership. And sometimes the first
              step is Market Intelligence &amp; Advisory before anybody recruits
              at all.
            </p>
            <Link className="text-link" href="/services">
              Explore the four hiring routes
            </Link>
          </div>
        </div>
      </section>
      <CTASection
        title="Can't see your exact job title?"
        text={
          "That's probably because there are about 400 different ways to name marketing jobs these days 😂\n\nTell me what the person actually needs to do and I'll tell you whether it's in my patch."
        }
        whatsAppIntent="hiring"
      />
    </div>
  );
}
