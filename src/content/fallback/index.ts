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
    heroHeadline: "Helping Businesses Make Better Hiring Decisions.",
    heroSubheadline:
      "Permanent, retained and fractional marketing search.",
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
