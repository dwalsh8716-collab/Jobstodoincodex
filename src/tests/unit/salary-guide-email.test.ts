import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { salaryGuideEmailSchema } from "@/validations/salary-guide-email";
import { publicSalaryGuideUrl } from "@/lib/salary-guide-product";

const now = 1_800_000_000_000;
const input = {
  name: "Alex",
  email: "alex+guide@example.technology",
  startedAt: now - 5000,
  website: "",
  requestId: "7a5cf42b-c3c2-49b2-81e8-8c88848d0de7",
};
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("RESEND_API_KEY", "test-only");
  vi.stubEnv("CONTACT_FROM_EMAIL", "test@example.com");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe("transactional guide email", () => {
  it("accepts aliases and modern domains, rejects unrelated personal fields", () => {
    expect(salaryGuideEmailSchema.safeParse(input).success).toBe(true);
    for (const change of [
      { name: "" },
      { email: "" },
      { email: "not-email" },
      { website: "bot" },
      { salary: 50000 },
      { role: "CMO" },
      { marketingConsent: true },
    ]) {
      expect(
        salaryGuideEmailSchema.safeParse({ ...input, ...change }).success,
      ).toBe(false);
    }
  });
  it("sends only the requested link, with no lead creation or salary data", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "mock-only" }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const { sendGuideEmail, guideEmailContent } =
      await import("@/lib/salary-guide-email");
    expect(await sendGuideEmail(input, "192.0.2.1", now)).toEqual({
      status: 200,
      ok: true,
    });
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    const body = JSON.parse(request.body);
    expect(body.to).toBe(input.email);
    expect(body.text).toContain(publicSalaryGuideUrl);
    expect(body.text).toContain("hasn't subscribed you to marketing");
    expect(body).not.toHaveProperty("attachments");
    expect(body).not.toHaveProperty("salary");
    expect(body.text).not.toContain("utm_");
    expect(guideEmailContent("Alex Example").text.startsWith("Hi Alex,")).toBe(
      true,
    );
    await sendGuideEmail(input, "192.0.2.1", now);
    expect(fetchMock.mock.calls[0][1].headers["Idempotency-Key"]).toBe(
      fetchMock.mock.calls[1][1].headers["Idempotency-Key"],
    );
    expect(await sendGuideEmail(input, "192.0.2.2", now)).toEqual({
      status: 429,
      ok: false,
    });
  });
  it("fails truthfully on missing configuration, provider rejection and network failure", async () => {
    const { sendGuideEmail } = await import("@/lib/salary-guide-email");
    vi.stubEnv("RESEND_API_KEY", "");
    expect((await sendGuideEmail(input, "ip", now)).status).toBe(503);
    vi.stubEnv("RESEND_API_KEY", "test-only");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response("provider details", { status: 500 })),
    );
    expect(
      await sendGuideEmail({ ...input, email: "other@example.com" }, "ip", now),
    ).toEqual({ status: 502, ok: false });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("private details")),
    );
    expect(
      await sendGuideEmail({ ...input, email: "third@example.com" }, "ip", now),
    ).toEqual({ status: 502, ok: false });
    expect(console.error).toHaveBeenCalledWith(
      "Salary guide email delivery unavailable",
    );
  });
  it("blocks automated timing and independent IP limits", async () => {
    const { sendGuideEmail } = await import("@/lib/salary-guide-email");
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(new Response('{"id":"mock"}')));
    vi.stubGlobal("fetch", fetchMock);
    expect(
      (await sendGuideEmail({ ...input, startedAt: now }, "ip", now)).status,
    ).toBe(400);
    for (let i = 0; i < 5; i++)
      await sendGuideEmail(
        { ...input, email: `test${i}@example.com` },
        "ip",
        now,
      );
    expect(
      (
        await sendGuideEmail(
          { ...input, email: "sixth@example.com" },
          "ip",
          now,
        )
      ).status,
    ).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });
  it("guards the API origin, content type and actual body size", async () => {
    const { POST } = await import("../../../app/api/salary-guide/email/route");
    const path = `${publicSalaryGuideUrl.split("/insights")[0]}/api/salary-guide/email`;
    const foreign = await POST(
      new Request(path, {
        method: "POST",
        headers: {
          origin: "https://other.example",
          "content-type": "application/json",
        },
        body: JSON.stringify(input),
      }),
    );
    expect(foreign.status).toBe(403);
    const large = await POST(
      new Request(path, {
        method: "POST",
        headers: {
          origin: "https://essentialresourcing.co.uk",
          "content-type": "application/json",
        },
        body: "a".repeat(5000),
      }),
    );
    expect(large.status).toBe(413);
    expect(large.headers.get("cache-control")).toBe("no-store");
  });
});
