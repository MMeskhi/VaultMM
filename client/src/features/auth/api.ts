import { ApiError, apiRequest } from "../../lib/api";
import { getMyVault } from "../vault/api";
import type { CurrentUser, Session } from "./types";

export async function getSession(
  signal?: AbortSignal,
): Promise<Session | null> {
  try {
    const user = await apiRequest<CurrentUser>(
      "/api/auth/me",
      { signal },
      "Could not load user",
    );
    const vault = await getMyVault(signal);
    return { user, vault };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function logout() {
  try {
    await apiRequest<void>(
      "/api/auth/logout",
      { method: "POST" },
      "Could not log out",
    );
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 401)) throw error;
  }
}
