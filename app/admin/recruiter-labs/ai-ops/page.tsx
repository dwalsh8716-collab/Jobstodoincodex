import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CMS_SESSION_COOKIE,
  getCmsSessionUsername,
  isCmsSessionValid,
} from "@/lib/cms-auth";
import { logAuditEvent } from "@/lib/operations/audit";
import {
  type RecruiterLabsAiLaunchGateStatus,
  getRecruiterLabsAiOverview,
} from "@/lib/recruiter-labs-ai";
import { createMetadata } from "@/lib/seo";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Recruiter Labs AI Ops | Private Admin",
    description:
      "Private admin-only AI governance foundation for Recruiter Labs operational drafting. No automated candidate evaluation.",
    path: "/admin/recruiter-labs/ai-ops",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

const governanceStatusLabel = {
  passed: "Passed",
  blocked: "Blocked",
  manual_review: "Manual review",
} as const;

function launchGateStatusClass(status: RecruiterLabsAiLaunchGateStatus) {
  if (status === "passed") return styles.labsFlagOn;
  if (status === "blocked") return `${styles.labsRisk} ${styles.labsRiskHigh}`;
  return styles.labsRisk;
}

export default async function RecruiterLabsAiOpsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) redirect("/cms?next=/admin/recruiter-labs/ai-ops");

  const username = await getCmsSessionUsername(sessionCookie);
  const overview = getRecruiterLabsAiOverview();

  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "recruiter_labs_dashboard_viewed",
    entityType: "recruiter_labs_dashboard",
    entityLabel: "Recruiter Labs AI Ops",
    metadata: {
      surface: "admin_recruiter_labs_ai_ops",
      enabledFlags: overview.stats.enabledFlags,
      blockedGovernanceChecks: overview.stats.blockedGovernanceChecks,
      unresolvedLaunchGateChecks: overview.stats.unresolvedLaunchGateChecks,
      safeForRealCandidateData: overview.safeForRealCandidateData,
      safeForClientFacingOutput: overview.launchGate.safeForClientFacingOutput,
    },
  });

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private admin</p>
          <h1>AI Ops.</h1>
          <p className="lede">
            A private governance foundation for using AI to reduce admin typing.
            No ranking. No rejection. No hidden scoring. Safe first, private
            first.
          </p>
          <div className="button-row hero-actions">
            <Link
              className="button button-secondary"
              href="/admin/recruiter-labs"
            >
              Recruiter Labs
            </Link>
            <Link className="button button-secondary" href="/admin/audit">
              Audit log
            </Link>
          </div>
        </div>

        <div className={styles.adminStatus}>
          <span className="tag">Sample data only</span>
          <div>
            <h2>
              {overview.launchGate.safeForRealCandidateData
                ? "AI launch gate has no real-data blockers showing."
                : "AI launch gate blocks real candidate data."}
            </h2>
            <p>
              This route does not call an AI provider and must not use real
              candidate data until provider, privacy, retention and approval
              rules are signed off. AI can help David move faster. It must not
              make hidden decisions about people.
            </p>
          </div>
          <div className={styles.adminStatusActions}>
            <Link
              className="button button-secondary"
              href="/admin/recruiter-labs"
            >
              Back to gate
            </Link>
          </div>
        </div>

        <div className={styles.adminGrid} aria-label="AI Ops overview">
          <div className={styles.adminStat}>
            <span>Feature flags</span>
            <strong>{overview.stats.totalFlags}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Enabled flags</span>
            <strong>{overview.stats.enabledFlags}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Governance blockers</span>
            <strong>{overview.stats.blockedGovernanceChecks}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Launch gate unresolved</span>
            <strong>{overview.stats.unresolvedLaunchGateChecks}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Real candidate data</span>
            <strong>{overview.safeForRealCandidateData ? "OK" : "No"}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Client-facing output</span>
            <strong>
              {overview.launchGate.safeForClientFacingOutput ? "OK" : "No"}
            </strong>
          </div>
        </div>

        <div className={styles.adminPanels}>
          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Launch gate</p>
                <h2>Fake data only until every blocker is cleared.</h2>
              </div>
              <span
                className={
                  overview.launchGate.safeForSyntheticAdminTesting
                    ? styles.labsFlagOn
                    : `${styles.labsRisk} ${styles.labsRiskHigh}`
                }
              >
                {overview.launchGate.safeForSyntheticAdminTesting
                  ? "Synthetic testing OK"
                  : "Testing blocked"}
              </span>
            </div>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Check</th>
                    <th>Status</th>
                    <th>Required before</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.launchGate.checks.map((check) => (
                    <tr key={check.id}>
                      <td>
                        {check.label}
                        <span className={styles.adminSubtle}>
                          {check.category}
                        </span>
                      </td>
                      <td>
                        <span className={launchGateStatusClass(check.status)}>
                          {governanceStatusLabel[check.status]}
                        </span>
                      </td>
                      <td>
                        {check.requiredBefore
                          .map((requirement) =>
                            requirement.replaceAll("_", " "),
                          )
                          .join(", ")}
                      </td>
                      <td>{check.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Allowed</p>
            <h2>Operational compression only.</h2>
            <ul className={styles.adminChecklist}>
              {overview.allowedUses.map((use) => (
                <li key={use}>{use}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Banned</p>
            <h2>Judgement stays human.</h2>
            <ul className={styles.adminChecklist}>
              {overview.bannedUses.map((use) => (
                <li key={use}>{use}</li>
              ))}
            </ul>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Provider blockers</p>
                <h2>Real data stays blocked.</h2>
              </div>
            </div>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Check</th>
                    <th>Status</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.governanceChecks.map((check) => (
                    <tr key={check.id}>
                      <td>{check.label}</td>
                      <td>
                        <span
                          className={
                            check.status === "passed"
                              ? styles.labsFlagOn
                              : launchGateStatusClass(check.status)
                          }
                        >
                          {governanceStatusLabel[check.status]}
                        </span>
                      </td>
                      <td>{check.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Server flags</p>
                <h2>Off until deliberately approved.</h2>
              </div>
            </div>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Flag</th>
                    <th>State</th>
                    <th>Scope</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.flags.map((flag) => (
                    <tr key={flag.name}>
                      <td>
                        {flag.label}
                        <span className={styles.adminSubtle}>{flag.name}</span>
                      </td>
                      <td>
                        <span
                          className={
                            flag.enabled
                              ? styles.labsFlagOn
                              : styles.labsFlagOff
                          }
                        >
                          {flag.enabled ? "On" : "Off"}
                        </span>
                      </td>
                      <td>{flag.scope}</td>
                      <td>{flag.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Rollback</p>
            <h2>One move: switch it off.</h2>
            <ul className={styles.adminChecklist}>
              {overview.rollbackSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
