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
  auditActions,
  auditEntityTypes,
  getAuditLogOverview,
  logAuditEvent,
} from "@/lib/operations/audit";
import { createMetadata } from "@/lib/seo";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Audit Log | Essential Resourcing",
    description:
      "Private read-only audit log for Essential Resourcing sensitive data access and admin activity.",
    path: "/admin/audit",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatValue(value: string) {
  return value.replaceAll("_", " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatJson(value: unknown) {
  if (!value || (typeof value === "object" && !Object.keys(value).length)) {
    return "No metadata";
  }

  return JSON.stringify(value, null, 2);
}

export default async function AdminAuditPage({ searchParams }: Props) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) redirect("/cms?next=/admin/audit");

  const username = await getCmsSessionUsername(sessionCookie);
  const params = await searchParams;
  const filters = {
    entityType: firstParam(params.entityType) || "",
    action: firstParam(params.action) || "",
    actor: firstParam(params.actor) || "",
    entityId: firstParam(params.entityId) || "",
  };

  await logAuditEvent({
    actor: username
      ? {
          email: username,
          role: "cms_admin",
        }
      : undefined,
    action: "audit_log_viewed",
    entityType: "audit_log",
    entityLabel: "Audit log",
    metadata: {
      filters: Object.fromEntries(
        Object.entries(filters).filter(([, value]) => Boolean(value)),
      ),
    },
  });

  const overview = await getAuditLogOverview(filters);

  return (
    <section className={`section ${styles.adminShell}`}>
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Private admin</p>
          <h1>Read-only audit log.</h1>
          <p className="lede">
            A defensible record of sensitive data access, admin authentication
            and privacy workflow events. Normal app flow can add rows, not edit
            or delete them.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-secondary" href="/admin">
              Admin overview
            </Link>
          </div>
        </div>

        <div className={styles.adminStatus}>
          <span className="tag">{overview.status.state.replaceAll("_", " ")}</span>
          <div>
            <h2>{overview.totalCount} audit events</h2>
            <p>{overview.status.message}</p>
          </div>
        </div>

        <form className={styles.adminFilters} action="/admin/audit">
          <div className="form-row">
            <label htmlFor="entityType">Entity type</label>
            <select id="entityType" name="entityType" defaultValue={filters.entityType}>
              <option value="">All entity types</option>
              {auditEntityTypes.map((entityType) => (
                <option value={entityType} key={entityType}>
                  {formatValue(entityType)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="action">Action</label>
            <select id="action" name="action" defaultValue={filters.action}>
              <option value="">All actions</option>
              {auditActions.map((action) => (
                <option value={action} key={action}>
                  {formatValue(action)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="actor">Actor</label>
            <input
              id="actor"
              name="actor"
              type="search"
              defaultValue={filters.actor}
              placeholder="admin email"
              maxLength={120}
            />
          </div>
          <div className="form-row">
            <label htmlFor="entityId">Entity ID</label>
            <input
              id="entityId"
              name="entityId"
              type="search"
              defaultValue={filters.entityId}
              placeholder="uuid"
              maxLength={80}
            />
          </div>
          <button className="button button-primary" type="submit">
            Filter
          </button>
          <Link className="button button-secondary" href="/admin/audit">
            Clear
          </Link>
        </form>

        <section className={styles.adminPanel}>
          {overview.latest.length ? (
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.latest.map((event) => (
                    <tr key={event.id}>
                      <td>{formatDate(event.createdAt)}</td>
                      <td>{event.actorEmail || "System"}</td>
                      <td>{formatValue(event.action)}</td>
                      <td>
                        {formatValue(event.entityType)}
                        {event.entityLabel ? (
                          <span className={styles.adminSubtle}>
                            {event.entityLabel}
                          </span>
                        ) : null}
                      </td>
                      <td>
                        <details className={styles.auditDetails}>
                          <summary>View safe metadata</summary>
                          <pre>{formatJson(event.metadata)}</pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.adminEmpty}>
              No audit events are showing yet. If Railway Postgres is not
              enabled, public routes can still work but compliance logs are not
              live.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
