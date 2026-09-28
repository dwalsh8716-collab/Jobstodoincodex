import { getCliClient } from "sanity/cli";
import { fallbackContentHubPages } from "../src/lib/content-hub-pages.ts";

const client = getCliClient({ apiVersion: "2026-06-09" });

const documents = [
  {
    _id: "jobsPage",
    _type: "jobsPage",
    ...fallbackContentHubPages.jobs,
  },
  {
    _id: "insightsPage",
    _type: "insightsPage",
    ...fallbackContentHubPages.insights,
    questions: fallbackContentHubPages.insights?.questions?.map(
      (question, index) => ({
        _key: `quick-answer-${index + 1}`,
        ...question,
      }),
    ),
  },
  {
    _id: "caseStudiesPage",
    _type: "caseStudiesPage",
    ...fallbackContentHubPages.caseStudies,
  },
];

for (const document of documents) {
  const existing = await client.fetch("*[_id == $id][0]{_id}", {
    id: document._id,
  });

  if (existing) {
    console.log(`Preserved existing ${document._id} content.`);
    continue;
  }

  await client.createIfNotExists(document);
  console.log(`Created ${document._id} from the currently published copy.`);
}
