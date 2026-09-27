import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/clients", "/clients/"],
      disallow: [
        "/studio",
        "/cms",
        "/admin",
        "/labs",
        "/recruiter-labs",
        "/candidate/",
        "/api",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
