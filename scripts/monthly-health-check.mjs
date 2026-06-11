import { spawnSync } from "node:child_process";

const dryRun = process.argv.includes("--dry-run");
const checks = [
  {
    name: "Release verification",
    command: "npm run verify",
    covers: "build, lint, typecheck, tests, performance budget and smoke checks",
  },
  {
    name: "Dependency audit",
    command: "npm audit --audit-level=moderate",
    covers: "known moderate-or-higher dependency vulnerabilities",
  },
  {
    name: "Sanity schema",
    command: "npm run sanity -- schema validate",
    covers: "CMS schema validity before editors use it",
  },
  {
    name: "Database status",
    command: "npm run db:status",
    covers: "Railway Postgres configuration status without exposing secrets",
  },
  {
    name: "Retention dry run",
    command: "npm run retention:check",
    covers: "data-retention runner safety",
  },
];

function runCheck(check) {
  if (dryRun) {
    return { ...check, status: "Not run", ok: true, seconds: 0 };
  }

  const started = Date.now();
  const result = spawnSync(check.command, {
    encoding: "utf8",
    shell: true,
    stdio: "pipe",
  });

  return {
    ...check,
    status: result.status === 0 ? "Green" : "Red",
    ok: result.status === 0,
    seconds: Math.round((Date.now() - started) / 1000),
  };
}

const results = checks.map(runCheck);
const failed = results.filter((result) => !result.ok);
const overall = failed.length ? "Red" : dryRun ? "Not run" : "Green";
const date = new Date().toISOString().slice(0, 10);

console.log(`# Monthly Website Health Check - ${date}`);
console.log("");
console.log(`Overall status: ${overall}`);
console.log("");
console.log("| Check | Status | Time | Covers |");
console.log("| --- | --- | --- | --- |");
for (const result of results) {
  console.log(
    `| ${result.name} | ${result.status} | ${result.seconds}s | ${result.covers} |`,
  );
}
console.log("");
console.log("Manual checks still needed:");
console.log("- Railway deployment dashboard and latest deploy status");
console.log("- uptime monitor incidents");
console.log("- Google Search Console coverage and Core Web Vitals");
console.log("- GA4/GTM conversion events, only after consent is approved");
console.log("- live contact, booking, WhatsApp and salary guide journeys");
console.log("- CMS stale drafts, missing alt text and jobs to close");
console.log("- privacy, cookie and candidate notices still accurate");
console.log("");
console.log("Use docs/monthly-website-health-report-template.md for the final plain-English report.");

if (failed.length) process.exit(1);
