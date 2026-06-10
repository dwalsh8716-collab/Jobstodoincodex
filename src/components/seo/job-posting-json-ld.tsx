import { jobPostingSchema } from "@/lib/seo";
import type { Job } from "@/lib/types";
import { JsonLd } from "./json-ld";

export function JobPostingJsonLd({ job }: { job: Job }) {
  return <JsonLd data={jobPostingSchema(job)} />;
}
