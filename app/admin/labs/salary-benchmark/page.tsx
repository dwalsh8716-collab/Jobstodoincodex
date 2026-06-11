import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CMS_SESSION_COOKIE,
  getCmsSessionUsername,
  isCmsSessionValid,
} from "@/lib/cms-auth";
import { getLabsSalaryBenchmarkPreview } from "@/lib/labs-salary-benchmark";
import { logAuditEvent } from "@/lib/operations/audit";
import { createMetadata } from "@/lib/seo";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Salary Benchmark Asset | Essential Resourcing Labs",
    description:
      "Private, noindexed Labs preview for bespoke salary benchmarking assets.",
    path: "/admin/labs/salary-benchmark",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLabsSalaryBenchmarkPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) redirect("/cms?next=/admin/labs/salary-benchmark");

  const username = await getCmsSessionUsername(sessionCookie);
  const preview = getLabsSalaryBenchmarkPreview();

  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "labs_dashboard_viewed",
    entityType: "labs_dashboard",
    entityLabel: "Salary benchmark asset preview",
    metadata: {
      surface: "admin_labs_salary_benchmark",
      featureEnabled: preview.status.featureEnabled,
      canStoreRequests: preview.status.canStoreRequests,
      readyForPublicLaunch: preview.status.readyForPublicLaunch,
    },
  });

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private Labs preview</p>
          <h1>Salary Benchmark Request.</h1>
          <p className="lede">
            A future bespoke asset builder for senior marketing, comms, digital,
            agency leadership and Strategic Interim salary sense-checks. David
            reviews the advice before anything is sent.
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
              {preview.status.canStoreRequests
                ? "Benchmark requests can be stored privately."
                : "Benchmark asset builder is staged, but storage is blocked."}
            </h2>
            <p>
              This is not a generic salary guide. It is a David-reviewed request
              workflow with caveats, sources and no unreviewed recommendations.
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

        <div className={styles.adminGrid} aria-label="Salary benchmark status">
          <div className={styles.adminStat}>
            <span>Request fields</span>
            <strong>{preview.requestFields.length}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Report sections</span>
            <strong>{preview.reportSections.length}</strong>
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
                <p className="eyebrow">Asset names</p>
                <h2>Useful, direct, not gimmicky.</h2>
              </div>
            </div>
            <div className={styles.labsRoadmap}>
              {preview.toolNames.map((name) => (
                <article className={styles.labsCard} key={name}>
                  <div className={styles.labsCardHeader}>
                    <h3>{name}</h3>
                    <span className={styles.labsRisk}>Name option</span>
                  </div>
                  <p>
                    Keep the offer plain: a sensible salary/rate check before
                    the brief reaches the market.
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Request fields</p>
            <h2>Enough context to be useful.</h2>
            <ul className={styles.adminChecklist}>
              {preview.requestFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Report structure</p>
            <h2>Draft asset, not final advice.</h2>
            <ul className={styles.adminChecklist}>
              {preview.reportSections.map((section) => (
                <li key={section}>{section}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Data sources</p>
            <h2>Every figure needs a source note.</h2>
            <ul className={styles.adminChecklist}>
              {preview.dataSources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Admin workflow</p>
            <h2>David reviews before sending.</h2>
            <ul className={styles.adminChecklist}>
              {preview.adminWorkflow.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">AI and review rules</p>
            <h2>No unreviewed advice.</h2>
            <ul className={styles.adminChecklist}>
              {preview.reviewRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
