import { AnalyticsConsent, type AnalyticsConfig } from "./AnalyticsConsent";

export function Analytics() {
  const config: AnalyticsConfig = {
    gaId: process.env.NEXT_PUBLIC_GA_ID || undefined,
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || undefined,
    linkedInPartnerId:
      process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || undefined,
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || undefined,
    clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || undefined,
    hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID || undefined,
  };

  return <AnalyticsConsent config={config} />;
}
