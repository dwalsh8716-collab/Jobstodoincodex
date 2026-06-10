"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { analyticsAttributes } from "@/lib/analytics";

export function StickyMobileCTA() {
  const pathname = usePathname();

  if (pathname.startsWith("/cms") || pathname.startsWith("/studio")) {
    return null;
  }

  return (
    <div className="mobile-sticky-cta" aria-label="Quick contact">
      <Link
        className="button button-primary"
        href="/contact"
        {...analyticsAttributes("cta_click", {
          label: "Talk to David",
          href: "/contact",
          location: "mobile sticky cta",
        })}
      >
        Talk to David
      </Link>
    </div>
  );
}
