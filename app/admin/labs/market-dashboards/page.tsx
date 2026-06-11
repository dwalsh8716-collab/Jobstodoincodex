import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CMS_SESSION_COOKIE,
  getCmsSessionUsername,
  isCmsSessionValid,
} from "@/lib/cms-auth";
import { getLabsMarketDashboardPreview } from "@/lib/labs-market-dashboards";
import { logAuditEvent } from "@/lib/operations/audit";
import { createMetadata } from "@/lib/seo";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Market Dashboards | Essential Resourcing Labs",
    description:
      "Private, noindexed Labs preview for future market intelligence dashboards.",
    path: "/admin/labs/market-dashboards",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLabsMarketDashboardsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) redirect("/cms?next=/admin/labs/market-dashboards");

  const username = await getCmsSessionUsername(sessionCookie);
  const preview = getLabsMarketDashboardPreview();

  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "labs_dashboard_viewed",
    entityType: "labs_dashboard",
    entityLabel: "Live market dashboard preview",
    metadata: {
      surface: "admin_labs_market_dashboards",
      featureEnabled: preview.status.featureEnabled,
      readyForPrivatePreview: preview.status.readyForPrivatePreview,
      readyForPublicLaunch: preview.status.readyForPublicLaunch,
    },
  });

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private Labs preview</p>
          <h1>Live market dashboards.</h1>
          <p className="lede">
            A future market intelligence product for salary ranges, interim
            rates, demand and movement notes. Hidden until the data is strong
            enough to trust.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-secondary" href="/admin/labs">
              Labs overview
            </Link>
            <Link className="button button-secondary" href="/salary-guides">
              Salary guides
            </Link>
          </div>
        </div>

        <div className={styles.adminStatus}>
          <span className="tag">
            {preview.status.featureEnabled ? "Flag on" : "Flag off"}
          </span>
          <div>
            <h2>
              {preview.status.readyForPrivatePreview
                ? "Private preview can read verified dashboard data."
                : "Dashboard data is not connected yet."}
            </h2>
            <p>
              This route is noindexed and admin-only. Public dashboards stay
              blocked until source quality, methodology and performance are
              proven.
            </p>
          </div>
          <div className={styles.adminStatusActions}>
            <span className={styles.labsRisk}>
              {preview.status.readyForPublicLaunch
                ? "Public launch ready"
                : "Public launch blocked"}
            </span>
          </div>
        </div>

        <div className={styles.adminGrid} aria-label="Dashboard readiness">
          <div className={styles.adminStat}>
            <span>Dashboards staged</span>
            <strong>{preview.dashboards.length}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Database</span>
            <strong>{preview.status.databaseStatus.state}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Noindex</span>
            <strong>{preview.status.noIndex ? "Yes" : "No"}</strong>
          </div>
        </div>

        <div className={styles.adminPanels}>
          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Dashboard plans</p>
                <h2>No fake benchmarks. No weak charts.</h2>
              </div>
            </div>
            <div className={styles.labsRoadmap}>
              {preview.dashboards.map((dashboard) => (
                <article className={styles.labsCard} key={dashboard.slug}>
                  <div className={styles.labsCardHeader}>
                    <div>
                      <span className="tag">Hidden preview</span>
                      <h3>{dashboard.title}</h3>
                    </div>
                    <span className={styles.labsRisk}>Waiting for data</span>
                  </div>
                  <p>{dashboard.audience}</p>
                  <dl className={styles.labsMetaGrid}>
                    <div>
                      <dt>Focus</dt>
                      <dd>{dashboard.focus.join(", ")}</dd>
                    </div>
                    <div>
                      <dt>Sources</dt>
                      <dd>{dashboard.requiredSources.join(", ")}</dd>
                    </div>
                    <div>
                      <dt>CTA</dt>
                      <dd>{dashboard.leadCapturePath}</dd>
                    </div>
                    <div>
                      <dt>Rule</dt>
                      <dd>{dashboard.confidenceRule}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Filters</p>
            <h2>Designed. Disabled for now.</h2>
            <div className={styles.adminFilters}>
              {Object.entries(preview.filters).map(([label, options]) => (
                <label key={label}>
                  <span>{label.replace(/([A-Z])/g, " $1")}</span>
                  <select disabled>
                    {options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <p className="meta">
              Filters unlock only after verified aggregate data exists. Until
              then, showing a chart would be theatre.
            </p>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Methodology</p>
            <h2>Every chart needs evidence.</h2>
            <ul className={styles.adminChecklist}>
              {preview.methodologyRequired.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Privacy rules</p>
            <h2>Aggregate only.</h2>
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
