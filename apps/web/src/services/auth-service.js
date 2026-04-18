import { apiRequest } from "@/services/api.js";

export function login(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function register(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function getCurrentUser(token) {
  return apiRequest("/auth/me", {
    token,
  });
}

export function logout(token) {
  return apiRequest("/auth/logout", {
    method: "POST",
    token,
  });
}
