const API = import.meta.env.VITE_API_URL;
const API_BASE = `${API}/api/trips`;

export async function fetchOnDemandAlternatives(tripId, payload) {
  const response = await fetch(`${API_BASE}/${tripId}/alternatives/on-demand`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch alternatives: ${response.status}`);
  }

  return response.json();
}
