# prim-viewer

A surface for a Prim. Drop a `.prim` (or point `filename=` at one) and it renders.

This is the Flash player. The pack is the file. The player is not.

Registered as **prim-viewer**: kind `surface`, direction `talk`, cites `*` (any type), as `viewer`. Repo: this one (`eidos-agi/prim`).

Unknown profiles fall back to the face (SPEC §9). OBIF projects a brand board from `identity.json`. Profile editors stay the operators on their types. This tool opens the file.

The tag is the pairing. Hosting it on a site does not make the site a Prim.

## WebMCP

The same tag is the connector. When `<show-prim>` is on a page it registers tools on `navigator.modelContext` (or `document.modelContext`). A model talks to the open prim. It does not scrape the page.

Registered as **prim-viewer-webmcp**: kind `connector`, direction `talk`, cites `*`, as `webmcp`.

| Tool | Does |
|---|---|
| `prim-status` | filename, kind, title, tab, tabs, files |
| `prim-open` | `{ src }` — load a pack |
| `prim-tab` | `{ tab }` — switch the view |
| `prim-files` | pack-relative names |
| `prim-face` | title, profile, type, body |
| `prim-read` | `{ path }` — text file from the pack. Refuses secrets. |

`webmcp="0"` on the tag turns the connector off. Native WebMCP is origin-trial / Chrome flag; without it the tools still land on `globalThis.modelContext` so a bridge can call them.

## HTML

```html
<script type="module" src="showprim.js"></script>
<show-prim filename="yadda.prim"></show-prim>
```

Also: `<show-prim src="/brand/daniel-shanklin.prim.zip">`. The hyphen is required (custom elements). The React component is still `ShowPrim`.

From a CDN: `https://cdn.jsdelivr.net/gh/eidos-agi/prim@main/tools/prim-viewer/showprim.js`

## React

```bash
npm i @eidos-agi/prim-viewer
```

```tsx
import { ShowPrim } from "@eidos-agi/prim-viewer/react";

<ShowPrim filename="yadda.prim" />
```

Use this from any client-side React tree (Vite, SPA, client components).

## Next.js

```tsx
import { ShowPrim } from "@eidos-agi/prim-viewer/next";

export default function Page() {
  return <ShowPrim filename="yadda.prim" />;
}
```

`next` is the same component with `"use client"`, so an App Router server page can import it and the player still boots in the client bundle. Two lines. No copy of `showprim.js` into `public/`.

```tsx
<ShowPrim src="/packs/house.opff.prim.zip" filename="house.opff.prim" />
<ShowPrim filename="yadda.prim" chrome={false} />
```

`src` and `filename` both load a pack. `chrome={false}` hides the bar.

Until the package is on npm, from a clone of this repo:

```bash
npm i ./tools/prim-viewer
```

## Package

`@eidos-agi/prim-viewer`

| Import | What |
|---|---|
| `@eidos-agi/prim-viewer` | Defines the `<show-prim>` element. No React. |
| `@eidos-agi/prim-viewer/react` | `<ShowPrim />` for React 18+ |
| `@eidos-agi/prim-viewer/next` | Same, `"use client"` for Next App Router |
| `@eidos-agi/prim-viewer/webmcp` | Connector helpers (`prim-status`, `prim-open`, …) |

No runtime deps. `react` is a peer (optional if you only use the tag).
