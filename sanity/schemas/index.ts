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

// Sanity is the public website CMS. Do not add private candidate records,
// client contact records, CV files, DSAR requests, audit logs or internal notes here.

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
    defineField({
      name: "email",
      title: "Public business email",
      type: "string",
      description:
        "Public Essential Resourcing contact email only. Do not store private candidate, client contact or application email addresses here.",
    }),
    defineField({
      name: "phone",
      title: "Public business phone",
      type: "string",
      description:
        "Public business phone only. Do not store candidate or private client phone numbers here.",
    }),
    defineField({ name: "bookingUrl", title: "Booking link", type: "url" }),
    defineField({
      name: "googleBookingUrl",
      title: "Google Calendar booking link",
      type: "url",
      description:
        "Paste David's Google Calendar Appointment Schedule booking link. Leave blank to hide booking buttons.",
    }),
    defineField({
      name: "bookingEnabled",
      title: "Show booking option on the site?",
      type: "boolean",
      description:
        "Turn this on only when the Google Calendar booking link is ready and tested.",
      initialValue: false,
    }),
    defineField({
      name: "bookingButtonText",
      title: "Booking button text",
      type: "string",
      description: "Short button copy, for example: Book a 15-minute call.",
      validation: (rule) => rule.max(42),
    }),
    defineField({
      name: "bookingSectionHeading",
      title: "Booking section heading",
      type: "string",
      description:
        "Heading used on booking-focused sections, for example: Book a 15-minute call with David.",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "bookingIntroText",
      title: "Booking section intro",
      type: "text",
      rows: 3,
      description:
        "Explain what the call is for. Keep it plain English and specific.",
      validation: (rule) => rule.max(220),
    }),
    defineField({
      name: "showBookingInHeader",
      title: "Show booking in the mobile menu?",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "showBookingInFooter",
      title: "Show booking in the footer?",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "showBookingOnContactPage",
      title: "Show booking on the contact page?",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "showBookingOnServicePages",
      title: "Show booking on service pages?",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "whatsAppEnabled",
      title: "Show WhatsApp buttons on the website?",
      type: "boolean",
      description:
        "Turn this on when David wants WhatsApp shown as a quick contact route.",
      initialValue: true,
    }),
    defineField({
      name: "whatsAppNumber",
      title: "WhatsApp Business number",
      type: "string",
      description:
        "Use international format only, with no spaces or symbols. Example: 447824514296. This opens WhatsApp directly.",
      validation: (rule) =>
        rule.regex(/^\d{8,15}$/, {
          name: "international WhatsApp number",
          invert: false,
        }),
    }),
    defineField({
      name: "whatsAppButtonText",
      title: "WhatsApp button text",
      type: "string",
      description: "Short button copy, for example: Message David on WhatsApp.",
      validation: (rule) => rule.max(42),
    }),
    defineField({
      name: "whatsAppDefaultMessage",
      title: "Default WhatsApp message",
      type: "text",
      rows: 3,
      description:
        "This message is pre-filled when someone opens WhatsApp from the site.",
    }),
    defineField({
      name: "whatsAppHiringMessage",
      title: "WhatsApp hiring message",
      type: "text",
      rows: 3,
      description:
        "Used for hiring and client CTAs. Keep it plain English and specific.",
    }),
    defineField({
      name: "whatsAppCandidateMessage",
      title: "WhatsApp candidate message",
      type: "text",
      rows: 3,
      description:
        "Used on candidate and job pages for quick role or career questions.",
    }),
    defineField({
      name: "whatsAppStrategicInterimMessage",
      title: "WhatsApp strategic interim message",
      type: "text",
      rows: 3,
      description:
        "Used where the need may be urgent, especially Strategic Interim pages.",
    }),
    defineField({
      name: "showWhatsAppInHeader",
      title: "Show WhatsApp in the mobile menu?",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "showWhatsAppInFooter",
      title: "Show WhatsApp in the footer?",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "showWhatsAppOnContactPage",
      title: "Show WhatsApp on the contact page?",
      type: "boolean",
      initialValue: true,
    }),
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
    defineField({
      name: "salaryStatus",
      title: "Salary status",
      type: "string",
      description:
        "Choose how confident the public salary/rate information is. Do not publish a live role while this is unverified.",
      options: {
        list: [
          { title: "Verified", value: "verified" },
          { title: "Indicative", value: "indicative" },
          { title: "Unverified", value: "unverified" },
        ],
        layout: "radio",
      },
      initialValue: "unverified",
    }),
    defineField({
      name: "salaryTransparencyNote",
      title: "Salary transparency note",
      type: "text",
      rows: 2,
      description:
        "Plain-English note for candidates. Example: salary range confirmed with the client, or indicative pending final sign-off.",
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "hybridRemote",
      title: "Hybrid / remote",
      type: "string",
    }),
    defineField({
      name: "hybridReality",
      title: "Hybrid reality",
      type: "text",
      rows: 2,
      description:
        "The actual office rhythm. Avoid vague wording such as flexible unless David has confirmed what it means.",
    }),
    defineField({
      name: "locationExpectation",
      title: "Location expectation",
      type: "text",
      rows: 2,
      description:
        "Explain office, client-site or travel expectations clearly before publishing.",
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
    stringListField("mustHaves", "Must-haves"),
    stringListField("niceToHaves", "Nice-to-haves"),
    stringListField("requirements", "Requirements"),
    stringListField("benefits", "Benefits"),
    stringListField("interviewProcess", "Interview process"),
    stringListField("applicationProcess", "What happens after applying"),
    defineField({
      name: "candidateDataHandling",
      title: "Candidate data handling note",
      type: "text",
      rows: 3,
      description:
        "Public-safe note only. Do not paste CV text, application messages or private candidate details.",
    }),
    defineField({
      name: "quickQuestionRoute",
      title: "Quick question route",
      type: "text",
      rows: 2,
      description:
        "How candidates can ask David a quick question, usually WhatsApp or email.",
    }),
    defineField({
      name: "applicationEmail",
      title: "Application email",
      type: "string",
      description:
        "Public application inbox or routing email only. Do not store candidate email addresses, cover letters or private application records in Sanity.",
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
    defineField({
      name: "clientType",
      title: "Client type",
      type: "string",
      description:
        "Use a public-safe label unless David has approval to name the client.",
    }),
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
      "Market-level notes only. Do not include named candidates or private candidate details.",
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
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description:
        "Only add a named person with permission. Otherwise keep the testimonial anonymous or generic.",
    }),
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
    defineField({
      name: "email",
      title: "Public profile email",
      type: "string",
      description:
        "Public team/profile email only. Do not store candidate or private client email addresses here.",
    }),
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
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 3,
      description:
        "Technical/public redirect note only. Do not add candidate names, client contacts, CV details or private lead history.",
    }),
  ],
  preview: {
    select: { title: "sourcePath", subtitle: "destinationPath" },
  },
});

const labsIdea = defineType({
  name: "labsIdea",
  title: "Labs Idea",
  type: "document",
  icon: RocketIcon,
  fields: [
    defineField({
      name: "title",
      title: "Feature idea",
      type: "string",
      description:
        "Short working title. Planning only, not a public page title.",
      validation: requiredText("Add a feature idea title."),
    }),
    defineField({
      name: "slug",
      title: "Internal slug",
      type: "slug",
      description:
        "Internal planning slug only. This does not create a public URL.",
      options: { source: "title", maxLength: 96 },
    }),
    defineField({
      name: "status",
      title: "Labs status",
      type: "string",
      options: {
        list: [
          { title: "Idea", value: "idea" },
          { title: "Researching", value: "researching" },
          { title: "Scoped", value: "scoped" },
          { title: "In build", value: "in_build" },
          { title: "Private preview", value: "private_preview" },
          { title: "Ready for launch review", value: "ready_to_launch" },
          { title: "Launched", value: "launched" },
          { title: "Parked", value: "parked" },
          { title: "Rejected", value: "rejected" },
        ],
        layout: "radio",
      },
      initialValue: "idea",
      validation: requiredText("Choose the Labs status."),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Salary intelligence", value: "salary_intelligence" },
          { title: "Client portal", value: "client_portal" },
          { title: "Candidate portal", value: "candidate_portal" },
          { title: "Lead generation", value: "lead_generation" },
          { title: "AI support", value: "ai_support" },
          { title: "Market intelligence", value: "market_intelligence" },
          { title: "Strategic Interim", value: "strategic_interim" },
          { title: "Digital PR data product", value: "digital_pr" },
        ],
      },
    }),
    defineField({
      name: "summary",
      title: "Plain-English summary",
      type: "text",
      rows: 3,
      description:
        "Explain the idea without hype. Do not include private client, candidate or CV detail.",
      validation: (rule) => rule.max(320),
    }),
    stringListField(
      "targetAudience",
      "Target user",
      "Who this is for, such as hiring leader, candidate, retained client or David.",
    ),
    defineField({
      name: "commercialPurpose",
      title: "Commercial purpose",
      type: "text",
      rows: 3,
      description: "Why this could matter commercially.",
    }),
    defineField({
      name: "problemSolved",
      title: "Problem solved",
      type: "text",
      rows: 3,
      description: "The practical problem this feature would reduce.",
    }),
    textListField(
      "proposedUserJourney",
      "Proposed user journey",
      "Planning notes only. Keep it generic and privacy-safe.",
    ),
    stringListField(
      "dependencies",
      "Dependencies",
      "Flags, routes, data models, integrations, legal review or manual setup needed first.",
    ),
    defineField({
      name: "dataRequired",
      title: "Data required",
      type: "text",
      rows: 3,
      description:
        "Use generic data categories only. Do not paste private candidate, client or contact data.",
    }),
    defineField({
      name: "privacyRisk",
      title: "Data/privacy risk",
      type: "string",
      options: {
        list: [
          { title: "Low", value: "low" },
          { title: "Medium", value: "medium" },
          { title: "High", value: "high" },
          { title: "Critical", value: "critical" },
        ],
        layout: "radio",
      },
      initialValue: "medium",
    }),
    defineField({
      name: "implementationComplexity",
      title: "Implementation complexity",
      type: "string",
      options: {
        list: [
          { title: "Low", value: "low" },
          { title: "Medium", value: "medium" },
          { title: "High", value: "high" },
        ],
        layout: "radio",
      },
      initialValue: "medium",
    }),
    defineField({
      name: "suggestedPhase",
      title: "Suggested phase",
      type: "string",
      description: "Example: discovery, private beta, post-launch growth.",
    }),
    defineField({
      name: "publicLaunchReady",
      title: "Ready for public launch review?",
      type: "boolean",
      description:
        "This does not publish anything. It only marks the idea for a separate launch review.",
      initialValue: false,
    }),
    defineField({
      name: "featureFlagName",
      title: "Feature flag name",
      type: "string",
      description:
        "Server-side env flag that would gate the feature. Do not use NEXT_PUBLIC for private Labs flags.",
      options: {
        list: [
          { title: "FEATURE_LABS_ENABLED", value: "FEATURE_LABS_ENABLED" },
          {
            title: "FEATURE_SALARY_GUIDE_GATE",
            value: "FEATURE_SALARY_GUIDE_GATE",
          },
          {
            title: "FEATURE_SALARY_BENCHMARK_ASSET",
            value: "FEATURE_SALARY_BENCHMARK_ASSET",
          },
          { title: "FEATURE_MARKET_MAPPING", value: "FEATURE_MARKET_MAPPING" },
          {
            title: "FEATURE_BAD_HIRE_CALCULATOR",
            value: "FEATURE_BAD_HIRE_CALCULATOR",
          },
          {
            title: "FEATURE_FUNCTIONAL_MATRIX",
            value: "FEATURE_FUNCTIONAL_MATRIX",
          },
          {
            title: "FEATURE_CLIENT_SHORTLIST_PORTAL",
            value: "FEATURE_CLIENT_SHORTLIST_PORTAL",
          },
          {
            title: "FEATURE_AI_BRIEF_BUILDER",
            value: "FEATURE_AI_BRIEF_BUILDER",
          },
          {
            title: "FEATURE_INTERIM_BENCH_PORTAL",
            value: "FEATURE_INTERIM_BENCH_PORTAL",
          },
          {
            title: "FEATURE_LIVE_MARKET_DASHBOARDS",
            value: "FEATURE_LIVE_MARKET_DASHBOARDS",
          },
        ],
      },
    }),
    defineField({
      name: "relatedRoute",
      title: "Related route if built",
      type: "string",
      description:
        "Internal path only, and only when the route is already protected or approved.",
    }),
    defineField({
      name: "relatedGitHubIssue",
      title: "Related GitHub issue",
      type: "url",
      description: "Paste the GitHub issue URL for the build task.",
    }),
    referenceListField(
      "relatedSanityContent",
      "Related Sanity content",
      ["page", "service", "job", "insight", "salarySnapshot", "caseStudy"],
      "Optional public content linked to the idea. Do not use this for private candidate or client records.",
    ),
    stringListField(
      "relatedDatabaseModels",
      "Related database models",
      "Example: applications, audit_logs, client_shortlists. Planning notes only.",
    ),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 5,
      description:
        "Planning notes only. Never paste CV text, client contacts, private candidate notes or secrets.",
    }),
    defineField({
      name: "owner",
      title: "Owner",
      type: "string",
      initialValue: "David Walsh",
    }),
    defineField({
      name: "createdAt",
      title: "Created at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "updatedAt",
      title: "Updated at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      status: "status",
      category: "category",
    },
    prepare({ title, status, category }) {
      return {
        title,
        subtitle: [status, category].filter(Boolean).join(" · "),
      };
    },
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
  labsIdea,
];
