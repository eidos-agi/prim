# Prim Family Map

Prim is the category. Additive OKF profiles are the domain grammars that make Prims real.

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

Profiles (additive OKF)
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
└── prim.obf      (private / emerging)

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
| **OKF** (via okflify and profile bases) | Document model, provenance, trust tiers, pack face conventions |
| **prim.\*** profiles | Domain kinds, edges, validation gates, pack layouts |
| **prim-web** / renderers | Generate views on demand; never become the source of truth |
| **Validators** | Enforce profile rules; fail-closed where specified |

---

## Composition rules

1. **Every Prim is OKF-compatible.** A renderer that understands only OKF can still display the pack (and ignore profile-specific keys).
2. **Profiles are additive.** Declaring `profile: ocsf` (or orf, opf, obif, osf, …) adds domain structure; it does not remove OKF properties.
3. **Profiles do not merge domains by default.** Corporate structure stays in OCSF (`prim.ocsf`). Research stays in ORF (`prim.orf`). Brand stays in OBIF (`prim.obif`). Session state stays in OSF (`prim.osf`). Cross-references are preferred over forced unification.
4. **Evidence and trust follow OKF.** Profiles may tighten requirements but do not invent a parallel trust model.
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

1. It is specified as an additive OKF profile with clear kinds, validation gates, and pack conventions.
2. It respects the shared Prim properties (AI-native, evidence-first, durable, no fixed UX, human-readable).
3. Its canonical repo is named `prim.<shortname>` under `eidos-agi`.
4. It is linked from this family map and from the Prim README.

The Prim category SPEC does not need to change for every new profile. The family map does.

---

## Status

This map reflects the `prim` / `prim.*` repositories in the Eidos org as of the current draft. It will be updated as profiles mature and new ones are added.

---

## License

MIT — Eidos AGI
