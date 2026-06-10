export type AnalyticsEventName =
  | "form_submission"
  | "form_error"
  | "cta_click"
  | "book_call_click"
  | "email_click"
  | "phone_click"
  | "linkedin_click"
  | "job_application_start"
  | "job_application_submission"
  | "cv_upload_submission"
  | "insight_download"
  | "salary_snapshot_view"
  | "salary_snapshot_download";

export type AnalyticsEventParams = {
  label?: string;
  href?: string;
  location?: string;
  form_type?: string;
  brief_type?: string;
  job_title?: string;
  snapshot_slug?: string;
  insight_slug?: string;
};

export const analyticsConsentStorageKey = "essential.analytics-consent";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | IArguments>;
    gtag?: (...args: unknown[]) => void;
    lintrk?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

const dataAttributeMap: Record<keyof AnalyticsEventParams, string> = {
  label: "data-analytics-label",
  href: "data-analytics-href",
  location: "data-analytics-location",
  form_type: "data-analytics-form-type",
  brief_type: "data-analytics-brief-type",
  job_title: "data-analytics-job-title",
  snapshot_slug: "data-analytics-snapshot-slug",
  insight_slug: "data-analytics-insight-slug",
};

export function analyticsAttributes(
  event: AnalyticsEventName,
  params: AnalyticsEventParams = {},
) {
  const attributes: Record<string, string> = {
    "data-analytics-event": event,
  };

  for (const [key, attribute] of Object.entries(dataAttributeMap)) {
    const value = params[key as keyof AnalyticsEventParams];
    if (value) attributes[attribute] = value;
  }

  return attributes;
}

export function analyticsParamsFromElement(element: HTMLElement) {
  const params: AnalyticsEventParams = {};

  for (const [key, attribute] of Object.entries(dataAttributeMap)) {
    const value = element.getAttribute(attribute);
    if (value) params[key as keyof AnalyticsEventParams] = value;
  }

  return params;
}

export function trackEvent(
  event: AnalyticsEventName,
  params: AnalyticsEventParams = {},
) {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(analyticsConsentStorageKey) !== "granted")
    return;

  const payload = {
    event,
    ...params,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  window.gtag?.("event", event, params);
  window.lintrk?.("track", { event, ...params });
  window.fbq?.("trackCustom", event, params);
  window.clarity?.("event", event);
}
