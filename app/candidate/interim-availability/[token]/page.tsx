import type { Metadata } from "next";
import Link from "next/link";
import { InterimAvailabilityForm } from "@/components/InterimAvailabilityForm";
import {
  getInterimAvailabilityView,
  type InterimAvailabilityViewState,
} from "@/lib/interim-availability";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Interim Availability Update | Essential Resourcing",
    description:
      "Private interim availability update link for Essential Resourcing candidates.",
    path: "/candidate/interim-availability",
    noIndex: true,
  }),
  robots: {
    index: false,
    follow: false,
  },
};

const stateCopy: Record<
  Exclude<InterimAvailabilityViewState, "ready">,
  { title: string; body: string }
> = {
  feature_disabled: {
    title: "This update route is not live yet.",
    body: "David has not switched on interim availability updates yet.",
  },
  backend_unavailable: {
    title: "This update route is not connected yet.",
    body: "Please message David directly with your interim availability.",
  },
  invalid_token: {
    title: "This link cannot be used.",
    body: "The link is invalid or has already been replaced.",
  },
  expired: {
    title: "This link has expired.",
    body: "Ask David for a fresh interim availability link.",
  },
  revoked: {
    title: "This link is no longer available.",
    body: "David has closed this interim availability link.",
  },
};

export default async function InterimAvailabilityPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const view = await getInterimAvailabilityView(token);
  const blockedCopy = view.state === "ready" ? null : stateCopy[view.state];

  return (
    <section className="section surface">
      <div className="container split split-start">
        <div>
          <p className="eyebrow">Strategic Interim</p>
          <h1>
            {view.state === "ready"
              ? "Update your interim availability."
              : blockedCopy?.title}
          </h1>
          <p className="lede">
            {view.state === "ready"
              ? "A quick private update so David knows whether to call you about interim work. No public listing. No faff."
              : blockedCopy?.body}
          </p>
          <div className="mini-process">
            <h2>What this does</h2>
            <ol>
              <li>Updates your private interim bench status.</li>
              <li>Helps David avoid bothering you at the wrong time.</li>
              <li>Does not publish your details anywhere.</li>
            </ol>
          </div>
          <p className="form-note">
            If this link is wrong, email{" "}
            <Link className="text-link" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </Link>
            .
          </p>
        </div>

        {view.state === "ready" && view.token ? (
          <InterimAvailabilityForm token={view.token} current={view.current} />
        ) : null}
      </div>
    </section>
  );
}
