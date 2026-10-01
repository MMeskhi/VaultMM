import { apiRequest } from "../../lib/api";
import type { CreateVaultItemInput, Taxonomy, Vault, VaultItem } from "./types";

export function getVaults(signal?: AbortSignal) {
  return apiRequest<Vault[]>("/api/vault", { signal }, "Could not load vaults");
}

export function createVault(input: { name: string; description: string }) {
  return apiRequest<Vault>(
    "/api/vault",
    { method: "POST", body: JSON.stringify(input) },
    "Could not create vault",
  );
}

export function getTaxonomy(
  kind: "folder" | "category" | "tag",
  vaultId: number,
  signal?: AbortSignal,
) {
  return apiRequest<Taxonomy[]>(
    `/api/${kind}?vaultId=${vaultId}`,
    { signal },
    `Could not load ${kind}s`,
  );
}

export function createTaxonomy(
  kind: "folder" | "category" | "tag",
  vaultId: number,
  name: string,
) {
  return apiRequest<Taxonomy>(
    `/api/${kind}`,
    { method: "POST", body: JSON.stringify({ vaultId, name }) },
    `Could not create ${kind}`,
  );
}

export function updateVaultItem(id: number, input: CreateVaultItemInput) {
  return apiRequest<void>(
    `/api/vaultitem/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        ...input,
        id,
        tags: input.tagIds.map((tagId) => ({ id: tagId, name: "" })),
      }),
    },
    "Could not update item",
  );
}

export function deleteVaultItem(id: number) {
  return apiRequest<void>(
    `/api/vaultitem/${id}`,
    { method: "DELETE" },
    "Could not remove item",
  );
}

export function getMyVault(signal?: AbortSignal) {
  return apiRequest<Vault>(
    "/api/vault/mine",
    { method: "POST", signal },
    "Could not load vault",
  );
}

export function getVaultItems(vaultId: number, signal?: AbortSignal) {
  return apiRequest<VaultItem[]>(
    `/api/vaultitem?vaultId=${vaultId}`,
    { signal },
    "Could not load items",
  );
}

export function createVaultItem(input: CreateVaultItemInput) {
  return apiRequest<VaultItem>(
    "/api/vaultitem",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    "Could not save item",
  );
}
