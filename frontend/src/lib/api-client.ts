const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
let refreshing: Promise<boolean> | null = null;

const refresh = () =>
  (refreshing ??= fetch(`${BASE}/auth/refresh`, { method: "POST", credentials: "include" })
    .then(async (r) => r.ok)
    .finally(() => { refreshing = null; }));

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const doFetch = () => fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  let res = await doFetch();
  if (res.status === 401 && !path.startsWith("/auth/") && (await refresh())) {
    res = await doFetch();
  }

  const payload = await res.json().catch(() => ({}));

  if (!res.ok || (payload && payload.success === false)) {
    const errorMsg =
      payload.error?.message ||
      payload.detail ||
      payload.message ||
      res.statusText ||
      "API Request Failed";
    throw new Error(errorMsg);
  }

  return (payload && typeof payload === "object" && "success" in payload && "data" in payload ? payload.data : payload) as T;
}
