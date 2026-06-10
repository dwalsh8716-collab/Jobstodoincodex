import { breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "./json-ld";

export function BreadcrumbsJsonLd({
  items,
}: {
  items: Array<{ name: string; href: string }>;
}) {
  return <JsonLd data={breadcrumbSchema(items)} />;
}
