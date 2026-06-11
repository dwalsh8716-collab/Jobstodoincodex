import Link from "next/link";
import { BookingButton } from "@/components/BookingButton";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { analyticsAttributes } from "@/lib/analytics";
import type { WhatsAppIntent } from "@/lib/whatsapp";

export function CTASection({
  eyebrow = "Next step",
  title = "Need good people?",
  text = "Tell me what you are trying to hire and I will tell you honestly whether I can help.",
  ctaLabel = "Talk to David",
  ctaHref = "/contact",
  dark = true,
  whatsAppIntent = "general",
  whatsAppLabel = "Message David on WhatsApp",
  whatsAppService,
  showBooking = false,
  bookingLabel = "Book a 15-minute call",
}: {
  eyebrow?: string;
  title?: string;
  text?: string;
  ctaLabel?: string;
  ctaHref?: string;
  dark?: boolean;
  whatsAppIntent?: WhatsAppIntent;
  whatsAppLabel?: string;
  whatsAppService?: string;
  showBooking?: boolean;
  bookingLabel?: string;
}) {
  return (
    <section className={`section-tight ${dark ? "dark" : "muted"}`}>
      <div className="container cta-panel">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="cta-actions">
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
          <WhatsAppButton
            intent={whatsAppIntent}
            label={whatsAppLabel}
            location={title}
            service={whatsAppService}
            variant={dark ? "secondary" : "primary"}
          />
          {showBooking ? (
            <BookingButton
              label={bookingLabel}
              location={title}
              intent="hiring"
              service={whatsAppService}
              variant={dark ? "secondary" : "primary"}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
