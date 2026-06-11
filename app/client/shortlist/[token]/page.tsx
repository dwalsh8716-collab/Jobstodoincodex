import Link from "next/link";
import {
  getRecruiterLabsClientPortalRateLimitDecision,
  getRecruiterLabsClientPortalStatus,
  getRecruiterLabsClientPortalView,
  type RecruiterLabsClientPortalState,
  type RecruiterLabsClientPortalView,
  type RecruiterLabsShortlistCandidatePresentation,
} from "@/lib/client-shortlist-portal";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = createMetadata({
  title: "Private shortlist access | Essential Resourcing",
  description:
    "Private, noindexed client shortlist access for Essential Resourcing.",
  path: "/client/shortlist",
  noIndex: true,
});

type ClientShortlistPageProps = {
  params: Promise<{
    token?: string | string[];
  }>;
};

const stateCopy: Record<
  RecruiterLabsClientPortalState,
  { tag: string; title: string; body: string }
> = {
  active: {
    tag: "Private shortlist",
    title: "Shortlist ready for review.",
    body: "This private shortlist is open for the named client contact only.",
  },
  invalid: {
    tag: "Link not recognised",
    title: "This shortlist link cannot be opened.",
    body: "The link may have been copied incorrectly. Ask David for a fresh link and he will sort it directly.",
  },
  expired: {
    tag: "Expired link",
    title: "This shortlist link has expired.",
    body: "Shortlist links are time-limited. Ask David for a fresh link if you still need access.",
  },
  revoked: {
    tag: "Access revoked",
    title: "This shortlist link is no longer available.",
    body: "David has closed or revoked this private shortlist link.",
  },
  feature_disabled: {
    tag: "Private beta closed",
    title: "Client shortlist access is not live yet.",
    body: "This route is staged, noindexed and feature-gated. It will not show candidate data until David has approved the private portal for real client use.",
  },
  backend_unavailable: {
    tag: "Private data offline",
    title: "This private link is not connected yet.",
    body: "The shortlist portal needs the private Postgres backend, audit logging and launch gate switched on before it can show client data.",
  },
  rate_limited: {
    tag: "Try again shortly",
    title: "Too many access attempts.",
    body: "Wait a minute and try the link again. This protects private shortlist links from repeated guessing.",
  },
  shortlist_not_ready: {
    tag: "Not ready",
    title: "This shortlist is not ready for client review.",
    body: "David still needs to approve the shortlist, candidate consent, privacy checks and client visibility before this link can show anything.",
  },
};

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

function buildRateLimitedView(): RecruiterLabsClientPortalView {
  return {
    decision: {
      allowed: false,
      state: "rate_limited",
      reason: "too_many_attempts",
    },
    status: getRecruiterLabsClientPortalStatus(),
    shortlist: null,
  };
}

function CandidateCard({
  candidate,
}: {
  candidate: RecruiterLabsShortlistCandidatePresentation;
}) {
  return (
    <article className="card">
      <span className="tag">
        {candidate.sharingMode === "anonymised" ? "Anonymised" : "Approved"}
      </span>
      <h3>{candidate.name}</h3>
      {candidate.headline ? <p>{candidate.headline}</p> : null}
      <dl className="client-shortlist-meta">
        {candidate.location ? (
          <div>
            <dt>Location</dt>
            <dd>{candidate.location}</dd>
          </div>
        ) : null}
        {candidate.availability ? (
          <div>
            <dt>Availability</dt>
            <dd>{candidate.availability}</dd>
          </div>
        ) : null}
        {candidate.salaryExpectation ? (
          <div>
            <dt>Package</dt>
            <dd>{candidate.salaryExpectation}</dd>
          </div>
        ) : null}
      </dl>
      {candidate.davidSummary ? (
        <>
          <h4>David&apos;s take</h4>
          <p>{candidate.davidSummary}</p>
        </>
      ) : null}
      {candidate.evidenceNotes ? (
        <>
          <h4>Why they are here</h4>
          <p>{candidate.evidenceNotes}</p>
        </>
      ) : null}
      <div className="button-row">
        <button className="button button-secondary" type="button" disabled>
          Shortlist
        </button>
        <button className="button button-secondary" type="button" disabled>
          Maybe
        </button>
        <button className="button button-secondary" type="button" disabled>
          Decline
        </button>
        <button className="button button-primary" type="button" disabled>
          Request interview
        </button>
      </div>
      <p className="meta">
        Feedback and interview requests are staged for the next protected
        workflow. CV access stays blocked unless David has approved it.
      </p>
    </article>
  );
}

export default async function ClientShortlistPage({
  params,
}: ClientShortlistPageProps) {
  const { token: tokenParam } = await params;
  const token = normaliseParamToken(tokenParam);
  const rateLimit = getRecruiterLabsClientPortalRateLimitDecision(token);
  const view = rateLimit.allowed
    ? await getRecruiterLabsClientPortalView(token)
    : buildRateLimitedView();
  const copy = stateCopy[view.decision.state];
  const expiry = formatDate(view.decision.expiresAt);
  const shortlist = view.shortlist;

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
            <h2>Private by default.</h2>
            <ul>
              <li>Token links are hashed in storage and time-limited.</li>
              <li>This page is noindexed and excluded from the sitemap.</li>
              <li>No candidate data appears without valid client access.</li>
              <li>CV access is separate and needs explicit approval.</li>
              <li>No marketing analytics event is fired from this route.</li>
            </ul>
          </article>

          <article className="card">
            <p className="eyebrow">Launch gate</p>
            <h2>
              {view.status.featureEnabled
                ? "Portal flag is on."
                : "Portal flag is off."}
            </h2>
            <p>
              {view.status.featureEnabled
                ? "The feature flag is enabled, but private data still depends on database, audit, consent and launch-gate checks."
                : "This is the correct default until David approves private beta or real client use."}
            </p>
            <p className="meta">
              Default link expiry: {view.status.expiryDays} days.
            </p>
          </article>
        </div>
      </section>

      {shortlist ? (
        <>
          <section className="section muted">
            <div className="container section-heading">
              <p className="eyebrow">Shortlist overview</p>
              <h2>{shortlist.title}</h2>
              {shortlist.roleContext ? <p>{shortlist.roleContext}</p> : null}
              {shortlist.davidIntroNote ? (
                <p className="lede">{shortlist.davidIntroNote}</p>
              ) : null}
              {expiry ? <p className="meta">Link expires {expiry}.</p> : null}
            </div>
          </section>

          <section className="section surface">
            <div className="container grid grid-2">
              {shortlist.candidates.length > 0 ? (
                shortlist.candidates.map((candidate) => (
                  <CandidateCard candidate={candidate} key={candidate.id} />
                ))
              ) : (
                <article className="card">
                  <p className="eyebrow">No visible profiles</p>
                  <h2>Candidate cards stay hidden.</h2>
                  <p>
                    There are no approved, consent-cleared candidate cards for
                    this shortlist yet.
                  </p>
                </article>
              )}
            </div>
            {shortlist.withheldCandidateCount > 0 ? (
              <p className="container meta">
                {shortlist.withheldCandidateCount} profile
                {shortlist.withheldCandidateCount === 1 ? "" : "s"} withheld
                because approval, consent, CV access or retention checks are not
                complete.
              </p>
            ) : null}
          </section>
        </>
      ) : null}
    </>
  );
}
