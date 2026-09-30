import { NextResponse } from "next/server";
import { isJobLive } from "@/lib/content";
import { canonicalJobUrl, jobReference } from "@/lib/job-distribution";
import { getFreshDistributionJobs } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug") || "";
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) {
    return NextResponse.json({ eligible: false }, { status: 400 });
  }
  try {
    const job = (await getFreshDistributionJobs()).find((item) => item.slug === slug);
    if (!job || !isJobLive(job) || job.noIndex) {
      return NextResponse.json({ eligible: false }, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({
      eligible: true,
      url: canonicalJobUrl(job),
      reference: jobReference(job),
      title: job.title,
      summary: job.summary,
      location: job.location,
      salary: job.salaryRange,
      postedDate: job.postedDate || job.publishedDate,
      closingDate: job.closingDate,
      talentEligible: Boolean(job.hiringOrganizationName && job.hiringOrganizationName.toLowerCase() !== "confidential"),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ eligible: false, unavailable: true }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
