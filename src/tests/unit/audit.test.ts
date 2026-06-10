import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAuditLogOverview,
  logAuditEvent,
  sanitiseAuditValue,
} from "@/lib/operations/audit";

vi.mock("server-only", () => ({}));

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("audit log sanitisation", () => {
  it("redacts secrets, signed URLs and CV/file content", () => {
    const result = sanitiseAuditValue({
      status: "reviewing",
      password: "do-not-log",
      accessToken: "token",
      signedUrl: "https://private.example/download?token=secret",
      storageKey: "bucket/private-cv.pdf",
      message: "Candidate private message",
      nested: {
        cvContent: "full CV text",
      },
    });

    expect(result).toMatchObject({
      status: "reviewing",
      password: "[redacted]",
      accessToken: "[redacted]",
      signedUrl: "[redacted]",
      storageKey: "[redacted]",
      message: "[not logged]",
      nested: {
        cvContent: "[redacted]",
      },
    });
  });
});

describe("audit log utility", () => {
  it("does not require a database when operations are disabled", async () => {
    delete process.env.OPERATIONS_DB_ENABLED;
    delete process.env.DATABASE_URL;

    await expect(
      logAuditEvent({
        action: "candidate_viewed",
        entityType: "candidate",
        entityId: "00000000-0000-0000-0000-000000000001",
      }),
    ).resolves.toMatchObject({
      ok: true,
      required: false,
      reason: "disabled",
    });
  });

  it("reports a required logging failure when operations are enabled without DATABASE_URL", async () => {
    process.env.OPERATIONS_DB_ENABLED = "true";
    delete process.env.DATABASE_URL;

    await expect(
      logAuditEvent(
        {
          action: "cv_downloaded",
          entityType: "cv_file",
          entityId: "00000000-0000-0000-0000-000000000002",
        },
        { required: true },
      ),
    ).resolves.toMatchObject({
      ok: false,
      required: true,
      reason: "missing_database_url",
    });
  });

  it("returns an empty audit overview when operations are disabled", async () => {
    delete process.env.OPERATIONS_DB_ENABLED;
    delete process.env.DATABASE_URL;

    await expect(getAuditLogOverview()).resolves.toMatchObject({
      totalCount: 0,
      latest: [],
      status: {
        state: "disabled",
      },
    });
  });
});
