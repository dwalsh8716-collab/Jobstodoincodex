import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CMS_SESSION_COOKIE,
  getCmsSessionUsername,
  isCmsSessionValid,
} from "@/lib/cms-auth";
import { getLabsFunctionalMatrixPreview } from "@/lib/labs-functional-matrix";
import { logAuditEvent } from "@/lib/operations/audit";
import { createMetadata } from "@/lib/seo";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Functional Matrix | Essential Resourcing Labs",
    description:
      "Private, noindexed Labs preview for role requirement matrix mapping.",
    path: "/admin/labs/functional-matrix",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLabsFunctionalMatrixPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) redirect("/cms?next=/admin/labs/functional-matrix");

  const username = await getCmsSessionUsername(sessionCookie);
  const preview = getLabsFunctionalMatrixPreview();

  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "labs_dashboard_viewed",
    entityType: "labs_dashboard",
    entityLabel: "Functional matrix preview",
    metadata: {
      surface: "admin_labs_functional_matrix",
      featureEnabled: preview.status.featureEnabled,
      canSaveMatrices: preview.status.canSaveMatrices,
      readyForPublicLaunch: preview.status.readyForPublicLaunch,
    },
  });

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private Labs preview</p>
          <h1>The job title is not the brief.</h1>
          <p className="lede">
            A future advisory matrix for turning vague hiring briefs into
            structured search criteria across function, context, leadership and
            urgency.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-secondary" href="/admin/labs">
              Labs overview
            </Link>
            <Link className="button button-secondary" href="/services">
              Service pages
            </Link>
          </div>
        </div>

        <div className={styles.adminStatus}>
          <span className="tag">
            {preview.status.featureEnabled ? "Flag on" : "Flag off"}
          </span>
          <div>
            <h2>
              {preview.status.canSaveMatrices
                ? "Private matrices can be saved to Postgres."
                : "Matrix preview is staged, but live saving is blocked."}
            </h2>
            <p>
              Use this as a briefing and scoping tool. It must not become
              hidden candidate scoring or an automated hiring decision.
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

        <div className={styles.adminGrid} aria-label="Functional matrix status">
          <div className={styles.adminStat}>
            <span>Dimensions</span>
            <strong>{preview.dimensions.length}</strong>
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
                <p className="eyebrow">Matrix dimensions</p>
                <h2>Define the role by what it has to do.</h2>
              </div>
            </div>
            <div className={styles.labsRoadmap}>
              {preview.dimensions.map((dimension) => (
                <article className={styles.labsCard} key={dimension.id}>
                  <div className={styles.labsCardHeader}>
                    <h3>{dimension.label}</h3>
                    <span className={styles.labsRisk}>1-4</span>
                  </div>
                  <p>{dimension.prompt}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Example profile</p>
            <h2>{preview.example.title}</h2>
            <dl className={styles.labsMetaGrid}>
              <div>
                <dt>Service</dt>
                <dd>{preview.example.serviceType}</dd>
              </div>
              <div>
                <dt>Client type</dt>
                <dd>{preview.example.clientType}</dd>
              </div>
              <div>
                <dt>Scale</dt>
                <dd>{preview.example.scoreLabels.join(", ")}</dd>
              </div>
            </dl>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Must-haves</p>
            <h2>Keep the real non-negotiables tight.</h2>
            <ul className={styles.adminChecklist}>
              {preview.example.mustHaves.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Useful extras</p>
            <h2>Nice to have is not the same as required.</h2>
            <ul className={styles.adminChecklist}>
              {preview.example.niceToHaves.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Outputs</p>
            <h2>Useful search criteria, not spreadsheet theatre.</h2>
            <ul className={styles.adminChecklist}>
              {preview.outputs.map((output) => (
                <li key={output}>{output}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Safety rules</p>
            <h2>Advisory only.</h2>
            <ul className={styles.adminChecklist}>
              {preview.safetyRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
