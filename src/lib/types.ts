export type CTA = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "dark" | "text";
};

export type FAQ = {
  question: string;
  answer: string;
};

export type RichMedia =
  | {
      type: "video";
      provider: "youtube" | "vimeo" | "upload";
      title: string;
      url?: string;
      description?: string;
      thumbnail?: string;
      thumbnailAlt?: string;
      captionsUrl?: string;
      transcript?: string;
    }
  | {
      type: "image";
      title: string;
      src: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "gallery";
      title: string;
      items: Array<{ src: string; alt: string; caption?: string }>;
    };

export type Service = {
  title: string;
  slug: string;
  shortDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  audience: string[];
  problemsSolved: string[];
  whenToUse: string[];
  howEssentialWorks: string[];
  mistakes: string[];
  faqs: FAQ[];
  relatedInsightSlugs: string[];
  relatedCaseStudySlugs: string[];
  cta: CTA;
  seoTitle: string;
  metaDescription: string;
};

export type Insight = {
  title: string;
  slug: string;
  status: "published" | "draft";
  category: string;
  excerpt: string;
  publishedDate: string;
  updatedDate: string;
  readingTime: string;
  author: string;
  body: Array<{ heading: string; content: string[] }>;
  pullQuote?: string;
  faqs: FAQ[];
  relatedServiceSlugs: string[];
  relatedInsightSlugs: string[];
  media?: RichMedia;
  seoTitle: string;
  metaDescription: string;
};

export type CaseStudy = {
  title: string;
  slug: string;
  status: "published" | "draft";
  clientType: string;
  sector: string;
  roleHired: string;
  serviceSlug: string;
  challengeSummary: string;
  clientContext: string;
  hiringChallenge: string;
  whyHard: string;
  approach: string[];
  process: string;
  outcome: string;
  impact: string;
  quote?: string;
  featured: boolean;
  seoTitle: string;
  metaDescription: string;
};

export type SalarySnapshot = {
  title: string;
  slug: string;
  status: "published" | "draft";
  quarter: string;
  market: string;
  intro: string;
  commentary: string[];
  rows: Array<{ role: string; low: string; mid: string; high: string; notes: string }>;
  hiringNotes: string[];
  candidateAvailability: string[];
  takeaways: string[];
  seoTitle: string;
  metaDescription: string;
};

export type Job = {
  title: string;
  slug: string;
  status: "draft" | "live" | "closed";
  salary: string;
  location: string;
  hybrid: string;
  employmentType: string;
  sector: string;
  specialism: string;
  summary: string;
  description: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  applicationEmail: string;
  publishedDate: string;
  closingDate?: string;
  seoTitle: string;
  metaDescription: string;
};
