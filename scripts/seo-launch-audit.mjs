import { mkdir, writeFile } from "node:fs/promises";

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split("=");
    return [key, rest.join("=") || "true"];
  }),
);

const base = stripSlash(
  args.get("--base") || process.env.SEO_BASE_URL || "http://127.0.0.1:3000",
);
const canonicalHost = stripSlash(
  args.get("--canonical-host") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://essentialresourcing.co.uk",
);
const outDir = args.get("--out") || ".qa";
const checkedAt = new Date().toISOString();
const failures = [];
const warnings = [];
const notes = [];

const requiredPublicPaths = [
  "/",
  "/about-essential",
  "/about-david-walsh",
  "/clients",
  "/candidates",
  "/services",
  "/jobs",
  "/insights",
  "/contact",
  "/privacy-policy",
  "/cookie-policy",
  "/candidate-privacy",
  "/terms",
];

const blockedPrefixes = [
  "/admin",
  "/api",
  "/candidate/",
  "/client",
  "/cms",
  "/labs",
  "/recruiter-labs",
  "/studio",
];

await mkdir(outDir, { recursive: true });

const robots = await read("/robots.txt");
check(robots.response.ok, "robots.txt returns 200", robots.path);
checkIncludes(robots.text, `Sitemap: ${canonicalHost}/sitemap.xml`, "robots.txt points at canonical sitemap", robots.path);
for (const prefix of blockedPrefixes) {
  checkIncludes(robots.text, `Disallow: ${prefix}`, `robots.txt blocks ${prefix}`, robots.path);
}

const sitemap = await read("/sitemap.xml");
check(sitemap.response.ok, "sitemap.xml returns 200", sitemap.path);
const sitemapPaths = sitemapUrls(sitemap.text);
for (const requiredPath of requiredPublicPaths) {
  check(
    sitemapPaths.includes(requiredPath),
    `sitemap includes ${requiredPath}`,
    "/sitemap.xml",
  );
}
for (const prefix of blockedPrefixes) {
  check(
    sitemapPaths.every((path) => !isBlockedPath(path, prefix)),
    `sitemap excludes ${prefix}`,
    "/sitemap.xml",
  );
}

for (const asset of ["/rss.xml", "/llms.txt", "/llms-full.txt"]) {
  const result = await read(asset);
  check(result.response.ok, `${asset} returns 200`, asset);
  check(result.text.trim().length > 100, `${asset} has body content`, asset);
}

const pagePaths = Array.from(
  new Set([...requiredPublicPaths, ...sitemapPaths]),
).sort((a, b) => a.localeCompare(b));

for (const path of pagePaths) {
  const page = await read(path);
  check(page.response.ok, `${path} returns 200`, path);
  if (!page.response.ok) continue;

  const html = page.text;
  const title = decodeEntities(
    textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
  );
  const description = metaContent(html, "description");
  const canonical = linkHref(html, "canonical");
  const robotsMeta = metaContent(html, "robots");
  const h1s = matchAll(html, /<h1\b[^>]*>/gi).length;
  const jsonLd = parseJsonLd(html, path);

  check(Boolean(title), "page has a title", path);
  warn(
    title.length >= 20 && title.length <= 75,
    `title length is launch-friendly (${title.length} chars)`,
    path,
  );
  check(Boolean(description), "page has a meta description", path);
  warn(
    description.length >= 60 && description.length <= 180,
    `meta description length is launch-friendly (${description.length} chars)`,
    path,
  );
  check(
    canonical === `${canonicalHost}${path === "/" ? "/" : path}`,
    `canonical matches ${canonicalHost}`,
    path,
    { found: canonical },
  );
  check(
    !/noindex/i.test(robotsMeta),
    "sitemap page is not marked noindex",
    path,
    { found: robotsMeta },
  );
  check(h1s === 1, "page has exactly one H1", path, { found: h1s });

  for (const property of ["og:title", "og:description", "og:url", "og:image"]) {
    check(Boolean(metaContent(html, property)), `${property} is present`, path);
  }
  check(metaContent(html, "twitter:card") === "summary_large_image", "Twitter card is summary_large_image", path);
  check(jsonLd.valid > 0, "page has valid JSON-LD", path);
}

const ogImages = new Set();
for (const path of pagePaths.slice(0, 12)) {
  const page = await read(path);
  const image = metaContent(page.text, "og:image");
  if (image) ogImages.add(image);
}
for (const image of ogImages) {
  const imageUrl = sameCanonicalHost(image) ? `${base}${new URL(image).pathname}` : image;
  const response = await fetch(imageUrl, {
    method: "HEAD",
    signal: AbortSignal.timeout(12_000),
  });
  check(response.ok, `Open Graph image is reachable: ${new URL(image).pathname}`, image);
}

const report = {
  checkedAt,
  base,
  canonicalHost,
  pagesChecked: pagePaths.length,
  failures,
  warnings,
  notes,
};

const stamp = checkedAt.replace(/[:.]/g, "-");
await writeFile(
  `${outDir}/seo-launch-audit-${stamp}.json`,
  JSON.stringify(report, null, 2),
);
await writeFile(`${outDir}/seo-launch-audit-${stamp}.md`, markdown(report));

console.log(`SEO launch audit checked ${pagePaths.length} pages.`);
console.log(`Failures: ${failures.length}`);
console.log(`Warnings: ${warnings.length}`);
if (failures.length > 0) {
  for (const failure of failures.slice(0, 20)) {
    console.log(`FAIL ${failure.path}: ${failure.message}`);
  }
  process.exit(1);
}
for (const warning of warnings.slice(0, 12)) {
  console.log(`WARN ${warning.path}: ${warning.message}`);
}

function stripSlash(value) {
  return value.replace(/\/+$/, "");
}

function absolute(path) {
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function read(path) {
  const response = await fetch(absolute(path), {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });
  return {
    path,
    response,
    text: await response.text(),
  };
}

function sitemapUrls(xml) {
  return matchAll(xml, /<loc>([^<]+)<\/loc>/g)
    .map((match) => new URL(match[1]).pathname)
    .filter((path, index, paths) => paths.indexOf(path) === index)
    .sort();
}

function metaContent(html, nameOrProperty) {
  const escaped = escapeRegExp(nameOrProperty);
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["'][^>]*>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const value = textBetween(html, pattern);
    if (value) return decodeEntities(value).trim();
  }

  return "";
}

function linkHref(html, rel) {
  const escaped = escapeRegExp(rel);
  return decodeEntities(
    textBetween(
      html,
      new RegExp(
        `<link[^>]+rel=["']${escaped}["'][^>]+href=["']([^"']*)["'][^>]*>`,
        "i",
      ),
    ),
  ).trim();
}

function parseJsonLd(html, path) {
  const scripts = matchAll(
    html,
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  let valid = 0;
  for (const [, body] of scripts) {
    try {
      JSON.parse(body.replace(/<!--|-->/g, "").trim());
      valid += 1;
    } catch (error) {
      failures.push({
        path,
        message: "JSON-LD is not valid JSON",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return { valid, total: scripts.length };
}

function matchAll(value, regex) {
  return Array.from(value.matchAll(regex));
}

function textBetween(value, regex) {
  return value.match(regex)?.[1] || "";
}

function check(condition, message, path, detail = undefined) {
  if (condition) {
    notes.push({ path, message });
    return;
  }
  failures.push({ path, message, detail });
}

function warn(condition, message, path, detail = undefined) {
  if (condition) return;
  warnings.push({ path, message, detail });
}

function checkIncludes(text, expected, message, path) {
  check(text.includes(expected), message, path, { expected });
}

function isBlockedPath(path, prefix) {
  return (
    path === prefix ||
    path.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`)
  );
}

function sameCanonicalHost(value) {
  try {
    return new URL(value).origin === new URL(canonicalHost).origin;
  } catch {
    return false;
  }
}

function decodeEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function markdown(report) {
  return [
    "# SEO Launch Audit",
    "",
    `Checked: ${report.checkedAt}`,
    `Base: ${report.base}`,
    `Canonical host: ${report.canonicalHost}`,
    `Pages checked: ${report.pagesChecked}`,
    "",
    `Failures: ${report.failures.length}`,
    `Warnings: ${report.warnings.length}`,
    "",
    "## Failures",
    "",
    ...list(report.failures),
    "",
    "## Warnings",
    "",
    ...list(report.warnings),
    "",
  ].join("\n");
}

function list(items) {
  if (items.length === 0) return ["- None"];
  return items.map((item) => `- ${item.path}: ${item.message}`);
}
