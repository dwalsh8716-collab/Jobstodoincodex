import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://snap.licdn.com https://connect.facebook.net https://www.clarity.ms https://static.hotjar.com https://script.hotjar.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://cdn.sanity.io https://www.googletagmanager.com https://www.google-analytics.com https://px.ads.linkedin.com https://www.facebook.com https://*.clarity.ms https://*.hotjar.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.resend.com https://api.sanity.io https://*.api.sanity.io https://*.apicdn.sanity.io https://cdn.sanity.io wss://*.api.sanity.io https://www.google-analytics.com https://*.google-analytics.com https://stats.g.doubleclick.net https://px.ads.linkedin.com https://www.facebook.com https://*.clarity.ms https://*.hotjar.com wss://*.hotjar.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.googletagmanager.com",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
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
    ];
  },
  async redirects() {
    return [
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
        source: "/leadership-search",
        destination: "/services/leadership-search",
        permanent: true,
      },
      {
        source: "/strategic-interim",
        destination: "/services/strategic-interim",
        permanent: true,
      },
      {
        source: "/agency-recruitment",
        destination: "/services/agency-recruitment",
        permanent: true,
      },
      {
        source: "/client-side-recruitment",
        destination: "/services/client-side-marketing-recruitment",
        permanent: true,
      },
      {
        source: "/marketing-recruitment",
        destination: "/services/client-side-marketing-recruitment",
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
    ];
  },
};

export default nextConfig;
