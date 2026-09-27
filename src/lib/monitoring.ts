const sensitiveKeys =
  /authorization|cookie|email|phone|name|token|secret|password|cv|file|body/i;

type UnknownRecord = Record<string, unknown>;

function scrubObject(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(scrubObject);

  return Object.fromEntries(
    Object.entries(value as UnknownRecord).map(([key, entry]) => [
      key,
      sensitiveKeys.test(key) ? "[Filtered]" : scrubObject(entry),
    ]),
  );
}

export function scrubMonitoringEvent<T extends object>(event: T): T {
  const record = event as UnknownRecord;
  return {
    ...record,
    user: undefined,
    request: record.request
      ? {
          ...(scrubObject(record.request) as UnknownRecord),
          data: undefined,
          cookies: undefined,
          headers: undefined,
          query_string: undefined,
        }
      : undefined,
    extra: scrubObject(record.extra),
    contexts: scrubObject(record.contexts),
  } as T;
}

export function monitoringSampleRate(value: string | undefined) {
  const parsed = Number(value ?? "0.02");
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0.02;
}
