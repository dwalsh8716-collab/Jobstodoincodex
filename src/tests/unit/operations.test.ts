import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getOperationsBackendStatus,
  getOperationsOverview,
} from "@/lib/operations/store";

vi.mock("server-only", () => ({}));

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("operations backend status", () => {
  it("is disabled safely by default", () => {
    delete process.env.OPERATIONS_DB_ENABLED;
    delete process.env.DATABASE_URL;

    expect(getOperationsBackendStatus()).toMatchObject({
      enabled: false,
      configured: false,
      state: "disabled",
    });
  });

  it("does not pretend to be ready when enabled without DATABASE_URL", () => {
    process.env.OPERATIONS_DB_ENABLED = "true";
    delete process.env.DATABASE_URL;

    expect(getOperationsBackendStatus()).toMatchObject({
      enabled: true,
      configured: false,
      state: "missing_database_url",
    });
  });

  it("reports ready only when the feature flag and DATABASE_URL are present", () => {
    process.env.OPERATIONS_DB_ENABLED = "true";
    process.env.DATABASE_URL = "postgresql://example";

    expect(getOperationsBackendStatus()).toMatchObject({
      enabled: true,
      configured: true,
      state: "ready",
    });
  });

  it("returns zeroed DSAR overview fields when the database is disabled", async () => {
    delete process.env.OPERATIONS_DB_ENABLED;
    delete process.env.DATABASE_URL;

    await expect(getOperationsOverview()).resolves.toMatchObject({
      dataRequestCount: 0,
      openDataRequestCount: 0,
      latestDataRequests: [],
      interimAvailableNowCount: 0,
      latestInterimAvailability: [],
      retentionReviewCount: 0,
      latestRetentionReviews: [],
    });
  });
});
