# Prim — Category Specification (v0.1.0-draft)

**Prim is the category name for AI-native knowledge and memory packs.**

This document defines what makes something a Prim, how Prims relate to the OKF family, and the non-negotiable properties of the category.

Domain-specific structure lives in the individual profile SPECs (ORF, OCSF, OPF, etc.). This SPEC defines the shared category contract.

---

## 1. Definition

A **Prim** is a self-contained, structured, evidence-backed pack of knowledge that:

1. Is designed so agents can read, validate, reason over, and act on it without translation layers.
2. Serves as durable memory that can persist, be versioned, superseded, and shared across sessions and agents.
3. Treats traditional application files (spreadsheets, documents, decks, notes) as optional projections rather than the primary store.
4. Generates interfaces on demand rather than shipping a fixed UX.
5. Remains human-inspectable.

In short:

> The Prim is the source of truth. Everything else is a view.

---

## 2. Relationship to OKF

Prim is the **product identity and category**.

OKF (Open Knowledge Format) and its additive profiles are the **underlying format family**.

| Layer | Role |
|-------|------|
| **Prim** | What people call it. The category. The brand. |
| **OKF + profiles** | The grammar, validation model, pack layout, and domain schemas. |

Every valid Prim is (or is composed of) one or more OKF packs using one or more profiles.

A Prim may be:

- A single-profile pack (e.g. an ORF research prim, an OCSF corporate structure prim)
- A composed pack that references or embeds multiple profiles
- A higher-level index that points at a set of related Prims

The profile SPECs remain authoritative for their domains. Prim does not override them.

---

## 3. Core properties (normative)

These properties define the category. A pack that violates them is not a Prim in the intended sense.

### 3.1 AI-native

Agents must be able to open, validate, query, and reason over the pack using the declared profile rules without custom one-off parsers or brittle scraping of presentation formats.

### 3.2 Evidence and trust are first-class

Material claims carry provenance, trust tiers, and (where required) content hashes. The trust ladder follows OKF: `human:` > `job:` > `agent:`.

Validation is fail-closed for hard rules defined by the active profile(s).

### 3.3 Durable memory

A Prim is intended to outlive any single session or agent run. It supports versioning, supersession, and temporal reconstruction of state where the profile requires it.

### 3.4 No fixed UX

There is no canonical interface shipped with the Prim. Views (tables, graphs, narratives, brand boards, capitalization summaries, etc.) are generated on demand from the structure. Tools such as okflify and future Prim viewers produce projections; they do not become the source of truth.

### 3.5 Human-readable remains a feature

Prims must remain inspectable by people. Opacity is not a goal. Markdown + structured data (YAML frontmatter, JSON graph files, etc.) is the preferred surface.

### 3.6 Additive and profile-based

New domains extend the family through additive profiles rather than monolithic version bumps. Existing Prims continue to validate under their declared profiles.

---

## 4. Pack conventions (shared)

Exact layout is defined per profile. Shared conventions across the Prim category:

```
prim-pack/
  index.md          # required face (title, profile, version, status)
  log.md            # append-only timeline (strongly recommended)
  ...               # profile-specific semantic files (structure.json, book.json, etc.)
  evidence/         # native proof artifacts when required
```

- `index.md` is the human- and agent-facing entry point.
- Semantic authority for structured claims lives in the profile’s designated files (e.g. `structure.json` for OCSF, `book.json` for OBF), not in folder names or free-form prose alone.
- Evidence for material claims lives under `evidence/` or equivalent and is referenced with content hashes when the profile requires it.

### 4.1 Face path pointers (additive)

If a **top-level** face value (or item in a top-level list) looks like a relative pack path — a string with a file extension and no `://` / `:` scheme — that path MUST resolve to a file under the pack root.

This is how the category SDK checks `book: book.json` or `log: log.md` without learning profile names. Profile ids (`obf:ns:slug`) and trust marks (`human:`, `agent:`) are not paths.

### 4.2 Compose, don't merge (additive)

Optional face key `compose:` is a list of related prims:

- a relative directory that contains `index.md` (another pack beside or inside this one), or
- a prim id (`orf:…`, `emf:…`) which is a citation, not a file check.

A composed prim MUST NOT copy the neighbor’s claims into this pack’s authority file. Cite it. Profiles add their own constraint layers (e.g. OBF `bible/`) as **constraints on** the authority file, not a second authority.

### 4.3 `log.md`

Strongly recommended. Append-only. Preferred line shape:

```text
# Log

- 2026-08-19 — what changed
```

Absence is a category warning, not a profile-specific invention.

---

## 5. Packaging and interchange forms

A Prim exists in two complementary forms:

### 5.1 Canonical form — directory pack

The working and source-of-truth form is a directory that follows the pack conventions above. This is what lives in git, on disk while editing, and what validators operate on directly.

### 5.2 Interchange forms — single-file containers

For sharing (“send me the prim”), a Prim is packaged as a single archive whose root contains a valid Prim pack.

| Extension | Status | Notes |
|-----------|--------|-------|
| **`.prim.zip`** | Primary interchange | Required to support. Universal compatibility. |
| **`.prim.tar.gz`** | Allowed | Preferred on Unix/agent/server workflows. |
| **`.prim`** | Reserved | Branded container; treated as zip-compatible under the hood. |
| `.prim.7z` | Optional | Allowed but not required. |
| `.prim.rar` | Not part of the format | Proprietary; do not use as a standard interchange. |

**Rules**

1. A `.prim.zip` (or `.prim`) MUST be a zip archive whose root contains a valid Prim pack (`index.md` present, profile conventions satisfied).
2. A `.prim.tar.gz` MUST be a gzip-compressed tar archive with the same root contents requirement.
3. The archive root is the pack root — do not wrap an extra top-level folder unless that folder *is* the pack.
4. Tools that “open a prim” SHOULD accept the directory form and the primary interchange forms (`.prim.zip`, `.prim`, `.prim.tar.gz`).
5. The directory form remains the canonical source of truth for version control and editing. Archives are interchange and distribution.

**Everyday language remains the same:**

> “Send me the prim.”  
> → attach `ford-group.prim.zip` or `ford-group.prim`

---

## 6. Generative interfaces

Prims deliberately separate storage from presentation.

- The Prim stores structure, claims, evidence, and provenance.
- Renderers and agents generate views (HTML, tables, graphs, brand boards, capitalization waterfalls, etc.) on demand.
- Traditional formats (xlsx, docx, pptx, pdf) may be emitted as exports or projections; they are not the primary store for knowledge that belongs in a Prim.

This is the same separation of concerns that makes “send me the prim” viable: the recipient receives the source of truth, not a frozen view.

---

## 7. Language conventions

Preferred everyday language:

| Preferred | Avoid |
|-----------|--------|
| “Send me the prim.” | “Send me the knowledge pack / OKF bundle / YAML.” |
| “The prim is the source of truth.” | “The spreadsheet is the source of truth.” |
| “Generate a view from the prim.” | “Update the deck and the sheet and the doc.” |
| “Latest prim” | “Latest version of the files” |

Profile names (ORF, OCSF, etc.) remain useful in technical and agent contexts. Prim is the human-facing category name.

---

## 8. What Prim is not

- Not a single monolithic schema that replaces all profiles
- Not a replacement for pure data formats (Parquet, images, audio, etc.)
- Not a requirement that every document in the world become a Prim
- Not a fixed application or UI

Prim is the category for knowledge and memory that benefits from being structured, evidence-backed, agent-native, and view-independent.

---

## 9. Category primitives

These are the primitives of Prim itself. Profiles add domain grammar. They do not invent a parallel set.

A tool that “opens a prim” uses these — not a book app, not a slide viewer, not a profile-specific product.

| Primitive | What it is | What it is not |
|-----------|------------|----------------|
| **file** | The Prim. Directory pack or `.prim.zip` / `.prim` / `.prim.tar.gz`. | A PDF, xlsx, or HTML export |
| **face** | `index.md`. Identity: `profile`, `type`, optional `subtype`. How anything opens a Prim without knowing the domain. | The story, the graph, the claims |
| **authority** | The profile’s sole semantic file(s), pointed from the face (`book:`, `structure:`, …). | A projection, a bible, a render |
| **constraint** | `bible/`, `evidence/`, and other gates on authority. | A second authority |
| **log** | Append-only production memory (`log.md`). | A changelog written into authority |
| **validator** | Category gates (`validate_base`) plus a registered profile validator. Fail-closed. | A linter you run if you feel like it |
| **ui** | A view plugin keyed `profile/subtype` (or `profile/type`). Generated on demand. | A fixed application shipped with the file |
| **compose** | Cite another Prim. Do not copy its claims into this authority. | A merge, a fork-in-place |
| **trust** | OKF ladder on claims: `human:` > `job:` > `agent:`. | A confidence score |

**UI key.** `view_key = profile + "/" + (subtype or type)`. Example: `obf/picture-book`. A Prim UI resolves that key to a plugin. Unknown keys fall back to a face-only view.

**Validator stack.** Always run category gates. Then run the validator registered for `face.profile`, if any. Profile validators MUST NOT re-implement archive handling or face parsing.

The TypeScript SDK (`sdk/typescript`) names these primitives so agents and humans share one vocabulary.

---

## 10. Status

**v0.2.0-draft** (category primitives + face path pointers + compose).

This category SPEC will evolve as the family of profiles hardens and as real Prim usage surfaces additional shared requirements.

Domain authority remains with the individual profile repositories.

---

## License

MIT — Eidos AGI
