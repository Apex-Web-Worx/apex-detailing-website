/** Statuses that still occupy a bookable slot. Cancelled/completed do not. */
export const OCCUPYING_STATUSES = [
  "confirmed",
  "in_progress",
  "ready_for_pickup",
] as const;

export type OccupyingStatus = (typeof OCCUPYING_STATUSES)[number];

export const OCCUPYING_STATUS_LIST: string[] = [...OCCUPYING_STATUSES];
