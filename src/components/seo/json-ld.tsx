import { SchemaScript } from "@/components/SchemaScript";

export function JsonLd({ data }: { data: unknown }) {
  return <SchemaScript data={data} />;
}
