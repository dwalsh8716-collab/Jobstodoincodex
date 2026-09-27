import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { salaryGuideConfig } from "@/lib/salary-guide";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Salary Guide Request Received | Essential Resourcing",
  description:
    "Thanks for requesting the Essential Resourcing senior marketing salary guide.",
  path: salaryGuideConfig.thanksPath,
  noIndex: true,
});

export default function SalaryGuideThanksPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Salary Guides", href: salaryGuideConfig.path },
          { name: "Request received", href: salaryGuideConfig.thanksPath },
        ]}
      />
      <section className="section dark">
        <div className="container narrow">
          <p className="eyebrow">Request received</p>
          <h1>Got it. David will pick this up.</h1>
          <p className="lede">
            If automatic delivery is live, the guide will land in your inbox.
          </p>
          <p className="lede">
            If not, David will come back to you directly.
          </p>
          <p className="lede">
            No spam. No suddenly finding yourself in a 14-email nurture sequence
            😂
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-primary" href="/contact">
              Ask David a question
            </Link>
            <Link className="button button-secondary" href="/salary-snapshots">
              View salary snapshots
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
