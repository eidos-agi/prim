# prim.workbook (emerging)

Authority: `workbook.json`. Compose worksheets; don’t merge.

- Sheets: Alex (`expected`, frozen) + SQL (`actuals`, views from metric receipts / connectors)
- Atoms: `worksheet`, `measure`, `metric` (emerging types; may embed under `worksheets/`, `measures/`, `metrics/` until standalone repos)
- Connectors: Prim Tools (`warehouse`, `supabase`) — not pack types
- Surface: `workbook-editor` (cites `workbook`); `prim-viewer` hosts once registered

Profile home: `primfoundation/prim.workbook`. SPEC: INTENTION.md + SPEC.md there. Seed: `examples/cerebro-metrics/`.

Near-misses (not this): ODWF (proof pack), Cerebro `/metrics`, website grid code.
