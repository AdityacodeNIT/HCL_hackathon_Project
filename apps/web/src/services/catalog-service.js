import { apiRequest } from "@/services/api.js";

export function getAdminMasterData(token) {
  return apiRequest("/admin/master-data", {
    token,
  });
}

export function createHospital(token, payload) {
  return apiRequest("/admin/hospitals", {
    method: "POST",
    body: payload,
    token,
  });
}

export function updateHospital(token, hospitalId, payload) {
  return apiRequest(`/admin/hospitals/${hospitalId}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function createVaccine(token, payload) {
  return apiRequest("/admin/vaccines", {
    method: "POST",
    body: payload,
    token,
  });
}

export function createOffering(token, payload) {
  return apiRequest("/admin/offerings", {
    method: "POST",
    body: payload,
    token,
  });
}

export function updateOfferingStatus(token, offeringId, payload) {
  return apiRequest(`/admin/offerings/${offeringId}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function getPublicVaccines() {
  return apiRequest("/vaccines");
}
