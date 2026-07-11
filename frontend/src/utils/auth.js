import { clearAuth } from "./apiClient";

export function isUserLoggedIn() {
  const rawUserId = localStorage.getItem("voyexa_user_id");
  const hasRefreshToken = !!localStorage.getItem("voyexa_refresh_token");
  return rawUserId !== null && !Number.isNaN(Number(rawUserId)) && hasRefreshToken;
}

export function navigateRequiringLogin(navigate, targetPath, state = undefined) {
  if (isUserLoggedIn()) {
    navigate(targetPath, state ? { state } : undefined);
    return;
  }

  navigate("/auth", {
    state: {
      loginRequired: true,
      requestedPath: targetPath,
      requestedState: state,
    },
  });
}

export function logout(navigate) {
  clearAuth();
  if (navigate) {
    navigate("/auth", { replace: true });
  }
}
