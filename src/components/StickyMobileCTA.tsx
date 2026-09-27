"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookingButton } from "@/components/BookingButton";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { analyticsAttributes } from "@/lib/analytics";
import { siteConfig } from "@/lib/site";

export function StickyMobileCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let previousY = window.scrollY;
    let ticking = false;

    const updateVisibility = () => {
      const currentY = window.scrollY;
      const delta = currentY - previousY;

      if (currentY < 80 || delta < -12) {
        setVisible(true);
      } else if (delta > 12 && currentY > 120) {
        setVisible(false);
      }

      previousY = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (
    pathname.startsWith("/admin") ||
    pathname === "/client" ||
    pathname.startsWith("/client/") ||
    pathname.startsWith("/cms") ||
    pathname.startsWith("/studio")
  ) {
    return null;
  }

  return (
    <div
      className="mobile-sticky-cta"
      aria-label="Quick contact"
      aria-hidden={!visible}
      data-hidden={!visible}
      inert={!visible}
    >
      <WhatsAppButton
        intent="general"
        label="WhatsApp David"
        location="mobile sticky cta"
        variant="primary"
      />
      {siteConfig.booking.enabled ? (
        <BookingButton
          label="Book 15 minutes"
          location="mobile_sticky_cta"
          intent="book_call"
          variant="secondary"
        />
      ) : (
        <Link
          className="button button-secondary"
          href="/contact"
          prefetch={false}
          {...analyticsAttributes("cta_click", {
            label: "Talk to David",
            href: "/contact",
            location: "mobile sticky cta",
          })}
        >
          Talk to David
        </Link>
      )}
    </div>
  );
}
