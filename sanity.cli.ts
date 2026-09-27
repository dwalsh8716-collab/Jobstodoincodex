import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_PROJECT_ID || "sle6d8y3",
    dataset: process.env.SANITY_DATASET || "rebrand-preview",
  },
});
