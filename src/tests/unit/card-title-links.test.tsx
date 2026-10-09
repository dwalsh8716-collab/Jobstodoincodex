import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InsightCard, JobCard } from "@/components/Cards";
import { JobListingCard } from "@/components/JobListingCard";
import { insights, jobs } from "@/lib/content";

describe("content card titles", () => {
  it("links job titles on the jobs index and candidate page", () => {
    const job = jobs[0];
    const href = `/jobs/${job.slug}`;

    for (const Card of [JobListingCard, JobCard]) {
      const html = renderToStaticMarkup(createElement(Card, { job }));
      expect(html).toMatch(new RegExp(`<h3[^>]*><a[^>]*href="${href}"`));
      expect(html).toContain(href);
    }
  });

  it("links insight titles without removing the read-more action", () => {
    const insight = insights[0];
    const html = renderToStaticMarkup(
      createElement(InsightCard, { insight, editorial: true }),
    );

    expect(html).toMatch(
      new RegExp(`<h3[^>]*><a[^>]*href="/insights/${insight.slug}"`),
    );
    expect(html).toContain("Read insight");
  });
});
