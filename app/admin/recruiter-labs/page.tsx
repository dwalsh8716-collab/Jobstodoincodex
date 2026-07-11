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
  type RecruiterLabsFlagName,
  type RecruiterLabsLaunchGateStatus,
  getRecruiterLabsOverview,
} from "@/lib/recruiter-labs";
import { createMetadata } from "@/lib/seo";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Recruiter Labs | Private Admin",
    description:
      "Private admin-only foundation for Essential Resourcing client shortlist and candidate presentation workflows.",
    path: "/admin/recruiter-labs",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

const statusLabel = {
  current: "Current",
  next: "Next",
  staged: "Staged",
  blocked: "Blocked",
  disabled: "Disabled",
  passed: "Passed",
  manual_review: "Manual review",
} as const;

type FeatureStatus = "built" | "staged" | "discovery" | "blocked";

type RecruiterLabsFeature = {
  title: string;
  status: FeatureStatus;
  summary: string;
  built: readonly string[];
  next: string;
  href?: string;
  route?: string;
  flagName?: RecruiterLabsFlagName;
};

const featureStatusLabel = {
  built: "Built private tool",
  staged: "Staged, not live",
  discovery: "Discovery built",
  blocked: "Blocked from client use",
} as const;

const recruiterLabsFeatures: readonly RecruiterLabsFeature[] = [
  {
    title: "Client shortlist portal",
    status: "staged",
    summary:
      "A future one-link client view for shortlisted candidates. It is private, noindexed and feature-gated.",
    built: [
      "Magic-link route with invalid, expired, revoked and not-ready states.",
      "Candidate cards for David summaries, strengths, watch-outs, package and working preference.",
      "Hashed token model so raw links are not stored.",
    ],
    next:
      "Do not send to real clients until Railway Postgres, audit proof, CV access and legal/privacy wording are signed off.",
    route: "/client/shortlist/[token]",
    flagName: "FEATURE_CLIENT_PRESENTATION_PORTAL",
  },
  {
    title: "Branded candidate profiles",
    status: "staged",
    summary:
      "Private candidate presentation cards for shortlists, written in David's voice and approved before a client sees them.",
    built: [
      "Profile fields for headline, seniority, background, strengths and watch-outs.",
      "Named or anonymised presentation modes.",
      "Server-side checks block missing consent, approval or unsafe retention state.",
    ],
    next:
      "Needs real candidate consent flow, private CV access and David approval workflow before use.",
    flagName: "FEATURE_BRANDED_CANDIDATE_PROFILES",
  },
  {
    title: "Client feedback and engagement tracking",
    status: "staged",
    summary:
      "Future private activity trail for what a client opens, expands or feeds back on inside a shortlist.",
    built: [
      "Private engagement event model.",
      "Feedback actions for shortlist candidates.",
      "Audit-safe event naming without GA4 candidate data.",
    ],
    next:
      "Only becomes useful when the private database is live and the shortlist portal is approved.",
    route: "/api/client-shortlist-feedback",
    flagName: "FEATURE_SHORTLIST_FEEDBACK_TRACKING",
  },
  {
    title: "Candidate transparency scorecard",
    status: "built",
    summary:
      "A private checker that shows whether a job advert is clear enough for candidates before it goes live.",
    built: [
      "Checks salary clarity, must-haves, interview process, privacy notes and placeholder copy.",
      "Blocks weak JobPosting schema until the advert is candidate-ready.",
      "No candidate ranking or private candidate data.",
    ],
    next:
      "Use this before publishing or indexing live jobs, then fix the advert copy in Sanity.",
    href: "/admin/recruiter-labs/candidate-transparency",
    route: "/admin/recruiter-labs/candidate-transparency",
  },
  {
    title: "AI Ops sandbox",
    status: "built",
    summary:
      "A private AI governance area for future admin drafting. It uses fake data only and blocks real candidate data.",
    built: [
      "Allowed and banned AI-use rules.",
      "Fake interview-note prototype.",
      "Launch gate for provider approval, consent, retention and human review.",
    ],
    next:
      "Do not use with real candidate data until the AI launch gate is cleared.",
    href: "/admin/recruiter-labs/ai-ops",
    route: "/admin/recruiter-labs/ai-ops",
  },
  {
    title: "WhatsApp CRM sync discovery",
    status: "discovery",
    summary:
      "A private research area for future WhatsApp Business and Loxo workflow sync.",
    built: [
      "Vendor comparison and risk notes.",
      "Candidate communication boundary rules.",
      "Fake candidate timeline only.",
    ],
    next:
      "No WhatsApp automation is live. Keep this as discovery until David approves provider, templates and consent wording.",
    href: "/admin/recruiter-labs/whatsapp-crm-sync",
    route: "/admin/recruiter-labs/whatsapp-crm-sync",
    flagName: "FEATURE_WHATSAPP_CRM_SYNC",
  },
  {
    title: "Retained search dashboard",
    status: "staged",
    summary:
      "A future aggregate-only client dashboard for retained search progress. It must not expose candidate records.",
    built: [
      "Noindexed retained-search client route.",
      "Aggregate pipeline event model.",
      "Access logging and launch-gate notes.",
    ],
    next:
      "Needs source-of-truth metrics, client wording and audit proof before client use.",
    route: "/client/retained-search/[token]",
    flagName: "FEATURE_RETAINED_SEARCH_DASHBOARD",
  },
  {
    title: "Interview workflow and scheduling",
    status: "blocked",
    summary:
      "Future interview request, WhatsApp logistics and Google Meet scheduling support.",
    built: [
      "Interview request model and documentation.",
      "WhatsApp logistics flags default off.",
      "Google scheduling remains manual-first until approved.",
    ],
    next:
      "Needs Google OAuth approval, WhatsApp Business setup, candidate consent and clear audit trails.",
    flagName: "FEATURE_INTERVIEW_REQUEST_WORKFLOW",
  },
  {
    title: "David's Take audio notes",
    status: "blocked",
    summary:
      "Future private audio notes from David inside candidate shortlist profiles.",
    built: [
      "Audio-note metadata and approval states are staged.",
      "APIs fail closed until private storage exists.",
      "No public audio URLs.",
    ],
    next:
      "Needs private object storage, compression, signed playback, retention and legal/privacy review.",
    route: "/api/recruiter-labs/audio-notes",
    flagName: "FEATURE_DAVIDS_AUDIO_NOTES",
  },
];

function launchGateStatusClass(status: RecruiterLabsLaunchGateStatus) {
  if (status === "passed") return styles.labsFlagOn;
  if (status === "blocked") return `${styles.labsRisk} ${styles.labsRiskHigh}`;
  return styles.labsRisk;
}

function featureStatusClass(status: FeatureStatus) {
  if (status === "built") return styles.labsFlagOn;
  if (status === "blocked") return `${styles.labsRisk} ${styles.labsRiskHigh}`;
  return styles.labsRisk;
}

export default async function AdminRecruiterLabsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) redirect("/cms?next=/admin/recruiter-labs");

  const username = await getCmsSessionUsername(sessionCookie);
  const overview = getRecruiterLabsOverview();
  const recruiterLabsFlag = overview.flags.find(
    (flag) => flag.name === "FEATURE_RECRUITER_LABS_ENABLED",
  );

  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "recruiter_labs_dashboard_viewed",
    entityType: "recruiter_labs_dashboard",
    entityLabel: "Recruiter Labs foundation",
    metadata: {
      surface: "admin_recruiter_labs",
      enabledFlags: overview.stats.enabledFlags,
      publicRoutes: overview.stats.publicRoutes,
      blockedLaunchGateChecks: overview.stats.blockedLaunchGateChecks,
      safeForRealClients: overview.launchGate.safeForRealClients,
    },
  });

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private admin</p>
          <h1>Recruiter Labs.</h1>
          <p className="lede">
            A private foundation for branded shortlists, client feedback and
            future interview workflows. No public CV links. No fake automation.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-secondary" href="/admin">
              Admin overview
            </Link>
            <Link className="button button-secondary" href="/admin/labs">
              Labs
            </Link>
            <Link
              className="button button-secondary"
              href="/admin/recruiter-labs/ai-ops"
            >
              AI Ops
            </Link>
            <Link
              className="button button-secondary"
              href="/admin/recruiter-labs/whatsapp-crm-sync"
            >
              WhatsApp CRM sync
            </Link>
            <Link
              className="button button-secondary"
              href="/admin/recruiter-labs/candidate-transparency"
            >
              Candidate scorecard
            </Link>
          </div>
        </div>

        <div className={styles.adminStatus}>
          <span className="tag">
            {recruiterLabsFlag?.enabled ? "Flag on" : "Private foundation"}
          </span>
          <div>
            <h2>
              {overview.launchGate.safeForRealClients
                ? "Recruiter Labs has no launch-gate blockers showing."
                : "Recruiter Labs is private testing only. Real clients are blocked."}
            </h2>
            <p>
              The client token route is now staged and noindexed, but real
              client data still needs private CV access, audit proof and
              legal/privacy sign-off before David sends any link.
            </p>
          </div>
          <div className={styles.adminStatusActions}>
            <Link className="button button-secondary" href="/admin/audit">
              Audit log
            </Link>
          </div>
        </div>

        <section
          className={styles.featureDirectory}
          aria-labelledby="recruiter-labs-feature-directory"
        >
          <div className={styles.featureDirectoryHeader}>
            <div>
              <p className="eyebrow">What you have built</p>
              <h2 id="recruiter-labs-feature-directory">
                Recruiter Labs feature map.
              </h2>
              <p>
                These are private tools and staged foundations. Green means
                useful as a private admin tool. Grey means staged. Strong
                warning means do not use with real clients yet.
              </p>
            </div>
            <span className={styles.labsRisk}>Private, noindexed</span>
          </div>

          <div
            className={styles.featureGrid}
            aria-label="Recruiter Labs built features"
          >
            {recruiterLabsFeatures.map((feature) => {
              const flag = feature.flagName
                ? overview.flags.find((item) => item.name === feature.flagName)
                : undefined;

              return (
                <article className={styles.featureCard} key={feature.title}>
                  <div className={styles.featureCardHeader}>
                    <div>
                      <span className={featureStatusClass(feature.status)}>
                        {featureStatusLabel[feature.status]}
                      </span>
                      <h3>{feature.title}</h3>
                    </div>
                    {flag ? (
                      <span
                        className={
                          flag.enabled ? styles.labsFlagOn : styles.labsFlagOff
                        }
                      >
                        {flag.enabled ? "Flag on" : "Flag off"}
                      </span>
                    ) : null}
                  </div>

                  <p>{feature.summary}</p>

                  <dl className={styles.featureMeta}>
                    <div>
                      <dt>Built</dt>
                      <dd>
                        <ul>
                          {feature.built.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div>
                      <dt>Where it lives</dt>
                      <dd>
                        {feature.href ? (
                          <Link href={feature.href}>{feature.route}</Link>
                        ) : (
                          <code>{feature.route || "Private model/docs"}</code>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Next before real use</dt>
                      <dd>{feature.next}</dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        </section>

        <div className={styles.adminGrid} aria-label="Recruiter Labs overview">
          <div className={styles.adminStat}>
            <span>Feature flags</span>
            <strong>{overview.stats.totalFlags}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Enabled flags</span>
            <strong>{overview.stats.enabledFlags}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Blocked dependencies</span>
            <strong>{overview.stats.blockedDependencies}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Launch blockers</span>
            <strong>{overview.stats.blockedLaunchGateChecks}</strong>
          </div>
          <div className={styles.adminStat}>
            <span>Public routes</span>
            <strong>{overview.stats.publicRoutes}</strong>
          </div>
        </div>

        <div className={styles.adminPanels}>
          <section className={styles.adminPanel}>
            <p className="eyebrow">Route strategy</p>
            <h2>Private first. Client links later.</h2>
            <ul className={styles.adminChecklist}>
              <li>`/admin/recruiter-labs` is admin-only and noindexed.</li>
              <li>
                `/client/shortlist/[token]` is staged, noindexed and
                feature-gated.
              </li>
              <li>
                No shortlist or candidate profile appears in public sitemap.
              </li>
              <li>
                Magic-link tokens must be hashed in Postgres, never logged.
              </li>
              <li>David must verify every client-facing candidate summary.</li>
            </ul>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Launch gate</p>
                <h2>Safe for admin testing. Not safe for real clients yet.</h2>
              </div>
              <span
                className={
                  overview.launchGate.safeForPrivateAdminTesting
                    ? styles.labsFlagOn
                    : `${styles.labsRisk} ${styles.labsRiskHigh}`
                }
              >
                {overview.launchGate.safeForPrivateAdminTesting
                  ? "Private testing OK"
                  : "Private testing blocked"}
              </span>
            </div>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Check</th>
                    <th>Status</th>
                    <th>Required before</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.launchGate.checks.map((check) => (
                    <tr key={check.id}>
                      <td>
                        {check.label}
                        <span className={styles.adminSubtle}>
                          {check.category}
                        </span>
                      </td>
                      <td>
                        <span className={launchGateStatusClass(check.status)}>
                          {statusLabel[check.status]}
                        </span>
                      </td>
                      <td>
                        {check.requiredBefore
                          .map((requirement) =>
                            requirement.replaceAll("_", " "),
                          )
                          .join(", ")}
                      </td>
                      <td>{check.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Dependencies</p>
            <h2>What must be safe first.</h2>
            <div className={styles.labsRoadmap}>
              {overview.dependencies.map((dependency) => (
                <article className={styles.labsCard} key={dependency.label}>
                  <div className={styles.labsCardHeader}>
                    <h3>{dependency.label}</h3>
                    <span
                      className={
                        dependency.status === "blocked"
                          ? `${styles.labsRisk} ${styles.labsRiskHigh}`
                          : styles.labsRisk
                      }
                    >
                      {statusLabel[dependency.status]}
                    </span>
                  </div>
                  <p>{dependency.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Build phases</p>
                <h2>David stays in control.</h2>
              </div>
            </div>
            <div className={styles.labsRoadmap}>
              {overview.phases.map((phase) => (
                <article className={styles.labsCard} key={phase.title}>
                  <div className={styles.labsCardHeader}>
                    <h3>{phase.title}</h3>
                    <span
                      className={
                        phase.status === "blocked"
                          ? `${styles.labsRisk} ${styles.labsRiskHigh}`
                          : styles.labsRisk
                      }
                    >
                      {statusLabel[phase.status]}
                    </span>
                  </div>
                  <p>{phase.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Client presentation portal</p>
                <h2>One secure shortlist link. No public candidate data.</h2>
              </div>
              <span className={styles.labsRisk}>
                {overview.clientPresentationPortal.route}
              </span>
            </div>
            <div className={styles.labsRoadmap}>
              {overview.clientPresentationPortal.adminWorkflow.map((step) => (
                <article className={styles.labsCard} key={step.step}>
                  <div className={styles.labsCardHeader}>
                    <h3>{step.step}</h3>
                    <span
                      className={
                        step.status === "manual_review"
                          ? styles.labsRisk
                          : styles.labsFlagOn
                      }
                    >
                      {statusLabel[step.status]}
                    </span>
                  </div>
                  <p>{step.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.adminPanel} ${styles.adminPanelWide}`}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Server flags</p>
                <h2>Off until deliberately approved.</h2>
              </div>
            </div>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Flag</th>
                    <th>State</th>
                    <th>Scope</th>
                    <th>Purpose</th>
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
                      <td>{flag.description}</td>
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
