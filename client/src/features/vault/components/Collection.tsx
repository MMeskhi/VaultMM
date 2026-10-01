import { useState } from "react";
import { Button } from "../../../ui/Button";
import { Input } from "../../../ui/Field";
import { ItemCard } from "../../../ui/ItemCard";
import { PageHeading } from "../../../ui/PageHeading";
import { Tag } from "../../../ui/Tag";
import { itemMetadata } from "../display";
import { navigate } from "../navigation";
import type { Vault } from "../types";
import type { Archive } from "../useArchive";

export function Collection({
  archive,
  vault,
  search,
  recent = false,
  onNewFolder,
}: {
  archive: Archive;
  vault?: Vault;
  search: string;
  recent?: boolean;
  onNewFolder: () => void;
}) {
  const [folderId, setFolderId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showTags, setShowTags] = useState(false);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [localSearch, setLocalSearch] = useState("");
  const allItems = archive.items.filter(
    (item) => recent || item.vaultId === vault?.id,
  );
  const items = allItems
    .filter(
      (item) =>
        (folderId === null || item.folderId === folderId) &&
        selectedTags.every((id) => item.tags?.some((tag) => tag.id === id)) &&
        `${item.title} ${item.description ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        `${item.title} ${item.description ?? ""}`
          .toLowerCase()
          .includes(localSearch.toLowerCase()),
    )
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const availableTags = recent
    ? [
        ...new Map(
          allItems
            .flatMap((item) => item.tags ?? [])
            .map((tag) => [tag.id, tag]),
        ).values(),
      ]
    : archive.tags;
  return (
    <>
      <PageHeading
        title={recent ? "Recently added" : (vault?.name ?? "Your collection")}
        subtitle={
          recent
            ? "The latest things you wanted to keep."
            : `${allItems.length} ${allItems.length === 1 ? "item" : "items"}. A few obsessions. No particular order.`
        }
      />
      <div className="collection-search">
        <Input
          label={`Search ${vault?.name ?? "your archive"}`}
          type="search"
          placeholder={`Search in ${vault?.name ?? "your archive"}...`}
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
        />
      </div>
      <div className="collection-toolbar">
        <div className="folder-tabs" role="group" aria-label="Filter by folder">
          <Button
            aria-pressed={folderId === null}
            variant={folderId === null ? "glass" : "ghost"}
            onClick={() => setFolderId(null)}
          >
            All items <span className="count">{allItems.length}</span>
          </Button>
          {!recent &&
            archive.folders.map((folder) => (
              <Button
                key={folder.id}
                aria-pressed={folderId === folder.id}
                variant={folderId === folder.id ? "glass" : "ghost"}
                onClick={() => setFolderId(folder.id)}
              >
                {folder.name}{" "}
                <span className="count">
                  {
                    allItems.filter((item) => item.folderId === folder.id)
                      .length
                  }
                </span>
              </Button>
            ))}
          {!recent && (
            <Button variant="ghost" onClick={onNewFolder}>
              + New folder
            </Button>
          )}
        </div>
        <div className="collection-toolbar__right">
          <Button
            onClick={() => setShowTags(!showTags)}
            aria-expanded={showTags}
            aria-controls="tag-filters"
          >
            Filter by tags
            {selectedTags.length > 0 && ` (${selectedTags.length})`}
          </Button>
          <div className="view-toggle" role="group" aria-label="Item layout">
            <button
              onClick={() => setLayout("grid")}
              aria-pressed={layout === "grid"}
            >
              Grid
            </button>
            <span>/</span>
            <button
              onClick={() => setLayout("list")}
              aria-pressed={layout === "list"}
            >
              List
            </button>
          </div>
        </div>
      </div>
      <div
        className={`collection-tags ${showTags ? "collection-tags--expanded" : ""}`}
        id="tag-filters"
      >
        <span className="eyebrow">Tags</span>
        <Tag
          aria-pressed={selectedTags.length === 0}
          onClick={() => setSelectedTags([])}
        >
          All
        </Tag>
        {availableTags.map((tag) => (
          <Tag
            key={tag.id}
            aria-pressed={selectedTags.includes(tag.id)}
            onClick={() =>
              setSelectedTags((previous) =>
                previous.includes(tag.id)
                  ? previous.filter((id) => id !== tag.id)
                  : [...previous, tag.id],
              )
            }
          >
            #{tag.name}
          </Tag>
        ))}
      </div>
      <div
        className={`item-grid ${layout === "list" ? "item-grid--list" : ""}`}
      >
        {items.map((item) => (
          <ItemCard
            key={item.id}
            title={item.title}
            imageUrl={item.imageUrl}
            metadata={itemMetadata(item, archive.folders)}
            variant={(item.id - 1) % 4}
            onClick={() => navigate({ page: "detail", itemId: item.id })}
          />
        ))}
      </div>
      {!items.length && !archive.loading && (
        <div className="empty-state">
          <h2>
            {allItems.length
              ? "Nothing quite matches."
              : "Make room for something good."}
          </h2>
          <p>
            {allItems.length
              ? "Try another search, folder, or tag."
              : "Save a film, an album, a link. This space is yours."}
          </p>
          {!allItems.length && vault && (
            <Button
              variant="primary"
              onClick={() => navigate({ page: "create", vaultId: vault.id })}
            >
              + Save your first item
            </Button>
          )}
        </div>
      )}
      <p className="collection-count eyebrow">
        Showing {items.length} of {allItems.length} items
      </p>
      {vault && (
        <Button
          className="mobile-save"
          variant="primary"
          onClick={() => navigate({ page: "create", vaultId: vault.id })}
        >
          + Save item
        </Button>
      )}
    </>
  );
}
