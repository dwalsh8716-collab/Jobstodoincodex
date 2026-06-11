import Link from "next/link";
import { analyticsAttributes } from "@/lib/analytics";
import { siteConfig } from "@/lib/site";

type LinkedInProfileLinkProps = {
  label?: string;
  location: string;
  profileType?: "founder" | "author";
  variant?: "primary" | "secondary" | "text";
  className?: string;
};

function LinkedInMark() {
  return (
    <span className="linkedin-mark" aria-hidden="true">
      in
    </span>
  );
}

export function LinkedInProfileLink({
  label = siteConfig.linkedInLabel,
  location,
  profileType = "founder",
  variant = "text",
  className,
}: LinkedInProfileLinkProps) {
  if (!siteConfig.linkedIn) return null;

  const variantClass =
    variant === "text" ? "text-link" : `button button-${variant}`;

  return (
    <Link
      className={[variantClass, "linkedin-profile-link", className]
        .filter(Boolean)
        .join(" ")}
      href={siteConfig.linkedIn}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}. Opens David Walsh's LinkedIn profile.`}
      {...analyticsAttributes("linkedin_click", {
        label,
        href: siteConfig.linkedIn,
        location,
        cta_text: label,
        destination: "linkedin_profile",
        profile_type: profileType,
      })}
    >
      <LinkedInMark />
      <span>{label}</span>
    </Link>
  );
}
