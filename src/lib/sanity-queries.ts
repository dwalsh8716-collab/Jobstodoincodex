import { defineQuery } from "next-sanity";

const imageFields = /* groq */ `
  asset->{_id, url, metadata{lqip, dimensions}},
  alt,
  caption
`;

const ctaFields = /* groq */ `
  cta{
    label,
    href,
    variant
  }
`;

const seoFields = /* groq */ `
  seoTitle,
  metaDescription,
  openGraphImage{${imageFields}},
  canonicalUrlOverride,
  redirectFrom,
  noIndex
`;

const faqFields = /* groq */ `
  faqs[]{
    _key,
    question,
    answer
  }
`;

const videoFields = /* groq */ `
  title,
  provider,
  url,
  uploadedVideo{asset->{_id, url, mimeType, size}},
  description,
  posterImage{${imageFields}},
  transcript,
  captionsUrl
`;

const serviceCardFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  heroHeadline,
  status
`;

const insightCardFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  publishedDate,
  updatedDate,
  readingTime,
  status
`;

const caseStudyCardFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  clientType,
  sector,
  roleHired,
  challengeSummary,
  featured,
  status
`;

const proofItemFields = /* groq */ `
  _id,
  label,
  description,
  logo{${imageFields}},
  permissionToDisplay,
  featured
`;

const contentBlockFields = /* groq */ `
  contentBlocks[]{
    _key,
    _type,
    ...,
    image{${imageFields}},
    posterImage{${imageFields}},
    person->{_id, name, role, bio, headshot{${imageFields}}},
    services[]->{${serviceCardFields}},
    testimonials[]->{_id, quote, name, jobTitle, company, permissionToDisplayName, featured},
    caseStudies[]->{${caseStudyCardFields}},
    insights[]->{${insightCardFields}},
    proofItems[]->{${proofItemFields}},
    snapshot->{_id, title, "slug": slug.current, quarterDate, market},
    faqs[]->{_id, question, answer, relatedPage}
  }
`;

const serviceFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  heroHeadline,
  heroSubheadline,
  whoFor,
  problemsSolved,
  whenToUse,
  clientProblem,
  whatGoodLooksLike,
  commonMistakes,
  howEssentialWorks,
  searchSummary,
  searchPhrases,
  processSteps[]{_key, title, text},
  relatedServices[]->{${serviceCardFields}},
  relatedCaseStudies[]->{${caseStudyCardFields}},
  relatedInsights[]->{${insightCardFields}},
  ${faqFields},
  ctaHeading,
  ctaText,
  ${ctaFields},
  ${seoFields},
  status
`;

const jobFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  salaryRange,
  salaryMin,
  salaryMax,
  salaryCurrency,
  salaryPeriod,
  salaryVisibility,
  rateMin,
  rateMax,
  ratePeriod,
  salary,
  salaryStatus,
  salaryTransparencyNote,
  location,
  officeLocation,
  workingPattern,
  hybridPattern,
  remotePossible,
  hybridRemote,
  hybridReality,
  locationExpectation,
  travelExpectation,
  employmentType,
  roleType,
  seniority,
  sector,
  agencyOrClientSide,
  specialism,
  whyRoleExists,
  whyThisRoleMatters,
  successInThreeMonths,
  successInSixMonths,
  successInTwelveMonths,
  summary,
  body[]{_key, _type, ...},
  davidsTake[]{_key, _type, ...},
  responsibilities,
  mustHaves,
  niceToHaves,
  whatGoodLooksLike,
  requirements,
  benefits,
  interviewSteps,
  interviewProcessConfirmed,
  interviewProcess,
  processOverview,
  processSteps,
  expectedTimeline,
  taskRequired,
  presentationRequired,
  firstStageFormat,
  finalStageFormat,
  feedbackExpectation,
  applicationReviewTimeframe,
  applicationProcess,
  applicationProcessNotes,
  applicationNotes,
  candidatePrivacyNote,
  candidateDataHandling,
  quickQuestionEnabled,
  whatsappQuestionEnabled,
  quickQuestionRoute,
  applicationEmail,
  applicationFormEnabled,
  postedDate,
  publishedDate,
  updatedDate,
  closingDate,
  status,
  ${seoFields}
`;

const insightFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  buyerQuestionAnswered,
  problemAddressed,
  author->{_id, name, role, bio, headshot{${imageFields}}},
  publishedDate,
  updatedDate,
  readingTime,
  heroImage{${imageFields}},
  body[]{_key, _type, ...},
  ${faqFields},
  relatedServices[]->{${serviceCardFields}},
  relatedInsights[]->{${insightCardFields}},
  ctaHeading,
  ctaText,
  ${ctaFields},
  ${seoFields},
  status
`;

const caseStudyFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  clientType,
  sector,
  roleHired,
  serviceUsed->{${serviceCardFields}},
  challengeSummary,
  businessProblem,
  whyHireMattered,
  whatMadeItTricky,
  howWeDeriskedIt,
  outcome,
  whatChanged,
  commercialImpact,
  testimonialQuote,
  featured,
  ${seoFields},
  status
`;

const salarySnapshotFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  contentFormat,
  quarterDate,
  market,
  introSummary,
  marketCommentary,
  salaryTableRows[]{_key, roleTitle, lowSalary, midSalary, highSalary, notes},
  hiringNotes,
  candidateAvailabilityNotes,
  keyTakeaways,
  ctaHeading,
  ctaText,
  ${ctaFields},
  ${seoFields},
  status
`;

export const SITE_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_id == "siteSettings"][0]{
    _id,
    siteName,
    defaultSeoTitle,
    defaultMetaDescription,
    siteUrl,
    logo{${imageFields}},
    favicon{asset->{_id, url}},
    email,
    phone,
    bookingUrl,
    googleBookingUrl,
    bookingEnabled,
    bookingButtonText,
    bookingSectionHeading,
    bookingIntroText,
    showBookingInHeader,
    showBookingInFooter,
    showBookingOnContactPage,
    showBookingOnServicePages,
    whatsAppEnabled,
    whatsAppNumber,
    whatsAppButtonText,
    whatsAppDefaultMessage,
    whatsAppHiringMessage,
    whatsAppCandidateMessage,
    whatsAppStrategicInterimMessage,
    showWhatsAppInHeader,
    showWhatsAppInFooter,
    showWhatsAppOnContactPage,
    linkedInProfileUrl,
    linkedInButtonLabel,
    showLinkedInInFooter,
    showLinkedInOnContactPage,
    showLinkedInInFounderBlock,
    addressRegion,
    socialLinks[]{_key, label, url},
    defaultOpenGraphImage{${imageFields}},
    footerCopy,
    footerCtaHeading,
    footerCtaText,
    footerNavigation[]->{_id, label, url, order, isCta, openInNewTab},
    featuredProof[]->{${proofItemFields}}
  }
`);

export const HOME_PAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "homePage"][0]{
    _id,
    title,
    heroEyebrow,
    heroHeadline,
    heroSubheadline,
    premiumVideo{${videoFields}},
    proofPoints,
    whyEssentialPoints,
    featuredServices[]->{${serviceCardFields}},
    featuredInsights[]->{${insightCardFields}},
    featuredCaseStudies[]->{${caseStudyCardFields}},
    featuredProof[]->{${proofItemFields}},
    ${contentBlockFields},
    ctaHeading,
    ctaText,
    ${ctaFields},
    ${seoFields},
    status
  }
`);

export const NAVIGATION_QUERY = defineQuery(/* groq */ `
  *[_type == "navigation"] | order(order asc, label asc){
    _id,
    label,
    url,
    order,
    parent->{_id, label, url},
    isCta,
    openInNewTab
  }
`);

export const PAGES_QUERY = defineQuery(/* groq */ `
  *[_type == "page" && defined(slug.current)] | order(title asc){
    _id,
    title,
    "slug": slug.current,
    pageType,
    heroEyebrow,
    heroHeadline,
    heroSubheadline,
    body[]{_key, _type, ...},
    ${contentBlockFields},
    ctaHeading,
    ctaText,
    ${ctaFields},
    ${seoFields},
    status
  }
`);

export const SERVICES_QUERY = defineQuery(/* groq */ `
  *[_type == "service" && defined(slug.current)] | order(title asc){
    ${serviceFields}
  }
`);

export const SERVICE_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "service" && slug.current == $slug][0]{
    ${serviceFields}
  }
`);

export const JOBS_QUERY = defineQuery(/* groq */ `
  *[_type == "job" && defined(slug.current)] | order(publishedDate desc, title asc){
    ${jobFields}
  }
`);

export const JOB_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "job" && slug.current == $slug][0]{
    ${jobFields}
  }
`);

export const INSIGHTS_QUERY = defineQuery(/* groq */ `
  *[_type == "insight" && defined(slug.current)] | order(publishedDate desc, title asc){
    ${insightFields}
  }
`);

export const INSIGHT_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "insight" && slug.current == $slug][0]{
    ${insightFields}
  }
`);

export const CASE_STUDIES_QUERY = defineQuery(/* groq */ `
  *[_type == "caseStudy" && defined(slug.current)] | order(featured desc, title asc){
    ${caseStudyFields}
  }
`);

export const CASE_STUDY_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "caseStudy" && slug.current == $slug][0]{
    ${caseStudyFields}
  }
`);

export const SALARY_SNAPSHOTS_QUERY = defineQuery(/* groq */ `
  *[_type == "salarySnapshot" && defined(slug.current)] | order(quarterDate desc, title asc){
    ${salarySnapshotFields}
  }
`);

export const SALARY_SNAPSHOT_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "salarySnapshot" && slug.current == $slug][0]{
    ${salarySnapshotFields}
  }
`);

export const REDIRECTS_QUERY = defineQuery(/* groq */ `
  *[_type == "redirect" && defined(sourcePath) && defined(destinationPath)]{
    _id,
    sourcePath,
    destinationPath,
    statusCode,
    notes
  }
`);
