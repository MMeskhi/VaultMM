import { useEffect, useState } from "react";
import { API_URL } from "../../../lib/api";
import { AppShell } from "../../../ui/AppShell";
import { Button } from "../../../ui/Button";
import { Dialog } from "../../../ui/Dialog";
import { Input } from "../../../ui/Field";
import { Status } from "../../../ui/Status";
import { useLogout } from "../../auth/queries";
import type { Session } from "../../auth/types";
import { navigate, useArchiveRoute } from "../navigation";
import { useArchive } from "../useArchive";
import { Collection } from "./Collection";
import { Dashboard } from "./Dashboard";
import { ItemDetail } from "./ItemDetail";
import { ItemForm } from "./ItemForm";
import { ResourceDialog } from "./ResourceDialog";

export function ArchiveWorkspace({
  session,
  preview,
}: {
  session?: Session;
  preview: boolean;
}) {
  const route = useArchiveRoute();
  const [search, setSearch] = useState("");
  const [resourceKind, setResourceKind] = useState<
    "vault" | "folder" | "category" | "tag" | null
  >(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const requestedVaultId =
    "vaultId" in route ? route.vaultId : (session?.vault.id ?? 1);
  const itemId = "itemId" in route ? route.itemId : undefined;
  const archive = useArchive(preview, session?.vault, requestedVaultId, itemId);
  const activeVaultId = archive.activeVaultId;
  const logout = useLogout();
  const item =
    "itemId" in route
      ? archive.items.find((item) => item.id === route.itemId)
      : undefined;
  const vault = archive.vaults.find((vault) => vault.id === activeVaultId);
  const resetSave = archive.saveItem.reset;
  useEffect(() => {
    resetSave();
  }, [route.page, itemId, resetSave]);

  function openResource(kind: "vault" | "folder" | "category" | "tag") {
    archive.addResource.reset();
    setResourceKind(kind);
  }
  const nav = (
    <>
      <p className="eyebrow nav-caption">Personal archive</p>
      <Input
        label="Search your archive"
        type="search"
        placeholder="Search anything..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <a
        href="#home"
        className={`nav-link ${route.page === "dashboard" ? "nav-link--active" : ""}`}
        aria-current={route.page === "dashboard" ? "page" : undefined}
      >
        All vaults
      </a>
      <a
        href="#recent"
        className={`nav-link ${route.page === "recent" ? "nav-link--active" : ""}`}
        aria-current={route.page === "recent" ? "page" : undefined}
      >
        Recently added
      </a>
      <div className="nav-divider" />
      <p className="eyebrow nav-caption">Your vaults</p>
      {archive.vaults.map((entry) => (
        <a
          key={entry.id}
          href={`#vault/${entry.id}`}
          className={`nav-link ${route.page !== "dashboard" && route.page !== "recent" && entry.id === activeVaultId ? "nav-link--active" : ""}`}
          aria-current={
            route.page === "collection" && entry.id === activeVaultId
              ? "page"
              : undefined
          }
        >
          {entry.name}
        </a>
      ))}
      <Button
        className="new-vault"
        variant="ghost"
        size="sm"
        onClick={() => openResource("vault")}
      >
        + New vault
      </Button>
    </>
  );
  const footer = preview ? (
    <>
      <p className="sidebar__name">A little space of your own.</p>
      <a className="account-link" href={`${API_URL}/api/auth/google`}>
        Sign in with Google ↗
      </a>
    </>
  ) : (
    <>
      <p className="sidebar__name">
        {session?.user.displayName || session?.user.email}
      </p>
      <button
        className="account-link"
        onClick={() => {
          logout.reset();
          setAccountOpen(true);
        }}
      >
        Account settings ↗
      </button>
    </>
  );
  const breadcrumb = (
    <>
      <a href="#home">My space</a>
      <span>/</span>
      <span>
        {route.page === "dashboard"
          ? "All vaults"
          : route.page === "recent"
            ? "Recently added"
            : (vault?.name ?? "Your vault")}
      </span>
    </>
  );
  const actions = (
    <>
      {preview && <span className="topbar-preview">Design preview</span>}
      <Button
        variant="primary"
        size="sm"
        disabled={!vault}
        onClick={() => vault && navigate({ page: "create", vaultId: vault.id })}
      >
        + Save item
      </Button>
    </>
  );
  const detailsReady =
    item && item.vaultId === activeVaultId && !archive.metadataLoading;
  return (
    <AppShell
      navigation={nav}
      footer={footer}
      breadcrumb={breadcrumb}
      actions={actions}
      preview={preview}
    >
      {archive.errors.length > 0 && (
        <Status error>
          <span>{[...new Set(archive.errors)].join(" · ")}</span>
          <Button size="sm" onClick={() => void archive.refresh()}>
            Try again
          </Button>
        </Status>
      )}
      {archive.loading && <Status>Opening your archive...</Status>}
      {route.page === "dashboard" && (
        <Dashboard archive={archive} search={search} />
      )}
      {(route.page === "collection" || route.page === "recent") &&
        (vault || route.page === "recent" ? (
          <Collection
            key={route.page === "recent" ? "recent" : activeVaultId}
            archive={archive}
            vault={vault}
            search={search}
            recent={route.page === "recent"}
            onNewFolder={() => openResource("folder")}
          />
        ) : (
          !archive.loading && (
            <Status>
              This vault isn't available.{" "}
              <a href="#home">Return to your archive.</a>
            </Status>
          )
        ))}
      {route.page === "detail" &&
        (detailsReady ? (
          <ItemDetail key={item.id} item={item} archive={archive} />
        ) : !archive.loading && !item ? (
          <Status>
            This item isn't available.{" "}
            <a href="#home">Return to your archive.</a>
          </Status>
        ) : (
          <Status>Loading item details...</Status>
        ))}
      {(route.page === "create" || route.page === "edit") &&
        ((route.page === "create" && vault) ||
        (route.page === "edit" && detailsReady) ? (
          <ItemForm
            key={route.page === "edit" ? item?.id : `new-${activeVaultId}`}
            archive={archive}
            vaultId={activeVaultId}
            item={route.page === "edit" ? item : undefined}
            onResource={openResource}
          />
        ) : (
          !archive.loading && (
            <Status>
              This item or vault isn't available.{" "}
              <a href="#home">Return to your archive.</a>
            </Status>
          )
        ))}
      {resourceKind && (
        <ResourceDialog
          kind={resourceKind}
          vaultId={activeVaultId}
          archive={archive}
          onClose={() => setResourceKind(null)}
          onCreated={
            resourceKind === "vault"
              ? (id) => navigate({ page: "collection", vaultId: id })
              : undefined
          }
        />
      )}
      {accountOpen && (
        <Dialog
          title="Your private archive."
          onClose={() => setAccountOpen(false)}
        >
          <p>Signed in as {session?.user.email}</p>
          <p>Your vaults and saved items belong to this account.</p>
          {logout.error && <Status error>{logout.error.message}</Status>}
          <div className="dialog__actions">
            <Button onClick={() => setAccountOpen(false)}>Close</Button>
            <Button
              variant="primary"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              {logout.isPending ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </Dialog>
      )}
    </AppShell>
  );
}
