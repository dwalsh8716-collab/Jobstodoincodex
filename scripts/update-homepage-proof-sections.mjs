import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-06-09" });

await client
  .patch("homePage")
  .set({
    "proofSection.eyebrow": "Proof",
    "proofSection.heading": "A senior hire that went on to matter.",
    "liveProofSection.eyebrow": "Insights",
    "liveProofSection.heading": "Useful thinking for better hiring decisions.",
    "liveProofSection.intro":
      "Practical hiring advice and market observations from the work David actually does. No SEO sludge written because somebody said the website needed another blog.",
  })
  .unset(["proofSection.caveat"])
  .commit();

console.log("Homepage proof and insight section copy updated.");
