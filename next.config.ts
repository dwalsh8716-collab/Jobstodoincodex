import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://snap.licdn.com https://connect.facebook.net https://www.clarity.ms https://static.hotjar.com https://script.hotjar.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://cdn.sanity.io https://www.googletagmanager.com https://www.google-analytics.com https://px.ads.linkedin.com https://www.facebook.com https://*.clarity.ms https://*.hotjar.com",
  "media-src 'self' https://cdn.sanity.io",
  "font-src 'self' data:",
  "connect-src 'self' https://api.resend.com https://api.sanity.io https://*.api.sanity.io https://*.apicdn.sanity.io https://cdn.sanity.io wss://*.api.sanity.io https://www.google-analytics.com https://*.google-analytics.com https://stats.g.doubleclick.net https://px.ads.linkedin.com https://www.facebook.com https://*.clarity.ms https://*.hotjar.com wss://*.hotjar.com https://*.ingest.sentry.io https://o4512128295698432.ingest.de.sentry.io",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.googletagmanager.com",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    inlineCss: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.essentialresourcing.co.uk",
          },
        ],
        destination: "https://essentialresourcing.co.uk/:path*",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/about-essential",
        permanent: true,
      },
      {
        source: "/about-david",
        destination: "/about-david-walsh",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/cookies",
        destination: "/cookie-policy",
        permanent: true,
      },
      {
        source: "/marketing-recruitment-north-west",
        destination: "/clients",
        permanent: true,
      },
      {
        source: "/marketing-recruitment-liverpool",
        destination: "/clients",
        permanent: true,
      },
      {
        source: "/marketing-recruitment-leeds",
        destination: "/clients",
        permanent: true,
      },
      {
        source: "/marketing-recruitment-cheshire",
        destination: "/clients",
        permanent: true,
      },
      {
        source: "/marketing-recruitment-manchester",
        destination: "/clients",
        permanent: true,
      },
      {
        source: "/pr-recruitment-manchester",
        destination: "/specialisms/pr-communications-content",
        permanent: true,
      },
      {
        source: "/digital-recruitment",
        destination: "/specialisms/digital-performance-ecommerce",
        permanent: true,
      },
      {
        source: "/exclusive-search",
        destination: "/services/retained-search",
        permanent: true,
      },
      {
        source: "/retained-search",
        destination: "/services/retained-search",
        permanent: true,
      },
      {
        source: "/hiring-models",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/testimonials",
        destination: "/clients",
        permanent: true,
      },
      {
        source: "/bad-hire-calculator",
        destination: "/services/market-intelligence-advisory",
        permanent: true,
      },
      {
        source: "/book",
        destination: "/book-a-call",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
