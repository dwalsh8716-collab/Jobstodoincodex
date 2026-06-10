import {
  caseStudies,
  homepageFeatureVideo,
  insights,
  jobs,
  proofPoints,
  salarySnapshots,
  services,
  whyEssential,
} from "@/lib/content";
import { primaryNavigation, serviceNavigation, siteConfig } from "@/lib/site";

export const fallbackContent = {
  siteSettings: siteConfig,
  navigation: primaryNavigation,
  footerNavigation: [...primaryNavigation, ...serviceNavigation],
  homePage: {
    heroHeadline: "Senior marketing and comms hiring, done properly.",
    heroSubheadline:
      "Essential Resourcing helps agencies, brands and growth businesses make sharper senior hires.",
    premiumVideo: homepageFeatureVideo,
    proofPoints,
    whyEssential,
  },
  services,
  jobs,
  insights,
  caseStudies,
  salarySnapshots,
  serviceNavigation,
};

export {
  caseStudies,
  homepageFeatureVideo,
  insights,
  jobs,
  primaryNavigation,
  proofPoints,
  salarySnapshots,
  services,
  serviceNavigation,
  siteConfig,
  whyEssential,
};
