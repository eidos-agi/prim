# Prim — What It Is and How to Talk About It

A complete reference for understanding Prims and communicating the idea clearly.

The category has two nouns: **Prims** and **Prim Tools**.

---

## 1. What a Prim is

A **Prim** is the file that stores the information. A **Prim Tool** is how you interact with it. That is the whole split.

- Agents and humans use the **same store** — no scraping a sheet or a deck to recover meaning
- The file **outlives a session**
- Traditional files (Excel, Word, PDFs, decks) are optional **views**, not the store
- Interfaces are generated or operated on demand (`ui` opens; a tool cites)
- It stays human-inspectable

It does not have to be an OKF pack. OKF is one grammar. Prim can evolve without it.

**One-line definition**

> The Prim is the source of truth. Everything else is a view.

**Everyday definition**

> The file you store the information in, and the tool you use on it. You don’t send the spreadsheet — you send the prim.

Pronunciation: /prɪm/ (same as the English adjective “prim”).

---

## 2. Why Prims exist

Most important knowledge today lives in application-specific files:

- Spreadsheets for structure and numbers
- Documents for narrative and decisions
- Decks for presentation
- Notes for memory

None of these were designed for agents. Agents are forced to reverse-engineer meaning, re-derive facts, and re-interpret context every time. Humans maintain multiple copies that drift out of sync.

**Prims invert the relationship.**

1. The structured store *is* the file.
2. Both agents and humans treat that file as the source of truth.
3. Interfaces are generated or operated on demand from it.
4. OKF is optional. Pure data formats stay specialized. Everything else can become a view.

Once this is understood, the sentence becomes obvious:

> “Don’t send me the spreadsheet. Send me the prim.”

---

## 3. Core properties (non-negotiable)

| Property | Meaning |
|----------|---------|
| **Store + interact** | The file stores. A surface or connector cites it and does work. |
| **AI-native** | Agents open the store using the profile — no scraping a presentation format. |
| **Durable** | Outlives a session. |
| **No fixed UX** | `ui` opens; a Prim Tool operates. Neither is the file. |
| **Human-inspectable** | Opacity is not a goal. |
| **Additive profiles** | New domains are `prim.<name>`. They do not have to be OKF. |
| **Evidence / fail-closed** | Profile rules when the domain is claims. Not the membership test. |

---

## 4. Relationship to the family

**Prim** is the product identity and category name.

**OKF** (Open Knowledge Format) is one pack grammar some profiles use. It is not Prim.

| Layer | Role |
|-------|------|
| **Prim** | The category. File + tools. |
| **Profile** | Domain store (`prim.orf`, `prim.docket`, …). |
| **OKF** | Optional grammar (face, evidence, trust). |

### Repository naming

| Pattern | Role |
|---------|------|
| `prim` | Category home |
| `prim.<profile>` | Domain profile repo |
| `prim-web` | Public web host |
| `prim-mac` | Mac document host — Prim.app |

Current profiles (non-exhaustive):

- **prim.emf** — human intent + durable memory
- **prim.orf** — research / investigation packs
- **prim.opf** — product graphs
- **prim.odwf** — spreadsheet → bronze proof packages
- **prim.opff** — personal finance packs; Prim Tool is `opff-editor` (surface / talk, as ledger)
- **prim.omf** — meeting occurrences
- **prim.ocsf** — corporate structure, ownership, capital, governance
- **prim.obif** — brand & identity
- **prim.osf** — open session format (movable session packs)
- **prim.docket** — execution prim; first Prim Tool is `docket-editor` (surface / talk)
- **prim.deck** — slide records + `deck-editor` (emerging)
- **prim.invoice** — bill pack + `invoice-editor` (emerging)
- **prim.session** — thin transcript + `session-editor` (emerging; not OSF)
- **prim.scene** — one cinematic beat; `scene.json` is camera/objects/duration (emerging)
- **prim.video** — ordered collection of `prim.scene` packs (emerging)

A Prim can be a single-profile pack (e.g., “the corporate prim” / `prim.ocsf`) or a composition that references multiple profiles. Profile SPECs remain authoritative for their domains. Prim does not override them.

See [FAMILY.md](./FAMILY.md) for the full map.

---

## 5. Packaging

| Form | Role |
|------|------|
| **Directory pack** | Canonical source of truth (git, editing, validation) |
| **`.prim.zip`** | Primary interchange form — “send me the prim” |
| **`.prim.tar.gz`** | Allowed, Unix/agent-friendly |
| **`.prim`** | Reserved branded container (treated as zip-compatible) |

A `.prim.zip` or `.prim` is simply a zip whose root contains a valid Prim pack (`index.md` present, profile conventions satisfied).

Everyday language stays the same regardless of container:

> “Send me the prim.” → attach `ford-group.prim.zip` or `ford-group.prim`

See [SPEC.md §5](./SPEC.md) for the full packaging rules.

---

## 6. How to communicate Prims to people

### The core insight (use this first)

Traditional files were built for human tools. Agents reverse-engineer them.

Prims reverse that relationship: structure first, views later.

### Preferred everyday language

**Do say**

- “Send me the prim.”
- “Is that the latest prim?”
- “Don’t send the spreadsheet — just send the prim.”
- “The prim is the source of truth. The deck is just a view.”
- “Generate a view from the prim.”
- “There are prims and prim tools.”
- “A surface tool on this prim.” / “A connector that cites this prim.”
- “Corporate prim,” “brand prim,” `prim.ocsf`, `prim.obif` (when the domain helps)

**Avoid as primary language**

- Leading with “OKF pack,” “YAML knowledge bundle,” or “structured Markdown”
- “Knowledge management platform”
- “AI document format” (too soft and generic)
- Claiming every file in the world must become a Prim

Technical terms (OKF, ORF, OCSF, validators) belong in specs and agent-facing docs. Human conversation stays on “prim.”

### Analogies that land

- **Like source code, not the compiled binary** — the Prim is the real thing; the spreadsheet/deck is a build artifact.
- **Like a git repo for knowledge** — versioned, inspectable, shareable, the single source of truth.
- **Like JSON for data, but for knowledge + memory + evidence** — structured enough for machines, readable enough for humans.
- **Like “send me the link”** — once people hear “send me the prim,” it should feel equally natural.

### Audience-specific framing

| Audience | Lead with |
|----------|-----------|
| **Builders / engineers** | AI-native files. Agents can validate and reason without scraping. Evidence and trust are first-class. |
| **Operators / operators of knowledge** | Stop maintaining three versions of the same truth (sheet + doc + deck). One prim, many views. |
| **Leadership / decision-makers** | Durable organizational memory that agents can actually use. Reduced re-derivation and tribal knowledge. |
| **Skeptics** | You still get human-readable files. You still get exports. You just stop treating the export as the source of truth. |

### The “duh” test

A successful explanation makes people say something close to:

> “Oh. Yeah. Of course you don’t need an Excel file for this anymore.”

If the explanation requires a long technical preamble, it has not yet landed.

### Short scripts

**15-second version**

“Prims are AI-native knowledge files. The structured, evidence-backed version is the real file. Spreadsheets and decks become views you generate when you need them. You just say ‘send me the prim.’”

**60-second version**

“Most of our important knowledge lives in tools that were never designed for agents — spreadsheets, docs, decks. Agents have to reverse-engineer them every time. A Prim flips that. Knowledge is stored structured and evidence-backed so both humans and agents can trust it. Interfaces are generated on demand. Pure data stays specialized. Everything else can become a view of a Prim. The everyday language becomes ‘send me the prim’ the same way we say ‘send me the link.’”

**Technical one-liner**

“Prim is the category: a file that stores information, and a tool that cites it. OKF is one grammar. Profile repos are named `prim.<name>`.”

---

## 7. What Prim is not

- Not a single monolithic schema that replaces all domain profiles
- Not a replacement for pure data formats (Parquet, images, audio, 3D, etc.)
- Not a requirement that every document become a Prim
- Not a fixed application or UI
- Not “yet another knowledge base product”
- Not a `prim.surface` or `prim.connector` file — those are Prim Tools (operators), not Prims

Prim is the category for knowledge and memory that benefits from being structured, evidence-backed, agent-native, and view-independent.

A **Prim Tool** operates on a Prim. Two kinds only: **surface** (counterpart is a human — print, page turns, a panel) and **connector** (counterpart is a system — bake, warehouse read, export). Both use the same three directions: emit, talk, receive. The tool cites the Prim. It does not become one. If it is not surface or connector, it is a script. See [SPEC.md §10](./SPEC.md).

---

## 8. Success signal

People say “send me the prim” without explanation, and it feels as ordinary as “send me the link” or “drop the JSON.”

When that happens, the category has landed.

---

## 9. Status and ownership

- **Prim** = category and product identity
- **Eidos AGI** = the organization developing the open OKF-family formats and tools that make Prims reliable
- Repo convention: `prim` + `prim.<profile>` + `prim-web` + `prim-mac`
- Current status: early (v0.4.0-draft — Prim is not OKF)
- Home: https://github.com/eidos-agi/prim

Domain profiles remain in their own `prim.*` repositories. Prim is the name of the category they all belong to.

---

## License

MIT — Eidos AGI

This document is the complete public-facing explanation of what Prims are and how to communicate them.
