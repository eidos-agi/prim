# Prim registry

Two lists: **types** (kinds of Prim) and **tools** (operators that cite a type).

Source of truth: [`registry.json`](./registry.json).

```bash
prim registry
prim registry types
prim registry tools
prim registry tool docket-editor
```

`docket-editor` is the first registered Prim Tool (surface / talk, as editor, cites `docket`). The binary is `docket-prim`.

Emerging file+editor pairings: `deck-editor`, `invoice-editor`, `session-editor`. `session` is not OSF.

First connector: `docket-webmcp` (connector / talk, as webmcp, cites `docket`). Validates the file. Does not feed contents to a model unless you expose it.

`prim-arcade` is a surface tool on an `arcade` prim. The cart is the file. JSNES embeds in chat.

A type is not a tool. A tool is not a `prim.surface` pack.
