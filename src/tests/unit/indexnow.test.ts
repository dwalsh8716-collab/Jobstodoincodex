import { describe, expect, it, vi } from "vitest";

import {
  indexNowPathForSanityDocument,
  normaliseIndexNowUrls,
  submitIndexNowUrls,
} from "@/lib/indexnow";

describe("IndexNow", () => {
  it("maps public Sanity documents to their canonical routes", () => {
    expect(
      indexNowPathForSanityDocument({
        _type: "insight",
        slug: { current: "useful-guide" },
      }),
    ).toEqual(["/insights/useful-guide", "/insights"]);

    expect(
      indexNowPathForSanityDocument({
        _type: "service",
        slug: "retained-search",
      }),
    ).toEqual(["/services/retained-search", "/services"]);
  });

  it("rejects external, private and malformed URLs", () => {
    expect(
      normaliseIndexNowUrls(
        [
          "/clients",
          "/clients?preview=true",
          "/admin",
          "https://example.com/stolen",
          "not a safe path",
        ],
        "https://essentialresourcing.co.uk",
      ),
    ).toEqual(["https://essentialresourcing.co.uk/clients"]);
  });

  it("submits a deduplicated canonical URL list", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));

    const result = await submitIndexNowUrls(["/clients", "/clients"], {
      fetch: fetchMock,
      key: "12345678abcdef",
      siteUrl: "https://essentialresourcing.co.uk",
    });

    expect(result).toEqual({ submitted: 1, status: 200 });
    expect(fetchMock).toHaveBeenCalledOnce();

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(request.body))).toEqual({
      host: "essentialresourcing.co.uk",
      key: "12345678abcdef",
      keyLocation: "https://essentialresourcing.co.uk/indexnow-key.txt",
      urlList: ["https://essentialresourcing.co.uk/clients"],
    });
  });
});
