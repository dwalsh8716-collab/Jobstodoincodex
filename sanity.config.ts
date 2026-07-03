import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/studioStructure";

export default defineConfig({
  name: "essential-resourcing",
  title: "Essential Resourcing",
  projectId:
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    process.env.SANITY_PROJECT_ID ||
    "sle6d8y3",
  dataset:
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    process.env.SANITY_DATASET ||
    "production",
  basePath: "/studio",
  schema: {
    types: schemaTypes,
  },
  plugins: [structureTool({ structure }), visionTool()],
});
