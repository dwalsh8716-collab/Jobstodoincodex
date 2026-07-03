import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import zlib from "node:zlib";

const appDir = ".next/server/app";
const maxRouteGzipBytes = 80 * 1024;
const maxUniquePublicGzipBytes = 120 * 1024;
const ignoredRoutePattern = /^\/(studio|cms|api|llms|rss|robots|sitemap)/;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(filePath) : [filePath];
  });
}

function readRouteManifest(filePath) {
  const context = { globalThis: {} };
  vm.runInNewContext(fs.readFileSync(filePath, "utf8"), context);
  return Object.entries(context.globalThis.__RSC_MANIFEST || {})[0];
}

function normaliseChunk(chunk) {
  return chunk.replace(/^\/_next\//, "");
}

function gzipSize(filePath) {
  return zlib.gzipSync(fs.readFileSync(filePath)).length;
}

const manifests = walk(appDir).filter((filePath) =>
  filePath.endsWith("_client-reference-manifest.js"),
);

const publicRoutes = [];
const uniquePublicChunks = new Set();

for (const manifestFile of manifests) {
  const [route, manifest] = readRouteManifest(manifestFile) || [];
  if (!route || ignoredRoutePattern.test(route)) continue;

  const chunks = new Set();

  for (const files of Object.values(manifest.entryJSFiles || {})) {
    for (const file of files) chunks.add(normaliseChunk(file));
  }

  for (const moduleRef of Object.values(manifest.clientModules || {})) {
    for (const file of moduleRef.chunks || []) chunks.add(normaliseChunk(file));
  }

  let gzipBytes = 0;

  for (const chunk of chunks) {
    const chunkPath = path.join(".next", chunk);
    if (!fs.existsSync(chunkPath)) continue;
    gzipBytes += gzipSize(chunkPath);
    uniquePublicChunks.add(chunk);
  }

  publicRoutes.push({ route, chunks: chunks.size, gzipBytes });
}

let uniqueGzipBytes = 0;
for (const chunk of uniquePublicChunks) {
  const chunkPath = path.join(".next", chunk);
  if (fs.existsSync(chunkPath)) uniqueGzipBytes += gzipSize(chunkPath);
}

const heavyRoutes = publicRoutes.filter(
  (route) => route.gzipBytes > maxRouteGzipBytes,
);

publicRoutes
  .sort((a, b) => b.gzipBytes - a.gzipBytes)
  .slice(0, 8)
  .forEach((route) => {
    console.log(
      `${route.route}: ${Math.round(route.gzipBytes / 1024)}KB gzip across ${route.chunks} client files`,
    );
  });

console.log(
  `Unique public client JS: ${Math.round(uniqueGzipBytes / 1024)}KB gzip`,
);

if (heavyRoutes.length || uniqueGzipBytes > maxUniquePublicGzipBytes) {
  console.error("Performance budget failed.");
  process.exit(1);
}
