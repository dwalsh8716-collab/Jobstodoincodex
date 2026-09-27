import assert from "node:assert/strict";
import test from "node:test";
import { assertLocalPreview, previewDecision } from "./rebrand-preview-safety.mjs";

const credentials = { username: "reviewer", password: "synthetic-test-credential-only" };
const authorization = `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64")}`;
const request = { host: "127.0.0.1:3027", url: "/", method: "GET", authorization };

test("blocks Railway and copied local credentials", () => {
  assert.throws(() => assertLocalPreview({ RAILWAY_ENVIRONMENT_ID: "production" }, []));
  assert.throws(() => assertLocalPreview({}, [".env.local"]));
  assert.doesNotThrow(() => assertLocalPreview({}, [".env.example"]));
});
test("rejects active business integrations and production analytics", () => {
  for (const key of ["RESEND_API_KEY", "DATABASE_URL", "SANITY_READ_TOKEN", "CANDIDATE_CV_STORAGE_BUCKET", "NEXT_PUBLIC_GA_ID", "INDEXNOW_KEY", "CMS_GATE_SECRET"]) {
    assert.throws(() => assertLocalPreview({ [key]: "synthetic" }, []));
  }
  assert.throws(() => assertLocalPreview({ FEATURE_LABS_ENABLED: "true" }, []));
  assert.throws(() => assertLocalPreview({ NEXT_PUBLIC_SITE_URL: "https://essentialresourcing.co.uk" }, []));
});
test("every page and asset needs authentication", () => {
  for (const url of ["/", "/clients", "/assets/dwr/dwr-horizontal-dark.png", "/_next/static/test.js", "/_next/image?url=x", "/robots.txt"]) {
    assert.equal(previewDecision({ ...request, url, authorization: undefined }, credentials).status, 401);
  }
  assert.equal(previewDecision({ ...request, authorization: "Basic invalid" }, credentials).status, 401);
});
test("rejects other hosts", () => {
  assert.equal(previewDecision({ ...request, host: "essentialresourcing.co.uk" }, credentials).status, 403);
});
test("blocks all mutations including Next server actions", () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    for (const url of ["/", "/contact", "/api/contact", "/api/webhooks/sanity"]) {
      assert.equal(previewDecision({ ...request, method, url }, credentials).status, 405);
    }
  }
});
test("blocks CMS, private tools, APIs and token actions", () => {
  for (const url of ["/studio", "/cms", "/admin/labs", "/client/shortlist/test", "/candidate-privacy/request/confirm", "/api/data-request/confirm?token=test", "/candidate/interim-availability/test", "/%61pi/contact"]) {
    assert.equal(previewDecision({ ...request, url }, credentials).status, 403);
  }
});
test("keeps public journeys browsable", () => {
  for (const url of ["/", "/clients", "/candidates", "/services/fractional", "/jobs", "/candidate-privacy"]) {
    assert.equal(previewDecision({ ...request, url }, credentials), null);
  }
});
test("disables indexing feeds and tells robots not to crawl", () => {
  assert.match(previewDecision({ ...request, url: "/robots.txt" }, credentials).body, /Disallow: \//);
  for (const url of ["/sitemap.xml", "/rss.xml", "/llms.txt", "/llms-full.txt", "/indexnow-key.txt"]) {
    assert.equal(previewDecision({ ...request, url }, credentials).status, 404);
  }
});
