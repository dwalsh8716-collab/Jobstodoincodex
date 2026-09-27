import * as Sentry from "@sentry/nextjs";
import { monitoringSampleRate, scrubMonitoringEvent } from "@/lib/monitoring";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(
    process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  ),
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: monitoringSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE),
  beforeSend: scrubMonitoringEvent,
});
