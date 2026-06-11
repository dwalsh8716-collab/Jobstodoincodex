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
  getWhatsAppCrmSyncDiscoveryStatus,
  loxoApiEvidence,
  loxoSupportQuestions,
  mockWhatsAppCrmTimeline,
  whatsAppCrmAllowedMessageTypes,
  whatsAppCrmBannedMessageTypes,
  whatsAppCrmOperatingPrinciples,
  whatsAppCrmProviderOptions,
} from "@/lib/recruiter-labs-whatsapp-crm-sync";
import { createMetadata } from "@/lib/seo";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "WhatsApp CRM Sync | Private Recruiter Labs",
    description:
      "Private discovery view for future WhatsApp Business and Loxo candidate communication sync.",
    path: "/admin/recruiter-labs/whatsapp-crm-sync",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

const providerStatusLabel = {
  preferred_discovery: "First check",
  worth_shortlisting: "Shortlist",
  possible: "Possible",
  hold: "Hold",
  blocked: "Blocked",
} as const;

function statusClass(status: string) {
  if (status === "preferred_discovery" || status === "worth_shortlisting") {
    return styles.labsFlagOn;
  }

  if (status === "blocked" || status === "hold") {
    return `${styles.labsRisk} ${styles.labsRiskHigh}`;
  }

  return styles.labsRisk;
}

export default async function WhatsAppCrmSyncPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) {
    redirect("/cms?next=/admin/recruiter-labs/whatsapp-crm-sync");
  }

  const username = await getCmsSessionUsername(sessionCookie);
  const status = getWhatsAppCrmSyncDiscoveryStatus();

  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "recruiter_labs_dashboard_viewed",
    entityType: "recruiter_labs_dashboard",
    entityLabel: "WhatsApp CRM sync discovery",
    metadata: {
      surface: "admin_recruiter_labs_whatsapp_crm_sync",
      enabledFlags: status.enabledFlags,
      databaseStatus: status.databaseStatus.state,
      whatsappBusinessState: status.whatsappStatus.state,
      loxoConfigured: status.loxoConfigured,
      productionReadiness: status.productionReadiness,
      realMessagesBlocked: status.canSendRealWhatsAppMessages === false,
      loxoSyncBlocked: status.canSyncToLoxo === false,
    },
  });

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private admin</p>
          <h1>WhatsApp CRM sync.</h1>
          <p className="lede">
            Discovery for linking opted-in WhatsApp Business logistics to Loxo
            candidate records. No live sync. No personal WhatsApp scrape. No
            message bodies.
          </p>
          <div className="button-row hero-actions">
            <Link
              className="button button-secondary"
              href="/admin/recruiter-labs"
            >
              Recruiter Labs
            </Link>
            <Link
              className="button button-secondary"
              href="/admin/recruiter-labs/ai-ops"
            >
              AI Ops
            </Link>
            <Link className="button button-secondary" href="/admin/audit">
              Audit log
            </Link>
          </div>
        </div>

        <div className={styles.adminStatus}>
          <span className="tag">Discovery only</span>
          <div>
            <h2>Safe for private prototype. Not production ready.</h2>
            <p>{status.message}</p>
          </div>
          <div className={styles.adminStatusActions}>
            <Link className="button button-secondary" href="/admin/audit">
              Audit log
            </Link>
          </div>
        </div>

        <div className={styles.adminGrid} aria-label="WhatsApp CRM sync status">
          <div className={styles.adminStat}>
            <span>Production status</span>
            <strong>Not ready</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Real messages</span>
            <strong>{status.canSendRealWhatsAppMessages ? "On" : "Off"}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Loxo sync</span>
            <strong>{status.canSyncToLoxo ? "On" : "Off"}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>WhatsApp API</span>
            <strong>{status.whatsappStatus.state}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Database</span>
            <strong>{status.databaseStatus.state}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Loxo config</span>
            <strong>{status.loxoConfigured ? "Present" : "Missing"}</strong>
          </div>
        </div>

        <div className={styles.adminPanels}>
          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Recommendation</p>
                <h2>Check Loxo marketplace routes before custom build.</h2>
              </div>
              <span className={styles.labsRisk}>No live integration</span>
            </div>
            <p className={styles.adminEmpty}>{status.recommendedFirstStep}</p>
            <ul className={styles.adminChecklist}>
              {whatsAppCrmOperatingPrinciples.map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Feature flags</p>
                <h2>Everything stays off by default.</h2>
              </div>
            </div>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Flag</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {status.flagStates.map((flag) => (
                    <tr key={flag.name}>
                      <td>{flag.name}</td>
                      <td>
                        <span
                          className={
                            flag.enabled
                              ? styles.labsFlagOn
                              : `${styles.labsRisk} ${styles.labsRiskHigh}`
                          }
                        >
                          {flag.enabled ? "On" : "Off"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Provider options</p>
                <h2>Shortlist carefully. Do not pick blindly.</h2>
              </div>
            </div>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Option</th>
                    <th>Status</th>
                    <th>Finding</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {whatsAppCrmProviderOptions.map((provider) => (
                    <tr key={provider.name}>
                      <td>{provider.name}</td>
                      <td>
                        <span className={statusClass(provider.status)}>
                          {providerStatusLabel[provider.status]}
                        </span>
                      </td>
                      <td>{provider.finding}</td>
                      <td>
                        <a href={provider.evidenceUrl}>{provider.route}</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Allowed</p>
            <h2>Use WhatsApp for logistics.</h2>
            <ul className={styles.adminChecklist}>
              {whatsAppCrmAllowedMessageTypes.map((messageType) => (
                <li key={messageType}>{messageType}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Banned</p>
            <h2>Bad news is human.</h2>
            <ul className={styles.adminChecklist}>
              {whatsAppCrmBannedMessageTypes.map((messageType) => (
                <li key={messageType}>{messageType}</li>
              ))}
            </ul>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Mock timeline</p>
                <h2>Fake candidate data only.</h2>
              </div>
              <span className={styles.labsRisk}>Bodies excluded</span>
            </div>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {mockWhatsAppCrmTimeline.map((event) => (
                    <tr key={event.id}>
                      <td>{event.label}</td>
                      <td>{event.channel}</td>
                      <td>
                        <span className={statusClass(event.status)}>
                          {event.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td>{event.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Loxo evidence</p>
                <h2>Public docs suggest the hook points exist.</h2>
              </div>
            </div>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Why it matters</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {loxoApiEvidence.map((item) => (
                    <tr key={item.label}>
                      <td>{item.label}</td>
                      <td>{item.detail}</td>
                      <td>
                        <a href={item.url}>Open docs</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Questions</p>
                <h2>David should ask Loxo before any build.</h2>
              </div>
            </div>
            <ol className={styles.adminChecklist}>
              {loxoSupportQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </section>
  );
}
