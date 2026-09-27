"use client";

import { useEffect, useState } from "react";
import { brand } from "@/lib/brand";

export function RebrandPreviewNotice() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    function preventContact(event: Event) {
      const element = event.target;
      if (!(element instanceof Element)) return;
      const link = element.closest("a[href]");
      const href = link?.getAttribute("href") || "";
      if (
        event.type === "submit" ||
        /^(mailto:|tel:)|^https?:\/\/(wa\.me|api\.whatsapp\.com|calendar\.google\.com|calendly\.com)/i.test(href)
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setBlocked(true);
      }
    }

    document.addEventListener("click", preventContact, true);
    document.addEventListener("submit", preventContact, true);
    return () => {
      document.removeEventListener("click", preventContact, true);
      document.removeEventListener("submit", preventContact, true);
    };
  }, []);

  return (
    <aside className="rebrand-preview-notice" aria-label="Private preview">
      <strong>{brand.previewLabel}</strong>
      <span>Private design review. Forms and live integrations are disabled.</span>
      {blocked ? <span role="status">This action is disabled in the preview.</span> : null}
    </aside>
  );
}
