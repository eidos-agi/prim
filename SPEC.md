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
  ...               # profile-specific semantic files (structure.json, findings/, etc.)
  evidence/         # native proof artifacts when required
```

- `index.md` is the human- and agent-facing entry point.
- Semantic authority for structured claims lives in the profile’s designated files (e.g. `structure.json` for OCSF), not in folder names or free-form prose alone.
- Evidence for material claims lives under `evidence/` or equivalent and is referenced with content hashes when the profile requires it.

---

## 5. Generative interfaces

Prims deliberately separate storage from presentation.

- The Prim stores structure, claims, evidence, and provenance.
- Renderers and agents generate views (HTML, tables, graphs, brand boards, capitalization waterfalls, etc.) on demand.
- Traditional formats (xlsx, docx, pptx, pdf) may be emitted as exports or projections; they are not the primary store for knowledge that belongs in a Prim.

This is the same separation of concerns that makes “send me the prim” viable: the recipient receives the source of truth, not a frozen view.

---

## 6. Language conventions

Preferred everyday language:

| Preferred | Avoid |
|-----------|--------|
| “Send me the prim.” | “Send me the knowledge pack / OKF bundle / YAML.” |
| “The prim is the source of truth.” | “The spreadsheet is the source of truth.” |
| “Generate a view from the prim.” | “Update the deck and the sheet and the doc.” |
| “Latest prim” | “Latest version of the files” |

Profile names (ORF, OCSF, etc.) remain useful in technical and agent contexts. Prim is the human-facing category name.

---

## 7. What Prim is not

- Not a single monolithic schema that replaces all profiles
- Not a replacement for pure data formats (Parquet, images, audio, etc.)
- Not a requirement that every document in the world become a Prim
- Not a fixed application or UI

Prim is the category for knowledge and memory that benefits from being structured, evidence-backed, agent-native, and view-independent.

---

## 8. Status

**v0.1.0-draft.**

This category SPEC will evolve as the family of profiles hardens and as real Prim usage surfaces additional shared requirements.

Domain authority remains with the individual profile repositories.

---

## License

MIT — Eidos AGI
