import Link from "next/link";
import { SpecialismRoutes } from "@/components/SpecialismRoutes";
import styles from "@/components/AudiencePages.module.css";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/Cards";
import { CandidateApplicationDrop } from "@/components/CandidateApplicationDrop";
import { SchemaScript } from "@/components/SchemaScript";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { isJobLive } from "@/lib/content";
import { candidatePrivacyPath } from "@/lib/candidate-trust";
import { getPublicJobs } from "@/lib/public-content";
import { createMetadata, itemListSchema } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Marketing, Digital & PR Jobs | Essential Resourcing",
  description:
    "Marketing, digital, PR, communications and agency opportunities with straight-talking, confidential recruitment support from David Walsh.",
  path: "/candidates",
});

export default async function CandidatesPage() {
  const jobs = await getPublicJobs();
  const liveJobs = jobs.filter((job) => isJobLive(job));
  const featuredJobs = liveJobs.slice(0, 3);

  return (
    <div className={`candidate-page ${styles.page}`}>
      <Breadcrumbs items={[{ name: "Candidates", href: "/candidates" }]} />

      <section className="section dark candidate-hero">
        <div className="container section-heading">
          <p className="eyebrow">For candidates</p>
          <h1>
            Looking for your next move?
            <br />
            Or just quietly curious?
          </h1>
          <div className={styles.candidateHeroCopy}>
          <p>
            Good roles. Honest advice. No recruitment nonsense.
          </p>
          <p className="lede">
            You don’t need to be desperately looking for another job to have a
            conversation with me.
          </p>
          <p className="lede">
            Maybe you’re actively looking. Maybe something doesn’t feel quite
            right where you are. Or maybe you’re perfectly happy but you’d still
            listen if the right thing came along.
          </p>
          <p className="lede">
            I recruit across marketing, digital, PR, communications and
            agencies, from specialist roles through to senior leadership.
          </p>
          <p className="lede">
            I’ll give you an honest view on the opportunity, salary and market.
            I won’t push you into something that isn’t right, and your details
            don’t go anywhere without you knowing about it.
          </p>
          <p className="lede">
            No hard sell. No CV flinging. Just a proper conversation.
          </p>
          </div>
          <div className="button-row hero-actions">
            <Link
              className="button button-primary"
              href="#current-opportunities"
            >
              See current roles
            </Link>
            <Link className="button button-secondary" href="#candidate-contact">
              Talk to David confidentially
            </Link>
            <WhatsAppButton
              intent="candidates"
              label="Message David on WhatsApp"
              location="candidate_hero"
              variant="text"
            />
          </div>
          <p className="candidate-credibility-line">
            Agency-side · Client-side · Permanent · Fractional ·
            Manchester-led · UK-wide
          </p>
        </div>
      </section>

      <section className="section surface" aria-labelledby="candidate-world">
        <div className="container split split-start">
          <div className="section-heading">
            <p className="eyebrow">What David recruits</p>
            <h2 id="candidate-world">
              Marketing, digital, PR and agency people.
            </h2>
          </div>
          <div>
            <p>That’s my world.</p>
            <p>I recruit specialist and senior people across:</p>
            <Link className="text-link" href="/specialisms">
              Explore Specialisms
            </Link>
          </div>
        </div>
        <div className="container"><SpecialismRoutes /></div>
      </section>

      <section
        className="section"
        id="current-opportunities"
        aria-labelledby="candidate-jobs"
      >
        <div className="container section-heading">
          <p className="eyebrow">Current opportunities</p>
          <h2 id="candidate-jobs">Current opportunities.</h2>
          <p className="lede">
            Only genuine, published live roles appear here.
          </p>
        </div>
        {featuredJobs.length ? (
          <>
            <div className="container grid grid-3">
              {featuredJobs.map((job) => (
                <JobCard key={job.slug} job={job} />
              ))}
            </div>
            <div className="container candidate-jobs-actions">
              <Link className="button button-secondary" href="/jobs">
                View all current roles
              </Link>
            </div>
          </>
        ) : (
          <div className={`container ${styles.empty}`}>
            <p className="eyebrow">Nothing right today?</p>
            <h3>
              Good roles don’t always appear at exactly the right moment.
            </h3>
            <p className="lede">
              And some senior opportunities never make it onto the website.
            </p>
            <p className="lede">
              If you’re quietly curious, send me your LinkedIn profile and a
              few lines about what would genuinely get your attention. No cover
              letter needed.
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="#candidate-contact">
                Send David a confidential note
              </Link>
              <WhatsAppButton
                intent="candidates"
                label="Quick WhatsApp to David"
                location="candidate_empty_state"
                variant="secondary"
              />
              <Link className="text-link" href="/jobs">
                View all current roles
              </Link>
            </div>
          </div>
        )}
      </section>

      <section
        className="section surface"
        id="candidate-contact"
        aria-labelledby="candidate-next-move"
      >
        <div className={`container ${styles.contactGrid}`}>
          <div className={styles.contactCopy}>
            <p className="eyebrow">Your next move</p>
            <h2 id="candidate-next-move">
              Actively looking. Quietly curious. Both are fine.
            </h2>
            <p className="lede">
              You don’t need to know exactly what you’re looking for.
            </p>
            <p className="lede">
              Tell me where you’re at and what would genuinely interest you.
            </p>
            <p className="lede">
              If I’ve got something relevant, brilliant. If I haven’t, I won’t
              invent one.
            </p>
            <p>
              A LinkedIn or profile URL and a few lines is enough to start.
              There’s no account, no long registration and no faff.
            </p>
            <p>
              Your details are handled under the{" "}
              <Link className="text-link" href={candidatePrivacyPath}>
                Candidate Privacy Notice
              </Link>
              .
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="#candidate-note">
                Talk to David confidentially
              </Link>
              <WhatsAppButton
                intent="candidates"
                label="Message David on WhatsApp"
                location="candidate_final_cta"
                variant="secondary"
              />
            </div>
            <div className={styles.trust}>
              <h3>What happens to your details?</h3>
              <ol>
                <li><strong>David reviews it</strong>Your note or CV goes directly to David for manual review.</li>
                <li><strong>It stays private</strong>Your identifiable CV or profile is not sent to a client without a proper conversation and the appropriate permission for that introduction.</li>
                <li><strong>No database nonsense</strong>You can ask for access, correction or deletion of your information, as explained in the <Link href={candidatePrivacyPath}>Candidate Privacy Notice</Link>.</li>
              </ol>
            </div>
          </div>
          <div id="candidate-note" className={styles.formPanel}>
            <p className="eyebrow">Private details</p>
            <h2>Send me enough to start the conversation.</h2>
            <p>A LinkedIn/profile URL, a few lines or a CV is enough. No account. No long registration. No faff.</p>
            <p>I’ll review it personally and get in touch if there’s something worth discussing.</p>
            <CandidateApplicationDrop type="candidate" />
          </div>
        </div>
      </section>

      <section className={`section ${styles.closing}`}>
        <div className="container">
          <p className="eyebrow">Not ready to send anything?</p>
          <h2>That’s fine too.</h2>
          <p>If you’re just quietly curious and want to ask a question first, message me.</p>
          <div className="button-row hero-actions">
            <WhatsAppButton intent="candidates" label="Message David on WhatsApp" location="candidate_closing" variant="primary" />
            <Link className="text-link" href="/contact">Talk to David confidentially</Link>
          </div>
        </div>
      </section>

      {liveJobs.length ? (
        <SchemaScript
          data={itemListSchema({
            name: "Essential Resourcing live candidate opportunities",
            description:
              "Visible live marketing, digital, PR, communications and agency opportunities handled by Essential Resourcing.",
            items: liveJobs.map((job) => ({
              name: job.title,
              url: `/jobs/${job.slug}`,
              description: job.summary,
            })),
          })}
        />
      ) : null}
    </div>
  );
}
