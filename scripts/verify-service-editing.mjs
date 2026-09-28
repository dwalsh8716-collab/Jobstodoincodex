import { getCliClient } from "sanity/cli";
import { services } from "../src/lib/content.ts";

const client = getCliClient({ apiVersion: "2026-06-09" });
const expected = new Map(services.map((service) => [service.slug, service]));
const actual = await client.fetch(
  `*[_type == "service" && slug.current in $slugs && !(_id in path("drafts.**"))]{
  _id, _rev, title, "slug": slug.current, contentVersion, status,
  heroHeadline, heroSubheadline, whoFor, problemsSolved, whenToUse,
  howEssentialWorks, commonMistakes, processSteps[]{title, text}, searchSummary,
  searchPhrases, seoTitle, metaDescription, ctaHeading, ctaText
}`,
  { slugs: [...expected.keys()] },
);
const errors = [];
for (const slug of expected.keys()) {
  const doc = actual.find((item) => item.slug === slug);
  if (!doc) {
    errors.push(`${slug}: published document missing`);
    continue;
  }
  const source = expected.get(slug);
  if (doc.contentVersion !== 2)
    errors.push(`${slug}: contentVersion is ${doc.contentVersion}`);
  if (doc.heroHeadline !== source.heroHeadline)
    errors.push(`${slug}: hero headline differs from approved code copy`);
  if (doc.heroSubheadline !== source.heroSubheadline)
    errors.push(`${slug}: hero support copy differs from approved code copy`);
  if (
    JSON.stringify(
      doc.processSteps?.map(({ title, text }) => ({
        title,
        description: text,
      })) ?? [],
    ) !== JSON.stringify(source.processSteps ?? [])
  )
    errors.push(`${slug}: process differs from approved code copy`);
  if (doc.status !== "published")
    errors.push(`${slug}: published status is ${doc.status}`);
}
console.log(
  JSON.stringify(
    {
      checked: actual.length,
      services: actual.map(
        ({ title, slug, status, contentVersion, processSteps }) => ({
          title,
          slug,
          status,
          contentVersion,
          processStepCount: processSteps?.length ?? 0,
        }),
      ),
      errors,
    },
    null,
    2,
  ),
);
if (actual.length !== expected.size || errors.length) process.exitCode = 1;
