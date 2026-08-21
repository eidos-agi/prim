# prim-viewer

A surface for a Prim. Drop a `.prim` (or point `filename=` at one) and it renders.

This is the Flash player. The pack is the file. The player is not.

Registered as **prim-viewer**: kind `surface`, direction `talk`, cites `*` (any type), as `viewer`. Repo: this one (`eidos-agi/prim`).

Unknown profiles fall back to the face (SPEC §9). OBIF projects a brand board from `identity.json`. Profile editors stay the operators on their types. This tool opens the file.

The tag is the pairing. Hosting it on a site does not make the site a Prim.

## HTML

```html
<script type="module" src="showprim.js"></script>
<showprim filename="yadda.prim"></showprim>
```

Also: `<showprim src="/brand/daniel-shanklin.prim.zip">`.

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
| `@eidos-agi/prim-viewer` | Defines the `<showprim>` element. No React. |
| `@eidos-agi/prim-viewer/react` | `<ShowPrim />` for React 18+ |
| `@eidos-agi/prim-viewer/next` | Same, `"use client"` for Next App Router |

No runtime deps. `react` is a peer (optional if you only use the tag).
