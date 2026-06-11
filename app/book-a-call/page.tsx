import Link from "next/link";
import { BookingButton } from "@/components/BookingButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SchemaScript } from "@/components/SchemaScript";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { analyticsAttributes } from "@/lib/analytics";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Book a 15-Minute Call with David | Essential Resourcing",
  description:
    "Book a short Google Calendar call with David Walsh to sense-check a hiring brief, strategic interim need or quick recruitment question.",
  path: siteConfig.booking.pagePath,
  noIndex: !siteConfig.booking.enabled,
});

const bookingReasons = [
  "You are hiring and want to sense-check the brief.",
  "You need senior interim marketing or agency support quickly.",
  "You want a straight view on salary, market or process.",
  "You are a candidate with a quick question before sending detail.",
];

const bookingSetupSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Book a 15-minute call with David",
  url: absoluteUrl(siteConfig.booking.pagePath),
  description:
    "A short booking route for hiring, strategic interim and recruitment questions.",
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
              No sales script. No recruitment nonsense. Just a straight
              conversation about what you need and whether I can help.
            </p>
          </div>
          <div className="booking-panel">
            {siteConfig.booking.enabled ? (
              <>
                <span className="tag">Google Calendar</span>
                <h2>Choose a time that works.</h2>
                <p>
                  Booking opens David&apos;s Google Calendar appointment page.
                  Google Calendar can add the Google Meet link when David has
                  configured it in the appointment schedule.
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
                  and the contact form are the right routes.
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
            <h2>Need the fastest route?</h2>
            <p>
              Fastest way to reach me? Message me on WhatsApp. If you need to
              send more detail, use the contact form.
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
              handles availability, calendar invites and Meet links.
            </p>
            <p>
              Do not put sensitive candidate details or confidential client
              information into the booking form. Use the contact form if you
              need to send detail carefully.
            </p>
            <p>
              This is a technical setup note, not legal advice. The final Google
              booking wording should be checked before launch.
            </p>
          </div>
        </div>
      </section>
      <SchemaScript data={bookingSetupSchema} />
    </>
  );
}
