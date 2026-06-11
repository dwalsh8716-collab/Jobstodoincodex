import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

describe("launch redirects", () => {
  it("keeps common old or short launch URLs away from 404s", async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual(
      expect.arrayContaining([
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
          source: "/leadership-search",
          destination: "/services/leadership-search",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/strategic-interim",
          destination: "/services/strategic-interim",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/agency-recruitment",
          destination: "/services/agency-recruitment",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/client-side-recruitment",
          destination: "/services/client-side-marketing-recruitment",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/marketing-recruitment",
          destination: "/services/client-side-marketing-recruitment",
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
      ]),
    );

    expect(redirects).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/salary-guides",
        }),
      ]),
    );
  });
});
