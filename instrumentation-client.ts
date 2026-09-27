import { monitoringSampleRate, scrubMonitoringEvent } from "@/lib/monitoring";

type SentryModule = typeof import("@sentry/nextjs");

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
let sentryPromise: Promise<SentryModule> | undefined;

function loadSentry() {
  if (!dsn) return Promise.resolve(undefined);
  if (sentryPromise) return sentryPromise;

  sentryPromise = import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn,
      environment:
        process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
      sendDefaultPii: false,
      tracesSampleRate: monitoringSampleRate(
        process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
      ),
      beforeSend: scrubMonitoringEvent,
    });

    return Sentry;
  });

  return sentryPromise;
}

if (dsn) {
  const load = () => void loadSentry();
  const events: Array<keyof WindowEventMap> = [
    "pointerdown",
    "scroll",
    "keydown",
    "touchstart",
  ];

  for (const event of events) {
    window.addEventListener(event, load, { once: true, passive: true });
  }

  window.setTimeout(load, 10000);
}

export function onRouterTransitionStart(
  ...args: Parameters<SentryModule["captureRouterTransitionStart"]>
) {
  void loadSentry().then((Sentry) => {
    Sentry?.captureRouterTransitionStart(...args);
  });
}
