import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL is not set.");
  process.exit(0);
}

try {
  const { stdout } = await execFileAsync(
    "psql",
    [
      "--dbname",
      process.env.DATABASE_URL,
      "--tuples-only",
      "--no-align",
      "--command",
      "select 'ok' as database_status;",
    ],
    { timeout: 15_000 },
  );
  console.log(`Database connection: ${stdout.trim() || "ok"}`);
} catch (error) {
  console.error("Database connection failed. Check DATABASE_URL and psql.");
  if (error instanceof Error) console.error(error.message);
  process.exit(1);
}
