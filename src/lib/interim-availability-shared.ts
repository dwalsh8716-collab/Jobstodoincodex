export const interimAvailabilityFeatureFlagName =
  "FEATURE_INTERIM_AVAILABILITY_TOGGLE" as const;

export const interimAvailabilityPath = "/candidate/interim-availability";

export const interimAvailabilityStatuses = [
  "available_now",
  "available_from",
  "on_assignment",
  "not_looking",
] as const;

export type InterimAvailabilityStatus =
  (typeof interimAvailabilityStatuses)[number];

export const interimAvailabilityStatusLabels: Record<
  InterimAvailabilityStatus | "not_confirmed",
  string
> = {
  not_confirmed: "Not confirmed",
  available_now: "Available now",
  available_from: "Available from a date",
  on_assignment: "On assignment",
  not_looking: "Not looking",
};
