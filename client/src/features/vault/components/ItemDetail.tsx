import { useState } from "react";
import { ArchiveArtwork } from "../../../ui/ArchiveArtwork";
import { Button } from "../../../ui/Button";
import { Dialog } from "../../../ui/Dialog";
import { Panel } from "../../../ui/Panel";
import { Status } from "../../../ui/Status";
import { safeUrl } from "../display";
import { navigate } from "../navigation";
import type { VaultItem } from "../types";
import type { Archive } from "../useArchive";

export function ItemDetail({
  item,
  archive,
}: {
  item: VaultItem;
  archive: Archive;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const vault = archive.vaults.find((vault) => vault.id === item.vaultId);
  const folder = archive.folders.find((folder) => folder.id === item.folderId);
  const category = archive.categories.find(
    (category) => category.id === item.categoryId,
  );
  const source = safeUrl(item.url);
  return (
    <>
      <button
        className="back-link"
        onClick={() => navigate({ page: "collection", vaultId: item.vaultId })}
      >
        ← Back to {vault?.name ?? "vault"}
        {folder && ` / ${folder.name}`}
      </button>
      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-cover">
            <ArchiveArtwork
              imageUrl={item.imageUrl}
              title={item.title}
              variant={(item.id - 1) % 4}
            />
          </div>
          <h1>{item.title}</h1>
          <p className="detail-subtitle">
            {category?.name ?? "Saved discovery"} ·{" "}
            {new Date(item.createdAt).getFullYear()}
          </p>
          <div className="detail-actions">
            {source && (
              <a
                className="button button--primary"
                href={source}
                target="_blank"
                rel="noreferrer"
              >
                Open source ↗
              </a>
            )}
            <Button onClick={() => navigate({ page: "edit", itemId: item.id })}>
              Edit item
            </Button>
          </div>
        </div>
        <Panel className="detail-notes">
          <p className="eyebrow">Item / {String(item.id).padStart(3, "0")}</p>
          <h2>Kept for a reason.</h2>
          <p className="detail-description">
            {item.description ||
              "Some things don't need a reason. Add a note whenever you're ready."}
          </p>
          <dl>
            <dt>Vault</dt>
            <dd>{vault?.name}</dd>
            <dt>Folder</dt>
            <dd>{folder?.name ?? "Unfiled"}</dd>
            <dt>Category</dt>
            <dd>{category?.name ?? "Uncategorized"}</dd>
            <dt>Tags</dt>
            <dd className="detail-tags">
              {item.tags?.length
                ? item.tags.map((tag) => <span key={tag.id}>#{tag.name}</span>)
                : "No tags yet"}
            </dd>
          </dl>
          <div className="detail-notes__bottom">
            <p className="eyebrow">
              Saved{" "}
              {new Date(item.createdAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                archive.removeItem.reset();
                setConfirmRemove(true);
              }}
            >
              Remove from vault
            </Button>
          </div>
        </Panel>
      </div>
      {confirmRemove && (
        <Dialog
          title="Remove this item?"
          onClose={() => {
            if (!archive.removeItem.isPending) setConfirmRemove(false);
          }}
        >
          <p>“{item.title}” will be removed from your archive.</p>
          {archive.removeItem.error && (
            <Status error>{archive.removeItem.error.message}</Status>
          )}
          <div className="dialog__actions">
            <Button
              disabled={archive.removeItem.isPending}
              onClick={() => setConfirmRemove(false)}
            >
              Keep item
            </Button>
            <Button
              variant="danger"
              disabled={archive.removeItem.isPending}
              onClick={() =>
                archive.removeItem.mutate(item.id, {
                  onSuccess: () => {
                    setConfirmRemove(false);
                    navigate({ page: "collection", vaultId: item.vaultId });
                  },
                })
              }
            >
              {archive.removeItem.isPending ? "Removing..." : "Remove item"}
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
