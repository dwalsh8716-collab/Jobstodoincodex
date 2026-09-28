import type { SanityContentHubPages } from "./sanity-types";
import { aiSearchQuestions } from "./content";

export const fallbackContentHubPages: SanityContentHubPages = {
  _id: "contentHubPages",
  jobs: {
    eyebrow: "Jobs",
    title: "Marketing, PR and digital jobs. Without the mystery.",
    intro: [
      "Live roles handled by Essential appear here.",
      "Wherever possible, you’ll see the useful stuff upfront: salary, location, hybrid setup, what the role actually involves and what the process looks like.",
    ],
    rolesEyebrow: "Live roles",
    rolesHeading: "Current live roles.",
    rolesIntro: [
      "If you’re open to something senior or specialist, don’t wait for the perfect advert to appear.",
      "Some searches are confidential and some conversations start before a role ever reaches a job board.",
    ],
    emptyEyebrow: "Confidential route",
    emptyHeading: "No live roles published right now.",
    emptyCtaHeading: "Open to the right thing?",
    emptyText: [
      "Send David your LinkedIn profile and a few lines about what you’d consider next.",
    ],
    emptyCtaLabel: "Send a confidential note",
    roleStandardTag: "Live role standard",
    roleStandardHeading: "Only real roles go live.",
    roleStandardPoints: [
      "No fake evergreen vacancies designed to collect CVs.",
      "No closed roles pretending they’re still available.",
      "No ‘competitive salary’ when a proper range can be shared.",
    ],
    standardsEyebrow: "Candidate standards",
    standardsHeading: "What a good job ad should tell you.",
    standards: [
      "What the salary or rate is",
      "Where the job is based",
      "What hybrid actually means",
      "Whether travel or client-site time is expected",
      "Why the role exists",
      "What's genuinely essential and what's just nice to have",
      "What the interview process looks like",
      "What the person is expected to achieve",
    ],
    ctaHeading: "Looking for your next move?",
    ctaText: "Send David a note or LinkedIn URL.",
    seoTitle: "Marketing, PR & Digital Jobs | Essential Resourcing",
    metaDescription:
      "Current marketing, PR, communications, digital and agency jobs handled by specialist recruiter Essential Resourcing.",
  },
  insights: {
    eyebrow: "Insights",
    title: "Useful thinking on marketing hiring. No SEO sludge.",
    intro: [
      "More than a decade of conversations with candidates, clients, agencies and marketing teams creates a fair few opinions.",
      "This is where David puts the useful ones.",
      "Hiring advice, market observations and straight answers to the questions businesses and candidates are actually asking.",
    ],
    displayOrder: [
      "manchester-north-west-marketing-salary-guide-2026",
      "marketing-recruitment-manchester-north-west-guide",
      "retained-search-vs-contingent-recruitment",
      "how-much-does-senior-marketing-recruitment-cost",
      "the-job-title-isnt-the-brief-senior-marketing-hire",
      "marketing-recruitment-market-isnt-dead-businesses-hiring-differently",
      "what-should-you-pay-a-senior-marketing-hire-in-2026",
      "do-you-actually-need-a-full-time-marketing-director",
      "your-first-marketing-director-what-should-you-actually-be-hiring-for",
      "why-hiring-senior-agency-people-is-harder-than-matching-clients-and-job-titles",
      "your-cv-tells-me-where-youve-worked-what-you-actually-did",
      "how-to-hire-a-marketing-director-without-wasting-six-weeks",
      "what-is-a-fractional-marketing-leader",
      "when-should-an-agency-use-retained-search",
      "why-senior-marketing-hiring-goes-wrong",
    ],
    categoryEyebrow: "Categories",
    categoryHeading: "Find the useful stuff.",
    categories: [
      "Hiring advice",
      "Market commentary",
      "Salary and market insight",
      "Fractional",
      "Candidate advice",
      "Agency hiring",
      "Client-side marketing hiring",
      "Case studies",
    ],
    categoryEmptyMessage:
      "Case studies and proof-led articles will sit here once the facts and permissions are ready.",
    quickAnswersEyebrow: "Quick answers",
    quickAnswersHeading:
      "Straight answers to common marketing recruitment questions.",
    questions: aiSearchQuestions,
    ctaHeading: "Want a market view before you hire?",
    ctaText: "Tell David what you’re trying to hire.",
    seoTitle: "Marketing Recruitment & Hiring Insights | David Walsh",
    metaDescription:
      "Practical marketing recruitment advice, market commentary, salary insight and fractional guidance from recruiter David Walsh.",
  },
  caseStudies: {
    eyebrow: "Case studies",
    title: "Proper proof. Not a page full of logos.",
    intro: [
      "Real marketing recruitment, leadership search and fractional case studies, published when the facts and permission are clear.",
    ],
    emptyEyebrow: "Proof in progress",
    emptyHeading: "The first case studies are currently being verified.",
    emptyText: [
      "Rather than publishing anonymous success stories with suspiciously perfect outcomes, Essential only publishes case studies when the facts and permission are clear.",
      "If you want to understand how David would approach a live brief in the meantime, have a conversation with him.",
    ],
    seoTitle: "Marketing Recruitment Case Studies | Essential Resourcing",
    metaDescription:
      "Real marketing recruitment, leadership search and fractional case studies from Essential Resourcing, published with permission.",
  },
};
