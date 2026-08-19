# Prim — What It Is and How to Talk About It

A complete reference for understanding Prims and communicating the idea clearly.

---

## 1. What a Prim is

A **Prim** is the primitive unit of knowledge and memory for AI.

It is a self-contained, structured, evidence-backed pack of knowledge that:

- Agents can read, validate, reason over, and act on **without translation layers**
- Serves as **durable memory** that persists across sessions, agents, and time
- Treats traditional files (Excel, Word, PDFs, decks, Notion pages) as optional **views**, not the source of truth
- Generates interfaces on demand rather than shipping a fixed UX
- Remains human-inspectable

**One-line definition**

> The Prim is the source of truth. Everything else is a view.

**Everyday definition**

> Structured knowledge that both humans and agents can trust. You don’t send the spreadsheet or the deck — you send the prim.

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

1. Knowledge is stored in structured, validated, evidence-backed form.
2. Both agents and humans treat the Prim as the source of truth.
3. Interfaces, documents, and visualizations are generated on demand from the Prim.
4. Pure data formats (images, Parquet, audio, etc.) stay specialized. Everything else can become a projection.

Once this is understood, the sentence becomes obvious:

> “Don’t send me the spreadsheet. Send me the prim.”

---

## 3. Core properties (non-negotiable)

| Property | Meaning |
|----------|---------|
| **AI-native** | Agents can open, validate, query, and reason over it using declared rules — no brittle scraping of presentation formats. |
| **Evidence-first** | Material claims carry provenance, trust tiers (`human:` > `job:` > `agent:`), and content hashes where required. Validation is fail-closed. |
| **Durable memory** | Designed to outlive any single session or agent run. Supports versioning, supersession, and temporal reconstruction. |
| **No fixed UX** | There is no canonical interface. Views are generated on the fly (tables, graphs, brand boards, capitalization waterfalls, narratives, etc.). |
| **Human-readable** | Still openable and understandable by people. Markdown + structured data (YAML/JSON) is preferred. Opacity is not a goal. |
| **Additive & profile-based** | New domains arrive as additive profiles rather than monolithic version bumps. Existing Prims continue to work. |

---

## 4. Relationship to the family

**Prim** is the product identity and category name.

**OKF** (Open Knowledge Format) and its additive profiles are the underlying grammar.

| Layer | Role |
|-------|------|
| **Prim** | What people call it. The category. The brand. |
| **OKF + profiles** | The format rules, validation model, pack layout, and domain schemas. |

### Repository naming

| Pattern | Role |
|---------|------|
| `prim` | Category home |
| `prim.<profile>` | Domain profile repo |
| `prim-web` | Public web surface |

Current profiles (non-exhaustive):

- **prim.emf** — human intent + durable memory
- **prim.orf** — research / investigation packs
- **prim.opf** — product graphs
- **prim.odwf** — spreadsheet → bronze proof packages
- **prim.opff** — personal finance packs
- **prim.omf** — meeting occurrences
- **prim.ocsf** — corporate structure, ownership, capital, governance
- **prim.obif** — brand & identity
- **prim.osf** — open session format (movable session packs)

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

“Prim is the category name for OKF-profile packs that are AI-native, evidence-first, durable memory, and deliberately free of fixed UX. Profile repos are named `prim.<name>`.”

---

## 7. What Prim is not

- Not a single monolithic schema that replaces all domain profiles
- Not a replacement for pure data formats (Parquet, images, audio, 3D, etc.)
- Not a requirement that every document become a Prim
- Not a fixed application or UI
- Not “yet another knowledge base product”

Prim is the category for knowledge and memory that benefits from being structured, evidence-backed, agent-native, and view-independent.

---

## 8. Success signal

People say “send me the prim” without explanation, and it feels as ordinary as “send me the link” or “drop the JSON.”

When that happens, the category has landed.

---

## 9. Status and ownership

- **Prim** = category and product identity
- **Eidos AGI** = the organization developing the open OKF-family formats and tools that make Prims reliable
- Repo convention: `prim` + `prim.<profile>` + `prim-web`
- Current status: early (v0.1.0-draft category specification)
- Home: https://github.com/eidos-agi/prim

Domain profiles remain in their own `prim.*` repositories. Prim is the name of the category they all belong to.

---

## License

MIT — Eidos AGI

This document is the complete public-facing explanation of what Prims are and how to communicate them.
