import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { POST as postContact } from "../../../app/api/contact/route";
import { POST as postDataRequest } from "../../../app/api/data-request/route";

vi.mock("server-only", () => ({}));

describe("public form API routes", () => {
  it("rejects empty contact posts with a safe validation response", async () => {
    const response = await postContact(
      new NextRequest("https://example.com/api/contact", { method: "POST" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({ ok: false });
    expect(body.message).not.toMatch(/Error|stack|RESEND_API_KEY/i);
  });

  it("rejects empty data request posts with a safe validation response", async () => {
    const response = await postDataRequest(
      new NextRequest("https://example.com/api/data-request", {
        method: "POST",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({ ok: false });
    expect(body.message).not.toMatch(/Error|stack|RESEND_API_KEY/i);
  });
});
