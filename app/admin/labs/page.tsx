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
  type LabsIdeaStatus,
  type LabsRiskLevel,
  getLabsOverview,
} from "@/lib/labs";
import { logAuditEvent } from "@/lib/operations/audit";
import { createMetadata } from "@/lib/seo";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Essential Resourcing Labs | Private Admin",
    description:
      "Private admin-only planning area for Essential Resourcing future product ideas and feature flags.",
    path: "/admin/labs",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

const statusLabels: Record<LabsIdeaStatus, string> = {
  idea: "Idea",
  researching: "Researching",
  scoped: "Scoped",
  in_build: "In build",
  private_preview: "Private preview",
  ready_to_launch: "Ready for launch review",
  launched: "Launched",
  parked: "Parked",
  rejected: "Rejected",
};

const riskLabels: Record<LabsRiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

function issueUrl(issue?: string) {
  if (!issue?.startsWith("#")) return undefined;
  return `https://github.com/dwalsh8716-collab/Jobstodoincodex/issues/${issue.slice(1)}`;
}

export default async function AdminLabsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) redirect("/cms?next=/admin/labs");

  const username = await getCmsSessionUsername(sessionCookie);
  const overview = getLabsOverview();
  const labsFlag = overview.flags.find(
    (flag) => flag.name === "FEATURE_LABS_ENABLED",
  );

  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "labs_dashboard_viewed",
    entityType: "labs_dashboard",
    entityLabel: "Essential Resourcing Labs",
    metadata: {
      surface: "admin_labs",
      enabledFlags: overview.stats.enabledFlags,
      totalIdeas: overview.stats.totalIdeas,
    },
  });

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private admin</p>
          <h1>Essential Resourcing Labs.</h1>
          <p className="lede">
            A hidden planning area for future product ideas. Nothing here is
            public, indexed or launchable by accident.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-secondary" href="/admin">
              Admin overview
            </Link>
            <Link className="button button-secondary" href="/admin/audit">
              Audit log
            </Link>
            <Link
              className="button button-secondary"
              href="/admin/labs/market-dashboards"
            >
              Market dashboards
            </Link>
            <Link
              className="button button-secondary"
              href="/admin/labs/interim-bench"
            >
              Interim bench
            </Link>
          </div>
        </div>

        <div className={styles.adminStatus}>
          <span className="tag">
            {labsFlag?.enabled ? "Labs flag on" : "Private planning"}
          </span>
          <div>
            <h2>
              {labsFlag?.enabled
                ? "Labs is enabled for protected admin planning."
                : "Labs is staged, hidden and disabled by default."}
            </h2>
            <p>
              Feature flags are server-side only. They are review gates, not
              public launch switches.
            </p>
          </div>
          <div className={styles.adminStatusActions}>
            <Link className="button button-secondary" href="/admin/audit">
              Audit log
            </Link>
          </div>
        </div>

        <div className={styles.adminGrid} aria-label="Labs overview">
          <div className={styles.adminStat}>
            <span>Ideas staged</span>
            <strong>{overview.stats.totalIdeas}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Roadmap phases</span>
            <strong>{overview.stats.totalRoadmapPhases}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Enabled flags</span>
            <strong>{overview.stats.enabledFlags}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>High risk ideas</span>
            <strong>{overview.stats.highRiskIdeas}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Ready to launch</span>
            <strong>{overview.stats.readyForLaunch}</strong>
          </div>
        </div>

        <div className={styles.adminPanels}>
          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">12-month roadmap</p>
                <h2>Build future advantage without derailing launch.</h2>
              </div>
            </div>
            <div className={styles.labsRoadmap}>
              {overview.roadmapPhases.map((phase) => (
                <article className={styles.labsCard} key={phase.phase}>
                  <div className={styles.labsCardHeader}>
                    <div>
                      <span className="tag">Phase {phase.phase}</span>
                      <h3>{phase.title}</h3>
                    </div>
                    <span className={styles.labsRisk}>
                      Months {phase.months}
                    </span>
                  </div>
                  <p>{phase.focus}</p>
                  <dl className={styles.labsMetaGrid}>
                    <div>
                      <dt>Do now</dt>
                      <dd>{phase.doNow.join(", ")}</dd>
                    </div>
                    <div>
                      <dt>Dependencies</dt>
                      <dd>{phase.dependencies.join(", ")}</dd>
                    </div>
                    <div>
                      <dt>Issues</dt>
                      <dd>{phase.relatedIssues.join(", ")}</dd>
                    </div>
                    <div>
                      <dt>Codex</dt>
                      <dd>{phase.codexReasoning}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Labs backlog</p>
                <h2>Plan the clever stuff without leaking it.</h2>
              </div>
            </div>
            <div className={styles.labsRoadmap}>
              {overview.ideas.map((idea) => {
                const relatedIssueUrl = issueUrl(idea.relatedGitHubIssue);

                return (
                  <article className={styles.labsCard} key={idea.title}>
                    <div className={styles.labsCardHeader}>
                      <div>
                        <span className="tag">{idea.category}</span>
                        <h3>{idea.title}</h3>
                      </div>
                      <span
                        className={`${styles.labsRisk} ${
                          idea.privacyRisk === "critical" ||
                          idea.privacyRisk === "high"
                            ? styles.labsRiskHigh
                            : ""
                        }`}
                      >
                        {riskLabels[idea.privacyRisk]} risk
                      </span>
                    </div>
                    <p>{idea.commercialPurpose}</p>
                    <dl className={styles.labsMetaGrid}>
                      <div>
                        <dt>Status</dt>
                        <dd>{statusLabels[idea.status]}</dd>
                      </div>
                      <div>
                        <dt>Target user</dt>
                        <dd>{idea.targetUser}</dd>
                      </div>
                      <div>
                        <dt>Complexity</dt>
                        <dd>{idea.complexity}</dd>
                      </div>
                      <div>
                        <dt>Flag</dt>
                        <dd>{idea.featureFlagName}</dd>
                      </div>
                    </dl>
                    <p className={styles.adminSubtle}>{idea.launchRule}</p>
                    <div className={styles.labsCardActions}>
                      <span
                        className={
                          idea.flagEnabled
                            ? styles.labsFlagOn
                            : styles.labsFlagOff
                        }
                      >
                        {idea.flagEnabled ? "Flag on" : "Flag off"}
                      </span>
                      {relatedIssueUrl ? (
                        <a
                          className="text-link"
                          href={relatedIssueUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {idea.relatedGitHubIssue}
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Launch rules</p>
            <h2>No accidental public features.</h2>
            <ul className={styles.adminChecklist}>
              <li>No public `/labs` route.</li>
              <li>No Labs pages in sitemap, RSS, llms files or navigation.</li>
              <li>No client-side private flags.</li>
              <li>No private candidate, client or CV data in Sanity Labs.</li>
              <li>No launch toggle without a separate review issue.</li>
            </ul>
            <p className="meta">
              Treat every future Labs idea as private until route protection,
              consent, privacy, search indexing and rollback are reviewed.
            </p>
          </section>

          <section className={styles.adminPanel}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Server flags</p>
                <h2>Hidden by default.</h2>
              </div>
            </div>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Flag</th>
                    <th>State</th>
                    <th>Scope</th>
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
