# VaultMM � Soft Archive

A private archive for films, sounds, worlds, and small discoveries. Built with
React, strict TypeScript, Vite, Tailwind CSS, and TanStack Query.

## Run locally

Run `npm install` and `npm run dev`. The API defaults to
`https://localhost:7213`. Copy `.env.example` to `.env.local` to set a different
`VITE_API_URL`, then restart Vite. The backend must allow credentialed requests
from the client origin, and its HTTPS certificate must be trusted locally.
Restart the backend after updating its controllers.

Visit `http://localhost:5173/?preview=1` to explore the design without the backend
or Google sign-in. Preview is clearly labeled, uses sample data, and keeps changes
in memory for the current visit. Normal signed-in mode uses your real archive.
Signed-out users can explore the preview and sign in through the sidebar.

## Screens and interactions

- Dashboard: vault overview, featured collection, recently saved items, global search.
- Collection: folder and tag filters, search, grid/list display, responsive item cards.
- Item details: cover, notes, metadata, source link, edit and confirmed removal.
- Save/edit: title, source link, notes, folder, category, tags, cover URL, live preview.
- Vaults, folders, categories, and tags can be created in dialogs.
- Mobile: two-column collections, navigation drawer, and a save action.

Hash URLs support direct links and browser back/forward navigation. Artwork is
original SVG corridor illustration inspired by the supplied reference; image URLs
replace the fallback illustrations. The screenshot was used as the visual reference,
so exact Figma fonts, tokens, and original assets are not available.

## Structure

- `src/app`: application entry, providers, and interaction tests.
- `src/ui`: shared shell, buttons, fields, panels, dialogs, tags, headings, status messages, artwork, and item cards.
- `src/features/auth`: session requests, types, and query hooks.
- `src/features/vault`: archive requests, types, data hooks, demo data, navigation, and feature screens.
- `src/lib`: shared HTTP and Query clients.
- `src/index.css`: design tokens, global styles, and responsive layout.

Keep domain-specific screens in their feature folder and reusable UI in `src/ui`.
UI primitives accept data and callbacks and do not fetch data themselves.

## Data

Query keys include vault IDs. Creating, editing, or removing data invalidates the
archive queries. Mutations and HTTP client errors are not retried automatically.
Logout cancels pending queries and removes cached archive data. Metadata saves are
atomic on the server. Vault ownership is enforced for folders, categories, and tags.
Source and cover links accept only HTTP or HTTPS URLs.

The backend now lists the user's vaults and persists the form's cover, source,
folder, category, and tags. Item responses exclude EF navigation properties to
avoid circular JSON serialization when tags are assigned. No schema migration is
needed: these relationships and fields already existed.

## Checks

- `npm run build`: strict TypeScript checking and production build.
- `npm run lint`: Oxlint.
- `npm run test`: DOM interaction tests and API contract tests.
- `npm run preview`: serve the production build locally.
