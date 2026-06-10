"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  analyticsConsentStorageKey,
  analyticsParamsFromElement,
  trackEvent,
  type AnalyticsEventName,
} from "@/lib/analytics";

export type AnalyticsConfig = {
  gaId?: string;
  gtmId?: string;
  linkedInPartnerId?: string;
  metaPixelId?: string;
  clarityId?: string;
  hotjarId?: string;
};

type ConsentState = "granted" | "denied" | null;

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

function readStoredConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(analyticsConsentStorageKey);
  return value === "granted" || value === "denied" ? value : null;
}

function AnalyticsScripts({ config }: { config: AnalyticsConfig }) {
  const useGtm = Boolean(config.gtmId);

  return (
    <>
      {config.gtmId ? (
        <Script id="gtm" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'analytics_consent_granted' });
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer',${JSON.stringify(config.gtmId)});
          `}
        </Script>
      ) : null}

      {config.gaId && !useGtm ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.gaId)}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'granted',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                functionality_storage: 'granted',
                security_storage: 'granted'
              });
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(config.gaId)}, {
                anonymize_ip: true,
                send_page_view: true
              });
            `}
          </Script>
        </>
      ) : null}

      {config.linkedInPartnerId ? (
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

      {config.metaPixelId ? (
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

      {config.clarityId ? (
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

      {config.hotjarId ? (
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
  const [consent, setConsent] = useState<ConsentState>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setConsent(readStoredConsent());
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (consent !== "granted") return;

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
  }, [consent]);

  if (!hasTracking(config)) return null;
  if (pathname.startsWith("/cms") || pathname.startsWith("/studio")) return null;

  function updateConsent(nextConsent: Exclude<ConsentState, null>) {
    window.localStorage.setItem(analyticsConsentStorageKey, nextConsent);
    setConsent(nextConsent);
  }

  return (
    <>
      {consent === "granted" ? <AnalyticsScripts config={config} /> : null}
      {ready && consent === null ? (
        <div className="analytics-consent" role="region" aria-label="Analytics consent">
          <p>
            We use privacy-conscious analytics to see what is useful. No
            tracking loads unless you say yes.
          </p>
          <div>
            <button
              className="button button-primary"
              type="button"
              onClick={() => updateConsent("granted")}
            >
              Accept analytics
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => updateConsent("denied")}
            >
              Keep browsing
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
