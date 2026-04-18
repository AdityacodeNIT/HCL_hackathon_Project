export const API_PREFIX = "/api/v1";

export const USER_ROLES = {
  PATIENT: "patient",
  ADMIN: "admin",
};

export const USER_ROLE_VALUES = Object.values(USER_ROLES);

export const BOOKING_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const BOOKING_STATUS_VALUES = Object.values(BOOKING_STATUSES);
