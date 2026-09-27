import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

// Read-only source audit plus public sitemap/schema metadata; never reads .env files or private records.
const root = process.argv[2];
if (!root || !path.isAbsolute(root)) throw new Error("Provide the absolute baseline source directory.");
const out = path.resolve("docs/rebrand/inventory");
mkdirSync(out, { recursive: true });
const skipped = new Set(["node_modules", ".git", ".next", ".venv", ".npm-cache", ".sanity", ".qa", "dist", "build", "coverage", "test-results", "artifacts", "exports", "logs", "data", "recordings", "uploads", "__pycache__", ".pytest_cache", "New Website 2026", "qa-screenshots"]);
const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (skipped.has(entry.name) || (entry.name.startsWith(".env") && entry.name !== ".env.example")) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.isFile() && /\.(tsx?|m?js|py|md|json|ya?ml|toml|css|sql|html|webmanifest)$|\.env\.example$/.test(entry.name) && !/lock\.json$|tsbuildinfo$/.test(entry.name)) files.push(p);
  }
}
walk(root);
const references = [], envReferences = new Map(), hashes = [], routes = [], packages = [];
const patterns = {
  brand: /Essential Resourcing|essential-resourcing|essentialresourcing/i,
  domain: /essentialresourcing\.co\.uk|web-production-ba3b9\.up\.railway\.app/i,
  email: /[\w.+-]+@essentialresourcing\.co\.uk/i,
  logo: /logoDark|logoLight|iconDark|iconLight|favicon|og-image|apple-touch-icon|android-chrome/i,
  discovery: /canonical|sitemap|robots|llms|openGraph|sameAs|schema\.org/i,
};
for (const file of files.sort()) {
  const relative = path.relative(root, file), source = readFileSync(file, "utf8");
  hashes.push({ path: relative, sha256: createHash("sha256").update(source).digest("hex") });
  if (path.basename(file) === "package.json") packages.push({ path: relative, ...JSON.parse(source) });
  if (/^app\/.*\/(page|route)\.(ts|tsx)$|^app\/(page|robots|sitemap)\.(ts|tsx)$/.test(relative)) routes.push({ file: relative, route: "/" + relative.replace(/^app\//, "").replace(/\/?(page|route)\.(ts|tsx)$/, "").replace(/\/$/, "") });
  source.split("\n").forEach((line, i) => {
    const categories = Object.entries(patterns).filter(([, pattern]) => pattern.test(line)).map(([name]) => name);
    if (categories.length) references.push({ file: relative, line: i + 1, categories: categories.join(";"), excerpt: line.trim().slice(0, 240) });
    for (const match of line.matchAll(/(?:process\.env\.|env\.|os\.getenv\(["'])([A-Z][A-Z0-9_]+)/g)) {
      const name = match[1]; if (!envReferences.has(name)) envReferences.set(name, new Set()); envReferences.get(name).add(`${relative}:${i + 1}`);
    }
    const definition = line.match(/^([A-Z][A-Z0-9_]+)=/);
    if (definition) { const name = definition[1]; if (!envReferences.has(name)) envReferences.set(name, new Set()); envReferences.get(name).add(`${relative}:${i + 1}`); }
  });
}
const redirects = [];
for (const file of ["next.config.ts", "proxy.ts"]) {
  const ast = ts.createSourceFile(file, readFileSync(path.join(root, file), "utf8"), ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const fields = new Map(node.properties.filter(ts.isPropertyAssignment).map(p => [p.name.getText(ast).replace(/["']/g, ""), p.initializer]));
      const dest = fields.get("destination"), src = fields.get("source"), prefixes = fields.get("prefixes");
      if (dest && ts.isStringLiteral(dest)) {
        if (src && ts.isStringLiteral(src)) redirects.push({ source: src.text, destination: dest.text, origin: file, scope: fields.has("has") ? "host-condition" : "exact" });
        if (prefixes && ts.isArrayLiteralExpression(prefixes)) for (const el of prefixes.elements) if (ts.isStringLiteral(el)) redirects.push({ source: el.text, destination: dest.text, origin: file, scope: "prefix" });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}
const sitemapResponse = await fetch("https://essentialresourcing.co.uk/sitemap.xml");
if (!sitemapResponse.ok) throw new Error("Could not read live sitemap");
const xml = await sitemapResponse.text();
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
const urlMap = urls.map(url => ({ oldUrl: url, futureUrl: `{APPROVED_NEW_ORIGIN}${new URL(url).pathname}`, action: "Preserve path; 301 old host directly to approved new host at authorised launch", source: "Live sitemap" }));
for (const redirect of redirects) {
  let dest = redirect.destination;
  const seen = new Set();
  while (!seen.has(dest)) { seen.add(dest); const next = redirects.find(r => r.scope === "exact" && r.source === dest); if (!next) break; dest = next.destination; }
  const pathname = dest.startsWith("https://") ? new URL(dest).pathname : dest;
  urlMap.push({ oldUrl: `https://essentialresourcing.co.uk${redirect.source}`, futureUrl: `{APPROVED_NEW_ORIGIN}${pathname}`, action: `Flatten legacy ${redirect.scope} redirect into single hop; review query handling`, source: redirect.origin });
}
const queryUrl = new URL("https://sle6d8y3.api.sanity.io/v2026-06-09/data/query/production");
queryUrl.searchParams.set("query", 'array::unique(*[!(_id in path("drafts.**"))]._type)');
const cmsResponse = await fetch(queryUrl); const cms = await cmsResponse.json();
const csv = (rows) => { const keys = Object.keys(rows[0] || {}); return [keys,...rows.map(row => keys.map(k => String(row[k] ?? "")))].map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n") + "\n"; };
writeFileSync(path.join(out,"brand-references.csv"),csv(references));
writeFileSync(path.join(out,"environment-references.csv"),csv([...envReferences].sort(([a],[b]) => a.localeCompare(b)).map(([name,refs]) => ({ name, references:[...refs].join(";") }))));
writeFileSync(path.join(out,"url-migration-map.csv"),csv(urlMap));
writeFileSync(path.join(out,"route-inventory.json"),JSON.stringify(routes,null,2));
writeFileSync(path.join(out,"package-inventory.json"),JSON.stringify(packages,null,2));
writeFileSync(path.join(out,"baseline-source-hashes.json"),JSON.stringify(hashes,null,2));
writeFileSync(path.join(out,"legacy-redirects.json"),JSON.stringify(redirects,null,2));
writeFileSync(path.join(out,"production-sitemap.xml"),xml);
const summary={auditedAt:new Date().toISOString(),sourceFiles:files.length,brandReferenceLines:references.length,environmentNames:envReferences.size,sitemapUrls:urls.length,redirectRules:redirects.length,routeFiles:routes.length,cms:{project:"sle6d8y3",dataset:"production",status:cmsResponse.status,publishedDocumentTypes:cms.result},scope:"Source plus read-only hosting configuration and public endpoints. No private data or secrets exported. External accounts and backlink history require later verification."};
writeFileSync(path.join(out,"summary.json"),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
