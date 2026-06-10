import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";

export default defineConfig({
  name: "essential-resourcing",
  title: "Essential Resourcing",
  projectId: process.env.SANITY_PROJECT_ID || "essentialresourcing",
  dataset: process.env.SANITY_DATASET || "production",
  basePath: "/studio",
  schema: {
    types: schemaTypes
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Essential Resourcing CMS")
          .items([
            S.listItem()
              .title("Main Site")
              .child(
                S.list()
                  .title("Main Site")
                  .items([
                    S.documentTypeListItem("siteSettings").title("Site Settings"),
                    S.documentTypeListItem("navigation").title("Navigation"),
                    S.documentTypeListItem("page").title("Pages")
                  ])
              ),
            S.listItem()
              .title("Commercial")
              .child(
                S.list()
                  .title("Commercial")
                  .items([
                    S.documentTypeListItem("service").title("Services"),
                    S.documentTypeListItem("caseStudy").title("Case Studies"),
                    S.documentTypeListItem("testimonial").title("Testimonials"),
                    S.documentTypeListItem("faq").title("FAQs"),
                    S.documentTypeListItem("ctaBlock").title("CTA Blocks"),
                    S.documentTypeListItem("proofItem").title("Logo / Proof Items")
                  ])
              ),
            S.listItem()
              .title("Content")
              .child(
                S.list()
                  .title("Content")
                  .items([
                    S.documentTypeListItem("insight").title("Insights"),
                    S.documentTypeListItem("salarySnapshot").title("Salary Snapshots")
                  ])
              ),
            S.listItem()
              .title("Recruitment")
              .child(S.list().title("Recruitment").items([S.documentTypeListItem("job").title("Jobs")])),
            S.listItem()
              .title("People")
              .child(S.list().title("People").items([S.documentTypeListItem("person").title("David Walsh / Team")]))
          ])
    }),
    visionTool()
  ]
});
