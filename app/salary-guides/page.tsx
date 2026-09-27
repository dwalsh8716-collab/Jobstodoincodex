import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SalaryGuideLeadForm } from "@/components/SalaryGuideLeadForm";
import {
  getSalaryGuideLeadCaptureStatus,
  salaryGuideConfig,
} from "@/lib/salary-guide";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return createMetadata({
    title: "Senior Marketing Salary Guide | Essential Resourcing",
    description:
      "Request practical salary guidance for senior marketing, PR, communications and digital hiring across Manchester and the North West.",
    path: salaryGuideConfig.path,
    noIndex: true,
  });
}

export default function SalaryGuidesPage() {
  const status = getSalaryGuideLeadCaptureStatus();
  const formEnabled = status.ready;

  return (
    <>
      <Breadcrumbs
        items={[{ name: "Salary Guides", href: salaryGuideConfig.path }]}
      />
      <section className="section dark">
        <div className="container split split-start">
          <div className="section-heading">
            <p className="eyebrow">Salary guide</p>
            <h1>Senior marketing salary context before the brief goes sideways.</h1>
            <p className="lede">
              A practical starting point for marketing, PR, communications and
              digital hiring. Not a magic table pretending every Head of
              Marketing does the same job.
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-secondary" href="/insights/manchester-north-west-marketing-salary-guide-2026">
                Read the full 2026 salary guide
              </Link>
              <Link className="text-link" href="/contact">
                Ask David directly
              </Link>
            </div>
          </div>
          <SalaryGuideLeadForm
            enabled={formEnabled}
            guideSlug={salaryGuideConfig.slug}
          />
        </div>
      </section>

      <section className="section surface">
        <div className="container grid grid-3">
          <article className="card">
            <span className="tag">Use it for</span>
            <h2>A better starting point.</h2>
            <p>
              Sense-check seniority, scope, location, hybrid expectations and
              where salary might start making the search difficult.
            </p>
          </article>
          <article className="card">
            <span className="tag">Not for</span>
            <h2>Pretending salary is an exact science.</h2>
            <p>
              A guide gives you context. A live brief, current market
              conversations and honest candidate feedback give you the proper
              answer.
            </p>
          </article>
          <article className="card">
            <span className="tag">Privacy</span>
            <h2>Handled properly.</h2>
            <p>
              Your details are used for the salary guide request. Marketing
              consent is separate.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
