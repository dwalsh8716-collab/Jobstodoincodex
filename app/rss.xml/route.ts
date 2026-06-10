import { insights } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export function GET() {
  const publishedInsights = insights.filter((insight) => insight.status === "published");
  const items = publishedInsights
    .map(
      (insight) => `
        <item>
          <title><![CDATA[${insight.title}]]></title>
          <description><![CDATA[${insight.excerpt}]]></description>
          <link>${absoluteUrl(`/insights/${insight.slug}`)}</link>
          <guid>${absoluteUrl(`/insights/${insight.slug}`)}</guid>
          <pubDate>${new Date(insight.publishedDate).toUTCString()}</pubDate>
        </item>
      `
    )
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0">
        <channel>
          <title>${siteConfig.name} Insights</title>
          <description>${siteConfig.defaultDescription}</description>
          <link>${siteConfig.url}</link>
          ${items}
        </channel>
      </rss>`,
    {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8"
      }
    }
  );
}
