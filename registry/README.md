# Prim registry

Two lists: **types** (kinds of Prim) and **tools** (operators that cite a type).

Source of truth: [`registry.json`](./registry.json).

```bash
prim registry
prim registry types
prim registry tools
prim registry tool docket-prim
```

`docket-prim` is the first registered Prim Tool (surface / talk, cites `docket`).

A type is not a tool. A tool is not a `prim.surface` pack.
