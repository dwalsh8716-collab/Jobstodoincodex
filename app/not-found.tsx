import Link from "next/link";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Page Not Found | Essential Resourcing",
  description: "This Essential Resourcing page could not be found. Return home or contact David Walsh.",
  path: "/404",
  noIndex: true
});

export default function NotFound() {
  return (
    <section className="section dark">
      <div className="container section-heading">
        <p className="eyebrow">404</p>
        <h1>That page has gone missing.</h1>
        <p className="lede">
          No drama. Head back to the main site, explore services, or talk to David if you were trying to find a brief,
          role or insight.
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
