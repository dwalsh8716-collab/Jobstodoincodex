import Link from "next/link";
import { analyticsAttributes } from "@/lib/analytics";

export function CTASection({
  eyebrow = "Next step",
  title = "Need good people?",
  text = "Tell me what you are trying to hire and I will tell you honestly whether I can help.",
  ctaLabel = "Talk to David",
  ctaHref = "/contact",
  dark = true
}: {
  eyebrow?: string;
  title?: string;
  text?: string;
  ctaLabel?: string;
  ctaHref?: string;
  dark?: boolean;
}) {
  return (
    <section className={`section-tight ${dark ? "dark" : "muted"}`}>
      <div className="container cta-panel">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <Link
          className="button button-primary"
          href={ctaHref}
          {...analyticsAttributes("cta_click", {
            label: ctaLabel,
            href: ctaHref,
            location: title,
          })}
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
