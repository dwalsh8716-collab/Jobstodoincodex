import Link from "next/link";
import { analyticsAttributes } from "@/lib/analytics";
import { siteConfig } from "@/lib/site";

type BookingButtonProps = {
  label?: string;
  location: string;
  intent?: string;
  service?: string;
  direct?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "text";
};

export function BookingButton({
  label = siteConfig.booking.label,
  location,
  intent = "general",
  service,
  direct = false,
  className,
  variant = "secondary",
}: BookingButtonProps) {
  if (!siteConfig.booking.enabled) return null;

  const href = direct ? siteConfig.booking.url : siteConfig.booking.pagePath;
  const classes =
    className ||
    (variant === "text" ? "text-link" : `button button-${variant}`);
  const analytics = analyticsAttributes("booking_click", {
    label,
    href,
    location,
    intent,
    service,
    booking_type: "google_calendar",
  });

  if (direct) {
    return (
      <a
        className={classes}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} through Google Calendar`}
        {...analytics}
      >
        {label}
      </a>
    );
  }

  return (
    <Link className={classes} href={href} prefetch={false} {...analytics}>
      {label}
    </Link>
  );
}
