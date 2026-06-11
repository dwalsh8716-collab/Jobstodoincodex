import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CandidateApplicationDrop } from "@/components/CandidateApplicationDrop";
import { CandidateProcessTimeline } from "@/components/CandidateProcessTimeline";
import { SchemaScript } from "@/components/SchemaScript";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  candidateNextSteps,
  candidatePrivacyPath,
} from "@/lib/candidate-trust";
import { isJobClosed, isJobLive } from "@/lib/content";
import { getPublicJob, getPublicJobs } from "@/lib/public-content";
import { createMetadata, jobPostingSchema } from "@/lib/seo";
import { candidateJobWhatsAppMessage } from "@/lib/whatsapp";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const jobs = await getPublicJobs();
  return jobs
    .filter((job) => job.status !== "draft")
    .map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const job = await getPublicJob(slug);
  if (!job || job.status === "draft") return {};
  const closed = isJobClosed(job);
  return createMetadata({
    title: closed
      ? `${job.title} - Role Closed | Essential Resourcing`
      : job.seoTitle,
    description: job.metaDescription,
    path: `/jobs/${job.slug}`,
    noIndex: closed || job.noIndex,
  });
}

export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const job = await getPublicJob(slug);
  if (!job || job.status === "draft") notFound();
  const live = isJobLive(job);
  const closed = isJobClosed(job);
  const jobs = await getPublicJobs();
  const relatedLiveJobs = jobs
    .filter((item) => item.slug !== job.slug && isJobLive(item))
    .slice(0, 3);
  const jobWhatsAppMessage = candidateJobWhatsAppMessage({
    jobTitle: job.title,
    jobSlug: job.slug,
  });

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Jobs", href: "/jobs" },
          { name: job.title, href: `/jobs/${job.slug}` },
        ]}
      />
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">{live ? "Live role" : "Role closed"}</p>
          <h1>{job.title}</h1>
          <p className="lede">{job.summary}</p>
          <p className="meta">
            {job.salaryRange} · {job.location} · {job.workingPattern} ·{" "}
            {job.roleType}
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container grid grid-3">
          <article className="card">
            <span className="tag">Salary / rate</span>
            <h2>{job.salaryRange}</h2>
            <p>{job.salaryTransparencyNote}</p>
            <p className="meta">Status: {job.salaryStatus}</p>
          </article>
          <article className="card">
            <span className="tag">Working pattern</span>
            <h2>{job.workingPattern}</h2>
            <p>{job.hybridPattern}</p>
            <p className="meta">{job.locationExpectation}</p>
          </article>
          {job.quickQuestionEnabled ? (
            <article className="card">
              <span className="tag">Quick question</span>
              <h2>Got a quick question before applying?</h2>
              <p>{job.quickQuestionRoute}</p>
              {job.whatsappQuestionEnabled ? (
                <WhatsAppButton
                  intent="jobs"
                  label="Message David on WhatsApp"
                  location="job_detail_transparency"
                  jobSlug={job.slug}
                  message={jobWhatsAppMessage}
                  variant="secondary"
                />
              ) : null}
              <p className="form-note">
                Prefer email? Use the short application note below. A quick call
                can be booked if it is useful.
              </p>
              <Link className="text-link" href="/book-a-call">
                Book a quick call
              </Link>
            </article>
          ) : null}
        </div>
      </section>
      {closed ? (
        <section className="section surface">
          <div className="container empty-state">
            <p className="eyebrow">Closed role</p>
            <h2>This role is not open for applications.</h2>
            <p className="lede">
              It is kept here only so old links do not mislead people. For
              current roles, use the jobs page or send a confidential note.
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="/jobs">
                View live roles
              </Link>
              <Link className="button button-secondary" href="/candidates">
                Send a confidential note
              </Link>
              <WhatsAppButton
                intent="candidates"
                label="Message David on WhatsApp"
                location="closed_job_detail"
                jobSlug={job.slug}
                variant="secondary"
              />
            </div>
          </div>
        </section>
      ) : null}
      <section className="section surface">
        <div className="container split split-start">
          <article className="article-body">
            <section>
              <h2>Why the role exists</h2>
              <p>{job.whyRoleExists}</p>
            </section>
            {job.davidsTake.length ? (
              <section>
                <h2>David&apos;s Take</h2>
                {job.davidsTake.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ) : null}
            <section>
              <h2>Role shape</h2>
              <p>
                {job.seniority} · {job.agencyOrClientSide} ·{" "}
                {job.officeLocation}
              </p>
              <p>
                Remote possible: {job.remotePossible}. Interview process:{" "}
                {job.interviewProcessConfirmed}.
              </p>
            </section>
            <section>
              <h2>Overview</h2>
              {job.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
            <section>
              <h2>Responsibilities</h2>
              {job.responsibilities.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </section>
            <section>
              <h2>Must-haves</h2>
              {job.mustHaves.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </section>
            <section>
              <h2>Useful extras</h2>
              {job.niceToHaves.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </section>
            {job.whatGoodLooksLike.length ? (
              <section>
                <h2>What good looks like</h2>
                {job.whatGoodLooksLike.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </section>
            ) : null}
            <section>
              <h2>Requirements</h2>
              {job.requirements.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </section>
            <section>
              <h2>Benefits</h2>
              {job.benefits.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </section>
            <section>
              <CandidateProcessTimeline
                processConfirmed={job.interviewProcessConfirmed}
                overview={job.processOverview}
                steps={
                  job.processSteps.length
                    ? job.processSteps
                    : job.interviewSteps
                }
                expectedTimeline={job.expectedTimeline}
                taskRequired={job.taskRequired}
                presentationRequired={job.presentationRequired}
                firstStageFormat={job.firstStageFormat}
                finalStageFormat={job.finalStageFormat}
                feedbackExpectation={job.feedbackExpectation}
                applicationReviewTimeframe={job.applicationReviewTimeframe}
              />
            </section>
            {job.applicationNotes ? (
              <section>
                <h2>Application notes</h2>
                <p>{job.applicationNotes}</p>
              </section>
            ) : null}
            <section>
              <h2>How your data is handled</h2>
              <p>{job.candidatePrivacyNote}</p>
              <Link className="text-link" href={candidatePrivacyPath}>
                Candidate Privacy Notice
              </Link>
            </section>
          </article>
          <aside className="grid">
            {live ? (
              <>
                <div className="card">
                  <span className="tag">Apply</span>
                  <h2>{job.applicationCta.label}</h2>
                  <p>
                    Applications are handled by David directly at{" "}
                    {job.applicationEmail}.
                  </p>
                  <div className="mini-process">
                    <h3>What happens next?</h3>
                    <ol>
                      {(job.applicationProcess.length
                        ? job.applicationProcess
                        : candidateNextSteps
                      ).map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    <Link className="text-link" href={candidatePrivacyPath}>
                      Candidate Privacy Notice
                    </Link>
                  </div>
                </div>
                <CandidateApplicationDrop
                  type="job"
                  jobTitle={job.title}
                  jobSlug={job.slug}
                />
              </>
            ) : (
              <div className="card">
                <span className="tag">No applications</span>
                <h2>Applications are closed.</h2>
                <p>
                  David will not invite applications for a role that is no
                  longer live.
                </p>
                <Link className="text-link" href="/candidates">
                  Send a confidential note
                </Link>
              </div>
            )}
            {relatedLiveJobs.length ? (
              <div className="card">
                <span className="tag">Other live roles</span>
                <div className="grid">
                  {relatedLiveJobs.map((item) => (
                    <Link
                      className="text-link"
                      href={`/jobs/${item.slug}`}
                      key={item.slug}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
      {live ? <SchemaScript data={jobPostingSchema(job)} /> : null}
    </>
  );
}
