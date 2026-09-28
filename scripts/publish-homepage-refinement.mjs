import { mkdir, writeFile } from "node:fs/promises";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-06-09" }).withConfig({ useCdn: false, perspective: "raw" });
const docs = await client.fetch('*[_id in ["homePage", "drafts.homePage"]]');
if (!docs.some((doc) => doc._id === "homePage")) throw new Error("Published homepage not found");
const changes = {
  "retained-search": { description: "A committed, research-led search for senior, confidential, difficult or commercially important appointments." },
  fractional: { title: "Fractional Leadership", linkLabel: "Explore Fractional Leadership", proposition: "Senior marketing leadership. Just not necessarily five days a week.", description: "Work out what senior capability the business actually needs, then find the person who can deliver it." },
  "market-intelligence-advisory": { description: "Salary intelligence, talent mapping, competitor insight, brief design and practical hiring advice before you commit." },
};
const updates = docs.map((doc) => {
  if (!Array.isArray(doc.serviceCards) || doc.serviceCards.length !== 4) throw new Error("Unexpected service cards; preserve content for review");
  const serviceCards = doc.serviceCards.map((card) => ({ ...card, ...changes[typeof card.slug === "string" ? card.slug : card.slug?.current] }));
  if (!serviceCards.some((card) => card.description === changes.fractional.description)) throw new Error("Service slugs did not match");
  const items = doc.audienceSection?.client?.items;
  if (!Array.isArray(items)) throw new Error("Client benefit list missing");
  return { doc, set: {
    heroSubheadline: "Marketing recruitment · Leadership search · Fractional Leadership · Market intelligence",
    "servicesSection.intro": "Permanent Recruitment, Retained Search, Fractional Leadership and Market Intelligence for marketing, communications, PR, digital and agency hiring.",
    serviceCards,
    "audienceSection.client.items": items.map((item) => item === "Hire permanently, retained or through Fractional" ? "Choose Permanent Recruitment, Retained Search or Fractional Leadership" : item),
  } };
});
console.log(JSON.stringify(updates.map(({ doc, set }) => ({ id: doc._id, set })), null, 2));
if (process.argv.includes("--apply")) {
  await mkdir(".qa/homepage", { recursive: true });
  const backup = `.qa/homepage/cms-before-${Date.now()}.json`;
  await writeFile(backup, JSON.stringify(docs, null, 2), { mode: 0o600 });
  let transaction = client.transaction();
  for (const { doc, set } of updates) transaction = transaction.patch(doc._id, (patch) => patch.ifRevisionId(doc._rev).set(set));
  await transaction.commit();
  console.log(`Homepage copy published. Backup: ${backup}`);
}
