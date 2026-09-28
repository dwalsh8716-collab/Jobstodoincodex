import { mkdir, writeFile } from "node:fs/promises";
import { getCliClient } from "sanity/cli";
import { havasSearchStory } from "../src/lib/havas-search-story.ts";

// Only add the approved story fields; retain all other published and draft edits.
const client = getCliClient({ apiVersion: "2026-06-09" }).withConfig({
  useCdn: false,
  perspective: "raw",
});
const slug = "havas-media-manchester-managing-partner-james-reddington";
const documents = await client.fetch(
  '*[_type == "caseStudy" && slug.current == $slug]',
  { slug },
);
const published = documents.filter(
  (doc) => !doc._id.startsWith("drafts.") && !doc._id.startsWith("versions."),
);
if (published.length !== 1)
  throw new Error("Expected exactly one published Havas case study.");
const targets = documents.filter(
  (doc) =>
    doc._id === published[0]._id || doc._id === `drafts.${published[0]._id}`,
);
const apply = process.argv.includes("--apply");
const pending = targets.filter((doc) => !doc.searchStory);
console.log(
  JSON.stringify(
    {
      project: client.config().projectId,
      dataset: client.config().dataset,
      publishedId: published[0]._id,
      draftPresent: targets.length > 1,
      addingStoryTo: pending.map((doc) => doc._id),
      mode: apply ? "apply" : "read-only",
    },
    null,
    2,
  ),
);
if (apply && pending.length) {
  await mkdir(".qa", { recursive: true });
  const backup = `.qa/havas-before-story-${Date.now()}.json`;
  await writeFile(backup, JSON.stringify(targets, null, 2), { mode: 0o600 });
  let transaction = client.transaction();
  for (const doc of pending)
    transaction = transaction.patch(doc._id, (patch) =>
      patch
        .ifRevisionId(doc._rev)
        .setIfMissing({ searchStory: havasSearchStory }),
    );
  await transaction.commit();
  const verified = await client.fetch("*[_id in $ids]{_id, searchStory}", {
    ids: pending.map((doc) => doc._id),
  });
  if (
    verified.some(
      (doc) =>
        JSON.stringify(doc.searchStory) === undefined ||
        doc.searchStory.approach.steps.length !== 5,
    )
  )
    throw new Error("Story read-back failed.");
  console.log(
    `Published approved Havas story fields. Rollback snapshot: ${backup}`,
  );
}
