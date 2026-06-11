import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CMS_SESSION_COOKIE,
  getCmsSessionUsername,
  isCmsSessionValid,
} from "@/lib/cms-auth";
import { getLabsMarketMappingPreview } from "@/lib/labs-market-mapping";
import { logAuditEvent } from "@/lib/operations/audit";
import { createMetadata } from "@/lib/seo";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Market Mapping | Essential Resourcing Labs",
    description:
      "Private, noindexed Labs preview for market mapping and network reach visualisation.",
    path: "/admin/labs/market-mapping",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

function percentage(count: number, total: number) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

export default async function AdminLabsMarketMappingPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) redirect("/cms?next=/admin/labs/market-mapping");

  const username = await getCmsSessionUsername(sessionCookie);
  const preview = getLabsMarketMappingPreview();
  const targetUniverse = preview.funnel[0]?.count || 1;

  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "labs_dashboard_viewed",
    entityType: "labs_dashboard",
    entityLabel: "Market mapping preview",
    metadata: {
      surface: "admin_labs_market_mapping",
      featureEnabled: preview.status.featureEnabled,
      canSavePrivateMaps: preview.status.canSavePrivateMaps,
      readyForPublicLaunch: preview.status.readyForPublicLaunch,
    },
  });

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private Labs preview</p>
          <h1>Make the invisible work visible.</h1>
          <p className="lede">
            A future market mapping module for showing search reach, market
            constraints, progress and shortlist shape without exposing private
            candidate data.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-secondary" href="/admin/labs">
              Labs overview
            </Link>
            <Link
              className="button button-secondary"
              href="/admin/labs/market-dashboards"
            >
              Market dashboards
            </Link>
          </div>
        </div>

        <div className={styles.adminStatus}>
          <span className="tag">
            {preview.status.featureEnabled ? "Flag on" : "Flag off"}
          </span>
          <div>
            <h2>
              {preview.status.canSavePrivateMaps
                ? "Private market maps can be saved."
                : "Market mapping is staged, but private saving is blocked."}
            </h2>
            <p>
              Show the work behind the search. Do not expose names, CVs, scraped
              profile data or private client context in public visuals.
            </p>
          </div>
          <div className={styles.adminStatusActions}>
            <span className={styles.labsRisk}>
              {preview.status.readyForPublicLaunch
                ? "Public launch ready"
                : "No public launch"}
            </span>
          </div>
        </div>

        <div className={styles.adminGrid} aria-label="Market mapping status">
          <div className={styles.adminStat}>
            <span>Funnel stages</span>
            <strong>{preview.funnel.length}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Segments</span>
            <strong>{preview.segments.length}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Database</span>
            <strong>{preview.status.databaseStatus.state}</strong>
          </div>
        </div>

        <div className={styles.adminPanels}>
          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Search funnel</p>
                <h2>Mapped, approached, engaged, shortlisted.</h2>
              </div>
            </div>
            <div className={styles.labsRoadmap}>
              {preview.funnel.map((stage) => (
                <article className={styles.labsCard} key={stage.stage}>
                  <div className={styles.labsCardHeader}>
                    <div>
                      <span className="tag">{stage.stage}</span>
                      <h3>{stage.count}</h3>
                    </div>
                    <span className={styles.labsRisk}>
                      {percentage(stage.count, targetUniverse)}%
                    </span>
                  </div>
                  <progress
                    aria-label={`${stage.stage} progress`}
                    max={targetUniverse}
                    value={stage.count}
                  />
                  <p>{stage.note}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <p className="eyebrow">Segment map</p>
            <h2>Show where the market actually is.</h2>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Segment</th>
                    <th>Target</th>
                    <th>Mapped</th>
                    <th>Approached</th>
                    <th>Engaged</th>
                    <th>Shortlisted</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.segments.map((segment) => (
                    <tr key={segment.segmentName}>
                      <td>{segment.segmentName}</td>
                      <td>{segment.targetCount}</td>
                      <td>{segment.mappedCount}</td>
                      <td>{segment.approachedCount}</td>
                      <td>{segment.engagedCount}</td>
                      <td>{segment.shortlistedCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Visual approach</p>
            <h2>Premium and editorial.</h2>
            <ul className={styles.adminChecklist}>
              {preview.visualApproach.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Market constraints</p>
            <h2>Explain why a role is hard.</h2>
            <ul className={styles.adminChecklist}>
              {preview.constraints.map((constraint) => (
                <li key={constraint}>{constraint}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Private client use</p>
            <h2>Proof of work, not a name dump.</h2>
            <ul className={styles.adminChecklist}>
              {preview.privateClientUses.map((use) => (
                <li key={use}>{use}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Privacy rules</p>
            <h2>No public PII.</h2>
            <ul className={styles.adminChecklist}>
              {preview.privacyRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
