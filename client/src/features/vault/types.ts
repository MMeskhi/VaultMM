export type Vault = { id: number; name: string; description?: string | null };

export type Taxonomy = {
  id: number;
  vaultId: number;
  name: string;
  parentFolderId?: number | null;
};

export type VaultItem = {
  id: number;
  vaultId: number;
  title: string;
  description: string | null;
  createdAt: string;
  url: string | null;
  imageUrl: string | null;
  folderId: number | null;
  categoryId: number | null;
  tags: Taxonomy[];
};

export type CreateVaultItemInput = {
  vaultId: number;
  title: string;
  description: string;
  url: string | null;
  imageUrl: string | null;
  folderId: number | null;
  categoryId: number | null;
  tagIds: number[];
};
