import { siteConfig } from "./site";
import { isPublicSitemapPath } from "./sitemap-engine";

const indexNowEndpoint = "https://api.indexnow.org/indexnow";

export type SanityIndexNowPayload = {
  _id?: string;
  _rev?: string;
  _type?: string;
  slug?: string | { current?: string };
};

export function indexNowPathForSanityDocument(
  payload: SanityIndexNowPayload,
): string[] {
  const slug =
    typeof payload.slug === "string"
      ? payload.slug
      : payload.slug?.current;

  switch (payload._type) {
    case "homePage":
      return ["/"];
    case "siteSettings":
      return ["/", "/contact", "/clients", "/candidates"];
    case "service":
      return slug ? [`/services/${slug}`, "/services"] : ["/services"];
    case "job":
      return slug ? [`/jobs/${slug}`, "/jobs"] : ["/jobs"];
    case "insight":
      return slug ? [`/insights/${slug}`, "/insights"] : ["/insights"];
    case "caseStudy":
      return slug
        ? [`/case-studies/${slug}`, "/case-studies", "/clients", "/"]
        : ["/case-studies", "/clients", "/"];
    case "salarySnapshot":
      return slug
        ? [`/salary-snapshots/${slug}`, "/salary-snapshots"]
        : ["/salary-snapshots"];
    case "testimonial":
    case "proofItem":
      return ["/", "/clients"];
    case "person":
      return ["/about-david-walsh", "/about-essential"];
    default:
      return [];
  }
}

export function normaliseIndexNowUrls(
  pathsOrUrls: readonly string[],
  siteUrl = siteConfig.url,
) {
  const origin = new URL(siteUrl).origin;
  const urls = new Set<string>();

  for (const value of pathsOrUrls) {
    if (!value.startsWith("/") && !value.startsWith("http://") && !value.startsWith("https://")) {
      continue;
    }

    try {
      const url = new URL(value, origin);
      if (url.origin !== origin || !isPublicSitemapPath(url.pathname)) continue;
      url.hash = "";
      url.search = "";
      urls.add(url.toString());
    } catch {
      continue;
    }
  }

  return Array.from(urls);
}

export async function submitIndexNowUrls(
  pathsOrUrls: readonly string[],
  options: {
    fetch?: typeof fetch;
    key?: string;
    siteUrl?: string;
  } = {},
) {
  const key = options.key || process.env.INDEXNOW_KEY;
  if (!key) {
    throw new Error("INDEXNOW_KEY is not configured.");
  }

  const siteUrl = options.siteUrl || siteConfig.url;
  const origin = new URL(siteUrl).origin;
  const urlList = normaliseIndexNowUrls(pathsOrUrls, origin);

  if (urlList.length === 0) {
    return { submitted: 0, status: 204 };
  }

  const response = await (options.fetch || fetch)(indexNowEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(origin).host,
      key,
      keyLocation: `${origin}/indexnow-key.txt`,
      urlList,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow rejected the submission (${response.status}).`);
  }

  return { submitted: urlList.length, status: response.status };
}
