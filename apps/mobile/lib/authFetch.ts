import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { getApiBase } from "./api";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Decode a JWT payload without verification (client-side only).
 */
function decodeJwtPayload(
  token: string,
): { sub?: string; exp?: number; role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired (or will expire within bufferSeconds).
 */
export function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= (payload.exp - bufferSeconds) * 1000;
}

/**
 * Attempt to refresh the access token using the stored refresh token.
 * Returns the new access token, or null if refresh failed.
 */
async function refreshAccessToken(): Promise<string | null> {
  // Deduplicate concurrent refresh attempts
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refresh_token");
      if (!refreshToken) return null;

      // If the refresh token itself is expired, no point trying
      if (isTokenExpired(refreshToken, 0)) {
        return null;
      }

      const base = getApiBase();
      const res = await fetch(`${base}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken;

      if (newAccessToken) {
        await SecureStore.setItemAsync("auth_token", newAccessToken);
      }
      if (newRefreshToken) {
        await SecureStore.setItemAsync("refresh_token", newRefreshToken);
      }

      return newAccessToken || null;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Clear all auth tokens and redirect to login.
 */
export async function forceLogout() {
  await SecureStore.deleteItemAsync("auth_token");
  await SecureStore.deleteItemAsync("refresh_token");
  router.replace("/" as never);
}

/**
 * Get a valid access token, refreshing if necessary.
 * Returns the token string, or null if not authenticated.
 */
export async function getValidToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync("auth_token");
  if (!token) return null;

  // If token is still valid (with 60s buffer), use it
  if (!isTokenExpired(token)) return token;

  // Try to refresh
  const newToken = await refreshAccessToken();
  return newToken;
}

/**
 * Authenticated fetch wrapper. Automatically:
 * 1. Attaches the Authorization header
 * 2. Refreshes the token if expired before the request
 * 3. Retries once on 401 with a refreshed token
 * 4. Forces logout if refresh also fails
 */
export async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  let token = await getValidToken();

  if (!token) {
    await forceLogout();
    throw new Error("Not authenticated");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  let response = await fetch(url, { ...options, headers });

  // If 401, try refreshing once and retry
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(url, { ...options, headers });
    }

    // If still 401 after refresh, force logout
    if (response.status === 401) {
      await forceLogout();
      throw new Error("Session expired");
    }
  }

  return response;
}
