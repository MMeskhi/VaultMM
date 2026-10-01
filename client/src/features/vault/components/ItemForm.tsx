import { useState } from "react";
import type { FormEvent } from "react";
import { ArchiveArtwork } from "../../../ui/ArchiveArtwork";
import { Button } from "../../../ui/Button";
import { Input, Select, Textarea } from "../../../ui/Field";
import { PageHeading } from "../../../ui/PageHeading";
import { Panel } from "../../../ui/Panel";
import { Status } from "../../../ui/Status";
import { Tag } from "../../../ui/Tag";
import { safeUrl } from "../display";
import { navigate } from "../navigation";
import type { VaultItem } from "../types";
import type { Archive } from "../useArchive";

export function ItemForm({
  archive,
  vaultId,
  item,
  onResource,
}: {
  archive: Archive;
  vaultId: number;
  item?: VaultItem;
  onResource: (kind: "folder" | "category" | "tag") => void;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [url, setUrl] = useState(item?.url ?? "");
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [folderId, setFolderId] = useState(item?.folderId ?? "");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? "");
  const [tagIds, setTagIds] = useState(item?.tags?.map((tag) => tag.id) ?? []);
  const vault = archive.vaults.find((vault) => vault.id === vaultId);
  const saving = archive.saveItem.isPending;
  const metadataReady = !archive.metadataLoading && !archive.errors.length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || saving || !metadataReady) return;
    archive.saveItem.mutate(
      {
        id: item?.id,
        input: {
          vaultId,
          title: title.trim(),
          description: description.trim(),
          url: url.trim() || null,
          imageUrl: imageUrl.trim() || null,
          folderId: folderId === "" ? null : Number(folderId),
          categoryId: categoryId === "" ? null : Number(categoryId),
          tagIds,
        },
      },
      { onSuccess: (saved) => navigate({ page: "detail", itemId: saved.id }) },
    );
  }

  return (
    <>
      <PageHeading
        title={item ? "Keep the details." : "Keep something."}
        subtitle="A link, a film, an album. Give it a place in your archive."
      />
      <div className="save-layout">
        <Panel className="save-panel">
          <form onSubmit={handleSubmit}>
            <fieldset disabled={saving}>
              <Input
                label="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What would you like to keep?"
                required
                maxLength={200}
                autoFocus
              />
              <Input
                label="Source URL"
                hint="optional"
                type="url"
                pattern="https?://.+"
                title="Use a link beginning with https:// or http://"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://..."
                maxLength={2000}
              />
              <Textarea
                label="Description"
                hint="optional"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What made you want to keep this?"
                maxLength={2000}
                rows={3}
              />
              <div className="form-columns">
                <Input label="Vault" value={vault?.name ?? ""} readOnly />
                <Select
                  label="Folder"
                  value={folderId}
                  disabled={!metadataReady}
                  onChange={(event) => setFolderId(event.target.value)}
                >
                  <option value="">Unfiled</option>
                  {archive.folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Category"
                  value={categoryId}
                  disabled={!metadataReady}
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  <option value="">None</option>
                  {archive.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="form-resource-links">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!metadataReady}
                  onClick={() => onResource("folder")}
                >
                  + New folder
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!metadataReady}
                  onClick={() => onResource("category")}
                >
                  + New category
                </Button>
              </div>
              <div className="field">
                <span className="field__label">Tags · optional</span>
                <div className="tag-input">
                  {archive.tags.map((tag) => (
                    <Tag
                      key={tag.id}
                      aria-pressed={tagIds.includes(tag.id)}
                      disabled={!metadataReady}
                      onClick={() =>
                        setTagIds((previous) =>
                          previous.includes(tag.id)
                            ? previous.filter((id) => id !== tag.id)
                            : [...previous, tag.id],
                        )
                      }
                    >
                      #{tag.name}
                    </Tag>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!metadataReady}
                    onClick={() => onResource("tag")}
                  >
                    + Add tag
                  </Button>
                </div>
              </div>
              <Input
                label="Cover image"
                hint="optional"
                type="url"
                pattern="https?://.+"
                title="Use a link beginning with https:// or http://"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="Paste an image URL"
                maxLength={2000}
              />
              {archive.saveItem.error && (
                <Status error>{archive.saveItem.error.message}</Status>
              )}
              {archive.metadataLoading && (
                <Status>Loading your folders and categories...</Status>
              )}
              <div className="form-actions">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!title.trim() || !metadataReady || saving}
                >
                  {saving ? "Saving..." : item ? "Save changes" : "Save item"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    navigate(
                      item
                        ? { page: "detail", itemId: item.id }
                        : { page: "collection", vaultId },
                    )
                  }
                >
                  Cancel
                </Button>
              </div>
            </fieldset>
          </form>
        </Panel>
        <aside className="save-preview">
          <p className="eyebrow">Preview</p>
          <Panel className="preview-card">
            <ArchiveArtwork
              imageUrl={safeUrl(imageUrl)}
              title={title || "Your item cover"}
              variant={item ? (item.id - 1) % 4 : 0}
            />
            <div className="preview-card__body">
              <h2>{title || "Something worth keeping"}</h2>
              <p className="eyebrow">
                {vault?.name}
                {folderId !== "" &&
                  ` / ${archive.folders.find((folder) => folder.id === Number(folderId))?.name ?? ""}`}
              </p>
            </div>
          </Panel>
          <p className="save-preview__note">
            Only you can see this item.
            <br />
            You can edit or move it anytime.
          </p>
        </aside>
      </div>
    </>
  );
}
