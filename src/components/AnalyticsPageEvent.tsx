"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsEventName } from "@/lib/analytics";

type Props = {
  event: Extract<AnalyticsEventName, "salary_snapshot_view">;
  snapshotSlug: string;
};

export function AnalyticsPageEvent({ event, snapshotSlug }: Props) {
  useEffect(() => {
    trackEvent(event, { snapshot_slug: snapshotSlug });
  }, [event, snapshotSlug]);

  return null;
}
