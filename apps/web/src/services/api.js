const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error?.message || "Request failed.";
    const error = new Error(message);
    error.code = payload?.error?.code || "REQUEST_FAILED";
    error.details = payload?.error?.details || null;
    throw error;
  }

  return payload?.data;
}
