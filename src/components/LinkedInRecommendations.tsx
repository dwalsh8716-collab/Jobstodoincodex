import Link from "next/link";
import { analyticsAttributes } from "@/lib/analytics";
import { linkedInRecommendations } from "@/lib/content";
import { siteConfig } from "@/lib/site";

type LinkedInRecommendationsProps = {
  className?: string;
  copy?: {
    eyebrow: string;
    heading: string;
    intro: string;
    linkLabel?: string;
  };
  recommendations?: Array<{
    proofPoint: string;
    name: string;
    role: string;
    date: string;
    quote: string;
  }>;
  serviceSlug?: string;
  variant?: "home" | "service" | "caseStudies";
};

const copyByVariant = {
  home: {
    eyebrow: "LinkedIn recommendations",
    heading: "Named proof from people who have worked with David.",
    intro:
      "Candidate and client feedback is more useful when it is public, named and easy to check.",
  },
  service: {
    eyebrow: "Public recommendations",
    heading: "What people say about working with David.",
    intro:
      "Short excerpts from public LinkedIn recommendations, used here because they speak to the work behind the brief.",
  },
  caseStudies: {
    eyebrow: "Proof while case studies are checked",
    heading: "Public LinkedIn proof, not anonymous fluff.",
    intro:
      "The detailed case studies are still permission-led. In the meantime, these named recommendations give a useful flavour of the way David works.",
  },
} as const;

export function LinkedInRecommendations({
  className = "",
  copy: copyOverride,
  recommendations: recommendationsOverride,
  serviceSlug,
  variant = "home",
}: LinkedInRecommendationsProps) {
  const copy: LinkedInRecommendationsProps["copy"] =
    copyOverride || copyByVariant[variant];
  const recommendations = (
    recommendationsOverride
      ? recommendationsOverride
      : serviceSlug
      ? linkedInRecommendations.filter((item) =>
          item.serviceSlugs.includes(serviceSlug),
        )
      : linkedInRecommendations
  )
    .slice(0, variant === "caseStudies" ? 6 : 4)
    .map((item) => ({
      proofPoint: item.proofPoint,
      name: item.name,
      role: item.role,
      date: item.date,
      quote: "quote" in item ? item.quote : item.excerpt,
    }));

  if (!recommendations.length || !siteConfig.linkedInRecommendations) {
    return null;
  }

  const headingId = serviceSlug
    ? `linkedin-recommendations-${serviceSlug}`
    : `linkedin-recommendations-${variant}`;
  const location = serviceSlug
    ? `${serviceSlug}_linkedin_recommendations`
    : `${variant}_linkedin_recommendations`;

  return (
    <section
      className={`section linkedin-proof linkedin-proof-${variant} ${className}`}
      aria-labelledby={headingId}
    >
      <div className="container linkedin-proof-layout">
        <div className="linkedin-proof-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id={headingId}>{copy.heading}</h2>
          <p className="lede">{copy.intro}</p>
          <Link
            className="button button-secondary linkedin-source-link"
            href={siteConfig.linkedInRecommendations}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${siteConfig.linkedInRecommendationsLabel}. Opens David Walsh's LinkedIn recommendations.`}
            {...analyticsAttributes("linkedin_click", {
              label: siteConfig.linkedInRecommendationsLabel,
              href: siteConfig.linkedInRecommendations,
              location,
              cta_text: copy.linkLabel || siteConfig.linkedInRecommendationsLabel,
              destination: "linkedin_recommendations",
              profile_type: "founder",
            })}
          >
            <span className="linkedin-proof-mark" aria-hidden="true">
              in
            </span>
            <span>{copy.linkLabel || siteConfig.linkedInRecommendationsLabel}</span>
          </Link>
        </div>

        <ul className="linkedin-recommendation-grid">
          {recommendations.map((item) => (
            <li key={`${item.name}-${item.date}`}>
              <figure className="linkedin-recommendation-card">
                <figcaption className="linkedin-recommendation-meta">
                  <span className="linkedin-proof-point">
                    {item.proofPoint}
                  </span>
                  <strong>{item.name}</strong>
                  <span>
                    {item.role} · {item.date}
                  </span>
                </figcaption>
                <blockquote>
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <p>Public LinkedIn recommendation</p>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
