import {
  buildWhatsAppUrl,
  defaultWhatsAppNumber,
  whatsAppMessages,
} from "@/lib/whatsapp";
import { brand } from "@/lib/brand";

const whatsAppNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || defaultWhatsAppNumber;
const whatsAppDefaultMessage =
  process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE || whatsAppMessages.general;
const normaliseExternalUrl = (value: string | undefined) => {
  if (!value) return "";

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : "";
  } catch {
    return "";
  }
};
export const defaultSiteUrl = brand.previewUrl;
export const defaultLinkedInProfileUrl =
  "https://www.linkedin.com/in/davidwalshmarketingsearch/";
export const defaultLinkedInCompanyUrl =
  "https://www.linkedin.com/company/essentialresourcing/";
export const defaultLinkedInRecommendationsUrl =
  "https://www.linkedin.com/in/davidwalshmarketingsearch/details/recommendations/";

export const normaliseSiteUrl = (value: string | undefined) => {
  if (!value) return defaultSiteUrl;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.origin
      : defaultSiteUrl;
  } catch {
    return defaultSiteUrl;
  }
};

const googleBookingUrl = normaliseExternalUrl(
  process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL ||
    process.env.NEXT_PUBLIC_BOOKING_URL,
);
const linkedInProfileUrl =
  normaliseExternalUrl(process.env.NEXT_PUBLIC_LINKEDIN_URL) ||
  defaultLinkedInProfileUrl;
const linkedInRecommendationsUrl =
  normaliseExternalUrl(process.env.NEXT_PUBLIC_LINKEDIN_RECOMMENDATIONS_URL) ||
  defaultLinkedInRecommendationsUrl;

export const siteConfig = {
  name: brand.name,
  founder: "David Walsh",
  url: normaliseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  email: "david@essentialresourcing.co.uk",
  phone: process.env.NEXT_PUBLIC_PHONE || "",
  linkedIn: linkedInProfileUrl,
  companyLinkedIn: defaultLinkedInCompanyUrl,
  linkedInLabel: "Connect with David on LinkedIn",
  linkedInRecommendations: linkedInRecommendationsUrl,
  linkedInRecommendationsLabel: "Read LinkedIn recommendations",
  bookingUrl: googleBookingUrl || "/contact",
  booking: {
    enabled: Boolean(googleBookingUrl),
    url: googleBookingUrl,
    pagePath: "/book-a-call",
    label: "Book a 15-minute call",
    shortLabel: "Book 15 minutes",
    heading: "Book 15 minutes with David",
    intro:
      "Got a hiring problem, fractional leadership gap or just want a straight view on something? Grab 15 minutes.",
  },
  whatsApp: {
    enabled: Boolean(buildWhatsAppUrl({ number: whatsAppNumber })),
    number: whatsAppNumber,
    label: "Message David on WhatsApp",
    defaultMessage: whatsAppDefaultMessage,
    url: buildWhatsAppUrl({
      number: whatsAppNumber,
      message: whatsAppDefaultMessage,
    }),
  },
  region: "Manchester, North West and UK-wide",
  defaultTitle:
    "David Walsh Recruitment | Private rebrand preview",
  defaultDescription:
    "Specialist marketing, digital, PR and agency recruitment across Manchester, the North West and UK. Permanent, retained, fractional and advisory support.",
  ogImage: "/assets/og-image.png",
  logoDark: brand.logoDark,
  logoLight: brand.logoLight,
  iconDark: brand.iconDark,
  iconLight: brand.iconLight,
} as const;

export const primaryNavigation = [
  { label: "Clients", href: "/clients" },
  { label: "Candidates", href: "/candidates" },
  { label: "Services", href: "/services" },
  { label: "Jobs", href: "/jobs" },
  { label: "Insight", href: "/insights" },
  { label: "About", href: "/about-essential" },
] as const;

export const serviceNavigation = [
  { label: "View all Services", href: "/services" },
  { label: "Permanent Recruitment", href: "/services/permanent-recruitment" },
  { label: "Retained Search", href: "/services/retained-search" },
  { label: "Fractional", href: "/services/fractional" },
  {
    label: "Market Intelligence & Advisory",
    href: "/services/market-intelligence-advisory",
  },
] as const;

export const launchPages = [
  "/",
  "/about-essential",
  "/about-david-walsh",
  "/clients",
  "/candidates",
  "/services",
  "/how-essential-resourcing-works",
  "/services/permanent-recruitment",
  "/services/retained-search",
  "/services/fractional",
  "/services/market-intelligence-advisory",
  "/specialisms",
  "/specialisms/marketing-and-leadership",
  "/specialisms/digital-performance-ecommerce",
  "/specialisms/pr-communications-content",
  "/specialisms/agency-client-services-leadership",
  "/insights",
  "/case-studies",
  "/contact",
  "/jobs",
  "/candidate-privacy",
  "/candidate-privacy/request",
  "/privacy-policy",
  "/cookie-policy",
  "/terms",
] as const;

export const designSystemNotes = {
  paletteFile: "src/styles/theme.css",
  paletteEnv: "NEXT_PUBLIC_THEME_PALETTE",
  mediaBlocks:
    "VideoEmbed, MediaFeature and GalleryBlock are reusable frontend components and have matching Sanity block schema fields.",
} as const;
