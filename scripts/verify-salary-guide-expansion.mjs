import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const git =
  process.platform === "darwin"
    ? "/Library/Developer/CommandLineTools/usr/bin/git"
    : "git";
const baseline = "e6e6e079d2c0193dce736542266abf7d3241255b";
const source = execFileSync(
  git,
  ["show", `${baseline}:src/lib/salary-guide-2026-tables.ts`],
  { encoding: "utf8" },
);
const before = (
  await import(
    `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
  )
).salaryTables;
const { salaryTables: after } = await import(
  pathToFileURL(`${process.cwd()}/src/lib/salary-guide-2026-tables.ts`)
);
const additions = [];
const changes = [];
let deleted = 0;
for (const table of before) {
  const next = after.find((t) => t.id === table.id);
  for (const row of table.rows) {
    const match = next?.rows.find(
      (r) => r[0] === row[0] && (row.length !== 5 || r[1] === row[1]),
    );
    if (!match) {
      deleted++;
      continue;
    }
    row.forEach((value, i) => {
      if (value !== match[i])
        changes.push({
          section: table.id,
          role: row[0],
          column: table.headers[i],
          before: value,
          after: match[i],
        });
    });
  }
}
for (const table of after)
  for (const row of table.rows) {
    const original = before
      .find((t) => t.id === table.id)
      ?.rows.find(
        (r) => r[0] === row[0] && (row.length !== 5 || r[1] === row[1]),
      );
    if (!original) additions.push({ section: table.id, row });
  }
// The supplied brief repeats some approved rows; compare its unique data rows.
const brief = readFileSync(process.argv[2], "utf8");
const approved = new Map();
for (const line of brief.split("\n")) {
  if (!line.startsWith("|") || !line.includes("£")) continue;
  const cells = line
    .split("|")
    .slice(1, -1)
    .map((s) => s.trim());
  if (cells.length === 4) approved.set(cells[0], cells);
}
const mismatches = additions.filter(
  ({ row }) => JSON.stringify(row) !== JSON.stringify(approved.get(row[0])),
);
const report = {
  baseline,
  existingRowsBefore: before.flatMap((t) => t.rows).length,
  existingRowsRetained: before.flatMap((t) => t.rows).length - deleted,
  newRows: additions.length,
  rowsAfter: after.flatMap((t) => t.rows).length,
  deleted,
  existingCellsChanged: changes.length,
  newSalaryCells: additions.length * 3,
  categoriesBefore: before.length,
  categoriesAfter: after.length,
  approvedUniqueRows: approved.size,
  approvedMismatches: mismatches,
  changes,
  additions,
};
writeFileSync(
  "artifacts/salary-guide-2026/final-expansion-integrity.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify({ ...report, additions: undefined }, null, 2));
if (
  deleted ||
  changes.length ||
  mismatches.length ||
  additions.length !== 27 ||
  approved.size !== 27
)
  process.exitCode = 1;
