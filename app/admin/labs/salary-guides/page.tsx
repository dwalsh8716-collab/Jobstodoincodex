import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CMS_SESSION_COOKIE,
  getCmsSessionUsername,
  isCmsSessionValid,
} from "@/lib/cms-auth";
import { getLabsSalaryGuidesPreview } from "@/lib/labs-salary-guides";
import { logAuditEvent } from "@/lib/operations/audit";
import { createMetadata } from "@/lib/seo";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Gated Salary Guides | Essential Resourcing Labs",
    description:
      "Private, noindexed Labs preview for gated salary guide lead capture.",
    path: "/admin/labs/salary-guides",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLabsSalaryGuidesPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) redirect("/cms?next=/admin/labs/salary-guides");

  const username = await getCmsSessionUsername(sessionCookie);
  const preview = getLabsSalaryGuidesPreview();

  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "labs_dashboard_viewed",
    entityType: "labs_dashboard",
    entityLabel: "Gated salary guides preview",
    metadata: {
      surface: "admin_labs_salary_guides",
      featureEnabled: preview.status.featureEnabled,
      canCaptureLeads: preview.status.canCaptureLeads,
      canDeliverGuide: preview.status.canDeliverGuide,
      readyForPublicLaunch: preview.status.readyForPublicLaunch,
    },
  });

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private Labs preview</p>
          <h1>Gated Salary Guides.</h1>
          <p className="lede">
            A staged B2B lead-capture route for useful salary guides. The offer
            is practical salary context before a hiring brief gets expensive,
            not a spammy PDF trap.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-secondary" href="/admin/labs">
              Labs overview
            </Link>
            <Link className="button button-secondary" href="/salary-guides">
              Public route preview
            </Link>
          </div>
        </div>

        <div className={styles.adminStatus}>
          <span className="tag">
            {preview.status.featureEnabled ? "Flag on" : "Flag off"}
          </span>
          <div>
            <h2>
              {preview.status.canDeliverGuide
                ? "Salary guide capture and delivery are technically ready."
                : "Salary guide capture is staged behind approval gates."}
            </h2>
            <p>
              The public route remains controlled by{" "}
              {preview.status.featureFlag}. Leads go to private Postgres, not
              Sanity, and the page stays out of normal navigation.
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

        <div className={styles.adminGrid} aria-label="Salary guide status">
          <div className={styles.adminStat}>
            <span>Guide formats</span>
            <strong>{preview.assetTypes.length}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Request fields</span>
            <strong>{preview.requestFields.length}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Lead statuses</span>
            <strong>{preview.leadStatuses.length}</strong>
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
                <p className="eyebrow">Guide assets</p>
                <h2>Useful first. Gated carefully.</h2>
              </div>
            </div>
            <div className={styles.labsRoadmap}>
              {preview.assetTypes.map((asset) => (
                <article className={styles.labsCard} key={asset}>
                  <div className={styles.labsCardHeader}>
                    <h3>{asset}</h3>
                    <span className={styles.labsRisk}>Future guide</span>
                  </div>
                  <p>
                    Needs reviewed market data, caveats and David approval
                    before it becomes a live download.
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Lead form</p>
            <h2>Short enough to complete.</h2>
            <ul className={styles.adminChecklist}>
              {preview.requestFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Lead status</p>
            <h2>Enough follow-up structure.</h2>
            <ul className={styles.adminChecklist}>
              {preview.leadStatuses.map((status) => (
                <li key={status}>{status}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Sanity content</p>
            <h2>Public copy only.</h2>
            <ul className={styles.adminChecklist}>
              {preview.cmsFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Private data</p>
            <h2>Postgres, not Sanity.</h2>
            <ul className={styles.adminChecklist}>
              {preview.privateDataFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Journey</p>
            <h2>Controlled from idea to lead.</h2>
            <ul className={styles.adminChecklist}>
              {preview.journey.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Privacy rules</p>
            <h2>No fake compliance.</h2>
            <ul className={styles.adminChecklist}>
              {preview.privacyRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Launch blockers</p>
            <h2>David must approve these first.</h2>
            <ul className={styles.adminChecklist}>
              {preview.launchBlockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
