import { brand } from "@/lib/brand";

export function SchemaScript({ data }: { data: unknown }) {
  if (brand.preview) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c")
      }}
    />
  );
}
