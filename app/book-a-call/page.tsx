import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingButton } from "@/components/BookingButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SchemaScript } from "@/components/SchemaScript";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { analyticsAttributes } from "@/lib/analytics";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Book a Call with David Walsh | Essential Resourcing",
  description:
    "Book a 15-minute phone call with David Walsh to discuss a marketing hire, leadership search, Fractional requirement or recruitment question.",
  path: siteConfig.booking.pagePath,
  noIndex: !siteConfig.booking.enabled,
});

const bookingReasons = [
  "Hiring and want somebody to sense-check the brief",
  "Need senior marketing or agency support quickly",
  "Want an honest view on salary or the candidate market",
  "Not sure whether permanent, retained or Fractional makes most sense",
  "Want to talk through a recruitment problem before it becomes a bigger one",
];

const bookingSetupSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Book a 15-minute call with David",
  url: absoluteUrl(siteConfig.booking.pagePath),
  description:
    "A 15-minute phone call for hiring, Fractional and recruitment questions.",
  ...(siteConfig.booking.enabled
    ? {
        potentialAction: {
          "@type": "ScheduleAction",
          target: siteConfig.booking.url,
          name: "Book a 15-minute call",
        },
      }
    : {}),
};

export default function BookCallPage() {
  if (!siteConfig.booking.enabled) redirect("/contact");

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Contact", href: "/contact" },
          { name: "Book a call", href: siteConfig.booking.pagePath },
        ]}
      />
      <section className="section dark">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Book a call</p>
            <h1>{siteConfig.booking.heading}</h1>
            <p className="lede">{siteConfig.booking.intro}</p>
            <p className="lede">
              No sales script. No awkward pitch. Just a proper conversation
              about what you need and whether David can help.
            </p>
          </div>
          <div className="booking-panel">
            {siteConfig.booking.enabled ? (
              <>
                <span className="tag">Google Calendar</span>
                <h2>Choose a time that works.</h2>
                <p>
                  Booking opens David’s Google Calendar appointment page.
                  Choose a 15-minute slot, add the best number to reach you and
                  a short note about what you’d like to discuss. David will call
                  you at the booked time.
                </p>
                <BookingButton
                  direct
                  label="Open Google Calendar booking"
                  location="book_call_page"
                  intent="book_call"
                  variant="primary"
                />
              </>
            ) : (
              <>
                <span className="tag">Setup needed</span>
                <h2>The booking link is not connected yet.</h2>
                <p>
                  David still needs to create the Google Calendar appointment
                  schedule and add the booking URL. Until then, WhatsApp, email
                  or the contact form are the quickest routes.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section surface">
        <div className="container grid grid-2">
          <article className="card">
            <span className="tag">Good reasons to book</span>
            <h2>Use the call for a quick sense-check.</h2>
            <ul>
              {bookingReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </article>
          <article className="card">
            <span className="tag">Other routes</span>
            <h2>Need the quickest route?</h2>
            <p>
              WhatsApp David. If there&apos;s more detail to send, use the
              contact form.
            </p>
            <div className="button-row hero-actions">
              <WhatsAppButton
                intent="general"
                label="Message David on WhatsApp"
                location="book_call_alternatives"
                variant="primary"
              />
              <Link
                className="button button-secondary"
                href="/contact"
                {...analyticsAttributes("cta_click", {
                  label: "Use the contact form",
                  href: "/contact",
                  location: "book call alternatives",
                })}
              >
                Use the contact form
              </Link>
              <Link
                className="text-link"
                href={`mailto:${siteConfig.email}`}
                {...analyticsAttributes("email_click", {
                  label: siteConfig.email,
                  href: `mailto:${siteConfig.email}`,
                  location: "book call alternatives",
                })}
              >
                {siteConfig.email}
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section muted">
        <div className="container split split-start">
          <div>
            <p className="eyebrow">Privacy note</p>
            <h2>Booking is handled by Google Calendar.</h2>
          </div>
          <div className="statement-list">
            <p>
              The booking button opens Google Calendar in a new tab. Google
              handles availability, calendar invitations and reminders. The
              appointment itself is a phone call to the number you provide.
            </p>
            <p>
              Please don&apos;t put sensitive candidate information or
              confidential client detail into the booking form. Use the contact
              form or speak to David directly if you need to share something
              confidential.
            </p>
          </div>
        </div>
      </section>
      <SchemaScript data={bookingSetupSchema} />
    </>
  );
}
