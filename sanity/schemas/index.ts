import { defineArrayMember, defineField, defineType } from "sanity";

const seoFields = [
  defineField({
    name: "seoTitle",
    title: "SEO title",
    type: "string",
    description: "Aim for 45-60 characters. Keep it specific and useful.",
    validation: (Rule) => Rule.max(70)
  }),
  defineField({
    name: "metaDescription",
    title: "Meta description",
    type: "text",
    rows: 3,
    description: "Aim for 120-155 characters. Explain the page benefit clearly.",
    validation: (Rule) => Rule.max(160)
  }),
  defineField({ name: "openGraphImage", title: "Open Graph image", type: "image" }),
  defineField({
    name: "canonicalUrlOverride",
    title: "Canonical URL override",
    type: "url",
    description: "Only use this when this page is a duplicate or replacement for another canonical URL."
  }),
  defineField({
    name: "redirectFrom",
    title: "Redirect from old URLs",
    type: "array",
    description: "Legacy paths that should 301 to this page, such as /old-service-page.",
    of: [defineArrayMember({ type: "string" })]
  }),
  defineField({ name: "noIndex", title: "Noindex", type: "boolean", initialValue: false })
];

const faqInline = defineField({
  name: "faqs",
  title: "FAQs",
  type: "array",
  of: [
    defineArrayMember({
      type: "object",
      fields: [
        defineField({ name: "question", title: "Question", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "answer", title: "Answer", type: "text", rows: 4, validation: (Rule) => Rule.required() })
      ],
      preview: {
        select: { title: "question", subtitle: "answer" }
      }
    })
  ]
});

const ctaObject = defineField({
  name: "cta",
  title: "CTA",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "Keep CTA labels short and action-led.",
      validation: (Rule) => Rule.max(36)
    }),
    defineField({ name: "href", title: "URL", type: "string", description: "Use an internal path such as /contact where possible." }),
    defineField({
      name: "variant",
      title: "Variant",
      type: "string",
      options: { list: ["primary", "secondary", "dark", "text"] }
    })
  ]
});

const richText = defineField({
  name: "body",
  title: "Body",
  type: "array",
  of: [
    defineArrayMember({ type: "block" }),
    defineArrayMember({
      name: "videoBlock",
      title: "Video embed",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
        defineField({
          name: "provider",
          title: "Provider",
          type: "string",
          options: { list: ["youtube", "vimeo"] },
          validation: (Rule) => Rule.required()
        }),
        defineField({ name: "url", title: "Embed or video URL", type: "url", validation: (Rule) => Rule.required() }),
        defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
        defineField({ name: "thumbnail", title: "Thumbnail", type: "image" })
      ],
      preview: {
        select: { title: "title", subtitle: "provider" }
      }
    }),
    defineArrayMember({
      name: "mediaFeature",
      title: "Image / media feature",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "image", title: "Image", type: "image" }),
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Describe the image for users who cannot see it. Leave decorative logos out of content blocks.",
          validation: (Rule) => Rule.max(140)
        }),
        defineField({ name: "caption", title: "Caption", type: "string" })
      ]
    }),
    defineArrayMember({
      name: "gallery",
      title: "Gallery",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({
          name: "items",
          title: "Images",
          type: "array",
          of: [
            defineArrayMember({
              type: "image",
              fields: [
                defineField({
                  name: "alt",
                  title: "Alt text",
                  type: "string",
                  description: "Describe the image in plain English.",
                  validation: (Rule) => Rule.max(140)
                }),
                defineField({ name: "caption", title: "Caption", type: "string" })
              ]
            })
          ]
        })
      ]
    })
  ]
});

const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "siteName", title: "Site name", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "defaultSeoTitle", title: "Default SEO title", type: "string" }),
    defineField({ name: "defaultMetaDescription", title: "Default meta description", type: "text", rows: 3 }),
    defineField({ name: "siteUrl", title: "Site URL", type: "url" }),
    defineField({ name: "logo", title: "Logo", type: "image" }),
    defineField({ name: "favicon", title: "Favicon", type: "image" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "linkedInUrl", title: "LinkedIn URL", type: "url" }),
    defineField({ name: "bookingUrl", title: "Booking URL", type: "url" }),
    defineField({ name: "addressRegion", title: "Address / region", type: "string" }),
    defineField({ name: "defaultOpenGraphImage", title: "Default Open Graph image", type: "image" }),
    defineField({ name: "footerCopy", title: "Footer copy", type: "text", rows: 3 }),
    defineField({ name: "footerCtaHeading", title: "Footer CTA heading", type: "string" }),
    defineField({ name: "footerCtaText", title: "Footer CTA text", type: "text", rows: 3 })
  ]
});

const navigation = defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "url", title: "URL", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "order", title: "Order", type: "number" }),
    defineField({ name: "parent", title: "Parent", type: "reference", to: [{ type: "navigation" }] }),
    defineField({ name: "isCta", title: "Is CTA", type: "boolean", initialValue: false }),
    defineField({ name: "openInNewTab", title: "Open in new tab", type: "boolean", initialValue: false })
  ],
  preview: {
    select: { title: "label", subtitle: "url" }
  }
});

const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({
      name: "pageType",
      title: "Page type",
      type: "string",
      options: { list: ["standard", "landing", "legal", "hub"] }
    }),
    defineField({ name: "heroEyebrow", title: "Hero eyebrow", type: "string" }),
    defineField({ name: "heroHeadline", title: "Hero headline", type: "string" }),
    defineField({ name: "heroSubheadline", title: "Hero subheadline", type: "text", rows: 3 }),
    ctaObject,
    richText,
    ...seoFields,
    defineField({
      name: "status",
      title: "Published status",
      type: "string",
      options: { list: ["draft", "published"] },
      initialValue: "draft"
    })
  ]
});

const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "shortDescription", title: "Short description", type: "text", rows: 2 }),
    defineField({ name: "heroHeadline", title: "Hero headline", type: "string" }),
    defineField({ name: "heroSubheadline", title: "Hero subheadline", type: "text", rows: 3 }),
    defineField({ name: "whoFor", title: "Who it is for", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "problemsSolved", title: "Problems solved", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "whenToUse", title: "When to use this service", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "howEssentialWorks", title: "How Essential works", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "relatedCaseStudies", title: "Related case studies", type: "array", of: [{ type: "reference", to: [{ type: "caseStudy" }] }] }),
    defineField({ name: "relatedInsights", title: "Related insights", type: "array", of: [{ type: "reference", to: [{ type: "insight" }] }] }),
    faqInline,
    ctaObject,
    ...seoFields,
    defineField({ name: "status", title: "Published status", type: "string", options: { list: ["draft", "published"] }, initialValue: "draft" })
  ]
});

const job = defineType({
  name: "job",
  title: "Job",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Job title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "salary", title: "Salary", type: "string" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "hybridRemote", title: "Hybrid / remote", type: "string" }),
    defineField({ name: "employmentType", title: "Employment type", type: "string" }),
    defineField({ name: "sector", title: "Sector", type: "string" }),
    defineField({ name: "specialism", title: "Specialism", type: "string" }),
    defineField({ name: "summary", title: "Short summary", type: "text", rows: 3 }),
    richText,
    defineField({ name: "responsibilities", title: "Responsibilities", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "requirements", title: "Requirements", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "benefits", title: "Benefits", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "applicationEmail", title: "Application email", type: "string" }),
    defineField({ name: "applicationFormEnabled", title: "Application form enabled", type: "boolean", initialValue: true }),
    defineField({ name: "publishedDate", title: "Published date", type: "date" }),
    defineField({ name: "closingDate", title: "Closing date", type: "date" }),
    defineField({ name: "status", title: "Status", type: "string", options: { list: ["draft", "live", "closed"] }, initialValue: "draft" }),
    ...seoFields
  ]
});

const insight = defineType({
  name: "insight",
  title: "Insight",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3 }),
    defineField({ name: "category", title: "Category", type: "string" }),
    defineField({ name: "author", title: "Author", type: "reference", to: [{ type: "person" }] }),
    defineField({ name: "publishedDate", title: "Published date", type: "date" }),
    defineField({ name: "updatedDate", title: "Updated date", type: "date" }),
    defineField({ name: "readingTime", title: "Reading time", type: "string" }),
    defineField({ name: "heroImage", title: "Hero image", type: "image" }),
    richText,
    faqInline,
    defineField({ name: "relatedServices", title: "Related services", type: "array", of: [{ type: "reference", to: [{ type: "service" }] }] }),
    defineField({ name: "relatedInsights", title: "Related insights", type: "array", of: [{ type: "reference", to: [{ type: "insight" }] }] }),
    ctaObject,
    ...seoFields,
    defineField({ name: "status", title: "Published status", type: "string", options: { list: ["draft", "published"] }, initialValue: "draft" })
  ]
});

const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "clientType", title: "Client type", type: "string" }),
    defineField({ name: "sector", title: "Sector", type: "string" }),
    defineField({ name: "roleHired", title: "Role hired", type: "string" }),
    defineField({ name: "serviceUsed", title: "Service used", type: "reference", to: [{ type: "service" }] }),
    defineField({ name: "challengeSummary", title: "Challenge summary", type: "text", rows: 3 }),
    defineField({ name: "clientContext", title: "Client context", type: "text", rows: 4 }),
    defineField({ name: "hiringChallenge", title: "Hiring challenge", type: "text", rows: 4 }),
    defineField({ name: "whyHard", title: "Why the brief was hard", type: "text", rows: 4 }),
    defineField({ name: "approach", title: "Approach", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "process", title: "Shortlist / process", type: "text", rows: 4 }),
    defineField({ name: "outcome", title: "Outcome", type: "text", rows: 4 }),
    defineField({ name: "commercialImpact", title: "Commercial impact", type: "text", rows: 4 }),
    defineField({ name: "testimonialQuote", title: "Testimonial quote", type: "text", rows: 3 }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    ...seoFields,
    defineField({ name: "status", title: "Published status", type: "string", options: { list: ["draft", "published"] }, initialValue: "draft" })
  ]
});

const salarySnapshot = defineType({
  name: "salarySnapshot",
  title: "Salary Snapshot",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "quarterDate", title: "Quarter / date", type: "string" }),
    defineField({ name: "market", title: "Market", type: "string" }),
    defineField({ name: "introSummary", title: "Intro summary", type: "text", rows: 3 }),
    defineField({ name: "marketCommentary", title: "Market commentary", type: "array", of: [{ type: "text" }] }),
    defineField({
      name: "salaryTableRows",
      title: "Salary table rows",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "roleTitle", title: "Role title", type: "string" }),
            defineField({ name: "lowSalary", title: "Low salary", type: "string" }),
            defineField({ name: "midSalary", title: "Mid salary", type: "string" }),
            defineField({ name: "highSalary", title: "High salary", type: "string" }),
            defineField({ name: "notes", title: "Notes", type: "string" })
          ]
        })
      ]
    }),
    defineField({ name: "hiringNotes", title: "Hiring notes", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "candidateAvailabilityNotes", title: "Candidate availability notes", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "keyTakeaways", title: "Key takeaways", type: "array", of: [{ type: "string" }] }),
    ctaObject,
    ...seoFields,
    defineField({ name: "status", title: "Published status", type: "string", options: { list: ["draft", "published"] }, initialValue: "draft" })
  ]
});

const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "quote", title: "Quote", type: "text", rows: 4 }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "jobTitle", title: "Job title", type: "string" }),
    defineField({ name: "company", title: "Company", type: "string" }),
    defineField({ name: "companyType", title: "Company type", type: "string" }),
    defineField({ name: "relatedService", title: "Related service", type: "reference", to: [{ type: "service" }] }),
    defineField({ name: "permissionToDisplayName", title: "Permission to display name", type: "boolean", initialValue: false }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false })
  ]
});

const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({ name: "question", title: "Question", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "answer", title: "Answer", type: "text", rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: "relatedPage", title: "Related page / service", type: "string" })
  ]
});

const person = defineType({
  name: "person",
  title: "Person",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "bio", title: "Bio", type: "text", rows: 5 }),
    defineField({ name: "headshot", title: "Headshot", type: "image" }),
    defineField({ name: "linkedInUrl", title: "LinkedIn URL", type: "url" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "schemaKnowsAbout", title: "Schema knows about", type: "array", of: [{ type: "string" }] })
  ]
});

const ctaBlock = defineType({
  name: "ctaBlock",
  title: "CTA Block",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
    ctaObject
  ]
});

const proofItem = defineType({
  name: "proofItem",
  title: "Logo / Proof Item",
  type: "document",
  fields: [
    defineField({ name: "label", title: "Label", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({ name: "logo", title: "Logo", type: "image" }),
    defineField({ name: "permissionToDisplay", title: "Permission to display", type: "boolean", initialValue: false }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false })
  ]
});

export const schemaTypes = [
  siteSettings,
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
  proofItem
];
