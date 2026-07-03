import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split("=");
    return [key, rest.join("=") || "true"];
  }),
);

const base = normaliseBase(
  args.get("--base") || process.env.QA_BASE_URL || "http://127.0.0.1:3000",
);
const outDir = args.get("--out") || ".qa";
const checkedAt = new Date().toISOString();
const fetchTimeoutMs = 12_000;

const knownPages = [
  "/",
  "/about-essential",
  "/about-david-walsh",
  "/clients",
  "/candidates",
  "/services",
  "/services/leadership-search",
  "/services/strategic-interim",
  "/services/agency-recruitment",
  "/services/client-side-marketing-recruitment",
  "/jobs",
  "/insights",
  "/case-studies",
  "/salary-snapshots",
  "/contact",
  "/book-a-call",
  "/privacy-policy",
  "/cookie-policy",
  "/candidate-privacy",
  "/candidate-privacy/request",
  "/terms",
  "/salary-guides",
];

const requiredAssets = [
  "/robots.txt",
  "/sitemap.xml",
  "/rss.xml",
  "/llms.txt",
  "/llms-full.txt",
  "/site.webmanifest",
  "/api/health",
];

const expectedRedirects = new Map([
  ["/about", "/about-essential"],
  ["/about-david", "/about-david-walsh"],
  ["/leadership-search", "/services/leadership-search"],
  ["/strategic-interim", "/services/strategic-interim"],
  ["/agency-recruitment", "/services/agency-recruitment"],
  ["/client-side-recruitment", "/services/client-side-marketing-recruitment"],
  ["/marketing-recruitment", "/services/client-side-marketing-recruitment"],
  ["/privacy", "/privacy-policy"],
  ["/cookies", "/cookie-policy"],
]);

function normaliseBase(value) {
  return value.replace(/\/+$/, "");
}

function absoluteUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function readText(path) {
  const response = await fetchWithTimeout(absoluteUrl(path), {
    redirect: "follow",
  });
  const text = await response.text();
  return { response, text };
}

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    ...options,
    signal: AbortSignal.timeout(fetchTimeoutMs),
  });
}

function sitemapUrls(xml) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1])
    .filter(
      (url) =>
        url.startsWith(base) ||
        url.startsWith("https://essentialresourcing.co.uk"),
    )
    .map((url) => new URL(url).pathname)
    .filter((path, index, paths) => paths.indexOf(path) === index)
    .sort();
}

function pageLinks(html, pagePath) {
  const links = [];

  for (const match of html.matchAll(/\s(?:href|src)=["']([^"']+)["']/g)) {
    const raw = match[1]?.trim();
    if (!raw || raw.startsWith("#")) continue;
    if (/^(mailto|tel|sms|whatsapp):/i.test(raw)) continue;
    if (/^(data|blob|javascript):/i.test(raw)) continue;

    const url = new URL(raw, absoluteUrl(pagePath));
    if (url.origin !== new URL(base).origin) continue;
    if (url.pathname.startsWith("/_next/")) continue;
    links.push(`${url.pathname}${url.search}`);
  }

  return Array.from(new Set(links)).sort();
}

async function checkRoute(path, expected = {}) {
  const started = Date.now();
  const response = await fetchWithTimeout(absoluteUrl(path), {
    redirect: expected.redirect ? "manual" : "follow",
  });
  const status = response.status;
  const location = response.headers.get("location") || "";
  const durationMs = Date.now() - started;
  const contentType = response.headers.get("content-type") || "";

  let ok = status >= 200 && status < 400;
  if (expected.status) ok = expected.status.includes(status);
  if (expected.redirect) {
    ok = status >= 300 && status < 400 && location.includes(expected.redirect);
  }

  return {
    path,
    status,
    ok,
    durationMs,
    contentType,
    location,
    expected,
  };
}

async function routeAudit(paths) {
  const routeResults = [];

  for (const path of paths) routeResults.push(await checkRoute(path));
  for (const path of requiredAssets) routeResults.push(await checkRoute(path));

  for (const [source, destination] of expectedRedirects) {
    routeResults.push(
      await checkRoute(source, {
        status: [301, 302, 307, 308],
        redirect: destination,
      }),
    );
  }

  routeResults.push(
    await checkRoute("/definitely-not-a-real-page", { status: [404] }),
  );

  return {
    checkedAt,
    base,
    total: routeResults.length,
    failures: routeResults.filter((result) => !result.ok),
    results: routeResults,
  };
}

async function linkAudit(paths) {
  const links = new Set();
  const sourcePages = [];

  for (const path of paths) {
    const { response, text } = await readText(path);
    if (!response.ok) {
      sourcePages.push({ path, status: response.status, linkCount: 0 });
      continue;
    }

    const pageLinkList = pageLinks(text, path);
    pageLinkList.forEach((link) => links.add(link));
    sourcePages.push({
      path,
      status: response.status,
      linkCount: pageLinkList.length,
    });
  }

  const results = [];
  for (const link of Array.from(links).sort()) {
    if (link.startsWith("/api/") && link !== "/api/health") continue;
    results.push(await checkRoute(link));
  }

  return {
    checkedAt,
    base,
    sourcePages,
    totalUniqueLinks: results.length,
    failures: results.filter((result) => !result.ok),
    results,
  };
}

async function browserPageAudit(browser, path, viewportName, viewport) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const response = await page.goto(absoluteUrl(path), {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.waitForTimeout(1_000);

  const details = await page.evaluate(async () => {
    const documentElement = document.documentElement;
    const visibleImages = Array.from(document.images).filter((image) => {
      const rect = image.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const imageSources = Array.from(
      new Set(
        visibleImages
          .map((image) => image.currentSrc || image.src)
          .filter((src) => src && !/^(data|blob):/i.test(src)),
      ),
    );
    const brokenImages = (
      await Promise.all(
        imageSources.map(async (src) => {
          try {
            const response = await fetch(src, {
              method: "GET",
              cache: "force-cache",
            });
            return response.ok ? null : `${src} (${response.status})`;
          } catch (error) {
            return `${src} (${error instanceof Error ? error.message : "fetch failed"})`;
          }
        }),
      )
    ).filter(Boolean);
    const unlabeledControls = Array.from(
      document.querySelectorAll("button, a, input, textarea, select"),
    )
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        if (element instanceof HTMLInputElement && element.type === "hidden") {
          return false;
        }
        const hasText = Boolean(element.textContent?.trim());
        const hasLabel = Boolean(
          element.getAttribute("aria-label") ||
          element.getAttribute("aria-labelledby") ||
          element.getAttribute("title") ||
          element.getAttribute("alt") ||
          element.getAttribute("placeholder") ||
          element.closest("label")?.textContent?.trim() ||
          ("labels" in element &&
            Array.from(element.labels || []).some((label) =>
              label.textContent?.trim(),
            )),
        );
        return !hasText && !hasLabel;
      })
      .map((element) => element.outerHTML.slice(0, 180));

    return {
      title: document.title,
      h1Count: document.querySelectorAll("h1").length,
      hasMain: Boolean(document.querySelector("main, #main")),
      hasSkipLink: Boolean(
        document.querySelector(".skip-link, a[href='#main']"),
      ),
      scrollWidth: documentElement.scrollWidth,
      clientWidth: documentElement.clientWidth,
      overflowX: documentElement.scrollWidth > documentElement.clientWidth + 1,
      visibleImageCount: visibleImages.length,
      brokenImages,
      unlabeledControls,
    };
  });

  await page.close();

  const status = response?.status() || 0;
  const failures = [];
  if (status >= 400) failures.push(`HTTP ${status}`);
  if (consoleErrors.length)
    failures.push(`${consoleErrors.length} console errors`);
  if (pageErrors.length) failures.push(`${pageErrors.length} page errors`);
  if (details.overflowX) failures.push("horizontal overflow");
  if (!details.hasMain) failures.push("missing main landmark");
  if (details.h1Count !== 1)
    failures.push(`expected one h1, found ${details.h1Count}`);
  if (details.brokenImages.length)
    failures.push(`${details.brokenImages.length} broken images`);
  if (details.unlabeledControls.length) {
    failures.push(
      `${details.unlabeledControls.length} unlabeled visible controls`,
    );
  }

  return {
    path,
    viewport: viewportName,
    status,
    ok: failures.length === 0,
    failures,
    consoleErrors,
    pageErrors,
    ...details,
  };
}

async function browserAudit(paths) {
  const browser = await chromium.launch();
  const viewports = {
    desktop: { width: 1440, height: 1000 },
    tablet: { width: 834, height: 1112 },
    mobile: { width: 390, height: 844 },
  };
  const results = [];

  try {
    for (const path of paths) {
      console.log(`Browser QA: ${path}`);
      for (const [viewportName, viewport] of Object.entries(viewports)) {
        results.push(
          await browserPageAudit(browser, path, viewportName, viewport),
        );
      }
    }
  } finally {
    await browser.close();
  }

  return {
    checkedAt,
    base,
    pages: paths,
    viewportRuns: results.length,
    failureCount: results.filter((result) => !result.ok).length,
    failures: results.filter((result) => !result.ok),
    results,
  };
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const { text: sitemapXml } = await readText("/sitemap.xml");
  const paths = Array.from(
    new Set([...sitemapUrls(sitemapXml), ...knownPages]),
  ).sort();

  const routes = await routeAudit(paths);
  const links = await linkAudit(paths);
  const browserResults = await browserAudit(paths);

  await writeFile(
    `${outDir}/qa-route-results.json`,
    JSON.stringify(routes, null, 2),
  );
  await writeFile(
    `${outDir}/qa-link-results.json`,
    JSON.stringify(links, null, 2),
  );
  await writeFile(
    `${outDir}/qa-browser-results.json`,
    JSON.stringify(browserResults, null, 2),
  );

  const summary = {
    checkedAt,
    base,
    routeFailures: routes.failures.length,
    linkFailures: links.failures.length,
    browserFailures: browserResults.failureCount,
    pagesAudited: paths.length,
    routeChecks: routes.total,
    linkChecks: links.totalUniqueLinks,
    viewportRuns: browserResults.viewportRuns,
  };

  await writeFile(
    `${outDir}/qa-summary.json`,
    JSON.stringify(summary, null, 2),
  );
  console.log(JSON.stringify(summary, null, 2));

  if (
    summary.routeFailures ||
    summary.linkFailures ||
    summary.browserFailures
  ) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
