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
  const [visibleOnPath, setVisibleOnPath] = useState<string | null>(null);
  const visible = visibleOnPath === pathname;

  useEffect(() => {
    let previousY = window.scrollY;
    let directionStartY = previousY;
    let direction = 0;
    let ticking = false;

    const updateVisibility = () => {
      const currentY = window.scrollY;
      const nextDirection = Math.sign(currentY - previousY);

      if (currentY < 80) {
        setVisibleOnPath(null);
      } else if (nextDirection !== 0) {
        if (nextDirection !== direction) {
          directionStartY = previousY;
          direction = nextDirection;
        }

        if (direction > 0 && currentY - directionStartY > 12) {
          setVisibleOnPath(null);
        } else if (direction < 0 && directionStartY - currentY > 12) {
          setVisibleOnPath(pathname);
        }
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
  }, [pathname]);

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
