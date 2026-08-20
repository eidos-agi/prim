# prim (TypeScript)

Category-level Prim SDK. Node stdlib + `zip` / `unzip` / `tar`. No npm runtime deps.

This is the Prim kernel for **OKF-shaped** packs. Profiles register a validator and a view on top. They do not re-parse archives or faces. A Prim does not have to be OKF; this SDK implements the pack grammar that many current profiles use.

## Use

```ts
import { openPrim } from "@eidos-agi/prim";

const p = openPrim("house.opff.prim");
p.title; // 'Harbor House'
p.pair(); // { surface: opff-editor, … }
p.jsonl("accounts.jsonl");
p.files(); // pack-relative paths
p.close(); // drop extracted zip tmp

const mem = openPrim({ files: { "index.md": face, "log.md": log } });
```

```bash
node --experimental-strip-types sdk/typescript/src/cli.ts open <pack>
node --experimental-strip-types sdk/typescript/src/cli.ts tools <pack>
node --experimental-strip-types sdk/typescript/src/cli.ts validate <pack>
node --experimental-strip-types sdk/typescript/src/cli.ts registry
node --experimental-strip-types sdk/typescript/tests/pack.test.ts
```

## API

| Call | Does |
|---|---|
| `openPrim(source)` | Directory, `.prim.zip` / `.prim.tar.gz`, or `{ files }` map |
| `Pack.face` / `Pack.title` | Parsed `index.md` frontmatter |
| `Pack.viewKey` | `profile/subtype` or `profile/type` |
| `Pack.pair()` / `tools()` / `surface()` / `connector()` | Registry pairing. Harbor House → `opff-editor` (as `ledger`). |
| `Pack.files()` / `read` / `jsonl` | Pack-relative paths. `read` refuses `..`. |
| `Pack.close()` | Delete extracted / materialized tmp |
| `Pack.validate()` | Category gates + registered profile validator |
| `Pack.validateBase()` | Shared SPEC §4 gates only |
| `registerView` / `resolveView` | Prim UI dispatch (`ui` — how a Prim opens) |
| `registerValidator` / `validate` | Profile validators plug in here |
| `PRIMITIVES` / `primitive(name)` | The nine category primitives |
| `createTool` / `TOOL_KINDS` | Prim Tools: `surface` or `connector`; `emit` / `talk` / `receive`. Optional `as` / `bin` / `repo`. Not a tenth primitive. |
| `listTypes` / `listTools` / `registerType` / `registerTool` | Category registry. Types are prim kinds. Tools cite a type. |

`validateBase()` checks `okf_version` / `profile` / `type`, recommends `log.md`, resolves face path pointers, checks `compose:` targets, and rejects secret-shaped strings.
