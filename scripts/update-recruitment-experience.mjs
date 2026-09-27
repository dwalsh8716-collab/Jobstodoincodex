import { getCliClient } from "sanity/cli";
import { mkdirSync, writeFileSync } from "node:fs";

const client = getCliClient({ apiVersion: "2026-06-09" }).withConfig({
  projectId: "sle6d8y3", dataset: "production", useCdn: false, perspective: "raw",
});
const documents = await client.fetch('*[_type in ["homePage","page","person","siteSettings","service","insight","caseStudy","salarySnapshot","faq","ctaBlock","proofItem"]]');
const replacements = [
  ["nearly 15 years in specialist recruitment", "more than a decade specialising in marketing recruitment"],
  ["nearly 13 years in specialist recruitment", "more than a decade specialising in marketing recruitment"],
  ["David Walsh has nearly 15 years of recruitment experience and went independent in 2017.", "David Walsh started recruiting in 2013 and went independent in 2017."],
  ["nearly 15 years’ experience", "more than a decade’s experience"],
  ["nearly 15 years", "more than a decade"],
  ["Nearly 15 years", "More than a decade"],
  ["nearly 13 years", "more than a decade"],
  ["Nearly 13 years", "More than a decade"],
];
function collect(value, path = "", changes = {}) {
  if (typeof value === "string") {
    const updated = replacements.reduce((text, [before, after]) => text.replaceAll(before, after), value);
    if (updated !== value) changes[path] = updated;
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => collect(item, `${path}[${index}]`, changes));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (!key.startsWith("_")) collect(item, path ? `${path}.${key}` : key, changes);
    }
  }
  return changes;
}
const pending = documents.map((document) => ({ document, changes: collect(document) }))
  .filter(({ changes }) => Object.keys(changes).length);
console.log(JSON.stringify(pending.map(({ document, changes }) => ({ id: document._id, changes })), null, 2));
if (process.argv.includes("--apply") && pending.length) {
  mkdirSync(".qa", { recursive: true });
  writeFileSync(`.qa/experience-copy-backup-${Date.now()}.json`, JSON.stringify(pending, null, 2), { mode: 0o600 });
  let transaction = client.transaction();
  for (const { document, changes } of pending) {
    transaction = transaction.patch(document._id, (patch) => patch.ifRevisionId(document._rev).set(changes));
  }
  await transaction.commit({ visibility: "sync" });
  const verified = await client.fetch('*[_id in $ids]', { ids: pending.map(({ document }) => document._id) });
  if (verified.length !== pending.length || verified.some((doc) => Object.keys(collect(doc)).length)) {
    throw new Error("Experience copy verification failed.");
  }
  console.log(`Verified ${verified.length} updated CMS documents.`);
}
