import type { Taxonomy, Vault, VaultItem } from "./types";

export const demoVaults: Vault[] = [
  { id: 1, name: "Cinema", description: "Films worth returning to." },
  { id: 2, name: "Sound", description: "Albums, artists, little discoveries." },
  { id: 3, name: "Play", description: "Worlds to get lost in." },
  { id: 4, name: "Collected", description: "Images, links, fragments." },
];

export const demoFolders: Taxonomy[] = [
  { id: 1, vaultId: 1, name: "Night studies" },
  { id: 2, vaultId: 1, name: "Animation" },
  { id: 3, vaultId: 1, name: "Dreamlike" },
  { id: 4, vaultId: 2, name: "Peak albums" },
];
export const demoCategories: Taxonomy[] = [
  { id: 1, vaultId: 1, name: "Film" },
  { id: 2, vaultId: 2, name: "Album" },
  { id: 3, vaultId: 3, name: "Game" },
  { id: 4, vaultId: 4, name: "Link" },
];
export const demoTags: Taxonomy[] = [
  { id: 1, vaultId: 1, name: "neon" },
  { id: 2, vaultId: 1, name: "solitude" },
  { id: 3, vaultId: 1, name: "dreamlike" },
];
const films = [
  "Fallen Angels",
  "Blade Runner 2049",
  "Mulholland Drive",
  "Cowboy Bebop",
  "Taxi Driver",
  "Akira",
  "Drive",
  "The Lighthouse",
];
export const demoItems: VaultItem[] = films.map((title, index) => ({
  id: index + 1,
  title,
  vaultId: 1,
  description:
    index === 0
      ? "Neon nights, missed connections, and the strange comfort of being alone in a crowded city."
      : "A little world to return to. Kept here for the way it makes me feel.",
  createdAt: new Date(Date.UTC(2026, 8, 30 - index)).toISOString(),
  url: null,
  imageUrl: null,
  folderId: index === 2 ? 3 : index === 3 || index === 5 ? 2 : 1,
  categoryId: 1,
  tags: index === 0 ? demoTags : [demoTags[index % 3]],
}));
demoItems.push({
  id: 9,
  title: "This Is Happening",
  vaultId: 2,
  description: "For the long way home.",
  createdAt: "2026-09-29T10:00:00Z",
  url: null,
  imageUrl: null,
  folderId: 4,
  categoryId: 2,
  tags: [],
});
