# Prim

**The primitive unit of knowledge and memory for AI.**

Prims are AI-native files.

They are structured, evidence-backed, versionable packs of knowledge that both agents and humans can trust. Traditional documents (Excel, Word, PDFs, decks) become projections — views generated on demand from the Prim.

> “Send me the prim.”

That should feel as natural as “send me the link” or “drop the JSON.”

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

## The Prim family

Prim is the product identity and category name.

Under the hood, Prims are built on the Open Knowledge Format (OKF) family of additive profiles developed by Eidos:

| Profile | Domain | Repo |
|---------|--------|------|
| **OKF** | Base knowledge + trust model | [okflify](https://github.com/eidos-agi/okflify) |
| **EMF** | Human intent + durable memory | [emf](https://github.com/eidos-agi/emf) |
| **ORF** | Research / investigation packs | [orf](https://github.com/eidos-agi/orf) |
| **OPF** | Product graph | [opf](https://github.com/eidos-agi/opf) |
| **ODFW** | Spreadsheet → bronze proof | [odwf](https://github.com/eidos-agi/odwf) |
| **OPFF** | Personal finance packs | [opff](https://github.com/eidos-agi/opff) |
| **OMF** | Meeting occurrences | [omf](https://github.com/eidos-agi/omf) |
| **OCSF** | Corporate structure & capital | [ocsf](https://github.com/eidos-agi/ocsf) |

OKF provides the grammar.  
Prim is what people call the thing.

See [FAMILY.md](./FAMILY.md) for the full map and composition rules.

## Language

- “Send me the prim.”
- “Is that the latest prim?”
- “Don’t send the spreadsheet — just send the prim.”
- “The prim is the source of truth. The deck is just a view.”

## Documents in this repo

| File | Purpose |
|------|---------|
| [INTENTION.md](./INTENTION.md) | North-star design commitments |
| [SPEC.md](./SPEC.md) | Category specification (what makes a Prim) |
| [FAMILY.md](./FAMILY.md) | Map of OKF profiles under Prim |
| [BRAND.md](./BRAND.md) | Identity, language, and positioning |
| [examples/](./examples/) | Illustrative packs and references |

## Status

Early. This repository is the home for the Prim identity, intention, category specification, and family map.

Domain profiles (ORF, OCSF, etc.) live in their own repositories and remain additive OKF profiles. Prim is the name of the category they all belong to.

## License

MIT — Eidos AGI
