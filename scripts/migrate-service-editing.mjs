import { getCliClient } from "sanity/cli";
import { services } from "../src/lib/content.ts";

const client = getCliClient({ apiVersion: "2026-06-09" });
const apply = process.argv.includes("--apply");
const docs = await client.fetch(
  '*[_type in ["service", "insight", "caseStudy"]]{_id,_rev,_type,slug,contentVersion}',
);
const refs = (type, slugs) =>
  slugs.map((slug) => {
    const doc = docs.find(
      (d) =>
        d._type === type &&
        d.slug?.current === slug &&
        !d._id.startsWith("drafts."),
    );
    if (!doc) throw new Error(`Missing ${type}: ${slug}`);
    return { _type: "reference", _ref: doc._id, _key: slug };
  });
const keyed = (items = []) =>
  items.map((item, i) => ({ ...item, _key: `item-${i}` }));
let transaction = client.transaction();
for (const service of services) {
  const doc = docs.find(
    (d) =>
      d._type === "service" &&
      d.slug?.current === service.slug &&
      !d._id.startsWith("drafts."),
  );
  if (!doc) throw new Error(`Missing service: ${service.slug}`);
  if (docs.some((d) => d._id === `drafts.${doc._id}`))
    throw new Error(
      `Preserve existing draft for ${service.slug}; review before migration.`,
    );
  if (doc.contentVersion === 2) {
    console.log(`Already migrated: ${service.slug}`);
    continue;
  }
  const {
    audience,
    mistakes,
    relatedServiceSlugs,
    relatedInsightSlugs,
    relatedCaseStudySlugs,
    ...copy
  } = service;
  const patch = Object.fromEntries(
    Object.entries({
      ...copy,
      slug: { _type: "slug", current: service.slug },
      whoFor: audience,
      commonMistakes: mistakes,
      processSteps: keyed(
        service.processSteps?.map(({ title, description }) => ({
          title,
          text: description,
        })),
      ),
      leadershipStages: keyed(service.leadershipStages),
      evidenceAreas: keyed(service.evidenceAreas),
      advisoryAreas: keyed(service.advisoryAreas),
      faqs: keyed(service.faqs),
      relatedServices: refs("service", relatedServiceSlugs),
      relatedInsights: refs("insight", relatedInsightSlugs),
      relatedCaseStudies: refs("caseStudy", relatedCaseStudySlugs),
      contentVersion: 2,
    }).filter(([, v]) => v !== undefined),
  );
  transaction = transaction.patch(doc._id, (p) =>
    p.ifRevisionId(doc._rev).set(patch),
  );
  console.log(`${apply ? "Migrate" : "Dry run"}: ${service.slug}`);
}
if (apply) {
  await transaction.commit();
  console.log("Service migration committed.");
}
