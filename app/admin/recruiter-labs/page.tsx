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
import { getRecruiterLabsOverview } from "@/lib/recruiter-labs";
import { createMetadata } from "@/lib/seo";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Recruiter Labs | Private Admin",
    description:
      "Private admin-only foundation for Essential Resourcing client shortlist and candidate presentation workflows.",
    path: "/admin/recruiter-labs",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

const statusLabel = {
  current: "Current",
  next: "Next",
  staged: "Staged",
  blocked: "Blocked",
  disabled: "Disabled",
} as const;

export default async function AdminRecruiterLabsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) redirect("/cms?next=/admin/recruiter-labs");

  const username = await getCmsSessionUsername(sessionCookie);
  const overview = getRecruiterLabsOverview();
  const recruiterLabsFlag = overview.flags.find(
    (flag) => flag.name === "FEATURE_RECRUITER_LABS_ENABLED",
  );

  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "recruiter_labs_dashboard_viewed",
    entityType: "recruiter_labs_dashboard",
    entityLabel: "Recruiter Labs foundation",
    metadata: {
      surface: "admin_recruiter_labs",
      enabledFlags: overview.stats.enabledFlags,
      publicRoutes: overview.stats.publicRoutes,
    },
  });

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private admin</p>
          <h1>Recruiter Labs.</h1>
          <p className="lede">
            A private foundation for branded shortlists, client feedback and
            future interview workflows. No public CV links. No fake automation.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-secondary" href="/admin">
              Admin overview
            </Link>
            <Link className="button button-secondary" href="/admin/labs">
              Labs
            </Link>
          </div>
        </div>

        <div className={styles.adminStatus}>
          <span className="tag">
            {recruiterLabsFlag?.enabled ? "Flag on" : "Private foundation"}
          </span>
          <div>
            <h2>
              {recruiterLabsFlag?.enabled
                ? "Recruiter Labs planning is enabled for admin only."
                : "Recruiter Labs is staged and hidden by default."}
            </h2>
            <p>
              The future client portal needs signed tokens, expiry, revocation,
              candidate consent and audit logging before any client link exists.
            </p>
          </div>
          <div className={styles.adminStatusActions}>
            <Link className="button button-secondary" href="/admin/audit">
              Audit log
            </Link>
          </div>
        </div>

        <div className={styles.adminGrid} aria-label="Recruiter Labs overview">
          <div className={styles.adminStat}>
            <span>Feature flags</span>
            <strong>{overview.stats.totalFlags}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Enabled flags</span>
            <strong>{overview.stats.enabledFlags}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Blocked dependencies</span>
            <strong>{overview.stats.blockedDependencies}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Public routes</span>
            <strong>{overview.stats.publicRoutes}</strong>
          </div>
        </div>

        <div className={styles.adminPanels}>
          <section className={styles.adminPanel}>
            <p className="eyebrow">Route strategy</p>
            <h2>Private first. Client links later.</h2>
            <ul className={styles.adminChecklist}>
              <li>`/admin/recruiter-labs` is admin-only and noindexed.</li>
              <li>No `/client/shortlist/[token]` route exists yet.</li>
              <li>
                No shortlist or candidate profile appears in public sitemap.
              </li>
              <li>
                Magic-link tokens must be hashed in Postgres, never logged.
              </li>
              <li>David must verify every client-facing candidate summary.</li>
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Dependencies</p>
            <h2>What must be safe first.</h2>
            <div className={styles.labsRoadmap}>
              {overview.dependencies.map((dependency) => (
                <article className={styles.labsCard} key={dependency.label}>
                  <div className={styles.labsCardHeader}>
                    <h3>{dependency.label}</h3>
                    <span
                      className={
                        dependency.status === "blocked"
                          ? `${styles.labsRisk} ${styles.labsRiskHigh}`
                          : styles.labsRisk
                      }
                    >
                      {statusLabel[dependency.status]}
                    </span>
                  </div>
                  <p>{dependency.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Build phases</p>
                <h2>David stays in control.</h2>
              </div>
            </div>
            <div className={styles.labsRoadmap}>
              {overview.phases.map((phase) => (
                <article className={styles.labsCard} key={phase.title}>
                  <div className={styles.labsCardHeader}>
                    <h3>{phase.title}</h3>
                    <span
                      className={
                        phase.status === "blocked"
                          ? `${styles.labsRisk} ${styles.labsRiskHigh}`
                          : styles.labsRisk
                      }
                    >
                      {statusLabel[phase.status]}
                    </span>
                  </div>
                  <p>{phase.detail}</p>
                </article>
              ))}
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
        </div>
      </div>
    </section>
  );
}
