# Prim

**The primitive unit of knowledge and memory for AI.**

Prims are AI-native files.

They are structured, evidence-backed, versionable packs of knowledge that both agents and humans can trust. Traditional documents (Excel, Word, PDFs, decks) become projections — views generated on demand from the Prim.

> “Send me the prim.”

That should feel as natural as “send me the link” or “drop the JSON.”

**New here?** Read [WHAT-IS-PRIM.md](./WHAT-IS-PRIM.md) — the complete explanation and how to talk about it.

## Why Prim exists

Most knowledge today lives in application-specific files:

- Spreadsheets for structure
- Documents for narrative
- Decks for presentation
- Notes for memory

None of these were designed for agents. They require constant translation, re-interpretation, and re-derivation.

**Prims invert this.**

The structured, validated, evidence-backed knowledge *is* the file. Interfaces are generated on the fly. Pure data formats (images, Parquet, etc.) remain specialized. Everything else can become a view of a Prim.

## Core properties

- **AI-native** — agents can read, validate, reason over, and act on them without translation layers
- **Memory** — durable, versioned, supersedable knowledge that persists across sessions and agents
- **Evidence-first** — claims carry provenance, trust tiers, and hashes
- **Human-readable** — still openable and understandable by people
- **Generative interfaces** — no fixed UX; views are rendered on demand (json-render style)

## Packaging

| Form | Role |
|------|------|
| **Directory pack** | Canonical source of truth (git, editing, validation) |
| **`.prim.zip`** | Primary interchange — “send me the prim” |
| **`.prim.tar.gz`** | Allowed, Unix/agent-friendly |
| **`.prim`** | Reserved branded container (zip-compatible) |

A `.prim.zip` or `.prim` is simply a zip whose root is a valid Prim pack.  
See [SPEC.md §5](./SPEC.md) for the full packaging rules.

## Naming

| Pattern | Role |
|---------|------|
| **`prim`** | This repo — category home |
| **`prim.<profile>`** | Domain profile (spec + validator + examples) |
| **`prim-web`** | Public web surface |

Examples: `prim.ocsf`, `prim.obif`, `prim.osf`, `prim.orf`.

## The Prim family

| Repo | Domain |
|------|--------|
| [prim](https://github.com/eidos-agi/prim) | Category identity (this repo) |
| [prim-web](https://github.com/eidos-agi/prim-web) | Public surface / views |
| [prim.emf](https://github.com/eidos-agi/prim.emf) | Human intent + durable memory |
| [prim.orf](https://github.com/eidos-agi/prim.orf) | Research / investigation |
| [prim.opf](https://github.com/eidos-agi/prim.opf) | Product graph |
| [prim.odwf](https://github.com/eidos-agi/prim.odwf) | Spreadsheet → bronze proof |
| [prim.opff](https://github.com/eidos-agi/prim.opff) | Personal finance |
| [prim.omf](https://github.com/eidos-agi/prim.omf) | Meeting occurrences |
| [prim.ocsf](https://github.com/eidos-agi/prim.ocsf) | Corporate structure & capital |
| [prim.obif](https://github.com/eidos-agi/prim.obif) | Brand & identity |
| [prim.osf](https://github.com/eidos-agi/prim.osf) | Open Session Format |

OKF provides the grammar ([okflify](https://github.com/eidos-agi/okflify)).  
**Prim** is what people call the thing.

See [FAMILY.md](./FAMILY.md) for composition rules and how to talk about profiles.

## Language

- “Send me the prim.”
- “Is that the latest prim?”
- “Don’t send the spreadsheet — just send the prim.”
- “The prim is the source of truth. The deck is just a view.”
- “Brand prim” / `prim.obif` when you need the profile.

Full communication guide: [WHAT-IS-PRIM.md](./WHAT-IS-PRIM.md).

## Documents in this repo

| File | Purpose |
|------|---------|
| [WHAT-IS-PRIM.md](./WHAT-IS-PRIM.md) | **Start here** — complete public explanation and how to talk about it |
| [INTENTION.md](./INTENTION.md) | North-star design commitments |
| [SPEC.md](./SPEC.md) | Category specification (what makes a Prim) |
| [FAMILY.md](./FAMILY.md) | Map of `prim.*` profiles |
| [BRAND.md](./BRAND.md) | Identity, language, and positioning |
| [examples/](./examples/) | Illustrative packs and references |

## Status

Early. This repository is the home for the Prim identity, intention, category specification, and family map.

Domain profiles live in `prim.<name>` repositories and remain additive OKF profiles. Prim is the name of the category they all belong to.

## License

MIT — Eidos AGI
