import { ArchiveArtwork } from "./ArchiveArtwork";

export function ItemCard({
  title,
  metadata,
  imageUrl,
  variant = 0,
  onClick,
}: {
  title: string;
  metadata: string;
  imageUrl?: string | null;
  variant?: number;
  onClick: () => void;
}) {
  return (
    <button type="button" className="item-card" onClick={onClick}>
      <ArchiveArtwork title={title} imageUrl={imageUrl} variant={variant} />
      <span className="item-card__body">
        <span className="item-card__title">{title}</span>
        <span className="eyebrow">{metadata}</span>
      </span>
    </button>
  );
}
