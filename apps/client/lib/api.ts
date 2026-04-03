export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export function resolveAvatarUrl(raw?: string | null): string {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  const base = API_BASE.replace(/\/+$/, "");
  const path = raw.startsWith("/") ? raw.slice(1) : raw;
  return `${base}/${path}`;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function api<T = unknown>(
  path: string,
  opts?: { method?: Method; body?: unknown; headers?: Record<string, string> }
): Promise<{ data: T | null; error: string | null; status: number }> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts?.headers ?? {}),
  };
  // Attach bearer token if present (client-side only)
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("auth_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  try {
    const res = await fetch(url, {
      method: opts?.method ?? "GET",
      headers,
      body: opts?.body ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
    const status = res.status;
    const isJson = res.headers
      .get("content-type")
      ?.includes("application/json");
    const payload: unknown = isJson ? await res.json() : null;
    if (!res.ok) {
      const message =
        isJson &&
        payload !== null &&
        typeof payload === "object" &&
        "message" in payload &&
        typeof (payload as { message: unknown }).message === "string"
          ? (payload as { message: string }).message
          : res.statusText;
      return { data: null, error: String(message), status };
    }
    return { data: payload as T, error: null, status };
  } catch (e) {
    return { data: null, error: (e as Error).message, status: 0 };
  }
}
