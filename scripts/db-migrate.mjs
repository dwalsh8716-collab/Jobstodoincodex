import { execFile } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const databaseUrl = process.env.DATABASE_URL;
const migrationsDir = join(process.cwd(), "database", "migrations");

if (!databaseUrl) {
  console.error("DATABASE_URL is required before running database migrations.");
  process.exit(1);
}

async function runMigration(fileName) {
  const sql = await readFile(join(migrationsDir, fileName), "utf8");
  await execFileAsync(
    "psql",
    [
      "--dbname",
      databaseUrl,
      "--set",
      "ON_ERROR_STOP=1",
      "--quiet",
      "--command",
      sql,
    ],
    {
      maxBuffer: 1024 * 1024 * 8,
      timeout: 60_000,
    },
  );
  console.log(`Applied ${fileName}`);
}

const migrations = (await readdir(migrationsDir))
  .filter((fileName) => fileName.endsWith(".sql"))
  .sort();

for (const migration of migrations) {
  await runMigration(migration);
}

console.log("Database migrations complete.");
