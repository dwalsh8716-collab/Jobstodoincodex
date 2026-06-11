import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CMS_SESSION_COOKIE,
  getCmsSessionUsername,
  isCmsSessionValid,
} from "@/lib/cms-auth";
import { getLabsBadHireCalculatorPreview } from "@/lib/labs-bad-hire-calculator";
import { logAuditEvent } from "@/lib/operations/audit";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Bad Hire Calculator | Essential Resourcing Labs",
    description:
      "Private, noindexed Labs preview for the bad senior marketing hire cost calculator.",
    path: "/admin/labs/bad-hire-calculator",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function MessageDavidLink() {
  const href = buildWhatsAppUrl({
    number: siteConfig.whatsApp.number,
    message:
      "Hi David, I want to sense-check the cost and risk in a senior marketing hire.",
  });

  if (!siteConfig.whatsApp.enabled || !href) {
    return (
      <Link className="button button-secondary" href="/contact">
        Sense-check the brief
      </Link>
    );
  }

  return (
    <a
      className="button button-secondary"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message David Walsh on WhatsApp. Opens WhatsApp."
    >
      WhatsApp David
    </a>
  );
}

export default async function AdminLabsBadHireCalculatorPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) redirect("/cms?next=/admin/labs/bad-hire-calculator");

  const username = await getCmsSessionUsername(sessionCookie);
  const preview = getLabsBadHireCalculatorPreview();
  const realistic = preview.result.scenarios.find(
    (scenario) => scenario.name === "realistic",
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
    entityLabel: "Bad hire calculator preview",
    metadata: {
      surface: "admin_labs_bad_hire_calculator",
      featureEnabled: preview.status.featureEnabled,
      canStoreLeads: preview.status.canStoreLeads,
      readyForPublicLaunch: preview.status.readyForPublicLaunch,
    },
  });

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private Labs preview</p>
          <h1>What does a poor senior marketing hire really cost?</h1>
          <p className="lede">
            A serious calculator for role risk, wasted management time,
            recruitment cost, delayed impact and interim cover. Evidence-led,
            caveated and hidden until the assumptions are approved.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-secondary" href="/admin/labs">
              Labs overview
            </Link>
            <MessageDavidLink />
          </div>
        </div>

        <div className={styles.adminStatus}>
          <span className="tag">
            {preview.status.featureEnabled ? "Flag on" : "Flag off"}
          </span>
          <div>
            <h2>
              {preview.status.canStoreLeads
                ? "Private leads and assumptions can be saved."
                : "Calculator is staged, but lead storage is blocked."}
            </h2>
            <p>
              Outputs are directional estimates for a commercial conversation.
              They are not financial advice and should not be used to
              scaremonger.
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

        <div className={styles.adminGrid} aria-label="Bad hire calculator status">
          <div className={styles.adminStat}>
            <span>Inputs</span>
            <strong>{preview.inputs.length}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Database</span>
            <strong>{preview.status.databaseStatus.state}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Example realistic cost</span>
            <strong>{realistic ? formatCurrency(realistic.total) : "TBC"}</strong>
          </div>
        </div>

        <div className={styles.adminPanels}>
          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Scenario estimates</p>
                <h2>No fake precision. Show the range.</h2>
              </div>
            </div>
            <div className={styles.labsRoadmap}>
              {preview.result.scenarios.map((scenario) => (
                <article className={styles.labsCard} key={scenario.name}>
                  <div className={styles.labsCardHeader}>
                    <div>
                      <span className="tag">{scenario.label}</span>
                      <h3>{formatCurrency(scenario.total)}</h3>
                    </div>
                    <span className={styles.labsRisk}>Estimate</span>
                  </div>
                  <p>{scenario.recommendation}</p>
                </article>
              ))}
            </div>
            <p className="meta">{preview.result.caveat}</p>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Inputs</p>
            <h2>Specific to senior marketing hiring.</h2>
            <ul className={styles.adminChecklist}>
              {preview.inputs.map((input) => (
                <li key={input}>{input}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Assumptions</p>
            <h2>Editable before launch.</h2>
            <dl className={styles.labsMetaGrid}>
              <div>
                <dt>Recruitment fee</dt>
                <dd>
                  {Math.round(
                    preview.result.assumptions.recruitmentFeeRate * 100,
                  )}
                  %
                </dd>
              </div>
              <div>
                <dt>Productivity loss</dt>
                <dd>
                  {Math.round(
                    preview.result.assumptions.productivityLossRate * 100,
                  )}
                  %
                </dd>
              </div>
              <div>
                <dt>Management day</dt>
                <dd>
                  {formatCurrency(preview.result.assumptions.managementDayCost)}
                </dd>
              </div>
              <div>
                <dt>Interim day rate</dt>
                <dd>{formatCurrency(preview.result.assumptions.interimDayRate)}</dd>
              </div>
            </dl>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Hidden costs</p>
            <h2>Breakdown, not a magic number.</h2>
            {realistic ? (
              <dl className={styles.labsMetaGrid}>
                {Object.entries(realistic.breakdown).map(([label, value]) => (
                  <div key={label}>
                    <dt>{label.replace(/([A-Z])/g, " $1")}</dt>
                    <dd>{formatCurrency(value)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Lead capture</p>
            <h2>Useful follow-up, no private analytics.</h2>
            <ul className={styles.adminChecklist}>
              {preview.leadCaptureActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
            <p className="meta">
              Emailing results should store the lead privately in Postgres.
              Private result data must not go to GA4 or GTM.
            </p>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Methodology</p>
            <h2>Commercially useful, heavily caveated.</h2>
            <ul className={styles.adminChecklist}>
              {preview.result.assumptions.sourceNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
