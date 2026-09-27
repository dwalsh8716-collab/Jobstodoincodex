import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("../chrome-extension/", import.meta.url);

const requiredFiles = [
  "manifest.json",
  "popup.html",
  "popup.css",
  "popup.js",
  "service-worker.js",
  "content.js",
  "offscreen.html",
  "offscreen.js",
  "README.md"
];

const fail = (message) => {
  console.error(`Extension check failed: ${message}`);
  process.exit(1);
};

for (const file of requiredFiles) {
  const fileUrl = new URL(file, root);
  try {
    await access(fileUrl, constants.R_OK);
  } catch {
    fail(`${file} is missing or not readable.`);
  }
}

const manifest = JSON.parse(await readFile(new URL("manifest.json", root), "utf8"));
if (manifest.manifest_version !== 3) {
  fail("manifest.json must use Manifest V3.");
}

if (manifest.name !== "Essential Resourcing Video Outreach") {
  fail("manifest name is wrong.");
}

for (const permission of ["activeTab", "downloads", "offscreen", "scripting", "tabCapture"]) {
  if (!manifest.permissions?.includes(permission)) {
    fail(`manifest is missing the ${permission} permission.`);
  }
}

for (const script of ["popup.js", "service-worker.js", "content.js", "offscreen.js"]) {
  const scriptPath = join(root.pathname, script);
  const result = spawnSync(process.execPath, ["--check", scriptPath], {
    encoding: "utf8"
  });

  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    fail(`${script} did not pass JavaScript syntax checking.`);
  }
}

console.log("Chrome extension files passed static checks.");
