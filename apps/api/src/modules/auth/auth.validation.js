import { USER_ROLE_VALUES } from "../../config/constants.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeBody(body = {}) {
  return {
    fullName: String(body.fullName || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    password: String(body.password || ""),
    role: String(body.role || "").trim().toLowerCase(),
  };
}

export function validateRegisterPayload(body) {
  const payload = normalizeBody(body);
  const errors = [];

  if (!payload.fullName) {
    errors.push("Full name is required.");
  }

  if (!payload.email) {
    errors.push("Email is required.");
  } else if (!emailPattern.test(payload.email)) {
    errors.push("Email must be valid.");
  }

  if (!payload.password) {
    errors.push("Password is required.");
  } else if (payload.password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }

  if (!payload.role) {
    errors.push("Role is required.");
  } else if (!USER_ROLE_VALUES.includes(payload.role)) {
    errors.push("Role must be either patient or admin.");
  }

  return {
    isValid: errors.length === 0,
    payload,
    errors,
  };
}

export function validateLoginPayload(body) {
  const payload = normalizeBody(body);
  const errors = [];

  if (!payload.email) {
    errors.push("Email is required.");
  } else if (!emailPattern.test(payload.email)) {
    errors.push("Email must be valid.");
  }

  if (!payload.password) {
    errors.push("Password is required.");
  }

  return {
    isValid: errors.length === 0,
    payload: {
      email: payload.email,
      password: payload.password,
    },
    errors,
  };
}
