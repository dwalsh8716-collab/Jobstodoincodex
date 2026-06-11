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
  status?: "published" | "draft";
  noIndex?: boolean;
  shortDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  audience: string[];
  problemsSolved: string[];
  whenToUse: string[];
  howEssentialWorks: string[];
  mistakes: string[];
  faqs: FAQ[];
  relatedServiceSlugs: string[];
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
  noIndex?: boolean;
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
  noIndex?: boolean;
  clientType: string;
  sector: string;
  roleHired: string;
  serviceSlug: string;
  challengeSummary: string;
  clientContext: string;
  hiringChallenge: string;
  whyHard: string;
  businessProblem: string;
  whyHireMattered: string;
  whatMadeItTricky: string;
  whatKindOfPerson: string;
  approach: string[];
  process: string;
  outcome: string;
  whatChanged: string;
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
  noIndex?: boolean;
  contentFormat?: "snapshot" | "guide_landing_page";
  quarter: string;
  market: string;
  intro: string;
  commentary: string[];
  rows: Array<{
    role: string;
    low: string;
    mid: string;
    high: string;
    notes: string;
  }>;
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
  noIndex?: boolean;
  salaryRange: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod: "annual" | "daily" | "hourly" | "fixed" | "to_be_confirmed";
  salary: string;
  salaryStatus: "verified" | "indicative" | "unverified";
  salaryTransparencyNote: string;
  location: string;
  officeLocation: string;
  workingPattern: string;
  hybridPattern: string;
  remotePossible: "yes" | "limited" | "no" | "to_be_confirmed";
  hybrid: string;
  hybridReality: string;
  locationExpectation: string;
  employmentType: string;
  sector: string;
  specialism: string;
  roleType: string;
  seniority: string;
  agencyOrClientSide: "agency" | "client-side" | "either" | "to_be_confirmed";
  whyRoleExists: string;
  whyThisRoleMatters: string;
  summary: string;
  description: string[];
  davidsTake: string[];
  responsibilities: string[];
  mustHaves: string[];
  niceToHaves: string[];
  whatGoodLooksLike: string[];
  requirements: string[];
  benefits: string[];
  interviewSteps: string[];
  interviewProcessConfirmed: "confirmed" | "indicative" | "to_be_confirmed";
  interviewProcess: string[];
  applicationProcess: string[];
  applicationNotes: string;
  candidatePrivacyNote: string;
  candidateDataHandling: string;
  quickQuestionEnabled: boolean;
  whatsappQuestionEnabled: boolean;
  quickQuestionRoute: string;
  applicationCta: CTA;
  applicationEmail: string;
  postedDate: string;
  publishedDate: string;
  updatedDate: string;
  closingDate?: string;
  seoTitle: string;
  metaDescription: string;
};
