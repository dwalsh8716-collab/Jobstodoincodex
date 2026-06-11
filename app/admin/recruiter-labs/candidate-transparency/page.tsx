import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CMS_SESSION_COOKIE,
  getCmsSessionUsername,
  isCmsSessionValid,
} from "@/lib/cms-auth";
import {
  candidateTransparencyScorecardCriteria,
  getCandidateTransparencyScorecardOverview,
  type CandidateTransparencyScorecardReadiness,
} from "@/lib/candidate-transparency-scorecard";
import { logAuditEvent } from "@/lib/operations/audit";
import { getPublicJobs } from "@/lib/public-content";
import { createMetadata } from "@/lib/seo";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Candidate Transparency Scorecard | Private Recruiter Labs",
    description:
      "Private candidate transparency readiness checker for Essential Resourcing job adverts.",
    path: "/admin/recruiter-labs/candidate-transparency",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

const readinessCopy = {
  green: "Ready",
  amber: "Needs improvement",
  red: "Not candidate-ready",
} as const;

function readinessClass(readiness: CandidateTransparencyScorecardReadiness) {
  if (readiness === "green") return styles.labsFlagOn;
  if (readiness === "red") return `${styles.labsRisk} ${styles.labsRiskHigh}`;
  return styles.labsRisk;
}

export default async function CandidateTransparencyScorecardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) {
    redirect("/cms?next=/admin/recruiter-labs/candidate-transparency");
  }

  const username = await getCmsSessionUsername(sessionCookie);
  const jobs = await getPublicJobs();
  const overview = getCandidateTransparencyScorecardOverview(jobs);

  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "candidate_transparency_scorecard_viewed",
    entityType: "candidate_transparency_scorecard",
    entityLabel: "Candidate transparency scorecard",
    metadata: {
      totalJobs: overview.stats.totalJobs,
      greenJobs: overview.stats.greenJobs,
      amberJobs: overview.stats.amberJobs,
      redJobs: overview.stats.redJobs,
      featureFlagEnabled: overview.flag.enabled,
      publicExposure: overview.safeForPublicExposure,
    },
  });

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private Recruiter Labs</p>
          <h1>Candidate transparency scorecard.</h1>
          <p className="lede">
            A private check for vague jobs before they go live. Salary, hybrid,
            process, privacy and plain-English quality all have to stand up.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-secondary" href="/admin">
              Admin overview
            </Link>
            <Link
              className="button button-secondary"
              href="/admin/recruiter-labs"
            >
              Recruiter Labs
            </Link>
            <Link className="button button-secondary" href="/jobs">
              Public jobs
            </Link>
          </div>
        </div>

        <div className={styles.adminStatus}>
          <span
            className={
              overview.flag.enabled ? styles.labsFlagOn : styles.labsFlagOff
            }
          >
            {overview.flag.enabled ? "Gate flag on" : "Gate flag off"}
          </span>
          <div>
            <h2>
              {overview.productionGateActive
                ? "Private scorecard can be used as a publishing gate."
                : "Private scorecard is advisory. Publishing gate is not active."}
            </h2>
            <p>
              The route is CMS-gated and noindexed. Nothing here is public, and
              the score is not a candidate-facing promise.
            </p>
          </div>
          <div className={styles.adminStatusActions}>
            <Link className="button button-secondary" href="/candidate-privacy">
              Candidate privacy
            </Link>
          </div>
        </div>

        <div
          className={styles.adminGrid}
          aria-label="Candidate transparency scorecard totals"
        >
          <div className={styles.adminStat}>
            <span>Jobs checked</span>
            <strong>{overview.stats.totalJobs}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Ready</span>
            <strong>{overview.stats.greenJobs}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Needs work</span>
            <strong>{overview.stats.amberJobs}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Blocked</span>
            <strong>{overview.stats.redJobs}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Criteria</span>
            <strong>{overview.stats.criteria}</strong>
          </div>
        </div>

        <div className={styles.adminPanels}>
          <section className={styles.adminPanel}>
            <p className="eyebrow">Readiness rule</p>
            <h2>Do not publish vague jobs.</h2>
            <ul className={styles.adminChecklist}>
              <li>Green means the advert is candidate-ready.</li>
              <li>
                Amber means improve it before treating the score as a gate.
              </li>
              <li>Red means do not publish as a live candidate-ready role.</li>
              <li>AI assistance remains future-only and David-reviewed.</li>
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Scope</p>
            <h2>Private only.</h2>
            <ul className={styles.adminChecklist}>
              <li>No public score badge.</li>
              <li>No candidate ranking.</li>
              <li>No automated AI judgement.</li>
              <li>No private candidate data in Sanity or analytics.</li>
            </ul>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Job readiness</p>
                <h2>Current advert checks.</h2>
              </div>
              <span className={styles.labsRisk}>
                {overview.flag.name}=false by default
              </span>
            </div>
            <div className={styles.labsRoadmap}>
              {overview.scorecards.map((scorecard) => (
                <article className={styles.labsCard} key={scorecard.job.slug}>
                  <div className={styles.labsCardHeader}>
                    <div>
                      <p className="eyebrow">{scorecard.job.status}</p>
                      <h3>{scorecard.job.title}</h3>
                      <p className="meta">/{scorecard.job.slug}</p>
                    </div>
                    <span className={readinessClass(scorecard.readiness)}>
                      {scorecard.readinessLabel}
                    </span>
                  </div>
                  <dl className={styles.labsMetaGrid}>
                    <div>
                      <dt>Score</dt>
                      <dd>{scorecard.score}%</dd>
                    </div>
                    <div>
                      <dt>Green</dt>
                      <dd>{scorecard.counts.green}</dd>
                    </div>
                    <div>
                      <dt>Amber</dt>
                      <dd>{scorecard.counts.amber}</dd>
                    </div>
                    <div>
                      <dt>Red</dt>
                      <dd>{scorecard.counts.red}</dd>
                    </div>
                  </dl>
                  {scorecard.issueIds.length ? (
                    <p className="form-note">
                      Open issues: {scorecard.issueIds.join(", ")}
                    </p>
                  ) : (
                    <p className="form-note">
                      No candidate transparency issues found.
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Criteria</p>
                <h2>Fields checked before publishing.</h2>
              </div>
              <span className={styles.labsFlagOff}>Internal quality gate</span>
            </div>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Criterion</th>
                    <th>Fields checked</th>
                  </tr>
                </thead>
                <tbody>
                  {candidateTransparencyScorecardCriteria.map((criterion) => (
                    <tr key={criterion.id}>
                      <td>{criterion.label}</td>
                      <td>{criterion.checkedFields.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Detailed results</p>
                <h2>What to fix.</h2>
              </div>
            </div>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Criterion</th>
                    <th>Status</th>
                    <th>Evidence</th>
                    <th>Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.scorecards.flatMap((scorecard) =>
                    scorecard.criteria.map((criterion) => (
                      <tr key={`${scorecard.job.slug}-${criterion.id}`}>
                        <td>{scorecard.job.title}</td>
                        <td>{criterion.label}</td>
                        <td>
                          <span className={readinessClass(criterion.status)}>
                            {readinessCopy[criterion.status]}
                          </span>
                        </td>
                        <td>{criterion.evidence}</td>
                        <td>
                          {criterion.issueIds.length
                            ? criterion.issueIds.join(", ")
                            : "None"}
                        </td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
