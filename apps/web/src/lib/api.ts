const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001"

async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${SERVER_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error ?? "Request failed")
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  get: <T>(path: string, headers?: HeadersInit) =>
    fetcher<T>(path, { method: "GET", headers }),

  post: <T>(path: string, body?: unknown, headers?: HeadersInit) =>
    fetcher<T>(path, { method: "POST", body: JSON.stringify(body), headers }),

  patch: <T>(path: string, body?: unknown, headers?: HeadersInit) =>
    fetcher<T>(path, { method: "PATCH", body: JSON.stringify(body), headers }),

  delete: <T>(path: string, headers?: HeadersInit) =>
    fetcher<T>(path, { method: "DELETE", headers }),
}
