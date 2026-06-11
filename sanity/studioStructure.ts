import {
  CaseIcon,
  CogIcon,
  ComposeIcon,
  DocumentsIcon,
  EarthGlobeIcon,
  HelpCircleIcon,
  HomeIcon,
  LinkIcon,
  RocketIcon,
  SearchIcon,
  StarIcon,
  TiersIcon,
  UserIcon,
} from "@sanity/icons";
import type { ComponentType } from "react";
import type { StructureBuilder, StructureResolver } from "sanity/structure";

const singletonListItem = (
  S: StructureBuilder,
  typeName: string,
  title: string,
  icon: ComponentType,
) =>
  S.listItem()
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(typeName).documentId(typeName).title(title));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Essential Resourcing CMS")
    .items([
      S.listItem()
        .title("Main Site")
        .icon(HomeIcon)
        .child(
          S.list()
            .title("Main Site")
            .items([
              singletonListItem(S, "homePage", "Homepage", HomeIcon),
              singletonListItem(S, "siteSettings", "Site Settings", CogIcon),
              S.documentTypeListItem("navigation")
                .title("Navigation")
                .icon(LinkIcon),
              S.documentTypeListItem("page").title("Pages").icon(DocumentsIcon),
              S.documentTypeListItem("redirect")
                .title("Redirects")
                .icon(EarthGlobeIcon),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Commercial")
        .icon(SearchIcon)
        .child(
          S.list()
            .title("Commercial")
            .items([
              S.documentTypeListItem("service")
                .title("Services")
                .icon(SearchIcon),
              S.documentTypeListItem("caseStudy")
                .title("Case Studies")
                .icon(CaseIcon),
              S.documentTypeListItem("testimonial")
                .title("Testimonials")
                .icon(StarIcon),
              S.documentTypeListItem("faq").title("FAQs").icon(HelpCircleIcon),
              S.documentTypeListItem("ctaBlock")
                .title("CTA Blocks")
                .icon(RocketIcon),
              S.documentTypeListItem("proofItem")
                .title("Logo / Proof Items")
                .icon(StarIcon),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Content")
        .icon(ComposeIcon)
        .child(
          S.list()
            .title("Content")
            .items([
              S.documentTypeListItem("insight")
                .title("Insights / Posts")
                .icon(ComposeIcon),
              S.documentTypeListItem("salarySnapshot")
                .title("Salary Guides / Snapshots")
                .icon(TiersIcon),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Recruitment")
        .icon(RocketIcon)
        .child(
          S.list()
            .title("Recruitment")
            .items([
              S.documentTypeListItem("job").title("Jobs").icon(RocketIcon),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Private Labs")
        .icon(RocketIcon)
        .child(
          S.list()
            .title("Private Labs")
            .items([
              S.documentTypeListItem("labsIdea")
                .title("Labs Ideas")
                .icon(RocketIcon),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("People")
        .icon(UserIcon)
        .child(
          S.list()
            .title("People")
            .items([
              S.documentTypeListItem("person")
                .title("Authors / David Walsh / Team")
                .icon(UserIcon),
            ]),
        ),
    ]);
