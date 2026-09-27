import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { brand } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  if (brand.preview) return { rules: { userAgent: "*", disallow: "/" } };
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
