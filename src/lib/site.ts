import {
  buildWhatsAppUrl,
  defaultWhatsAppNumber,
  whatsAppMessages,
} from "@/lib/whatsapp";

const whatsAppNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || defaultWhatsAppNumber;
const whatsAppDefaultMessage =
  process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE || whatsAppMessages.general;

export const siteConfig = {
  name: "Essential Resourcing",
  founder: "David Walsh",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://essentialresourcing.co.uk",
  email: "david@essentialresourcing.co.uk",
  phone: process.env.NEXT_PUBLIC_PHONE || "",
  linkedIn: process.env.NEXT_PUBLIC_LINKEDIN_URL || "",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || "/contact",
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
    "Essential Resourcing | Senior Marketing & Comms Recruitment Manchester",
  defaultDescription:
    "Straight-talking search and recruitment for senior marketing, communications, digital and agency leadership roles across Manchester, the North West and beyond.",
  ogImage: "/assets/og-image.png",
  logoDark: "/assets/logo-dark.svg",
  logoLight: "/assets/logo-light.svg",
  iconDark: "/assets/icon-dark.svg",
  iconLight: "/assets/icon-light.svg",
} as const;

export const primaryNavigation = [
  { label: "Clients", href: "/clients" },
  { label: "Services", href: "/services" },
  { label: "Strategic Interim", href: "/services/strategic-interim" },
  { label: "Jobs", href: "/jobs" },
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about-essential" },
  { label: "Contact", href: "/contact", cta: true },
] as const;

export const serviceNavigation = [
  { label: "Leadership Search", href: "/services/leadership-search" },
  { label: "Strategic Interim", href: "/services/strategic-interim" },
  { label: "Agency Recruitment", href: "/services/agency-recruitment" },
  {
    label: "Client-side Marketing Recruitment",
    href: "/services/client-side-marketing-recruitment",
  },
] as const;

export const launchPages = [
  "/",
  "/about-essential",
  "/about-david-walsh",
  "/clients",
  "/candidates",
  "/services",
  "/services/leadership-search",
  "/services/strategic-interim",
  "/services/agency-recruitment",
  "/services/client-side-marketing-recruitment",
  "/services/senior-recruitment",
  "/specialisms",
  "/case-studies",
  "/insights",
  "/salary-snapshots",
  "/contact",
  "/jobs",
  "/candidate-privacy",
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
