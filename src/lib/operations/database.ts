import "server-only";

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promisify } from "node:util";
import type { OperationsBackendStatus } from "./types";

const execFileAsync = promisify(execFile);
const commandTimeoutMs = 15_000;

function operationsEnabled() {
  return process.env.OPERATIONS_DB_ENABLED === "true";
}

export function getOperationsBackendStatus(): OperationsBackendStatus {
  const enabled = operationsEnabled();
  const configured = Boolean(process.env.DATABASE_URL);

  if (!enabled) {
    return {
      enabled,
      configured,
      state: "disabled",
      message:
        "Private operations database is staged but not enabled. Set OPERATIONS_DB_ENABLED=true after Railway Postgres is ready.",
    };
  }

  if (!configured) {
    return {
      enabled,
      configured,
      state: "missing_database_url",
      message:
        "OPERATIONS_DB_ENABLED is true, but DATABASE_URL is missing.",
    };
  }

  return {
    enabled,
    configured,
    state: "ready",
    message: "Private operations database is configured.",
  };
}

export function hashPrivateValue(value?: string) {
  const salt = process.env.OPERATIONS_PRIVACY_SALT || process.env.CMS_GATE_SECRET;
  if (!value || !salt) return undefined;
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

function toBase64Json(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

export async function runPsqlJson<T>(
  sql: string,
  payload?: unknown,
): Promise<T> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is missing.");

  const args = [
    "--dbname",
    databaseUrl,
    "--set",
    "ON_ERROR_STOP=1",
    "--tuples-only",
    "--no-align",
    "--quiet",
  ];

  if (payload !== undefined) {
    args.push("--set", `payload=${toBase64Json(payload)}`);
  }

  args.push("--command", sql);

  const { stdout } = await execFileAsync("psql", args, {
    timeout: commandTimeoutMs,
    maxBuffer: 1024 * 1024,
  });

  const trimmed = stdout.trim();
  if (!trimmed) throw new Error("Database returned no data.");
  return JSON.parse(trimmed) as T;
}
