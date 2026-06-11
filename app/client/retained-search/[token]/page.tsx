import Link from "next/link";
import {
  getRetainedSearchDashboardView,
  type RetainedSearchDashboardState,
} from "@/lib/retained-search-dashboard";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = createMetadata({
  title: "Private retained search dashboard | Essential Resourcing",
  description:
    "Private, noindexed retained search progress dashboard for Essential Resourcing clients.",
  path: "/client/retained-search",
  noIndex: true,
});

type RetainedSearchDashboardPageProps = {
  params: Promise<{
    token?: string | string[];
  }>;
};

const stateCopy: Record<
  RetainedSearchDashboardState,
  { tag: string; title: string; body: string }
> = {
  active: {
    tag: "Private dashboard",
    title: "Search progress, without the noise.",
    body: "This private view shows aggregate progress only. No candidate names, no CVs and no personal data.",
  },
  invalid: {
    tag: "Link not recognised",
    title: "This dashboard link cannot be opened.",
    body: "The link may have been copied incorrectly. Ask David for a fresh link and he will sort it directly.",
  },
  expired: {
    tag: "Expired link",
    title: "This dashboard link has expired.",
    body: "Dashboard links are time-limited. Ask David for a fresh link if you still need access.",
  },
  revoked: {
    tag: "Access revoked",
    title: "This dashboard link is no longer available.",
    body: "David has closed or revoked this private dashboard link.",
  },
  feature_disabled: {
    tag: "Private beta closed",
    title: "Retained search dashboards are not live yet.",
    body: "This route is staged, noindexed and feature-gated until David approves real client use.",
  },
  backend_unavailable: {
    tag: "Private data offline",
    title: "This private dashboard is not connected yet.",
    body: "The dashboard needs the private Postgres backend, aggregate pipeline data and launch gate switched on before it can show client data.",
  },
  dashboard_not_ready: {
    tag: "Not ready",
    title: "This dashboard is not ready for client review.",
    body: "David still needs to approve visibility, aggregate metric sources and client wording before this dashboard can show anything.",
  },
};

const metricLabels = [
  ["totalMapped", "Mapped"],
  ["totalApproached", "Approached"],
  ["totalResponded", "Responded"],
  ["totalScreened", "Screened"],
  ["totalRejected", "Rejected"],
  ["totalShortlisted", "Shortlisted"],
  ["interviewStageCount", "Interview stage"],
] as const;

function normaliseParamToken(token?: string | string[]) {
  if (Array.isArray(token)) return token[0];
  return token;
}

function formatDate(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function RetainedSearchDashboardPage({
  params,
}: RetainedSearchDashboardPageProps) {
  const { token: tokenParam } = await params;
  const view = await getRetainedSearchDashboardView(
    normaliseParamToken(tokenParam),
  );
  const copy = stateCopy[view.decision.state];
  const dashboard = view.dashboard;
  const expiry = formatDate(view.decision.expiresAt || dashboard?.expiresAt);

  return (
    <>
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Private client access</p>
          <span className="tag">{copy.tag}</span>
          <h1>{copy.title}</h1>
          <p className="lede">{copy.body}</p>
          <div className="button-row hero-actions">
            <Link className="button button-secondary" href="/contact">
              Contact David
            </Link>
          </div>
        </div>
      </section>

      <section className="section surface">
        <div className="container split split-start">
          <article className="card">
            <p className="eyebrow">Access rules</p>
            <h2>Aggregate only.</h2>
            <ul>
              <li>Token links are hashed in storage and time-limited.</li>
              <li>This page is noindexed and excluded from the sitemap.</li>
              <li>No candidate names, CVs or personal contact details appear.</li>
              <li>Metrics come from aggregate pipeline events where available.</li>
              <li>Market notes and blockers need David approval before sharing.</li>
            </ul>
          </article>

          <article className="card">
            <p className="eyebrow">Launch gate</p>
            <h2>
              {view.status.featureEnabled
                ? "Dashboard flag is on."
                : "Dashboard flag is off."}
            </h2>
            <p>
              {view.status.featureEnabled
                ? "The feature flag is enabled, but private data still depends on database, token and client visibility checks."
                : "This is the correct default until David approves private beta or real client use."}
            </p>
          </article>
        </div>
      </section>

      {dashboard ? (
        <>
          <section className="section muted">
            <div className="container section-heading">
              <p className="eyebrow">Retained search progress</p>
              <h2>{dashboard.title}</h2>
              {dashboard.roleContext ? <p>{dashboard.roleContext}</p> : null}
              {expiry ? <p className="meta">Link expires {expiry}.</p> : null}
            </div>
            <div className="container grid grid-4">
              {metricLabels.map(([key, label]) => (
                <article className="card" key={key}>
                  <p className="eyebrow">{label}</p>
                  <h3>{dashboard.metrics[key]}</h3>
                </article>
              ))}
            </div>
          </section>

          <section className="section surface">
            <div className="container grid grid-2">
              <article className="card">
                <p className="eyebrow">Market notes</p>
                <h2>What we are seeing.</h2>
                <p>
                  {dashboard.marketNotes ||
                    "David has not approved a market note for this dashboard yet."}
                </p>
              </article>

              <article className="card">
                <p className="eyebrow">Salary/rate reality</p>
                <h2>Where the market is landing.</h2>
                <p>
                  {dashboard.salaryRateReality ||
                    "David has not approved salary or rate commentary for this dashboard yet."}
                </p>
              </article>

              <article className="card">
                <p className="eyebrow">Blockers</p>
                <h2>What could slow this down.</h2>
                <p>
                  {dashboard.blockers ||
                    "No client-facing blockers have been approved for this dashboard yet."}
                </p>
              </article>

              <article className="card">
                <p className="eyebrow">Next actions</p>
                <h2>What happens next.</h2>
                <p>
                  {dashboard.nextActions ||
                    "David will confirm the next action once the aggregate update is ready."}
                </p>
              </article>
            </div>
          </section>

          {dashboard.processTimeline.length > 0 ? (
            <section className="section muted">
              <div className="container section-heading">
                <p className="eyebrow">Process timeline</p>
                <h2>Clear progress, no theatre.</h2>
              </div>
              <div className="container grid grid-3">
                {dashboard.processTimeline.map((item) => (
                  <article className="card" key={`${item.label}-${item.date}`}>
                    {item.date ? <p className="eyebrow">{item.date}</p> : null}
                    <h3>{item.label}</h3>
                    {item.detail ? <p>{item.detail}</p> : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </>
  );
}
