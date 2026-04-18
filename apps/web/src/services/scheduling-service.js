import { apiRequest } from "@/services/api.js";

export function getHospitalAvailability(token, hospitalId, filters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    const normalizedValue = String(value || "").trim();

    if (normalizedValue) {
      searchParams.set(key, normalizedValue);
    }
  });

  const queryString = searchParams.toString();
  const path = queryString
    ? `/hospitals/${hospitalId}/availability?${queryString}`
    : `/hospitals/${hospitalId}/availability`;

  return apiRequest(path, { token });
}

export function listAdminSlots(token, filters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    const normalizedValue = String(value || "").trim();

    if (normalizedValue) {
      searchParams.set(key, normalizedValue);
    }
  });

  const queryString = searchParams.toString();
  const path = queryString ? `/admin/slots?${queryString}` : "/admin/slots";

  return apiRequest(path, { token });
}

export function createSlot(token, payload) {
  return apiRequest("/admin/slots", {
    method: "POST",
    body: payload,
    token,
  });
}

export function updateSlot(token, slotId, payload) {
  return apiRequest(`/admin/slots/${slotId}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function listAdminBookings(token, filters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    const normalizedValue = String(value || "").trim();

    if (normalizedValue) {
      searchParams.set(key, normalizedValue);
    }
  });

  const queryString = searchParams.toString();
  const path = queryString ? `/admin/bookings?${queryString}` : "/admin/bookings";

  return apiRequest(path, { token });
}

export function createBooking(token, payload) {
  return apiRequest("/bookings", {
    method: "POST",
    body: payload,
    token,
  });
}

export function listMyBookings(token) {
  return apiRequest("/bookings/me", {
    token,
  });
}

export function rescheduleBooking(token, bookingId, payload) {
  return apiRequest(`/bookings/${bookingId}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function cancelBooking(token, bookingId) {
  return apiRequest(`/bookings/${bookingId}`, {
    method: "DELETE",
    token,
  });
}
