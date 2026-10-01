import { useId, useState } from "react";

export function ArchiveArtwork({
  variant = 0,
  imageUrl,
  title = "An atmospheric corridor",
}: {
  variant?: number;
  imageUrl?: string | null;
  title?: string;
}) {
  const id = useId().replaceAll(":", "");
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const palettes = [
    ["#193f40", "#779f95", "#0c282b"],
    ["#1c3036", "#728c8c", "#10262c"],
    ["#3b4638", "#a0aa8c", "#1c2a26"],
    ["#2c3c3f", "#899d99", "#182d30"],
  ];
  const [dark, light, deep] = palettes[variant % palettes.length];
  const safeImage =
    imageUrl && /^https?:\/\//i.test(imageUrl) && failedUrl !== imageUrl;
  return (
    <div className="archive-artwork">
      {safeImage ? (
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          onError={() => setFailedUrl(imageUrl)}
        />
      ) : (
        <svg
          viewBox="0 0 600 400"
          role="img"
          aria-label={title}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id={`${id}-wall`} x1="0" x2="1" y2="1">
              <stop stopColor={dark} />
              <stop offset=".65" stopColor={light} />
              <stop offset="1" stopColor={deep} />
            </linearGradient>
            <radialGradient id={`${id}-floor`}>
              <stop stopColor={light} />
              <stop offset="1" stopColor={deep} />
            </radialGradient>
            <linearGradient id={`${id}-ceiling`} x2="0" y2="1">
              <stop stopColor={deep} />
              <stop offset="1" stopColor={light} />
            </linearGradient>
            <radialGradient id={`${id}-shade`}>
              <stop offset=".2" stopColor="#091d20" stopOpacity="0" />
              <stop offset="1" stopColor="#091d20" stopOpacity=".4" />
            </radialGradient>
          </defs>
          <path fill={`url(#${id}-ceiling)`} d="M0 0H600L330 165H270Z" />
          <path fill={`url(#${id}-wall)`} d="M0 0L270 165V280L0 400Z" />
          <path fill={`url(#${id}-wall)`} d="M600 0L330 165V280L600 400Z" />
          <path fill={`url(#${id}-floor)`} d="M0 400L270 280H330L600 400Z" />
          <path fill={deep} d="M270 165H330V282H270Z" />
          <path fill="#0c1e21" d="M281 178H319V281H281Z" />
          <path fill="#cbd6b7" d="M289 190H311V196H289Z" />
          {variant % 4 === 2 ? (
            <>
              <path
                fill={light}
                d="M180 345H420V326H195Z M210 316H390V303H222Z M240 295H360V284H248Z"
              />
              <path
                fill="#bdc9a5"
                opacity=".85"
                d="M0 40L270 170V174L0 47Z M600 40L330 170V174L600 47Z"
              />
            </>
          ) : (
            <>
              {[70, 150, 215].map((x) => (
                <g key={x} stroke={light} strokeWidth="5" opacity=".7">
                  <path d={`M${x} ${x / 2}V${400 - x / 2}`} />
                  <path d={`M${600 - x} ${x / 2}V${400 - x / 2}`} />
                </g>
              ))}
              <path
                fill="#d5ddbc"
                opacity=".85"
                d="M0 42L265 178V184L0 49Z M600 42L335 178V184L600 49Z"
              />
              {variant % 4 === 1 && (
                <path
                  fill={light}
                  opacity=".4"
                  d="M70 0H125L280 165H270Z M475 0H530L330 165H320Z"
                />
              )}
            </>
          )}
          <path fill={light} opacity=".12" d="M281 281H319L353 337H245Z" />
          <rect width="600" height="400" fill={`url(#${id}-shade)`} />
        </svg>
      )}
    </div>
  );
}
