# Prim registry

Three lists: **types** (kinds of Prim), **tools** (operators that cite a type), and **applets** (compositions that cite types, and may cite tools).

Applets are not a tool kind. Tools stay `surface` or `connector`. An applet is a product that composes prims; it is not `kind: "applet"` and not a `prim.applet` type.

Source of truth: [`registry.json`](./registry.json).

```bash
prim registry
prim registry types
prim registry tools
prim registry applets
prim registry tools citing opff
prim registry type docket
prim registry tool docket-editor
prim registry tool opff-editor
prim registry applet pavo
```

`docket-editor` is the first registered Prim Tool (surface / talk, as editor, cites `docket`). The binary is `docket-prim`.

`opff-editor` is the household-ledger surface (surface / talk, as ledger, cites `opff`). The pack is the file; the charts cite it. Hosted today on prim-web.

`omf-editor` is the meeting-occurrence surface (surface / talk, as editor, cites `omf`). Invite, record, and outcome stay unmixed.

Emerging file+editor pairings: `deck-editor`, `invoice-editor`, `session-editor`. `session` is not OSF.

First connector: `docket-webmcp` (connector / talk, as webmcp, cites `docket`). Validates the file. Does not feed contents to a model unless you expose it.

`prim-arcade` is a surface tool on an `arcade` prim. The cart is the file. JSNES embeds in chat.

`album-player` is a surface tool on an `album` prim. The record is the file. Not slides (`prim.deck`). Do not mint `prim.track`.

`prim-viewer` is the category player (surface / talk, as viewer, cites `*`). Drop a `.prim` or write `<show-prim filename="yadda.prim">`. React/Next: `npm i @eidos-agi/prim-viewer` then `<ShowPrim filename="yadda.prim" />`. It is Flash for prims. Source: [`tools/prim-viewer/`](../tools/prim-viewer/). Profile editors stay the operators on their types.

`prim-viewer-webmcp` is the category connector on that player (connector / talk, as webmcp, cites `*`). The tag registers WebMCP tools (`prim-status`, `prim-open`, `prim-tab`, `prim-files`, `prim-face`, `prim-read`) so a model talks to the open prim instead of scraping the page. The pack stays the file.

`log` is the category primitive as a store. `log-editor` opens the file. `prim-sim` is the Mac surface that simulates other tools and writes that log prim.

`emf-editor`, `orf-editor`, `opf-editor`, `odwf-editor`, `ocsf-editor`, `osf-editor`, and `obf-editor` are hosted on prim-web. Brand kits (`prim.brand`) open in `prim-viewer`; there is no `brand-editor` yet. OSF is not the thin `session` file. OBF pages live in `book.json`.

`pavo` is the first registered applet. It cites the `opf` type. Its surface is not a dangling tools cite.

A type is not a tool. A tool is not a `prim.surface` pack. An applet is not a tool kind.
