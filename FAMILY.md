# Prim Family Map

Prim is the category. The OKF additive profiles are the domain grammars that make Prims real.

This document maps the current family and how the pieces compose.

---

## Family at a glance

```
Prim  (category / product identity)
│
├── OKF          Base knowledge + trust model + pack conventions
│                 https://github.com/eidos-agi/okflify
│
├── EMF          Human intent + durable personal/agent memory
│                 https://github.com/eidos-agi/emf
│
├── ORF          Research / investigation packs
│                 https://github.com/eidos-agi/orf
│
├── OPF          Product graph
│                 https://github.com/eidos-agi/opf
│
├── ODFW         Spreadsheet → bronze proof packages
│                 https://github.com/eidos-agi/odwf
│
├── OPFF         Personal / household finance packs
│                 https://github.com/eidos-agi/opff
│
├── OMF          Meeting occurrences (invite / record / outcome)
│                 https://github.com/eidos-agi/omf
│
└── OCSF         Corporate structure, ownership, capital, governance
                  https://github.com/eidos-agi/ocsf
```

Future profiles (e.g. brand/identity, legal agreements, etc.) will appear as additional rows in this map without breaking existing Prims.

---

## Roles

| Layer | Responsibility |
|-------|----------------|
| **Prim** | Category name, positioning, shared properties, language |
| **OKF** | Base document model, provenance, trust tiers, pack face conventions |
| **Profiles** | Domain kinds, edges, validation gates, pack layouts |
| **Renderers** (okflify, future Prim viewers) | Generate views on demand; never become the source of truth |
| **Validators** | Enforce profile rules; fail-closed where specified |

---

## Composition rules

1. **Every Prim is OKF-compatible.** A renderer that understands only OKF can still display the pack (and ignore profile-specific keys).
2. **Profiles are additive.** Declaring `profile: ocsf` (or orf, opf, …) adds domain structure; it does not remove OKF properties.
3. **Profiles do not merge domains by default.** Corporate structure stays in OCSF. Research stays in ORF. Product surfaces stay in OPF. Cross-references are preferred over forced unification.
4. **Evidence and trust follow OKF.** Profiles may tighten requirements (e.g. mandatory hashes for material ownership claims) but do not invent a parallel trust model.
5. **Human intent stays in EMF** where that distinction matters. Profiles that need intent link to or compose with EMF rather than redefining it.

---

## How to talk about them

| Context | Preferred language |
|---------|-------------------|
| Everyday / human | “the prim”, “send me the prim”, “latest prim” |
| Technical / agent | “OCSF pack”, “ORF prim”, “OKF profile: ocsf” |
| Mixed | “the corporate prim (OCSF)” or “the research prim” |

The goal is that “prim” becomes the default noun, with the profile name available when precision is needed.

---

## Adding a new profile

A new domain becomes part of the Prim family when:

1. It is specified as an additive OKF profile with clear kinds, validation gates, and pack conventions.
2. It respects the shared Prim properties (AI-native, evidence-first, durable, no fixed UX, human-readable).
3. It is linked from this family map and from the Prim README.

The Prim category SPEC does not need to change for every new profile. The family map does.

---

## Status

This map reflects the publicly visible Eidos OKF-family repositories as of the current draft. It will be updated as profiles mature and new ones are added.

---

## License

MIT — Eidos AGI
