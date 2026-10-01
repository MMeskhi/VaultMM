import type { Taxonomy, VaultItem } from "./types";

export function itemMetadata(item: VaultItem, folders: Taxonomy[]) {
  const folder = folders.find((folder) => folder.id === item.folderId)?.name;
  return [new Date(item.createdAt).getFullYear(), folder]
    .filter(Boolean)
    .join(" / ");
}

export function safeUrl(value: string | null | undefined) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
