import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/studioStructure";

export default defineConfig({
  name: "essential-resourcing",
  title: "Essential Resourcing",
  projectId: process.env.SANITY_PROJECT_ID || "essentialresourcing",
  dataset: process.env.SANITY_DATASET || "production",
  basePath: "/studio",
  schema: {
    types: schemaTypes,
  },
  plugins: [structureTool({ structure }), visionTool()],
});
