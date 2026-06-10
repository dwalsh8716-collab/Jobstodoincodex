import { organisationSchema } from "@/lib/seo";
import { JsonLd } from "./json-ld";

export function OrganisationJsonLd() {
  return <JsonLd data={organisationSchema()} />;
}
