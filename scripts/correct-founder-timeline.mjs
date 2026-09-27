import { getCliClient } from "sanity/cli";
import { defaultHomePageContent } from "../src/lib/homepage-content.ts";

const documentId = "homePage";
const oldSentence =
  "Essential Resourcing was founded by David Walsh in 2017 after he started recruiting across marketing and agencies in 2013.";
const correctedSentence = defaultHomePageContent.founderSection.paragraphs[0];
const client = getCliClient({ apiVersion: "2026-06-09" }).withConfig({
  useCdn: false,
  perspective: "raw",
});

async function readHomePage() {
  return client.fetch(
    `*[_id == $documentId][0]{
      _id,
      _rev,
      "paragraphs": founderSection.paragraphs
    }`,
    { documentId },
  );
}

const current = await readHomePage();
if (!current || !Array.isArray(current.paragraphs)) {
  throw new Error("Published homepage content was not found; no changes made.");
}

if (current.paragraphs[0] === correctedSentence) {
  console.log("Published homepage founder timeline is already correct.");
} else {
  if (current.paragraphs[0] !== oldSentence) {
    throw new Error("Homepage founder text has changed; no changes made.");
  }

  await client
    .patch(documentId)
    .ifRevisionId(current._rev)
    .set({
      "founderSection.paragraphs": [
        correctedSentence,
        ...current.paragraphs.slice(1),
      ],
    })
    .commit({ visibility: "sync" });

  const verified = await readHomePage();
  if (verified?.paragraphs?.[0] !== correctedSentence) {
    throw new Error("Homepage content update could not be verified.");
  }
  console.log("Published homepage founder timeline updated and verified.");
}
