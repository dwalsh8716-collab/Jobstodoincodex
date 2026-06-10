import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CMS_SESSION_COOKIE,
  isCmsSessionValid,
} from "@/lib/cms-auth";
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
];

export default async function AdminPage() {
  const cookieStore = await cookies();
  const loggedIn = await isCmsSessionValid(
    cookieStore.get(CMS_SESSION_COOKIE)?.value,
  );

  if (!loggedIn) redirect("/cms?next=/admin");

  const overview = await getOperationsOverview();
  const statCards = [
    { label: "Total enquiries", value: overview.enquiryCount },
    { label: "New enquiries", value: overview.newEnquiryCount },
    { label: "Candidates", value: overview.candidateCount },
    { label: "Applications", value: overview.applicationCount },
    { label: "Open tasks", value: overview.openTaskCount },
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
          <span className="tag">{overview.status.state.replaceAll("_", " ")}</span>
          <div>
            <h2>{overview.status.enabled ? "Operations database" : "Database staged"}</h2>
            <p>{overview.status.message}</p>
          </div>
          <Link className="button button-secondary" href="/cms">
            CMS gate
          </Link>
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
