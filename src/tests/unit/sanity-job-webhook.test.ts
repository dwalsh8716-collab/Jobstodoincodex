import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isValidSignature: vi.fn(),
  revalidatePath: vi.fn(),
  submitIndexNowUrls: vi.fn(),
  notifyGoogleJobUrl: vi.fn(),
  getFreshDistributionJobs: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@sanity/webhook", () => ({
  SIGNATURE_HEADER_NAME: "sanity-webhook-signature",
  isValidSignature: mocks.isValidSignature,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/indexnow", () => ({
  indexNowPathForSanityDocument: () => ["/jobs/example", "/jobs"],
  submitIndexNowUrls: mocks.submitIndexNowUrls,
}));
vi.mock("@/lib/google-job-indexing", () => ({ notifyGoogleJobUrl: mocks.notifyGoogleJobUrl }));
vi.mock("@/lib/job-distribution", () => ({ activeDistributionJobs: (jobs: unknown[]) => jobs }));
vi.mock("@/lib/public-content", () => ({ getFreshDistributionJobs: mocks.getFreshDistributionJobs }));

import { POST } from "../../../app/api/webhooks/sanity/route";

const originalWebhookSecret = process.env.SANITY_WEBHOOK_SECRET;

function jobRequest(id = "job-1") {
  return new Request("https://essentialresourcing.co.uk/api/webhooks/sanity", {
    method: "POST",
    headers: { "sanity-webhook-signature": "signed" },
    body: JSON.stringify({ _type: "job", _id: id, _rev: "rev-1", slug: "example" }),
  });
}

describe("Sanity job publishing webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SANITY_WEBHOOK_SECRET = "test-secret";
    mocks.isValidSignature.mockResolvedValue(true);
    mocks.submitIndexNowUrls.mockResolvedValue({ submitted: 1, status: 200 });
    mocks.getFreshDistributionJobs.mockResolvedValue([{ externalJobId: "job-1", slug: "example" }]);
  });

  afterEach(() => {
    if (originalWebhookSecret === undefined) delete process.env.SANITY_WEBHOOK_SECRET;
    else process.env.SANITY_WEBHOOK_SECRET = originalWebhookSecret;
  });

  it("acknowledges a submitted Google notification", async () => {
    mocks.notifyGoogleJobUrl.mockResolvedValue({
      status: "notified", url: "https://essentialresourcing.co.uk/jobs/example", type: "URL_UPDATED",
    });

    const response = await POST(jobRequest());

    expect(response.status).toBe(200);
    expect(mocks.notifyGoogleJobUrl).toHaveBeenCalledWith(
      { slug: "example" }, "URL_UPDATED", { revision: "rev-1" },
    );
  });

  it("returns a retryable response when Google rejects the notification", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.notifyGoogleJobUrl.mockRejectedValue(new Error("Google Indexing API rejected the job notification (429)."));

    try {
      const response = await POST(jobRequest());
      expect(response.status).toBe(503);
      expect(await response.json()).toMatchObject({ ok: false, googleIndexing: { status: "failed" } });
    } finally {
      log.mockRestore();
    }
  });

  it("does not acknowledge an unconfigured Google notification as success", async () => {
    mocks.notifyGoogleJobUrl.mockResolvedValue({ status: "not_configured" });

    const response = await POST(jobRequest());

    expect(response.status).toBe(503);
  });

  it("notifies Google when a published vacancy closes", async () => {
    mocks.getFreshDistributionJobs.mockResolvedValue([]);
    mocks.notifyGoogleJobUrl.mockResolvedValue({ status: "notified", type: "URL_DELETED" });

    const response = await POST(jobRequest());

    expect(response.status).toBe(200);
    expect(mocks.notifyGoogleJobUrl).toHaveBeenCalledWith(
      { slug: "example" }, "URL_DELETED", { revision: "rev-1" },
    );
  });

  it("does not notify Google about a Sanity draft", async () => {
    const response = await POST(jobRequest("drafts.job-1"));

    expect(response.status).toBe(200);
    expect(mocks.notifyGoogleJobUrl).not.toHaveBeenCalled();
  });
});
