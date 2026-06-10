import { serviceSchema } from "@/lib/seo";
import type { Service } from "@/lib/types";
import { JsonLd } from "./json-ld";

export function ServiceJsonLd({ service }: { service: Service }) {
  return <JsonLd data={serviceSchema(service)} />;
}
