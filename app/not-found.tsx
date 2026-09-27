import Link from "next/link";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Page Not Found | Essential Resourcing",
  description:
    "This Essential Resourcing page couldn’t be found. Head home or talk directly to David Walsh.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <section className="section dark">
      <div className="container section-heading">
        <p className="eyebrow">404</p>
        <h1>Well, this is awkward.</h1>
        <p className="lede">
          That page has gone missing. Head back home, have a look at the
          services or give David a shout if you were trying to find something
          specific.
        </p>
        <div className="button-row hero-actions">
          <Link className="button button-primary" href="/">
            Go home
          </Link>
          <Link className="button button-secondary" href="/contact">
            Talk to David
          </Link>
        </div>
      </div>
    </section>
  );
}
