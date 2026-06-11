import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CMS_SESSION_COOKIE,
  getCmsSessionUsername,
  isCmsSessionValid,
} from "@/lib/cms-auth";
import { getLabsInterimBenchPreview } from "@/lib/labs-interim-bench";
import { logAuditEvent } from "@/lib/operations/audit";
import { createMetadata } from "@/lib/seo";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Strategic Interim Bench | Essential Resourcing Labs",
    description:
      "Private, noindexed Labs preview for the future Strategic Interim bench.",
    path: "/admin/labs/interim-bench",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLabsInterimBenchPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) redirect("/cms?next=/admin/labs/interim-bench");

  const username = await getCmsSessionUsername(sessionCookie);
  const preview = getLabsInterimBenchPreview();

  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "labs_dashboard_viewed",
    entityType: "labs_dashboard",
    entityLabel: "Strategic Interim bench preview",
    metadata: {
      surface: "admin_labs_interim_bench",
      benchFeatureEnabled: preview.status.benchFeatureEnabled,
      availabilityToggleEnabled: preview.status.availabilityToggleEnabled,
      readyForAdminPreview: preview.status.readyForAdminPreview,
      safeForPublicListing: preview.status.safeForPublicListing,
    },
  });

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private Labs preview</p>
          <h1>Strategic Interim bench.</h1>
          <p className="lede">
            A future private bench for vetted interim marketing and comms
            leaders. Useful for David, safe for candidates, invisible to the
            public.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-secondary" href="/admin/labs">
              Labs overview
            </Link>
            <Link
              className="button button-secondary"
              href="/services/strategic-interim"
            >
              Strategic Interim page
            </Link>
          </div>
        </div>

        <div className={styles.adminStatus}>
          <span className="tag">
            {preview.status.benchFeatureEnabled ? "Bench flag on" : "Bench flag off"}
          </span>
          <div>
            <h2>
              {preview.status.readyForAdminPreview
                ? "Private bench preview can read Postgres data."
                : "Bench preview is staged, but private data is not connected."}
            </h2>
            <p>
              Candidate updates use scoped magic links. Public listings,
              searchable profiles and CV uploads stay blocked.
            </p>
          </div>
          <div className={styles.adminStatusActions}>
            <span className={styles.labsRisk}>
              {preview.status.safeForPublicListing
                ? "Public listing ready"
                : "No public listing"}
            </span>
          </div>
        </div>

        <div className={styles.adminGrid} aria-label="Interim bench readiness">
          <div className={styles.adminStat}>
            <span>Bench metrics</span>
            <strong>{preview.metrics.length}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Database</span>
            <strong>{preview.status.databaseStatus.state}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Token expiry</span>
            <strong>{preview.status.tokenExpiryDays}d</strong>
          </div>
        </div>

        <div className={styles.adminPanels}>
          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Bench dashboard</p>
                <h2>Designed for private matching, not public browsing.</h2>
              </div>
            </div>
            <div className={styles.labsRoadmap}>
              {preview.metrics.map((metric) => (
                <article className={styles.labsCard} key={metric.label}>
                  <div className={styles.labsCardHeader}>
                    <h3>{metric.label}</h3>
                    <span className={styles.labsRisk}>Waiting for data</span>
                  </div>
                  <p>
                    This metric can populate only from private Postgres records
                    once consent, retention and admin review gates are ready.
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Roles</p>
            <h2>Scoped access only.</h2>
            <ul className={styles.adminChecklist}>
              {preview.roles.map((role) => (
                <li key={role.role}>
                  <strong>{role.role}:</strong> {role.access}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Candidate update fields</p>
            <h2>Simple, private, useful.</h2>
            <ul className={styles.adminChecklist}>
              {preview.candidateUpdateFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Privacy rules</p>
            <h2>No public talent database.</h2>
            <ul className={styles.adminChecklist}>
              {preview.privacyRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Routes</p>
            <h2>Private route map.</h2>
            <dl className={styles.labsMetaGrid}>
              <div>
                <dt>Admin</dt>
                <dd>{preview.status.adminRoute}</dd>
              </div>
              <div>
                <dt>Candidate</dt>
                <dd>{preview.status.candidateRoute}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </section>
  );
}
