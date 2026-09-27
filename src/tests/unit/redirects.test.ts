import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import nextConfig from "../../../next.config";
import { proxy } from "../../../proxy";

describe("launch redirects", () => {
  it("keeps common old or short launch URLs away from 404s", async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/:path*",
          destination: "https://essentialresourcing.co.uk/:path*",
          permanent: true,
          has: [
            {
              type: "host",
              value: "www.essentialresourcing.co.uk",
            },
          ],
        }),
        expect.objectContaining({
          source: "/about",
          destination: "/about-essential",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/about-david",
          destination: "/about-david-walsh",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/privacy",
          destination: "/privacy-policy",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/cookies",
          destination: "/cookie-policy",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/marketing-recruitment-liverpool",
          destination: "/clients",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/pr-recruitment-manchester",
          destination: "/specialisms/pr-communications-content",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/digital-recruitment",
          destination: "/specialisms/digital-performance-ecommerce",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/exclusive-search",
          destination: "/services/retained-search",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/bad-hire-calculator",
          destination: "/services/market-intelligence-advisory",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/book",
          destination: "/book-a-call",
          permanent: true,
        }),
      ]),
    );

    expect(redirects).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/leadership-search",
        }),
        expect.objectContaining({
          source: "/agency-recruitment",
        }),
        expect.objectContaining({
          source: "/salary-guides",
        }),
      ]),
    );
  });

  it("301 redirects retired Fractional URLs to the Fractional service page", async () => {
    for (const path of [
      "/strategic-interim",
      "/fractional",
      "/fractional-marketing",
      "/fractional-marketing-leaders",
      "/fractional-strategic-interim",
      "/services/strategic-interim",
      "/services/fractional-strategic-interim",
    ]) {
      const response = await proxy(
        new NextRequest(`https://example.com${path}`),
      );

      expect(response.status).toBe(301);
      expect(response.headers.get("location")).toBe(
        `https://example.com/services/fractional`,
      );
    }
  });

  it("301 redirects the retired Fractional explainer insight to the current insight page", async () => {
    const response = await proxy(
      new NextRequest(
        "https://example.com/insights/what-is-a-strategic-interim-marketing-leader",
      ),
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "https://example.com/insights/what-is-a-fractional-marketing-leader",
    );
  });

  it("301 redirects retired service-product URLs to the closest current page", async () => {
    const redirects = [
      ["/leadership-search", "/services/retained-search"],
      ["/services/leadership-search", "/services/retained-search"],
      ["/senior-recruitment", "/services/permanent-recruitment"],
      ["/services/senior-recruitment", "/services/permanent-recruitment"],
      ["/agency-recruitment", "/specialisms"],
      ["/services/agency-recruitment", "/specialisms"],
      ["/client-side-recruitment", "/specialisms"],
      ["/marketing-recruitment", "/specialisms"],
      ["/services/client-side-marketing-recruitment", "/specialisms"],
      [
        "/services/market-intelligence-hiring-advisory",
        "/services/market-intelligence-advisory",
      ],
    ];

    for (const [source, destination] of redirects) {
      const response = await proxy(
        new NextRequest(`https://example.com${source}`),
      );

      expect(response.status).toBe(301);
      expect(response.headers.get("location")).toBe(
        `https://example.com${destination}`,
      );
    }
  });
});
