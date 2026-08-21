# Prim SDK

Reference implementation of the **category-level** Prim conventions: open a pack, read its face, check the shared gates, write an interchange archive.

The kernel is TypeScript. Profiles (OCSF, OMF, OPAF, OBF, …) live in their own repositories and register a validator + view on top. Nothing profile-specific belongs here.

The category player is a separate package: [`@eidos-agi/prim-viewer`](../tools/prim-viewer) — `<showprim>` plus React and Next components. It is a Prim Tool, not the kernel.

| Package | Path | Status |
|---|---|---|
| `@eidos-agi/prim` | [`typescript/`](typescript) | **kernel** — v0.4.2, no npm runtime deps |
| `@eidos-agi/prim-viewer` | [`../tools/prim-viewer/`](../tools/prim-viewer) | **player** — `<ShowPrim filename="yadda.prim" />` |

## Why this exists

Every profile repo was re-implementing the same three things: frontmatter parsing, pack loading, and archive handling. Three copies of a bug is three fixes.

## TypeScript

```ts
import { openPrim } from "@eidos-agi/prim";

const p = openPrim("ford-group.prim.zip");
p.profile; // 'ocsf'
p.viewKey; // 'ocsf/entity_structure'
p.authorityPaths();
p.trust();
p.validate();
p.write("ford-group.prim.tar.gz");
```

```bash
node --experimental-strip-types sdk/typescript/tests/pack.test.ts
node --experimental-strip-types sdk/typescript/src/cli.ts open <pack>
node --experimental-strip-types sdk/typescript/src/cli.ts validate <pack>
```

## Player (React / Next)

```tsx
import { ShowPrim } from "@eidos-agi/prim-viewer/next";

<ShowPrim filename="yadda.prim" />
```

See [`tools/prim-viewer/`](../tools/prim-viewer).
