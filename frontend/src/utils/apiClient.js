export const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// ── In-memory access token (never stored in localStorage) ──
let accessToken = null;

// ── Token management ──

export function setTokens(access, refresh) {
  accessToken = access;
  if (refresh) {
    localStorage.setItem("voyexa_refresh_token", refresh);
  }
}

export function getAccessToken() {
  return accessToken;
}

export function clearAuth() {
  accessToken = null;
  localStorage.removeItem("voyexa_refresh_token");
  localStorage.removeItem("voyexa_user_id");
  localStorage.removeItem("voyexa_user_name");
  localStorage.removeItem("voyexa_user_email");
  localStorage.removeItem("voyexa_user_phone");
}

/**
 * Restore access token from refresh token on app startup.
 * Call this once when the app loads (e.g., in App.jsx or a context provider).
 * Returns true if session was restored, false otherwise.
 */
export async function restoreSession() {
  const refreshToken = localStorage.getItem("voyexa_refresh_token");
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API}/api/users/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearAuth();
      return false;
    }

    const data = await res.json();
    accessToken = data.accessToken;
    if (data.refreshToken) {
      localStorage.setItem("voyexa_refresh_token", data.refreshToken);
    }
    // Update user info in localStorage
    if (data.userId !== undefined && data.userId !== null) {
      localStorage.setItem("voyexa_user_id", String(data.userId));
    }
    if (data.name) localStorage.setItem("voyexa_user_name", data.name);
    if (data.email) localStorage.setItem("voyexa_user_email", data.email);
    if (data.phone_number) localStorage.setItem("voyexa_user_phone", data.phone_number);
    return true;
  } catch {
    clearAuth();
    return false;
  }
}

// ── Core fetch wrapper with auto-refresh ──

async function refreshAndRetry(url, options) {
  const refreshToken = localStorage.getItem("voyexa_refresh_token");
  if (!refreshToken) {
    clearAuth();
    return null; // Caller must handle
  }

  try {
    const refreshRes = await fetch(`${API}/api/users/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshRes.ok) {
      clearAuth();
      return null;
    }

    const data = await refreshRes.json();
    accessToken = data.accessToken;
    if (data.refreshToken) {
      localStorage.setItem("voyexa_refresh_token", data.refreshToken);
    }

    // Retry the original request with new token
    const retryHeaders = { ...(options.headers || {}) };
    retryHeaders["Authorization"] = `Bearer ${accessToken}`;
    return fetch(url, { ...options, headers: retryHeaders });
  } catch {
    clearAuth();
    return null;
  }
}

/**
 * Authenticated fetch wrapper.
 * - Attaches Bearer token if available.
 * - On 401, attempts one token refresh + retry.
 * - Returns the fetch Response (or null if auth failed completely).
 */
export async function authFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && accessToken) {
    // Token may have expired — try refresh
    const retryResponse = await refreshAndRetry(url, { ...options, headers });
    if (retryResponse) return retryResponse;

    // Refresh failed — return the original 401
    return response;
  }

  return response;
}
