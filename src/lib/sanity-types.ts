import type { CTA, FAQ } from "./types";

export type SanityImage = {
  asset?: {
    _id: string;
    url: string;
    metadata?: {
      lqip?: string;
      dimensions?: {
        width?: number;
        height?: number;
        aspectRatio?: number;
      };
    };
  };
  alt?: string;
  caption?: string;
};

export type SanityVideo = {
  title?: string;
  provider?: "youtube" | "vimeo" | "upload";
  url?: string;
  uploadedVideo?: {
    asset?: {
      _id: string;
      url: string;
      mimeType?: string;
      size?: number;
    };
  };
  description?: string;
  posterImage?: SanityImage;
  transcript?: string;
  captionsUrl?: string;
};

export type SanitySeo = {
  seoTitle?: string;
  metaDescription?: string;
  openGraphImage?: SanityImage;
  canonicalUrlOverride?: string;
  redirectFrom?: string[];
  noIndex?: boolean;
};

export type SanityCardReference = {
  _id: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  excerpt?: string;
  category?: string;
  status?: string;
};

export type SanityPerson = {
  _id: string;
  name: string;
  role?: string;
  bio?: string;
  headshot?: SanityImage;
  linkedInUrl?: string;
  email?: string;
  schemaKnowsAbout?: string[];
};

export type SanityProofItem = {
  _id: string;
  label?: string;
  description?: string;
  logo?: SanityImage;
  permissionToDisplay?: boolean;
  featured?: boolean;
};

export type SanityPortableTextBlock = {
  _key?: string;
  _type?: string;
  style?: string;
  children?: Array<{
    _key?: string;
    _type?: string;
    text?: string;
    marks?: string[];
  }>;
};

export type SanitySiteSettings = SanitySeo & {
  _id?: string;
  siteName?: string;
  defaultSeoTitle?: string;
  defaultMetaDescription?: string;
  siteUrl?: string;
  logo?: SanityImage;
  favicon?: { asset?: { _id: string; url: string } };
  email?: string;
  phone?: string;
  bookingUrl?: string;
  googleBookingUrl?: string;
  bookingEnabled?: boolean;
  bookingButtonText?: string;
  bookingSectionHeading?: string;
  bookingIntroText?: string;
  showBookingInHeader?: boolean;
  showBookingInFooter?: boolean;
  showBookingOnContactPage?: boolean;
  showBookingOnServicePages?: boolean;
  whatsAppEnabled?: boolean;
  whatsAppNumber?: string;
  whatsAppButtonText?: string;
  whatsAppDefaultMessage?: string;
  whatsAppHiringMessage?: string;
  whatsAppCandidateMessage?: string;
  whatsAppStrategicInterimMessage?: string;
  showWhatsAppInHeader?: boolean;
  showWhatsAppInFooter?: boolean;
  showWhatsAppOnContactPage?: boolean;
  linkedInProfileUrl?: string;
  linkedInButtonLabel?: string;
  showLinkedInInFooter?: boolean;
  showLinkedInOnContactPage?: boolean;
  showLinkedInInFounderBlock?: boolean;
  addressRegion?: string;
  socialLinks?: Array<{ _key?: string; label?: string; url?: string }>;
  footerCopy?: string;
  footerCtaHeading?: string;
  footerCtaText?: string;
  footerNavigation?: Array<{
    _id: string;
    label?: string;
    url?: string;
    order?: number;
    isCta?: boolean;
  }>;
  featuredProof?: SanityProofItem[];
};

export type SanityHomePage = SanitySeo & {
  _id?: string;
  title?: string;
  heroEyebrow?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  premiumVideo?: SanityVideo;
  proofPoints?: string[];
  whyEssentialPoints?: string[];
  featuredServices?: SanityCardReference[];
  featuredInsights?: SanityCardReference[];
  featuredCaseStudies?: SanityCardReference[];
  featuredProof?: SanityProofItem[];
  contentBlocks?: SanityContentBlock[];
  ctaHeading?: string;
  ctaText?: string;
  cta?: CTA;
  status?: "draft" | "published";
};

export type SanityService = SanitySeo & {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  whoFor?: string[];
  problemsSolved?: string[];
  whenToUse?: string[];
  clientProblem?: string;
  whatGoodLooksLike?: string[];
  commonMistakes?: string[];
  howEssentialWorks?: string[];
  processSteps?: Array<{ _key?: string; title?: string; text?: string }>;
  relatedServices?: SanityCardReference[];
  relatedCaseStudies?: SanityCardReference[];
  relatedInsights?: SanityCardReference[];
  faqs?: FAQ[];
  ctaHeading?: string;
  ctaText?: string;
  cta?: CTA;
  status?: "draft" | "published";
};

export type SanityJob = SanitySeo & {
  _id: string;
  title: string;
  slug: string;
  salaryRange?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: "annual" | "daily" | "hourly" | "fixed" | "to_be_confirmed";
  salary?: string;
  salaryStatus?: "verified" | "indicative" | "unverified";
  salaryTransparencyNote?: string;
  location?: string;
  officeLocation?: string;
  workingPattern?: string;
  hybridPattern?: string;
  remotePossible?: "yes" | "limited" | "no" | "to_be_confirmed";
  hybridRemote?: string;
  hybridReality?: string;
  locationExpectation?: string;
  employmentType?: string;
  roleType?: string;
  seniority?: string;
  sector?: string;
  agencyOrClientSide?: "agency" | "client-side" | "either" | "to_be_confirmed";
  specialism?: string;
  whyRoleExists?: string;
  whyThisRoleMatters?: string;
  summary?: string;
  body?: SanityPortableTextBlock[];
  davidsTake?: SanityPortableTextBlock[];
  responsibilities?: string[];
  mustHaves?: string[];
  niceToHaves?: string[];
  whatGoodLooksLike?: string[];
  requirements?: string[];
  benefits?: string[];
  interviewSteps?: string[];
  interviewProcessConfirmed?: "confirmed" | "indicative" | "to_be_confirmed";
  interviewProcess?: string[];
  processOverview?: string;
  processSteps?: string[];
  expectedTimeline?: string;
  taskRequired?: "yes" | "no" | "possible" | "to_be_confirmed";
  presentationRequired?: "yes" | "no" | "possible" | "to_be_confirmed";
  firstStageFormat?: string;
  finalStageFormat?: string;
  feedbackExpectation?: string;
  applicationReviewTimeframe?: string;
  applicationProcess?: string[];
  applicationNotes?: string;
  candidatePrivacyNote?: string;
  candidateDataHandling?: string;
  quickQuestionEnabled?: boolean;
  whatsappQuestionEnabled?: boolean;
  quickQuestionRoute?: string;
  applicationEmail?: string;
  applicationFormEnabled?: boolean;
  postedDate?: string;
  publishedDate?: string;
  updatedDate?: string;
  closingDate?: string;
  status?: "draft" | "live" | "closed";
};

export type SanityInsight = SanitySeo & {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  buyerQuestionAnswered?: string;
  problemAddressed?: string;
  author?: SanityPerson;
  publishedDate?: string;
  updatedDate?: string;
  readingTime?: string;
  heroImage?: SanityImage;
  body?: SanityPortableTextBlock[];
  faqs?: FAQ[];
  relatedServices?: SanityCardReference[];
  relatedInsights?: SanityCardReference[];
  ctaHeading?: string;
  ctaText?: string;
  cta?: CTA;
  status?: "draft" | "published";
};

export type SanityCaseStudy = SanitySeo & {
  _id: string;
  title: string;
  slug: string;
  clientType?: string;
  sector?: string;
  roleHired?: string;
  serviceUsed?: SanityCardReference;
  challengeSummary?: string;
  businessProblem?: string;
  whyHireMattered?: string;
  whatMadeItTricky?: string;
  howWeDeriskedIt?: string[];
  outcome?: string;
  whatChanged?: string;
  commercialImpact?: string;
  testimonialQuote?: string;
  featured?: boolean;
  status?: "draft" | "published";
};

export type SanitySalarySnapshot = SanitySeo & {
  _id: string;
  title: string;
  slug: string;
  contentFormat?: "snapshot" | "guide_landing_page";
  quarterDate?: string;
  market?: string;
  introSummary?: string;
  marketCommentary?: string[];
  salaryTableRows?: Array<{
    _key?: string;
    roleTitle?: string;
    lowSalary?: string;
    midSalary?: string;
    highSalary?: string;
    notes?: string;
  }>;
  hiringNotes?: string[];
  candidateAvailabilityNotes?: string[];
  keyTakeaways?: string[];
  ctaHeading?: string;
  ctaText?: string;
  cta?: CTA;
  status?: "draft" | "published";
};

export type SanityContentBlock = {
  _key: string;
  _type: string;
  [key: string]: unknown;
};

export type SanityRedirect = {
  _id: string;
  sourcePath: string;
  destinationPath: string;
  statusCode?: "301" | "302";
  notes?: string;
};
