import { useState } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createTaxonomy,
  createVault,
  createVaultItem,
  deleteVaultItem,
  getTaxonomy,
  getVaultItems,
  getVaults,
  updateVaultItem,
} from "./api";
import {
  demoCategories,
  demoFolders,
  demoItems,
  demoTags,
  demoVaults,
} from "./demo";
import type { CreateVaultItemInput, Taxonomy, Vault, VaultItem } from "./types";

type TaxonomyKind = "folder" | "category" | "tag";
type SaveInput = { id?: number; input: CreateVaultItemInput };
type ResourceInput = {
  kind: TaxonomyKind | "vault";
  name: string;
  vaultId: number;
};

export function useArchive(
  preview: boolean,
  initialVault: Vault | undefined,
  requestedVaultId: number,
  itemId?: number,
) {
  const queryClient = useQueryClient();
  const [demo, setDemo] = useState({
    vaults: demoVaults,
    items: demoItems,
    folders: demoFolders,
    categories: demoCategories,
    tags: demoTags,
  });
  const vaultQuery = useQuery({
    queryKey: ["archive", "vaults"],
    queryFn: ({ signal }) => getVaults(signal),
    enabled: !preview,
  });
  const vaults = preview
    ? demo.vaults
    : (vaultQuery.data ?? (initialVault ? [initialVault] : []));
  const itemQueries = useQueries({
    queries: vaults.map((vault) => ({
      queryKey: ["archive", vault.id, "items"],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getVaultItems(vault.id, signal),
      enabled: !preview,
    })),
  });
  const items = preview
    ? demo.items
    : itemQueries.flatMap((query) => query.data ?? []);
  const activeVaultId =
    items.find((item) => item.id === itemId)?.vaultId ?? requestedVaultId;
  const taxonomyQueries = useQueries({
    queries: (["folder", "category", "tag"] as const).map((kind) => ({
      queryKey: ["archive", activeVaultId, kind],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getTaxonomy(kind, activeVaultId, signal),
      enabled: !preview && activeVaultId > 0,
    })),
  });
  const [folderQuery, categoryQuery, tagQuery] = taxonomyQueries;
  const folders = preview
    ? demo.folders.filter((folder) => folder.vaultId === activeVaultId)
    : (folderQuery.data ?? []);
  const categories = preview
    ? demo.categories.filter((category) => category.vaultId === activeVaultId)
    : (categoryQuery.data ?? []);
  const tags = preview
    ? demo.tags.filter((tag) => tag.vaultId === activeVaultId)
    : (tagQuery.data ?? []);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["archive"] });
  const saveItem = useMutation({
    mutationFn: async ({ id, input }: SaveInput) => {
      if (preview) {
        const item: VaultItem = {
          ...input,
          id: id ?? Math.max(0, ...demo.items.map((item) => item.id)) + 1,
          createdAt:
            items.find((item) => item.id === id)?.createdAt ??
            new Date().toISOString(),
          tags: demo.tags.filter((tag) => input.tagIds.includes(tag.id)),
        };
        setDemo((previous) => ({
          ...previous,
          items: id
            ? previous.items.map((existing) =>
                existing.id === id ? item : existing,
              )
            : [...previous.items, item],
        }));
        return item;
      }
      if (id) {
        await updateVaultItem(id, input);
        return { id, vaultId: input.vaultId };
      }
      return createVaultItem(input);
    },
    onSuccess: () => {
      if (!preview) return invalidate();
    },
  });
  const removeItem = useMutation({
    mutationFn: async (id: number) => {
      if (preview)
        setDemo((previous) => ({
          ...previous,
          items: previous.items.filter((item) => item.id !== id),
        }));
      else await deleteVaultItem(id);
    },
    onSuccess: () => {
      if (!preview) return invalidate();
    },
  });
  const addResource = useMutation({
    mutationFn: async ({
      kind,
      name,
      vaultId,
    }: ResourceInput): Promise<Vault | Taxonomy> => {
      if (!preview)
        return kind === "vault"
          ? createVault({ name, description: "" })
          : createTaxonomy(kind, vaultId, name);
      const key =
        kind === "vault"
          ? "vaults"
          : kind === "category"
            ? "categories"
            : kind === "folder"
              ? "folders"
              : "tags";
      const resource = {
        id: Math.max(0, ...demo[key].map((resource) => resource.id)) + 1,
        name,
        vaultId,
      };
      setDemo((previous) => ({
        ...previous,
        [key]: [...previous[key], resource],
      }));
      return resource;
    },
    onSuccess: () => {
      if (!preview) return invalidate();
    },
  });
  const errors = preview
    ? []
    : [vaultQuery, ...itemQueries, ...taxonomyQueries].flatMap((query) =>
        query.error ? [query.error.message] : [],
      );
  const loading =
    !preview &&
    (vaultQuery.isPending || itemQueries.some((query) => query.isPending));
  const metadataLoading =
    !preview &&
    activeVaultId > 0 &&
    taxonomyQueries.some((query) => query.isPending);
  return {
    activeVaultId,
    vaults,
    items,
    folders,
    categories,
    tags,
    errors,
    loading,
    metadataLoading,
    saveItem,
    removeItem,
    addResource,
    refresh: invalidate,
  };
}

export type Archive = ReturnType<typeof useArchive>;
