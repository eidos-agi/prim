# prim (TypeScript)

Category-level Prim SDK. Node stdlib + `zip` / `unzip` / `tar`. No npm runtime deps.

This is the Prim kernel. Profiles register a validator and a view on top. They do not re-parse archives or faces.

## Use

```ts
import { openPrim } from "@eidos-agi/prim";

const p = openPrim("ford-group.prim.zip");
p.profile; // 'ocsf'
p.viewKey; // 'ocsf/entity_structure'
p.authorityPaths();
p.constraintPaths();
p.trust(); // 'human' | 'job' | 'agent'
p.validate();
p.write("ford-group.prim.tar.gz");
```

```bash
node --experimental-strip-types sdk/typescript/src/cli.ts open <pack>
node --experimental-strip-types sdk/typescript/src/cli.ts validate <pack>
node --experimental-strip-types sdk/typescript/tests/pack.test.ts
```

## API

| Call | Does |
|---|---|
| `openPrim(source)` | Directory pack or `.prim.zip` / `.prim` / `.prim.tar.gz` |
| `Pack.face` | Parsed `index.md` frontmatter |
| `Pack.viewKey` | `profile/subtype` or `profile/type` |
| `Pack.validate()` | Category gates + registered profile validator |
| `Pack.validateBase()` | Shared SPEC §4 gates only |
| `registerView` / `resolveView` | Prim UI dispatch |
| `registerValidator` / `validate` | Profile validators plug in here |
| `PRIMITIVES` / `primitive(name)` | The nine category primitives |

`validateBase()` checks `okf_version` / `profile` / `type`, recommends `log.md`, resolves face path pointers, checks `compose:` targets, and rejects secret-shaped strings.
