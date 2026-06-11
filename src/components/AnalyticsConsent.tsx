"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  analyticsConsentStorageKey,
  analyticsParamsFromElement,
  consentModeStateFromPreferences,
  consentPreferencesStorageKey,
  defaultConsentPreferences,
  trackEvent,
  type AnalyticsEventName,
  type ConsentPreferences,
} from "@/lib/analytics";

export type AnalyticsConfig = {
  gaId?: string;
  gtmId?: string;
  linkedInPartnerId?: string;
  metaPixelId?: string;
  clarityId?: string;
  hotjarId?: string;
};

type StoredConsentPreferences = ConsentPreferences & {
  updatedAt?: string;
  source?: "custom-banner" | "legacy";
};

const analyticsCookiePrefixes = [
  "_ga",
  "_gid",
  "_gat",
  "_hj",
  "_clck",
  "_clsk",
];
const marketingCookiePrefixes = [
  "_gcl",
  "_fbp",
  "_fbc",
  "bcookie",
  "li_sugr",
  "lidc",
  "AnalyticsSyncHistory",
  "UserMatchHistory",
  "MUID",
];

function hasTracking(config: AnalyticsConfig) {
  return Boolean(
    config.gaId ||
    config.gtmId ||
    config.linkedInPartnerId ||
    config.metaPixelId ||
    config.clarityId ||
    config.hotjarId,
  );
}

function readStoredPreferences(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;

  const rawPreferences = window.localStorage.getItem(
    consentPreferencesStorageKey,
  );

  if (rawPreferences) {
    try {
      const parsed = JSON.parse(rawPreferences) as Partial<ConsentPreferences>;
      if (
        typeof parsed.analytics === "boolean" &&
        typeof parsed.marketing === "boolean"
      ) {
        return {
          analytics: parsed.analytics,
          marketing: parsed.marketing,
        };
      }
    } catch {
      window.localStorage.removeItem(consentPreferencesStorageKey);
    }
  }

  const legacyValue = window.localStorage.getItem(analyticsConsentStorageKey);
  if (legacyValue === "granted") return { analytics: true, marketing: true };
  if (legacyValue === "denied") return { ...defaultConsentPreferences };

  return null;
}

function storePreferences(preferences: ConsentPreferences) {
  const stored: StoredConsentPreferences = {
    ...preferences,
    updatedAt: new Date().toISOString(),
    source: "custom-banner",
  };

  window.localStorage.setItem(
    consentPreferencesStorageKey,
    JSON.stringify(stored),
  );
  window.localStorage.setItem(
    analyticsConsentStorageKey,
    preferences.analytics ? "granted" : "denied",
  );
}

function cookieDomainsForCurrentHost() {
  const host = window.location.hostname;
  const domains = new Set<string>([host]);
  const parts = host.split(".");

  if (parts.length > 2) {
    domains.add(`.${parts.slice(-2).join(".")}`);
  }

  return Array.from(domains);
}

function removeCookie(name: string) {
  const expires = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `${name}=; ${expires}; path=/; SameSite=Lax`;

  for (const domain of cookieDomainsForCurrentHost()) {
    document.cookie = `${name}=; ${expires}; path=/; domain=${domain}; SameSite=Lax`;
  }
}

function clearCookiesByPrefix(prefixes: string[]) {
  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("=")[0])
    .filter(Boolean);

  for (const name of cookieNames) {
    if (prefixes.some((prefix) => name.startsWith(prefix))) {
      removeCookie(name);
    }
  }
}

function clearNonEssentialCookies(preferences: ConsentPreferences) {
  if (!preferences.analytics) clearCookiesByPrefix(analyticsCookiePrefixes);
  if (!preferences.marketing) clearCookiesByPrefix(marketingCookiePrefixes);
}

function updateGoogleConsentMode(preferences: ConsentPreferences) {
  const state = consentModeStateFromPreferences(preferences);

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  window.gtag("consent", "update", state);
  window.dataLayer.push({
    event: "consent_preferences_updated",
    consent_analytics: preferences.analytics ? "granted" : "denied",
    consent_marketing: preferences.marketing ? "granted" : "denied",
  });
}

function AnalyticsScripts({
  config,
  preferences,
}: {
  config: AnalyticsConfig;
  preferences: ConsentPreferences;
}) {
  const useGtm = Boolean(config.gtmId);
  const canLoadGoogle = preferences.analytics || preferences.marketing;

  return (
    <>
      {config.gtmId && canLoadGoogle ? (
        <Script id="gtm" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'consent_preferences_loaded' });
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer',${JSON.stringify(config.gtmId)});
          `}
        </Script>
      ) : null}

      {config.gaId && !useGtm && preferences.analytics ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.gaId)}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
              window.gtag('js', new Date());
              window.gtag('config', ${JSON.stringify(config.gaId)}, {
                anonymize_ip: true,
                send_page_view: true
              });
            `}
          </Script>
        </>
      ) : null}

      {config.linkedInPartnerId && preferences.marketing ? (
        <Script id="linkedin-insight" strategy="afterInteractive">
          {`
            _linkedin_partner_id = ${JSON.stringify(config.linkedInPartnerId)};
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            (function(l) {
              if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
              window.lintrk.q=[]}
              var s = document.getElementsByTagName("script")[0];
              var b = document.createElement("script");
              b.type = "text/javascript"; b.async = true;
              b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
              s.parentNode.insertBefore(b, s);
            })(window.lintrk);
          `}
        </Script>
      ) : null}

      {config.metaPixelId && preferences.marketing ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', ${JSON.stringify(config.metaPixelId)});
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}

      {config.clarityId && preferences.analytics ? (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", ${JSON.stringify(config.clarityId)});
          `}
        </Script>
      ) : null}

      {config.hotjarId && preferences.analytics ? (
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${JSON.stringify(config.hotjarId)},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      ) : null}
    </>
  );
}

export function AnalyticsConsent({ config }: { config: AnalyticsConfig }) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(
    null,
  );
  const [draftPreferences, setDraftPreferences] = useState<ConsentPreferences>({
    ...defaultConsentPreferences,
  });
  const [ready, setReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedPreferences = readStoredPreferences();
      if (storedPreferences) {
        updateGoogleConsentMode(storedPreferences);
        setPreferences(storedPreferences);
        setDraftPreferences(storedPreferences);
      }
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function openPreferences() {
      setDraftPreferences(preferences || defaultConsentPreferences);
      setManageOpen(true);
      setPanelOpen(true);
    }

    window.addEventListener(
      "essential:open-consent-preferences",
      openPreferences,
    );

    return () =>
      window.removeEventListener(
        "essential:open-consent-preferences",
        openPreferences,
      );
  }, [preferences]);

  useEffect(() => {
    if (!panelOpen && preferences !== null) return;
    const panel = panelRef.current;
    const focusTarget = panel?.querySelector<HTMLElement>(
      "button, input, a[href]",
    );
    focusTarget?.focus();
  }, [panelOpen, preferences]);

  useEffect(() => {
    if (!panelOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && preferences !== null) {
        setPanelOpen(false);
        setManageOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [panelOpen, preferences]);

  useEffect(() => {
    if (!preferences?.analytics) return;

    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const element = target.closest<HTMLElement>("[data-analytics-event]");
      const eventName = element?.getAttribute(
        "data-analytics-event",
      ) as AnalyticsEventName | null;

      if (!element || !eventName) return;
      trackEvent(eventName, analyticsParamsFromElement(element));
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [preferences]);

  if (!hasTracking(config)) return null;
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/cms") ||
    pathname.startsWith("/studio")
  ) {
    return null;
  }

  function savePreferences(nextPreferences: ConsentPreferences) {
    storePreferences(nextPreferences);
    updateGoogleConsentMode(nextPreferences);
    clearNonEssentialCookies(nextPreferences);
    setPreferences(nextPreferences);
    setDraftPreferences(nextPreferences);
    setPanelOpen(false);
    setManageOpen(false);
  }

  const showPanel = ready && (preferences === null || panelOpen);

  return (
    <>
      {preferences ? (
        <AnalyticsScripts config={config} preferences={preferences} />
      ) : null}
      {showPanel ? (
        <div
          className="analytics-consent"
          ref={panelRef}
          role={manageOpen ? "dialog" : "region"}
          aria-label="Cookie and analytics preferences"
        >
          <div>
            <h2 className="analytics-consent-title">Cookie choices</h2>
            <p>
              We use essential site functions. Analytics and marketing tags only
              load if you say yes. You can read the{" "}
              <Link href="/cookie-policy">Cookie Policy</Link> and{" "}
              <Link href="/privacy-policy">Privacy Policy</Link>.
            </p>
            {manageOpen ? (
              <div className="consent-preferences">
                <div className="consent-preference">
                  <input
                    id="consent-analytics"
                    type="checkbox"
                    checked={draftPreferences.analytics}
                    onChange={(event) =>
                      setDraftPreferences((current) => ({
                        ...current,
                        analytics: event.target.checked,
                      }))
                    }
                  />
                  <label htmlFor="consent-analytics">
                    <strong>Analytics</strong>
                    <small>
                      Helps David see which pages, CTAs and content are useful.
                    </small>
                  </label>
                </div>
                <div className="consent-preference">
                  <input
                    id="consent-marketing"
                    type="checkbox"
                    checked={draftPreferences.marketing}
                    onChange={(event) =>
                      setDraftPreferences((current) => ({
                        ...current,
                        marketing: event.target.checked,
                      }))
                    }
                  />
                  <label htmlFor="consent-marketing">
                    <strong>Marketing</strong>
                    <small>
                      Allows advertising and retargeting tags if they are
                      configured.
                    </small>
                  </label>
                </div>
                <p className="consent-essential-note">
                  Essential security storage stays on. Non-essential functional
                  storage is denied unless a real feature needs it.
                </p>
              </div>
            ) : null}
          </div>
          <div>
            {manageOpen ? (
              <button
                className="button button-primary"
                type="button"
                onClick={() => savePreferences(draftPreferences)}
              >
                Save preferences
              </button>
            ) : (
              <button
                className="button button-primary"
                type="button"
                onClick={() =>
                  savePreferences({ analytics: true, marketing: true })
                }
              >
                Accept all
              </button>
            )}
            <button
              className="button button-secondary"
              type="button"
              onClick={() =>
                savePreferences({ analytics: false, marketing: false })
              }
            >
              Reject non-essential
            </button>
            {manageOpen ? (
              <button
                className="button button-secondary"
                type="button"
                onClick={() =>
                  savePreferences({ analytics: true, marketing: true })
                }
              >
                Accept all
              </button>
            ) : (
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setManageOpen(true)}
              >
                Manage preferences
              </button>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
