import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { POST as postCmsLogin } from "../../../app/api/cms/login/route";
import { POST as postCmsLogout } from "../../../app/api/cms/logout/route";
import { POST as postContact } from "../../../app/api/contact/route";
import { POST as postDataRequestConfirm } from "../../../app/api/data-request/confirm/route";
import { POST as postDataRequest } from "../../../app/api/data-request/route";
import { POST as postInterimAvailability } from "../../../app/api/interim-availability/route";
import { CMS_SESSION_COOKIE } from "../../lib/cms-auth";

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

  it("rejects invalid data request confirmation tokens safely", async () => {
    const response = await postDataRequestConfirm(
      new NextRequest("https://example.com/api/data-request/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: "bad token" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({ ok: false });
    expect(body.message).not.toMatch(/Error|stack|DATABASE_URL/i);
  });

  it("keeps interim availability updates disabled until the flag is approved", async () => {
    const response = await postInterimAvailability(
      new NextRequest("https://example.com/api/interim-availability", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token: "11111111111111111111111111111111",
          status: "available_now",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({ ok: false });
    expect(body.message).toMatch(/not live yet/i);
  });

  it("keeps CMS login redirects relative behind production proxies", async () => {
    const previous = {
      CMS_GATE_USERNAME: process.env.CMS_GATE_USERNAME,
      CMS_GATE_PASSWORD: process.env.CMS_GATE_PASSWORD,
      CMS_GATE_SECRET: process.env.CMS_GATE_SECRET,
    };

    process.env.CMS_GATE_USERNAME = "david";
    process.env.CMS_GATE_PASSWORD = "strong-password";
    process.env.CMS_GATE_SECRET = "long-random-session-secret";

    try {
      const response = await postCmsLogin(
        new NextRequest("https://0.0.0.0:8080/api/cms/login", {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            "x-forwarded-proto": "https",
          },
          body: new URLSearchParams({
            username: "david",
            password: "strong-password",
            redirectTo: "/studio",
          }),
        }),
      );

      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toBe("/studio");
      expect(response.headers.get("set-cookie")).toContain(
        `${CMS_SESSION_COOKIE}=`,
      );
    } finally {
      process.env.CMS_GATE_USERNAME = previous.CMS_GATE_USERNAME;
      process.env.CMS_GATE_PASSWORD = previous.CMS_GATE_PASSWORD;
      process.env.CMS_GATE_SECRET = previous.CMS_GATE_SECRET;
    }
  });

  it("keeps CMS logout redirects relative behind production proxies", async () => {
    const response = await postCmsLogout(
      new NextRequest("https://0.0.0.0:8080/api/cms/logout", {
        method: "POST",
        headers: {
          "x-forwarded-proto": "https",
        },
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/cms");
  });
});
