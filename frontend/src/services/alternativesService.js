import { authFetch } from "../utils/apiClient";

const API = import.meta.env.VITE_API_URL;
const API_BASE = `${API}/api/trips`;

export async function fetchOnDemandAlternatives(tripId, payload) {
  const response = await authFetch(`${API_BASE}/${tripId}/alternatives/on-demand`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response || !response.ok) {
    throw new Error(`Failed to fetch alternatives: ${response?.status || 'no response'}`);
  }

  return response.json();
}
