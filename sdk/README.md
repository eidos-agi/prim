# Prim SDK

Reference implementation of the **category-level** Prim conventions: open a pack, read its face, check the shared gates, write an interchange archive.

The kernel is TypeScript. Profiles (OCSF, OMF, OPAF, OBF, …) live in their own repositories and register a validator + view on top. Nothing profile-specific belongs here.

| Language | Path | Status |
|---|---|---|
| TypeScript | [`typescript/`](typescript) | **kernel** — v0.2.0, no npm runtime deps |

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
