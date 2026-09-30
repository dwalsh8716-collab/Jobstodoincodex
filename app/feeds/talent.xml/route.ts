import { getFreshDistributionJobs } from "@/lib/public-content";
import { buildTalentJobsXml } from "@/lib/job-distribution";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return new Response(buildTalentJobsXml(await getFreshDistributionJobs()), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Job feed temporarily unavailable", { status: 503, headers: { "Retry-After": "60", "Cache-Control": "no-store" } });
  }
}
