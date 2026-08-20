# Prim Family Map

Prim is the category: a file that stores information, and tools that interact with it. Some profiles use OKF as their grammar. They do not have to. Prim can evolve without being OKF.

The live list of **types** and **tools** is [`registry/registry.json`](./registry/registry.json). This map is a sketch. `prim registry` prints the catalog.

**Repository naming convention**

| Pattern | Role |
|---------|------|
| `prim` | Category home (this repo) |
| `prim.<profile>` | Domain profile (spec, validator, examples) |
| `prim-web` | Public web surface / generated views |

Examples: `prim.ocsf`, `prim.obif`, `prim.osf`, `prim.orf`.

---

## Family at a glance

```
prim              Category / product identity
                  https://github.com/eidos-agi/prim

prim-web          Public surface (views on demand)
                  https://github.com/eidos-agi/prim-web

Profiles (OKF-shaped unless noted)
│
├── prim.emf      Human intent + durable memory
├── prim.orf      Research / investigation packs
├── prim.opf      Product graph
├── prim.odwf     Spreadsheet → bronze proof packages
├── prim.opff     Personal / household finance packs
├── prim.omf      Meeting occurrences
├── prim.ocsf     Corporate structure, ownership, capital, governance
├── prim.obif     Brand identity (logo, color, type, voice, assets)
├── prim.osf      Open Session Format (movable session packs)
├── prim.obf      (private / emerging)
├── prim.docket   Execution prim + first Prim Tool (`docket-editor`, surface / talk)
├── prim.deck     Slide records + `deck-editor` (emerging, not OKF)
├── prim.invoice  Bill pack + `invoice-editor` (emerging, not OKF)
└── prim.session  Thin transcript + `session-editor` (emerging; not OSF)

Base grammar + render
│
└── okflify       OKF pack → HTML / base knowledge + trust model
                  https://github.com/eidos-agi/okflify
```

Profile short names (EMF, ORF, OCSF, …) remain valid in technical and agent contexts.  
Repo names and everyday speech prefer the `prim` / `prim.<profile>` form.

---

## Roles

| Layer | Responsibility |
|-------|----------------|
| **prim** | Category name, positioning, shared properties, language, packaging |
| **OKF** (via okflify and profile bases) | One pack grammar: face, provenance, trust. Optional. |
| **prim.\*** profiles | Domain store and rules. May be OKF-shaped or not. |
| **prim-web** / renderers | Generate views on demand; never become the source of truth |
| **Validators** | Enforce profile rules; fail-closed where specified. Register on the category SDK. |
| **Prim UIs** | View plugins keyed `profile/subtype`. How a Prim *opens*. Never the file. |
| **Prim Tools** | Operators on a Prim. Two kinds: **surface** (human counterpart) and **connector** (system counterpart). Cite a Prim. Not a pack type. |

Category primitives (file, face, authority, constraint, log, validator, ui, compose, trust) live in the TypeScript Prim SDK (`sdk/typescript`). See SPEC §9.

Prim Tools are category language, not a family of repos. Do not mint `prim.surface` or `prim.connector`. See SPEC §10.

---

## Composition rules

1. **OKF-shaped prims stay OKF-compatible.** A renderer that understands only OKF can display those packs and ignore extra keys.
2. **Not every Prim is OKF.** A profile may name another store. `docket-md` stays markdown. `docket-prim` (`prim.docket`) is the new-format execution prim.
3. **Profiles do not merge domains by default.** Corporate structure stays in OCSF. Research stays in ORF. Execution stays in the docket. Cross-references are preferred over forced unification.
4. **Evidence and trust follow the profile.** OKF profiles use the OKF ladder. Other profiles do not inherit it by default.
5. **Human intent stays in EMF** (`prim.emf`) where that distinction matters.

---

## How to talk about them

| Context | Preferred language |
|---------|-------------------|
| Everyday / human | “the prim”, “send me the prim”, “latest prim” |
| Profile precision | “the brand prim”, “the corporate prim”, “prim.obif”, “prim.ocsf” |
| Technical / agent | `profile: obif`, `profile: ocsf`, pack path / repo name |

The goal is that **prim** is the default noun. Profile codes and `prim.*` repo names appear when precision is needed.

---

## Adding a new profile

A new domain becomes part of the Prim family when:

1. It names a store and how tools cite it (kinds, gates, layout — OKF or not).
2. It respects the category split: the file stores; tools interact; no fixed UX required.
3. Its canonical repo is named `prim.<shortname>` under `eidos-agi`.
4. It is linked from this family map and from the Prim README.

The Prim category SPEC does not need to change for every new profile. The family map does.

A new renderer, print host, bake job, or warehouse reader is a **Prim Tool**, not a new profile. If it is not surface or connector, it is a script. Do not add it here.

---

## Status

This map reflects the `prim` / `prim.*` repositories in the Eidos org as of the current draft. It will be updated as profiles mature and new ones are added.

---

## License

MIT — Eidos AGI
