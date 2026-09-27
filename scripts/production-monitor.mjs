const baseUrl = (
  process.env.PRODUCTION_URL || "https://essentialresourcing.co.uk"
).replace(/\/$/, "");
const timeoutMs = Number(process.env.MONITOR_TIMEOUT_MS || 15_000);

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(`${baseUrl}${path}`, {
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "user-agent": "EssentialResourcingProductionMonitor/1.0",
        ...(options.headers || {}),
      },
      ...options,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkText(path, expected) {
  const response = await request(path);
  const body = await response.text();
  if (!response.ok || !expected.test(body)) {
    throw new Error(
      `${path} failed: HTTP ${response.status} or expected content missing`,
    );
  }
  return `${path}: ${response.status}`;
}

async function checkHealth() {
  const response = await request("/api/health");
  const body = await response.json().catch(() => ({}));
  if (
    !response.ok ||
    body.ok !== true ||
    body.service !== "essential-resourcing"
  ) {
    throw new Error(`/api/health failed: HTTP ${response.status}`);
  }
  return `/api/health: ${response.status}`;
}

async function checkContactRoute() {
  const response = await request("/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  const body = await response.json().catch(() => ({}));
  if (response.status !== 400 || body.ok !== false) {
    throw new Error(
      `/api/contact validation probe failed: HTTP ${response.status}`,
    );
  }
  return `/api/contact validation probe: ${response.status} (expected)`;
}

const checks = await Promise.allSettled([
  checkText("/", /Essential Resourcing/i),
  checkText("/contact", /Talk to David|Contact/i),
  checkHealth(),
  checkText("/sitemap.xml", /https:\/\/essentialresourcing\.co\.uk\//i),
  checkContactRoute(),
]);

let failed = false;
for (const check of checks) {
  if (check.status === "fulfilled") console.log(`PASS ${check.value}`);
  else {
    failed = true;
    console.error(
      `FAIL ${check.reason instanceof Error ? check.reason.message : "Unknown failure"}`,
    );
  }
}

if (failed) process.exit(1);
