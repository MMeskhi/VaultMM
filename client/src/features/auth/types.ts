import type { Vault } from "../vault/types";

export type CurrentUser = {
  id: number;
  email: string;
  displayName: string | null;
};
export type Session = { user: CurrentUser; vault: Vault };
