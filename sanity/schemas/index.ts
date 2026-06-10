import {
  BlockContentIcon,
  CaseIcon,
  CogIcon,
  ComposeIcon,
  DocumentsIcon,
  EarthGlobeIcon,
  HelpCircleIcon,
  HomeIcon,
  ImageIcon,
  InfoOutlineIcon,
  LinkIcon,
  PlayIcon,
  RocketIcon,
  SearchIcon,
  StarIcon,
  ThListIcon,
  TiersIcon,
  UserIcon,
} from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

type RequiredRule = {
  required: () => {
    error: (message: string) => unknown;
  };
};

const requiredText =
  (message = "Add this before publishing.") =>
  (rule: RequiredRule) =>
    rule.required().error(message) as never;

const stringListField = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    description,
    type: "array",
    of: [defineArrayMember({ type: "string" })],
  });

const textListField = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    description,
    type: "array",
    of: [defineArrayMember({ type: "text", rows: 3 })],
  });

const referenceListField = (
  name: string,
  title: string,
  to: string[],
  description?: string,
) =>
  defineField({
    name,
    title,
    description,
    type: "array",
    of: [
      defineArrayMember({
        type: "reference",
        to: to.map((type) => ({ type })),
      }),
    ],
  });

const publishedStatusField = () =>
  defineField({
    name: "status",
    title: "Published status",
    type: "string",
    options: {
      list: [
        { title: "Draft", value: "draft" },
        { title: "Published", value: "published" },
      ],
      layout: "radio",
    },
    initialValue: "draft",
    validation: requiredText("Choose draft or published."),
  });

const seoFields = [
  defineField({
    name: "seoTitle",
    title: "SEO title",
    type: "string",
    description: "Aim for 45-60 characters. Keep it specific and useful.",
    validation: (rule) => rule.max(70),
  }),
  defineField({
    name: "metaDescription",
    title: "Meta description",
    type: "text",
    rows: 3,
    description:
      "Aim for 120-155 characters. Explain the page benefit clearly.",
    validation: (rule) => rule.max(160),
  }),
  defineField({
    name: "openGraphImage",
    title: "Open Graph image",
    type: "image",
    description: "The image used when this page is shared.",
    options: { hotspot: true },
  }),
  defineField({
    name: "canonicalUrlOverride",
    title: "Canonical URL override",
    type: "url",
    description:
      "Only use this when this page is a duplicate or replacement for another canonical URL.",
  }),
  defineField({
    name: "redirectFrom",
    title: "Redirect from old URLs",
    type: "array",
    description:
      "Legacy paths that should 301 to this page, such as /old-service-page.",
    of: [defineArrayMember({ type: "string" })],
  }),
  defineField({
    name: "noIndex",
    title: "Hide this page from search engines",
    type: "boolean",
    initialValue: false,
  }),
];

const ctaButtonField = () =>
  defineField({
    name: "cta",
    title: "Call to action button",
    type: "object",
    fields: [
      defineField({
        name: "label",
        title: "Button label",
        type: "string",
        description: "Keep it short and action-led.",
        validation: (rule) => rule.max(36),
      }),
      defineField({
        name: "href",
        title: "Button link",
        type: "string",
        description: "Use an internal path such as /contact where possible.",
      }),
      defineField({
        name: "variant",
        title: "Button style",
        type: "string",
        options: {
          list: [
            { title: "Primary", value: "primary" },
            { title: "Secondary", value: "secondary" },
            { title: "Dark", value: "dark" },
            { title: "Text link", value: "text" },
          ],
          layout: "radio",
        },
      }),
    ],
  });

const inlineFaqField = () =>
  defineField({
    name: "faqs",
    title: "FAQs",
    type: "array",
    of: [
      defineArrayMember({
        type: "object",
        fields: [
          defineField({
            name: "question",
            title: "Question",
            type: "string",
            validation: requiredText("Add the question."),
          }),
          defineField({
            name: "answer",
            title: "Answer",
            type: "text",
            rows: 4,
            validation: requiredText("Add the answer."),
          }),
        ],
        preview: {
          select: { title: "question", subtitle: "answer" },
        },
      }),
    ],
  });

const imageWithAltField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Alt text",
        type: "string",
        description:
          "Describe the image in plain English. Leave blank if it is decorative.",
        validation: (rule) => rule.max(140),
      }),
      defineField({ name: "caption", title: "Caption", type: "string" }),
    ],
  });

const videoFields = [
  defineField({
    name: "title",
    title: "Video title",
    type: "string",
    validation: requiredText("Add a title."),
  }),
  defineField({
    name: "provider",
    title: "Video source",
    type: "string",
    options: {
      list: [
        { title: "YouTube", value: "youtube" },
        { title: "Vimeo", value: "vimeo" },
        { title: "Uploaded video file", value: "upload" },
      ],
      layout: "radio",
    },
    validation: requiredText("Choose where the video comes from."),
  }),
  defineField({
    name: "url",
    title: "Embed or video URL",
    type: "url",
    description:
      "Use this for YouTube, Vimeo or a hosted MP4 URL. Leave blank when using an uploaded file.",
    hidden: ({ parent }) => parent?.provider === "upload",
    validation: (rule) =>
      rule.custom((value, context) => {
        const parent = context.parent as { provider?: string } | undefined;
        if (parent?.provider !== "upload" && !value)
          return "Add a YouTube or Vimeo URL.";
        return true;
      }),
  }),
  defineField({
    name: "uploadedVideo",
    title: "Uploaded video file",
    type: "file",
    description: "Use an MP4/WebM file that has been compressed for the web.",
    options: { accept: "video/mp4,video/webm" },
    hidden: ({ parent }) => parent?.provider !== "upload",
    validation: (rule) =>
      rule.custom((value, context) => {
        const parent = context.parent as { provider?: string } | undefined;
        if (parent?.provider === "upload" && !value)
          return "Upload a video file or switch video source.";
        return true;
      }),
  }),
  defineField({
    name: "description",
    title: "Short description",
    type: "text",
    rows: 3,
  }),
  imageWithAltField("posterImage", "Poster image"),
  defineField({
    name: "transcript",
    title: "Short transcript or accessibility note",
    type: "text",
    rows: 4,
    description:
      "Add the key spoken points in plain English when the video is published.",
  }),
  defineField({
    name: "captionsUrl",
    title: "Captions file URL",
    type: "url",
    description:
      "Use a WebVTT captions file for uploaded video where possible.",
  }),
];

const videoBlockMember = defineArrayMember({
  name: "videoBlock",
  title: "Video block",
  type: "object",
  icon: PlayIcon,
  fields: videoFields,
  preview: { select: { title: "title", subtitle: "provider" } },
});

const portableBodyField = (name = "body", title = "Body rich text") =>
  defineField({
    name,
    title,
    type: "array",
    of: [
      defineArrayMember({ type: "block" }),
      videoBlockMember,
      defineArrayMember({
        name: "mediaFeature",
        title: "Image / media feature",
        type: "object",
        icon: ImageIcon,
        fields: [
          defineField({ name: "title", title: "Title", type: "string" }),
          imageWithAltField("image", "Image"),
          defineField({ name: "caption", title: "Caption", type: "string" }),
        ],
      }),
      defineArrayMember({
        name: "pullQuote",
        title: "Pull quote",
        type: "object",
        icon: ComposeIcon,
        fields: [
          defineField({ name: "quote", title: "Quote", type: "text", rows: 3 }),
          defineField({
            name: "attribution",
            title: "Attribution",
            type: "string",
          }),
        ],
      }),
      defineArrayMember({
        name: "callToAction",
        title: "Call to action",
        type: "object",
        icon: RocketIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
          ctaButtonField(),
        ],
      }),
    ],
  });

const processStepsField = () =>
  defineField({
    name: "processSteps",
    title: "Process steps",
    type: "array",
    of: [
      defineArrayMember({
        type: "object",
        fields: [
          defineField({
            name: "title",
            title: "Step title",
            type: "string",
            validation: requiredText("Add the step title."),
          }),
          defineField({
            name: "text",
            title: "Step text",
            type: "text",
            rows: 3,
          }),
        ],
        preview: { select: { title: "title", subtitle: "text" } },
      }),
    ],
  });

const salaryTableRowsField = () =>
  defineField({
    name: "salaryTableRows",
    title: "Salary table rows",
    type: "array",
    of: [
      defineArrayMember({
        type: "object",
        fields: [
          defineField({
            name: "roleTitle",
            title: "Role title",
            type: "string",
          }),
          defineField({
            name: "lowSalary",
            title: "Low salary",
            type: "string",
          }),
          defineField({
            name: "midSalary",
            title: "Mid salary",
            type: "string",
          }),
          defineField({
            name: "highSalary",
            title: "High salary",
            type: "string",
          }),
          defineField({ name: "notes", title: "Notes", type: "string" }),
        ],
        preview: { select: { title: "roleTitle", subtitle: "midSalary" } },
      }),
    ],
  });

const flexibleContentField = () =>
  defineField({
    name: "contentBlocks",
    title: "Flexible content blocks",
    description: "Optional page sections David can add without changing code.",
    type: "array",
    of: [
      defineArrayMember({
        name: "textBlock",
        title: "Text block",
        type: "object",
        icon: BlockContentIcon,
        fields: [
          defineField({
            name: "eyebrow",
            title: "Small heading",
            type: "string",
          }),
          defineField({ name: "heading", title: "Heading", type: "string" }),
          portableBodyField("text", "Text"),
        ],
      }),
      defineArrayMember({
        name: "imageTextSplit",
        title: "Image and text split",
        type: "object",
        icon: ImageIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          defineField({ name: "text", title: "Text", type: "text", rows: 4 }),
          imageWithAltField("image", "Image"),
          ctaButtonField(),
        ],
      }),
      videoBlockMember,
      defineArrayMember({
        name: "ctaBlock",
        title: "Call to action block",
        type: "object",
        icon: RocketIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
          ctaButtonField(),
        ],
      }),
      defineArrayMember({
        name: "statsProofStrip",
        title: "Stats / proof strip",
        type: "object",
        icon: StarIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          defineField({
            name: "items",
            title: "Proof points",
            type: "array",
            of: [
              defineArrayMember({
                type: "object",
                fields: [
                  defineField({
                    name: "value",
                    title: "Value",
                    type: "string",
                  }),
                  defineField({
                    name: "label",
                    title: "Label",
                    type: "string",
                  }),
                  defineField({ name: "note", title: "Note", type: "string" }),
                ],
              }),
            ],
          }),
        ],
      }),
      defineArrayMember({
        name: "serviceCards",
        title: "Service cards",
        type: "object",
        icon: SearchIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          referenceListField("services", "Services", ["service"]),
        ],
      }),
      defineArrayMember({
        name: "testimonialBlock",
        title: "Testimonial block",
        type: "object",
        icon: StarIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          referenceListField("testimonials", "Testimonials", ["testimonial"]),
        ],
      }),
      defineArrayMember({
        name: "caseStudyCards",
        title: "Case study cards",
        type: "object",
        icon: CaseIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          referenceListField("caseStudies", "Case studies", ["caseStudy"]),
        ],
      }),
      defineArrayMember({
        name: "insightCards",
        title: "Insight cards",
        type: "object",
        icon: DocumentsIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          referenceListField("insights", "Insights", ["insight"]),
        ],
      }),
      defineArrayMember({
        name: "faqBlock",
        title: "FAQ block",
        type: "object",
        icon: HelpCircleIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          referenceListField("faqs", "FAQs", ["faq"]),
          inlineFaqField(),
        ],
      }),
      defineArrayMember({
        name: "salaryTable",
        title: "Salary table",
        type: "object",
        icon: TiersIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          defineField({
            name: "snapshot",
            title: "Salary snapshot",
            type: "reference",
            to: [{ type: "salarySnapshot" }],
          }),
          salaryTableRowsField(),
        ],
      }),
      defineArrayMember({
        name: "pullQuote",
        title: "Pull quote",
        type: "object",
        icon: ComposeIcon,
        fields: [
          defineField({ name: "quote", title: "Quote", type: "text", rows: 3 }),
          defineField({
            name: "attribution",
            title: "Attribution",
            type: "string",
          }),
        ],
      }),
      defineArrayMember({
        name: "founderBlock",
        title: "Founder block",
        type: "object",
        icon: UserIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          defineField({ name: "text", title: "Text", type: "text", rows: 4 }),
          defineField({
            name: "person",
            title: "Person",
            type: "reference",
            to: [{ type: "person" }],
          }),
        ],
      }),
      defineArrayMember({
        name: "logoProofStrip",
        title: "Logo / proof strip",
        type: "object",
        icon: StarIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          referenceListField("proofItems", "Logo or proof items", [
            "proofItem",
          ]),
        ],
      }),
      defineArrayMember({
        name: "processSteps",
        title: "Process steps",
        type: "object",
        icon: ThListIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          processStepsField(),
        ],
      }),
      defineArrayMember({
        name: "comparisonBlock",
        title: "Comparison block",
        type: "object",
        icon: TiersIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          defineField({
            name: "rows",
            title: "Comparison rows",
            type: "array",
            of: [
              defineArrayMember({
                type: "object",
                fields: [
                  defineField({
                    name: "label",
                    title: "Label",
                    type: "string",
                  }),
                  defineField({
                    name: "before",
                    title: "Before / weak version",
                    type: "text",
                    rows: 2,
                  }),
                  defineField({
                    name: "after",
                    title: "After / stronger version",
                    type: "text",
                    rows: 2,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      defineArrayMember({
        name: "statementSection",
        title: "Dark statement section",
        type: "object",
        icon: InfoOutlineIcon,
        fields: [
          defineField({
            name: "eyebrow",
            title: "Small heading",
            type: "string",
          }),
          defineField({
            name: "statement",
            title: "Statement",
            type: "text",
            rows: 3,
          }),
          defineField({
            name: "supportingText",
            title: "Supporting text",
            type: "text",
            rows: 3,
          }),
        ],
      }),
      defineArrayMember({
        name: "contactBlock",
        title: "Contact block",
        type: "object",
        icon: LinkIcon,
        fields: [
          defineField({ name: "heading", title: "Heading", type: "string" }),
          defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
          ctaButtonField(),
        ],
      }),
    ],
  });

const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "siteName",
      title: "Site name",
      type: "string",
      validation: requiredText("Add the site name."),
    }),
    defineField({
      name: "defaultSeoTitle",
      title: "Default SEO title",
      type: "string",
    }),
    defineField({
      name: "defaultMetaDescription",
      title: "Default meta description",
      type: "text",
      rows: 3,
    }),
    defineField({ name: "siteUrl", title: "Site URL", type: "url" }),
    imageWithAltField("logo", "Logo"),
    defineField({ name: "favicon", title: "Favicon", type: "image" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "bookingUrl", title: "Booking link", type: "url" }),
    defineField({
      name: "addressRegion",
      title: "Address / region",
      type: "string",
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "url", title: "URL", type: "url" }),
          ],
        }),
      ],
    }),
    imageWithAltField("defaultOpenGraphImage", "Default Open Graph image"),
    defineField({
      name: "footerCopy",
      title: "Footer copy",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "footerCtaHeading",
      title: "Footer CTA heading",
      type: "string",
    }),
    defineField({
      name: "footerCtaText",
      title: "Footer CTA text",
      type: "text",
      rows: 3,
    }),
    referenceListField("footerNavigation", "Footer navigation links", [
      "navigation",
    ]),
    referenceListField(
      "featuredProof",
      "Proof or logos David has permission to show",
      ["proofItem"],
    ),
  ],
});

const homePage = defineType({
  name: "homePage",
  title: "Homepage",
  type: "document",
  icon: HomeIcon,
  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      initialValue: "Homepage",
    }),
    defineField({
      name: "heroEyebrow",
      title: "Hero small heading",
      type: "string",
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero headline",
      type: "string",
    }),
    defineField({
      name: "heroSubheadline",
      title: "Hero subheadline",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "premiumVideo",
      title: "Homepage premium video",
      type: "object",
      icon: PlayIcon,
      fields: videoFields,
    }),
    stringListField("proofPoints", "Proof strip points"),
    stringListField("whyEssentialPoints", "Why Essential points"),
    referenceListField("featuredServices", "Featured services", ["service"]),
    referenceListField("featuredInsights", "Featured insights", ["insight"]),
    referenceListField("featuredCaseStudies", "Featured case studies", [
      "caseStudy",
    ]),
    referenceListField(
      "featuredProof",
      "Proof or logos David has permission to show",
      ["proofItem"],
    ),
    flexibleContentField(),
    defineField({ name: "ctaHeading", title: "CTA heading", type: "string" }),
    defineField({ name: "ctaText", title: "CTA text", type: "text", rows: 3 }),
    ctaButtonField(),
    ...seoFields,
    publishedStatusField(),
  ],
});

const navigation = defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: requiredText("Add the navigation label."),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "string",
      validation: requiredText("Add the link URL."),
    }),
    defineField({ name: "order", title: "Order", type: "number" }),
    defineField({
      name: "parent",
      title: "Parent item",
      type: "reference",
      to: [{ type: "navigation" }],
    }),
    defineField({
      name: "isCta",
      title: "This is the main button",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "openInNewTab",
      title: "Open in a new tab",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "url" },
  },
});

const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: requiredText("Add the page title."),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: requiredText("Add a slug."),
    }),
    defineField({
      name: "pageType",
      title: "Page type",
      type: "string",
      options: {
        list: [
          { title: "Standard page", value: "standard" },
          { title: "Landing page", value: "landing" },
          { title: "Legal page", value: "legal" },
          { title: "Hub page", value: "hub" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "heroEyebrow",
      title: "Hero small heading",
      type: "string",
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero headline",
      type: "string",
    }),
    defineField({
      name: "heroSubheadline",
      title: "Hero subheadline",
      type: "text",
      rows: 3,
    }),
    portableBodyField(),
    flexibleContentField(),
    defineField({ name: "ctaHeading", title: "CTA heading", type: "string" }),
    defineField({ name: "ctaText", title: "CTA text", type: "text", rows: 3 }),
    ctaButtonField(),
    ...seoFields,
    publishedStatusField(),
  ],
});

const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  icon: SearchIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: requiredText("Add the service title."),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: requiredText("Add a slug."),
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero headline",
      type: "string",
    }),
    defineField({
      name: "heroSubheadline",
      title: "Hero subheadline",
      type: "text",
      rows: 3,
    }),
    stringListField("whoFor", "Who it is for"),
    stringListField("problemsSolved", "Problem this service solves"),
    stringListField("whenToUse", "When this makes sense"),
    defineField({
      name: "clientProblem",
      title: "What the client is really trying to fix",
      type: "text",
      rows: 4,
    }),
    stringListField("whatGoodLooksLike", "What good actually looks like"),
    stringListField("commonMistakes", "Common mistakes"),
    stringListField("howEssentialWorks", "How Essential helps"),
    processStepsField(),
    referenceListField("relatedServices", "Related services", ["service"]),
    referenceListField("relatedCaseStudies", "Related case studies", [
      "caseStudy",
    ]),
    referenceListField("relatedInsights", "Related insights", ["insight"]),
    inlineFaqField(),
    defineField({ name: "ctaHeading", title: "CTA heading", type: "string" }),
    defineField({ name: "ctaText", title: "CTA text", type: "text", rows: 3 }),
    ctaButtonField(),
    ...seoFields,
    publishedStatusField(),
  ],
});

const job = defineType({
  name: "job",
  title: "Job",
  type: "document",
  icon: RocketIcon,
  fields: [
    defineField({
      name: "title",
      title: "Job title",
      type: "string",
      validation: requiredText("Add the job title."),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: requiredText("Add a slug."),
    }),
    defineField({ name: "salary", title: "Salary", type: "string" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "hybridRemote",
      title: "Hybrid / remote",
      type: "string",
    }),
    defineField({
      name: "employmentType",
      title: "Employment type",
      type: "string",
    }),
    defineField({ name: "sector", title: "Sector", type: "string" }),
    defineField({ name: "specialism", title: "Specialism", type: "string" }),
    defineField({
      name: "whyThisRoleMatters",
      title: "Why this role matters",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "summary",
      title: "Short summary",
      type: "text",
      rows: 3,
    }),
    portableBodyField(),
    stringListField("responsibilities", "Responsibilities"),
    stringListField("requirements", "Requirements"),
    stringListField("benefits", "Benefits"),
    defineField({
      name: "applicationEmail",
      title: "Application email",
      type: "string",
    }),
    defineField({
      name: "applicationFormEnabled",
      title: "Application form enabled",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "publishedDate",
      title: "Published date",
      type: "date",
    }),
    defineField({ name: "closingDate", title: "Closing date", type: "date" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Live", value: "live" },
          { title: "Closed", value: "closed" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
      validation: requiredText("Choose draft, live or closed."),
    }),
    ...seoFields,
  ],
});

const insight = defineType({
  name: "insight",
  title: "Insight",
  type: "document",
  icon: ComposeIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: requiredText("Add the insight title."),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: requiredText("Add a slug."),
    }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3 }),
    defineField({ name: "category", title: "Category", type: "string" }),
    defineField({
      name: "buyerQuestionAnswered",
      title: "Buyer question answered",
      type: "string",
    }),
    defineField({
      name: "problemAddressed",
      title: "Problem addressed",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "person" }],
    }),
    defineField({
      name: "publishedDate",
      title: "Published date",
      type: "date",
    }),
    defineField({ name: "updatedDate", title: "Updated date", type: "date" }),
    defineField({ name: "readingTime", title: "Reading time", type: "string" }),
    imageWithAltField("heroImage", "Hero image"),
    portableBodyField(),
    inlineFaqField(),
    referenceListField("relatedServices", "Related services", ["service"]),
    referenceListField("relatedInsights", "Related insights", ["insight"]),
    defineField({ name: "ctaHeading", title: "CTA heading", type: "string" }),
    defineField({ name: "ctaText", title: "CTA text", type: "text", rows: 3 }),
    ctaButtonField(),
    ...seoFields,
    publishedStatusField(),
  ],
});

const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  icon: CaseIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: requiredText("Add the case study title."),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: requiredText("Add a slug."),
    }),
    defineField({ name: "clientType", title: "Client type", type: "string" }),
    defineField({ name: "sector", title: "Sector", type: "string" }),
    defineField({ name: "roleHired", title: "Role hired", type: "string" }),
    defineField({
      name: "serviceUsed",
      title: "Related service / service used",
      type: "reference",
      to: [{ type: "service" }],
    }),
    defineField({
      name: "challengeSummary",
      title: "Challenge summary",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "businessProblem",
      title: "The business problem",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "whyHireMattered",
      title: "Why the hire mattered",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "whatMadeItTricky",
      title: "What made it tricky",
      type: "text",
      rows: 4,
    }),
    stringListField("howWeDeriskedIt", "How we de-risked it"),
    defineField({ name: "outcome", title: "Outcome", type: "text", rows: 4 }),
    defineField({
      name: "whatChanged",
      title: "What changed",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "commercialImpact",
      title: "Commercial impact",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "testimonialQuote",
      title: "Testimonial quote",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    ...seoFields,
    publishedStatusField(),
  ],
});

const salarySnapshot = defineType({
  name: "salarySnapshot",
  title: "Salary Snapshot",
  type: "document",
  icon: TiersIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: requiredText("Add the salary snapshot title."),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: requiredText("Add a slug."),
    }),
    defineField({
      name: "quarterDate",
      title: "Quarter / date",
      type: "string",
    }),
    defineField({ name: "market", title: "Market", type: "string" }),
    defineField({
      name: "introSummary",
      title: "Intro summary",
      type: "text",
      rows: 3,
    }),
    textListField("marketCommentary", "Market commentary"),
    salaryTableRowsField(),
    stringListField("hiringNotes", "Hiring notes"),
    stringListField(
      "candidateAvailabilityNotes",
      "Candidate availability notes",
    ),
    stringListField("keyTakeaways", "Key takeaways"),
    defineField({ name: "ctaHeading", title: "CTA heading", type: "string" }),
    defineField({ name: "ctaText", title: "CTA text", type: "text", rows: 3 }),
    ctaButtonField(),
    ...seoFields,
    publishedStatusField(),
  ],
});

const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  icon: StarIcon,
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 4,
      validation: requiredText("Add the quote."),
    }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "jobTitle", title: "Job title", type: "string" }),
    defineField({ name: "company", title: "Company", type: "string" }),
    defineField({ name: "companyType", title: "Company type", type: "string" }),
    defineField({
      name: "relatedService",
      title: "Related service",
      type: "reference",
      to: [{ type: "service" }],
    }),
    defineField({
      name: "permissionToDisplayName",
      title: "Permission to display name",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
  ],
});

const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: requiredText("Add the question."),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "text",
      rows: 4,
      validation: requiredText("Add the answer."),
    }),
    defineField({
      name: "relatedPage",
      title: "Related page or service",
      type: "string",
    }),
    referenceListField("relatedServices", "Related services", ["service"]),
  ],
});

const person = defineType({
  name: "person",
  title: "Person",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: requiredText("Add the person's name."),
    }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "bio", title: "Bio", type: "text", rows: 5 }),
    imageWithAltField("headshot", "Headshot"),
    defineField({ name: "linkedInUrl", title: "LinkedIn URL", type: "url" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    stringListField("schemaKnowsAbout", "Topics this person knows about"),
  ],
});

const ctaBlock = defineType({
  name: "ctaBlock",
  title: "CTA Block",
  type: "document",
  icon: RocketIcon,
  fields: [
    defineField({ name: "title", title: "Internal title", type: "string" }),
    defineField({ name: "heading", title: "Public heading", type: "string" }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
    ctaButtonField(),
  ],
});

const proofItem = defineType({
  name: "proofItem",
  title: "Logo / Proof Item",
  type: "document",
  icon: StarIcon,
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: requiredText("Add a label."),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
    }),
    imageWithAltField("logo", "Logo"),
    defineField({
      name: "permissionToDisplay",
      title: "Permission to display",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
  ],
});

const redirect = defineType({
  name: "redirect",
  title: "Redirect",
  type: "document",
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: "sourcePath",
      title: "Old path",
      type: "string",
      description: "Example: /old-page. Use paths only, not full URLs.",
      validation: requiredText("Add the old path."),
    }),
    defineField({
      name: "destinationPath",
      title: "New path",
      type: "string",
      description: "Example: /services/leadership-search.",
      validation: requiredText("Add the new path."),
    }),
    defineField({
      name: "statusCode",
      title: "Redirect type",
      type: "string",
      options: {
        list: [
          { title: "Permanent 301", value: "301" },
          { title: "Temporary 302", value: "302" },
        ],
        layout: "radio",
      },
      initialValue: "301",
    }),
    defineField({ name: "notes", title: "Notes", type: "text", rows: 3 }),
  ],
  preview: {
    select: { title: "sourcePath", subtitle: "destinationPath" },
  },
});

export const schemaTypes = [
  siteSettings,
  homePage,
  navigation,
  page,
  service,
  job,
  insight,
  caseStudy,
  salarySnapshot,
  testimonial,
  faq,
  person,
  ctaBlock,
  proofItem,
  redirect,
];
