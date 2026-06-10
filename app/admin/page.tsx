import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CMS_SESSION_COOKIE,
  getCmsSessionUsername,
  isCmsSessionValid,
} from "@/lib/cms-auth";
import {
  dataSubjectRequestStatusLabels,
  dataSubjectRequestTypeOptions,
  dataSubjectVerificationLabels,
} from "@/lib/dsar";
import { logAuditEvent } from "@/lib/operations/audit";
import { getOperationsOverview } from "@/lib/operations/store";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Private Admin | Essential Resourcing",
    description:
      "Private operations dashboard for Essential Resourcing enquiries, candidates and applications.",
    path: "/admin",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

const setupItems = [
  "Create the Railway Postgres service.",
  "Set DATABASE_URL on the app service.",
  "Set OPERATIONS_DB_ENABLED=true only after migrations pass.",
  "Run npm run db:migrate against the Railway database.",
  "Keep CV files out of public storage until private object storage is approved.",
  "Review data/privacy requests before any export, correction or deletion.",
];

function formatDataRequestType(value: string) {
  return (
    dataSubjectRequestTypeOptions.find((option) => option.value === value)
      ?.label || value.replaceAll("_", " ")
  );
}

function formatLookup<T extends Record<string, string>>(
  lookup: T,
  value: string,
) {
  return lookup[value as keyof T] || value.replaceAll("_", " ");
}

function formatDueDate(value?: string) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) redirect("/cms?next=/admin");

  const username = await getCmsSessionUsername(sessionCookie);
  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "operations_dashboard_viewed",
    entityType: "admin_dashboard",
    entityLabel: "Private admin dashboard",
    metadata: {
      surface: "admin_overview",
    },
  });

  const overview = await getOperationsOverview();
  const statCards = [
    { label: "Total enquiries", value: overview.enquiryCount },
    { label: "New enquiries", value: overview.newEnquiryCount },
    { label: "Candidates", value: overview.candidateCount },
    { label: "Applications", value: overview.applicationCount },
    { label: "Open tasks", value: overview.openTaskCount },
    { label: "Open data requests", value: overview.openDataRequestCount },
    { label: "Retention reviews", value: overview.retentionReviewCount },
  ];

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private admin</p>
          <h1>Keep the operational stuff private.</h1>
          <p className="lede">
            Sanity still runs the public website. Railway Postgres is for
            enquiries, candidates, applications, notes, tasks and audit history.
          </p>
        </div>

        <div className={styles.adminStatus}>
          <span className="tag">
            {overview.status.state.replaceAll("_", " ")}
          </span>
          <div>
            <h2>
              {overview.status.enabled
                ? "Operations database"
                : "Database staged"}
            </h2>
            <p>{overview.status.message}</p>
          </div>
          <div className={styles.adminStatusActions}>
            <Link className="button button-secondary" href="/cms">
              CMS gate
            </Link>
            <Link className="button button-secondary" href="/admin/audit">
              Audit log
            </Link>
          </div>
        </div>

        <div className={styles.adminGrid} aria-label="Operations overview">
          {statCards.map((card) => (
            <div className={styles.adminStat} key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          ))}
        </div>

        <div className={styles.adminPanels}>
          <section className={styles.adminPanel}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Latest enquiries</p>
                <h2>New work comes in here.</h2>
              </div>
            </div>
            {overview.latestEnquiries.length ? (
              <div className={styles.adminTableWrap}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Interest</th>
                      <th>Status</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.latestEnquiries.map((enquiry) => (
                      <tr key={enquiry.id}>
                        <td>{enquiry.name}</td>
                        <td>{enquiry.enquiryType}</td>
                        <td>{enquiry.serviceInterest || "Not stated"}</td>
                        <td>{enquiry.status}</td>
                        <td>{enquiry.priority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.adminEmpty}>
                No private records are showing yet. If Railway Postgres is not
                enabled, the public site still works and enquiries can still go
                through the existing email route.
              </p>
            )}
          </section>

          <section className={styles.adminPanel}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Data/privacy requests</p>
                <h2>Identity first. Then action.</h2>
              </div>
            </div>
            {overview.latestDataRequests.length ? (
              <div className={styles.adminTableWrap}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Requester</th>
                      <th>Request</th>
                      <th>Status</th>
                      <th>Verification</th>
                      <th>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.latestDataRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.requesterName}</td>
                        <td>{formatDataRequestType(request.requestType)}</td>
                        <td>
                          {formatLookup(
                            dataSubjectRequestStatusLabels,
                            request.status,
                          )}
                        </td>
                        <td>
                          {formatLookup(
                            dataSubjectVerificationLabels,
                            request.verificationStatus,
                          )}
                        </td>
                        <td>{formatDueDate(request.dueAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.adminEmpty}>
                No data/privacy requests are showing yet. When one arrives,
                verify identity before releasing, deleting or changing private
                candidate data.
              </p>
            )}
          </section>

          <section className={styles.adminPanel}>
            <div className={styles.adminPanelHeading}>
              <div>
                <p className="eyebrow">Retention review</p>
                <h2>Review before deleting anything.</h2>
              </div>
            </div>
            {overview.latestRetentionReviews.length ? (
              <div className={styles.adminTableWrap}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Record</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Action</th>
                      <th>Retention date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.latestRetentionReviews.map((record) => (
                      <tr key={`${record.entityType}-${record.entityId}`}>
                        <td>
                          {formatLookup(
                            {
                              candidate: "Candidate",
                              application: "Application",
                              enquiry: "Enquiry",
                              cv_file: "CV/file metadata",
                              data_subject_request: "Data/privacy request",
                            },
                            record.entityType,
                          )}
                          <span className={styles.adminSubtle}>
                            {record.entityLabel}
                          </span>
                        </td>
                        <td>{record.retentionCategory.replaceAll("_", " ")}</td>
                        <td>{record.retentionStatus.replaceAll("_", " ")}</td>
                        <td>{record.recommendedAction.replaceAll("_", " ")}</td>
                        <td>{formatDueDate(record.dataRetentionUntil)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.adminEmpty}>
                No records are currently due for retention review. The retention
                engine is staged to create review tasks first, not delete data
                automatically.
              </p>
            )}
          </section>

          <section className={styles.adminPanel}>
            <p className="eyebrow">Setup</p>
            <h2>Do this before treating it as live operations.</h2>
            <ul className={styles.adminChecklist}>
              {setupItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="meta">
              This is not a public CRM. It is a private operations layer for{" "}
              {siteConfig.name}. Keep legal review, retention and storage
              decisions in the launch checklist.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
