import { ArchiveArtwork } from "../../../ui/ArchiveArtwork";
import { PageHeading } from "../../../ui/PageHeading";
import { Panel } from "../../../ui/Panel";
import { navigate } from "../navigation";
import type { Archive } from "../useArchive";

export function Dashboard({
  archive,
  search,
}: {
  archive: Archive;
  search: string;
}) {
  const filteredVaults = archive.vaults.filter((vault) =>
    `${vault.name} ${vault.description ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const recent = [...archive.items]
    .filter((item) =>
      `${item.title} ${item.description ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 4);
  const featured =
    archive.items.find((item) => item.folderId !== null) ?? archive.items[0];
  const featuredVault =
    archive.vaults.find((vault) => vault.id === featured?.vaultId) ??
    archive.vaults[0];
  return (
    <>
      <PageHeading
        title="A space for what stays."
        subtitle="Films, sounds, worlds, and small discoveries. All in one place."
      />
      <section className="feature-banner" aria-label="Featured collection">
        <ArchiveArtwork
          imageUrl={featured?.imageUrl}
          variant={0}
          title="Quiet light at the end of a corridor"
        />
        <Panel className="feature-banner__panel">
          <p className="eyebrow">For your archive / 001</p>
          <h2>After hours</h2>
          <p>
            A place for the things that linger.
            <br />A collection from the hours between.
          </p>
          <button
            className="button button--glass"
            disabled={!featuredVault}
            onClick={() =>
              featuredVault &&
              navigate({ page: "collection", vaultId: featuredVault.id })
            }
          >
            Open collection <span>↗</span>
          </button>
        </Panel>
      </section>
      <section className="dashboard-section" aria-labelledby="your-vaults">
        <div className="section-heading">
          <h2 id="your-vaults">Your vaults</h2>
          <span className="eyebrow">
            {String(filteredVaults.length).padStart(2, "0")} spaces
          </span>
        </div>
        <div className="vault-grid">
          {filteredVaults.map((vault) => (
            <button
              className="vault-card panel"
              key={vault.id}
              onClick={() =>
                navigate({ page: "collection", vaultId: vault.id })
              }
            >
              <span className="vault-card__heading">
                <span>{vault.name}</span>
                <span className="eyebrow">
                  {
                    archive.items.filter((item) => item.vaultId === vault.id)
                      .length
                  }
                </span>
              </span>
              <span className="vault-card__description">
                {vault.description || "A space for your discoveries."}
              </span>
              <span className="eyebrow">Open vault ↗</span>
            </button>
          ))}
        </div>
        {!filteredVaults.length && (
          <p className="empty-state">No vaults match your search.</p>
        )}
      </section>
      <section className="dashboard-section" aria-labelledby="recently-saved">
        <div className="section-heading">
          <h2 id="recently-saved">Recently saved</h2>
          <button
            className="text-link"
            onClick={() => navigate({ page: "recent" })}
          >
            View all ↗
          </button>
        </div>
        <div className="recent-items">
          {recent.map((item, index) => (
            <button
              key={item.id}
              className="recent-item"
              onClick={() => navigate({ page: "detail", itemId: item.id })}
            >
              <span className="recent-item__art">
                <ArchiveArtwork
                  imageUrl={item.imageUrl}
                  title={item.title}
                  variant={index}
                />
              </span>
              <span className="recent-item__title">{item.title}</span>
              <span className="eyebrow recent-item__vault">
                {
                  archive.vaults.find((vault) => vault.id === item.vaultId)
                    ?.name
                }
              </span>
              <span className="eyebrow recent-item__date">
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        {!recent.length && (
          <p className="empty-state">
            Nothing saved here yet. Start with something you want to keep.
          </p>
        )}
      </section>
    </>
  );
}
