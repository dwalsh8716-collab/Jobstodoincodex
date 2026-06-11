import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CMS_SESSION_COOKIE,
  getCmsSessionUsername,
  isCmsSessionValid,
} from "@/lib/cms-auth";
import { getLabsAiBriefBuilderPreview } from "@/lib/labs-ai-brief-builder";
import { logAuditEvent } from "@/lib/operations/audit";
import { createMetadata } from "@/lib/seo";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "AI Brief Builder | Essential Resourcing Labs",
    description:
      "Private, noindexed Labs preview for the AI-assisted job brief builder.",
    path: "/admin/labs/ai-brief-builder",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLabsAiBriefBuilderPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) redirect("/cms?next=/admin/labs/ai-brief-builder");

  const username = await getCmsSessionUsername(sessionCookie);
  const preview = getLabsAiBriefBuilderPreview();

  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "labs_dashboard_viewed",
    entityType: "labs_dashboard",
    entityLabel: "AI brief builder preview",
    metadata: {
      surface: "admin_labs_ai_brief_builder",
      featureEnabled: preview.status.featureFlagEnabled,
      nonAiModeAvailable: preview.status.nonAiModeAvailable,
      aiProviderImplemented: preview.status.aiProviderImplemented,
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
            A staged brief builder for getting under the surface of senior
            marketing, comms and interim roles. AI can help structure the
            thinking. David stays in control.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-secondary" href="/admin/labs">
              Labs overview
            </Link>
            <Link className="button button-secondary" href="/contact">
              {preview.cta}
            </Link>
          </div>
        </div>

        <div className={styles.adminStatus}>
          <span className="tag">
            {preview.status.featureFlagEnabled ? "Flag on" : "Flag off"}
          </span>
          <div>
            <h2>
              {preview.status.readyForPrivatePreview
                ? "Private preview can use the structured builder."
                : "Brief builder is staged, but live submissions are blocked."}
            </h2>
            <p>
              Non-AI mode is available as a design pattern. AI-assisted drafts
              stay blocked until provider, privacy and David review gates pass.
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

        <div className={styles.adminGrid} aria-label="AI brief builder status">
          <div className={styles.adminStat}>
            <span>Sections</span>
            <strong>{preview.sections.length}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Database</span>
            <strong>{preview.status.databaseStatus.state}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>AI provider</span>
            <strong>{preview.status.aiProviderImplemented ? "On" : "Off"}</strong>
          </div>
        </div>

        <div className={styles.adminPanels}>
          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Brief flow</p>
                <h2>Consultative, not a box-ticking form.</h2>
              </div>
            </div>
            <div className={styles.labsRoadmap}>
              {preview.sections.map((section, index) => (
                <article className={styles.labsCard} key={section.title}>
                  <div className={styles.labsCardHeader}>
                    <div>
                      <span className="tag">Step {index + 1}</span>
                      <h3>{section.title}</h3>
                    </div>
                  </div>
                  <ul className={styles.adminChecklist}>
                    {section.questions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Modes</p>
            <h2>AI optional. Judgement required.</h2>
            <ul className={styles.adminChecklist}>
              {preview.modes.map((mode) => (
                <li key={mode.label}>
                  <strong>{mode.label}:</strong> {mode.detail}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Draft outputs</p>
            <h2>Useful drafts, not final answers.</h2>
            <ul className={styles.adminChecklist}>
              {preview.outputTypes.map((output) => (
                <li key={output}>{output}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">AI safety</p>
            <h2>David reviews before anything is used.</h2>
            <ul className={styles.adminChecklist}>
              {preview.safetyRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Blockers</p>
            <h2>Still deliberately blocked.</h2>
            <ul className={styles.adminChecklist}>
              {preview.manualBlockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
