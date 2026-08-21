# Prim registry

Two lists: **types** (kinds of Prim) and **tools** (operators that cite a type).

Source of truth: [`registry.json`](./registry.json).

```bash
prim registry
prim registry types
prim registry tools
prim registry tools citing opff
prim registry tool docket-editor
prim registry tool opff-editor
```

`docket-editor` is the first registered Prim Tool (surface / talk, as editor, cites `docket`). The binary is `docket-prim`.

`opff-editor` is the household-ledger surface (surface / talk, as ledger, cites `opff`). The pack is the file; the charts cite it. Hosted today on prim-web.

`omf-editor` is the meeting-occurrence surface (surface / talk, as editor, cites `omf`). Invite, record, and outcome stay unmixed.

Emerging file+editor pairings: `deck-editor`, `invoice-editor`, `session-editor`. `session` is not OSF.

First connector: `docket-webmcp` (connector / talk, as webmcp, cites `docket`). Validates the file. Does not feed contents to a model unless you expose it.

`prim-arcade` is a surface tool on an `arcade` prim. The cart is the file. JSNES embeds in chat.

`prim-viewer` is the category player (surface / talk, as viewer, cites `*`). Drop a `.prim` or write `<show-prim filename="yadda.prim">`. React/Next: `npm i @eidos-agi/prim-viewer` then `<ShowPrim filename="yadda.prim" />`. It is Flash for prims. Source: [`tools/prim-viewer/`](../tools/prim-viewer/). Profile editors stay the operators on their types.

`prim-viewer-webmcp` is the category connector on that player (connector / talk, as webmcp, cites `*`). The tag registers WebMCP tools (`prim-status`, `prim-open`, `prim-tab`, `prim-files`, `prim-face`, `prim-read`) so a model talks to the open prim instead of scraping the page. The pack stays the file.

`log` is the category primitive as a store. `log-editor` opens the file. `prim-sim` is the Mac surface that simulates other tools and writes that log prim.

`emf-editor`, `orf-editor`, `opf-editor`, `odwf-editor`, `ocsf-editor`, `obif-editor`, `osf-editor`, and `obf-editor` are hosted on prim-web. OSF is not the thin `session` file. OBF pages live in `book.json`.

A type is not a tool. A tool is not a `prim.surface` pack.
