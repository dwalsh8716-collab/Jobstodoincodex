import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SchemaScript } from "@/components/SchemaScript";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { defaultConsentModeState } from "@/lib/analytics";
import {
  createMetadata,
  organisationSchema,
  personSchema,
  websiteSchema,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  ...createMetadata({
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription
  }),
  icons: {
    icon: [
      { url: "/assets/icon-dark.svg", type: "image/svg+xml" },
      { url: "/assets/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [{ url: "/assets/apple-touch-icon.png", sizes: "180x180" }]
  },
  manifest: "/site.webmanifest",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined
  }
};

export const viewport: Viewport = {
  themeColor: "#101114"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const palette = process.env.NEXT_PUBLIC_THEME_PALETTE || "graphite";
  const hasGoogleTag = Boolean(
    process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GTM_ID,
  );

  return (
    <html
      lang="en-GB"
      data-palette={palette}
      data-scroll-behavior="smooth"
    >
      {hasGoogleTag ? (
        <Script id="google-consent-mode-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
            window.gtag('consent', 'default', ${JSON.stringify({
              ...defaultConsentModeState,
              wait_for_update: 500,
            })});
          `}
        </Script>
      ) : null}
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="page-shell">
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <StickyMobileCTA />
        </div>
        <SchemaScript data={organisationSchema()} />
        <SchemaScript data={personSchema()} />
        <SchemaScript data={websiteSchema()} />
        <Analytics />
      </body>
    </html>
  );
}
