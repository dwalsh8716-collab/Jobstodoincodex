import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HowEssentialWorksPage, {
  metadata,
} from "../../../app/how-essential-resourcing-works/page";
import { FourRouteSelector } from "@/components/FourRouteSelector";
import { ServiceComparison } from "@/components/ServiceComparison";
import { services } from "@/lib/content";
import {
  commonSearchStages,
  comparisonDimensions,
  essentialPrinciples,
  essentialRoutes,
} from "@/lib/essential-approach";

describe("Essential parent proposition", () => {
  it("routes to the four current products without redefining their names or paths", () => {
    expect(essentialRoutes.map(({ title, href }) => ({ title, href }))).toEqual(
      services.map(({ title, slug }) => ({ title, href: `/services/${slug}` })),
    );
    expect(essentialRoutes).toHaveLength(4);
    expect(comparisonDimensions).toHaveLength(6);
    for (const route of essentialRoutes) {
      expect(route.comparison).toHaveLength(6);
      expect(route.comparison.every(Boolean)).toBe(true);
    }
    expect(essentialRoutes[3].comparison[5]).toBe("No");
  });

  it("keeps the principles separate from the seven search stages and preserves deep links", () => {
    expect(essentialPrinciples).toHaveLength(5);
    expect(commonSearchStages.map(({ id }) => id)).toEqual([
      "get-underneath-the-brief",
      "map-the-market",
      "approach-people-properly",
      "get-behind-the-cv",
      "focused-shortlist",
      "help-you-assess",
      "get-it-over-the-line",
    ]);
  });

  it("renders four whole-card links with explicit accessible names and visible link copy", () => {
    const html = renderToStaticMarkup(
      createElement(FourRouteSelector, { routes: essentialRoutes }),
    );
    expect(html.match(/<a /g)).toHaveLength(4);
    for (const route of essentialRoutes)
      expect(html).toContain(`href="${route.href}"`);
    expect(html).toContain('aria-label="Explore Fractional Leadership"');
    expect(html).toContain("Your hiring problem");
  });

  it("renders comparison values once, in four semantic lists with all six dimensions", () => {
    const html = renderToStaticMarkup(
      createElement(ServiceComparison, {
        dimensions: comparisonDimensions,
        services: essentialRoutes,
      }),
    );
    expect(html.match(/<dl>/g)).toHaveLength(4);
    expect(html.match(/<dt>/g)).toHaveLength(24);
    expect(html.match(/<dd>/g)).toHaveLength(24);
    expect(
      html.match(/Research-led; may not involve candidate search/g),
    ).toHaveLength(1);
  });

  it("renders the approved ten sections with a qualified method, correct CTAs and no escaped paragraphs", () => {
    const html = renderToStaticMarkup(createElement(HowEssentialWorksPage));
    expect(html.match(/<h1 /g)).toHaveLength(1);
    const sections = [
      ...html.matchAll(/<section[^>]*aria-labelledby="([^"]+)"/g),
    ].map((match) => match[1]);
    expect(sections).toEqual([
      "approach-title",
      "essential-philosophy",
      "essential-routes",
      "essential-principles",
      "service-comparison",
      "search-methodology",
      "technology-judgement",
      "founder-involvement",
      "choose-your-route",
      "next-step",
    ]);
    expect(html).toContain(
      "Not every Essential service follows this exact seven-stage journey.",
    );
    expect(html).toContain(
      "Retained Search has its own more formal seven-stage methodology.",
    );
    expect(html).toContain("Sense-check it with David");
    expect(html).toContain('href="/case-studies"');
    expect(html).not.toContain("\\n\\n");
  });

  it("keeps the canonical, indexability and approved metadata", () => {
    expect(metadata.title).toBe(
      "How Essential Resourcing Works | Recruitment, Search & Advisory",
    );
    expect(metadata.description).toBe(
      "How Essential Resourcing helps businesses make better hiring decisions through Permanent Recruitment, Retained Search, Fractional Leadership and Market Intelligence & Advisory.",
    );
    expect(metadata.alternates?.canonical).toBe(
      "https://essentialresourcing.co.uk/how-essential-resourcing-works",
    );
    expect(metadata.robots).toBeUndefined();
  });
});
