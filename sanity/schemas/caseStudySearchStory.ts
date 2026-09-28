import { defineArrayMember, defineField, defineType } from "sanity";

const line = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "string",
    validation: (rule) => rule.required(),
  });
const prose = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "text",
    rows: 4,
    description: "Use a blank line between paragraphs.",
    validation: (rule) => rule.required(),
  });
const lines = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "array",
    of: [defineArrayMember({ type: "string" })],
    validation: (rule) => rule.required().min(1),
  });

export const caseStudySearchStory = defineType({
  name: "caseStudySearchStory",
  title: "Search story",
  type: "object",
  fields: [
    defineField({
      name: "brief",
      title: "The brief",
      type: "object",
      validation: (rule) => rule.required(),
      fields: [
        line("heading", "Heading"),
        prose("impact", "Why the hire mattered"),
      ],
    }),
    defineField({
      name: "challenge",
      title: "Search challenge",
      type: "object",
      validation: (rule) => rule.required(),
      fields: [
        line("heading", "Heading"),
        line("questionsHeading", "Assessment heading"),
        lines("questions", "Assessment questions"),
        line("closing", "Closing line"),
      ],
    }),
    defineField({
      name: "approach",
      title: "Approach",
      type: "object",
      validation: (rule) => rule.required(),
      fields: [
        line("heading", "Heading"),
        prose("intro", "Introduction"),
        defineField({
          name: "steps",
          title: "Search stages",
          type: "array",
          validation: (rule) => rule.required().length(5),
          of: [
            defineArrayMember({
              type: "object",
              name: "searchStage",
              fields: [
                line("title", "Stage name"),
                prose("text", "What happened"),
              ],
              preview: { select: { title: "title", subtitle: "text" } },
            }),
          ],
        }),
        line("linkLabel", "Retained Search link wording"),
      ],
    }),
    defineField({
      name: "outcome",
      title: "Appointment and prior experience",
      type: "object",
      validation: (rule) => rule.required(),
      fields: [
        line("heading", "Heading"),
        prose("text", "Appointment story"),
        line("summary", "Hero outcome summary"),
        line("tenure", "Prior experience figure"),
        line("tenureQualifier", "Figure qualification, such as Almost"),
        prose("tenureLabel", "Where that experience was gained"),
      ],
    }),
    defineField({
      name: "progression",
      title: "What happened next",
      type: "object",
      validation: (rule) => rule.required(),
      fields: [
        line("heading", "Heading"),
        prose("text", "Progression story"),
        line("from", "Original role"),
        line("to", "Subsequent role"),
      ],
    }),
    defineField({
      name: "impact",
      title: "Attributed business growth",
      type: "object",
      description:
        "Havas reported this subsequent growth. It is not a result attributed to Essential. Keep the source and qualification beside the figure.",
      validation: (rule) => rule.required(),
      fields: [
        line("value", "Reported figure"),
        prose("attribution", "Source and period qualification"),
      ],
    }),
    defineField({
      name: "view",
      title: "The Essential view",
      type: "object",
      validation: (rule) => rule.required(),
      fields: [line("heading", "Heading"), lines("paragraphs", "Paragraphs")],
    }),
  ],
});
