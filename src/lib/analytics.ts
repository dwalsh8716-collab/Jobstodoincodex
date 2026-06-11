export type AnalyticsEventName =
  | "form_submission"
  | "form_error"
  | "cta_click"
  | "booking_click"
  | "book_call_click"
  | "email_click"
  | "phone_click"
  | "whatsapp_click"
  | "linkedin_click"
  | "candidate_enquiry_submitted"
  | "job_application_start"
  | "job_application_submission"
  | "cv_upload_submission"
  | "insight_download"
  | "salary_guide_lead"
  | "salary_snapshot_view"
  | "salary_snapshot_download";

export type AnalyticsEventParams = {
  label?: string;
  href?: string;
  location?: string;
  page_path?: string;
  cta_text?: string;
  destination?: string;
  profile_type?: string;
  intent?: string;
  service?: string;
  booking_type?: string;
  job_slug?: string;
  form_type?: string;
  brief_type?: string;
  job_title?: string;
  snapshot_slug?: string;
  guide_slug?: string;
  insight_slug?: string;
};

export const analyticsConsentStorageKey = "essential.analytics-consent";
export const consentPreferencesStorageKey = "essential.consent-preferences";

export type ConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
};

export type ConsentModeValue = "granted" | "denied";

export type ConsentModeState = {
  ad_storage: ConsentModeValue;
  analytics_storage: ConsentModeValue;
  functionality_storage: ConsentModeValue;
  personalization_storage: ConsentModeValue;
  security_storage: ConsentModeValue;
  ad_user_data: ConsentModeValue;
  ad_personalization: ConsentModeValue;
};

export const defaultConsentPreferences: ConsentPreferences = {
  analytics: false,
  marketing: false,
};

export const defaultConsentModeState: ConsentModeState = {
  ad_storage: "denied",
  analytics_storage: "denied",
  functionality_storage: "denied",
  personalization_storage: "denied",
  security_storage: "granted",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

export function consentModeStateFromPreferences(
  preferences: ConsentPreferences,
): ConsentModeState {
  return {
    ad_storage: preferences.marketing ? "granted" : "denied",
    analytics_storage: preferences.analytics ? "granted" : "denied",
    functionality_storage: "denied",
    personalization_storage: preferences.marketing ? "granted" : "denied",
    security_storage: "granted",
    ad_user_data: preferences.marketing ? "granted" : "denied",
    ad_personalization: preferences.marketing ? "granted" : "denied",
  };
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | unknown[]>;
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
  page_path: "data-analytics-page-path",
  cta_text: "data-analytics-cta-text",
  destination: "data-analytics-destination",
  profile_type: "data-analytics-profile-type",
  intent: "data-analytics-intent",
  service: "data-analytics-service",
  booking_type: "data-analytics-booking-type",
  job_slug: "data-analytics-job-slug",
  form_type: "data-analytics-form-type",
  brief_type: "data-analytics-brief-type",
  job_title: "data-analytics-job-title",
  snapshot_slug: "data-analytics-snapshot-slug",
  guide_slug: "data-analytics-guide-slug",
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
