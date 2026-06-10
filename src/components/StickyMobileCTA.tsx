"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function StickyMobileCTA() {
  const pathname = usePathname();

  if (pathname.startsWith("/cms") || pathname.startsWith("/studio")) {
    return null;
  }

  return (
    <div className="mobile-sticky-cta" aria-label="Quick contact">
      <Link className="button button-primary" href="/contact">
        Talk to David
      </Link>
    </div>
  );
}

