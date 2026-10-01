export const API_URL = (
  import.meta.env.VITE_API_URL ?? "https://localhost:7213"
).replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(`${message}: ${status}`);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  message = "Request failed",
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  if (!response.ok) throw new ApiError(message, response.status);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
