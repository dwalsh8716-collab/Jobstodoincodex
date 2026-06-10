import Link from "next/link";
import { analyticsAttributes } from "@/lib/analytics";
import { siteConfig } from "@/lib/site";
import {
  buildWhatsAppUrl,
  whatsAppMessageForIntent,
  type WhatsAppIntent,
} from "@/lib/whatsapp";

type WhatsAppButtonProps = {
  label?: string;
  location: string;
  intent?: WhatsAppIntent;
  service?: string;
  jobSlug?: string;
  message?: string;
  variant?: "primary" | "secondary" | "text";
  className?: string;
};

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      className="whatsapp-icon"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path d="M12.04 3.5a8.43 8.43 0 0 0-7.18 12.86L4 20.5l4.25-.82A8.42 8.42 0 1 0 12.04 3.5Zm0 1.6a6.82 6.82 0 0 1 5.7 10.55 6.83 6.83 0 0 1-8.9 2.42l-.26-.14-2.58.5.52-2.51-.16-.27A6.82 6.82 0 0 1 12.04 5.1Zm-2.47 3.5c-.16 0-.42.06-.65.3-.22.24-.86.84-.86 2.04 0 1.2.88 2.36 1 2.52.12.16 1.7 2.7 4.2 3.68 2.08.82 2.5.66 2.96.62.45-.04 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.46-.28-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.42-1.34-1.66-.14-.24-.02-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.46-.4-.4-.54-.41h-.46Z" />
    </svg>
  );
}

export function WhatsAppButton({
  label = "Message David on WhatsApp",
  location,
  intent = "general",
  service,
  jobSlug,
  message,
  variant = "secondary",
  className,
}: WhatsAppButtonProps) {
  if (!siteConfig.whatsApp.enabled) return null;

  const href = buildWhatsAppUrl({
    number: siteConfig.whatsApp.number,
    message: message || whatsAppMessageForIntent(intent),
  });

  if (!href) return null;

  const variantClass =
    variant === "text" ? "text-link whatsapp-text-link" : `button button-${variant}`;

  return (
    <Link
      className={[variantClass, "whatsapp-link", className]
        .filter(Boolean)
        .join(" ")}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}. Opens WhatsApp.`}
      {...analyticsAttributes("whatsapp_click", {
        label,
        href,
        location,
        cta_text: label,
        intent,
        service,
        job_slug: jobSlug,
      })}
    >
      <WhatsAppIcon />
      <span>{label}</span>
    </Link>
  );
}
