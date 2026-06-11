import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SalaryGuideLeadForm } from "@/components/SalaryGuideLeadForm";
import {
  getSalaryGuideLeadCaptureStatus,
  salaryGuideConfig,
} from "@/lib/salary-guide";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const status = getSalaryGuideLeadCaptureStatus();

  return createMetadata({
    title: "Senior Marketing Salary Guide | Essential Resourcing",
    description:
      "Request a practical salary guide for senior marketing, communications and digital hiring conversations.",
    path: salaryGuideConfig.path,
    noIndex: status.noIndex,
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
            <h1>Senior salary context before the brief goes sideways.</h1>
            <p className="lede">
              A practical guide for marketing, PR, communications and digital
              hiring conversations. Not a magic table. A better starting point.
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-secondary" href="/salary-snapshots">
                View salary snapshots
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
            <h2>Brief shape.</h2>
            <p>
              Sense-check seniority, scope, location, hybrid expectations and
              where salary starts to break the search.
            </p>
          </article>
          <article className="card">
            <span className="tag">Not for</span>
            <h2>Fake certainty.</h2>
            <p>
              A salary guide is useful context. It is not a substitute for a
              current brief, live market read and honest candidate feedback.
            </p>
          </article>
          <article className="card">
            <span className="tag">Privacy</span>
            <h2>Handled properly.</h2>
            <p>
              Guide requests go into the private operations database when the
              flow is live. Marketing consent is separate.
            </p>
          </article>
        </div>
      </section>

      <section className="section muted">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Launch status</p>
            <h2>
              {formEnabled
                ? "Salary guide requests are connected."
                : "Salary guide requests are staged, not live."}
            </h2>
          </div>
          <div className="grid">
            <article className="card">
              <h3>Before launch</h3>
              <p>
                David needs to approve the guide, Railway Postgres must be live,
                and email delivery needs a configured download link.
              </p>
            </article>
            <article className="card">
              <h3>No shortcuts</h3>
              <p>
                No reCAPTCHA or Turnstile has been added. Add one only if David
                approves the provider and privacy terms.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
