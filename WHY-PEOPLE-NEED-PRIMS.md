# Prim Profiles People Need

Which `prim.<profile>` types should exist for **people** — the same way `prim.opff` exists for a household's money and `prim.opf` exists for a product graph.

The registered family today is weighted toward work: product graphs, corporate structure, research, execution, meetings, brand. Exactly one profile is about a person's own life — `prim.opff`. This document proposes the rest, using OPFF as the pattern.

**What OPFF establishes as the pattern:** a domain a person recognizes as theirs, a bounded scope that refuses to become infrastructure (personal/household finance, not a bank connector, not `prim.ocsf` capital work), operational reality in the model (imports, stable ids, review queues, stale verification, reconciliation state), and a surface that cites the pack (`opff-editor`, as ledger). A candidate profile that cannot state all four is not ready.

---

## Proposed profiles

| Profile | Name | Store | Tool | OKF | Status |
|---------|------|-------|------|-----|--------|
| `prim.ohf` | Open Home Format | One dwelling or property | `ohf-editor` | yes | proposed |
| `prim.ovf` | Open Vehicle Format | One vehicle | `ovf-editor` | yes | proposed |
| `prim.ophf` | Open Personal Health Format | One person's health record | `ophf-editor` | yes | proposed |
| `prim.ocf` | Open Career Format | One person's working life | `ocf-editor` | yes | proposed |
| `prim.otf` | Open Trip Format | One trip occurrence | `otf-editor` | yes | proposed |
| `prim.oef` | Open Estate Format | Continuity if a person cannot act | `oef-editor` | yes | proposed |
| `prim.olf` | Open Lineage Format | People, records, and descent | `olf-editor` | yes | proposed |
| `prim.pet` | — | One animal | `pet-editor` | no | candidate |
| `prim.collection` | — | One collection of owned things | `collection-editor` | no | candidate |

Acronym profiles follow the existing `O__F` convention and OKF grammar because these domains are claims about the real world with provenance and freshness. `prim.pet` and `prim.collection` follow the non-acronym convention already used by `docket`, `deck`, `invoice`, and `arcade`.

---

## Tier 1 — build these first

### `prim.ohf` — Open Home Format

**Authority:** one dwelling, as an owner or tenant lives with it.

**Records:** property and parcel facts · rooms and systems · appliances with model and serial numbers · manuals · warranties with expiry · maintenance schedule · repair and service history with cost and vendor · contractors and trades · utility and insurance references · permits · photographs · active projects.

**Boundary:** it is a *home*, not real estate as an asset class and not a property-management system. No listings, valuations, tenants, or rent rolls. Ownership entities belong in `prim.ocsf`; a renovation's execution belongs in a `prim.docket` that cites the home.

**Why it's first after finance:** highest recognition of any candidate ("this is our house, help us take care of it"), and the data is currently the most catastrophically scattered — model numbers in photos, warranties in email, repairs in memory. Every appliance failure is a re-research event today.

**OPFF parallel:** the maintenance history is the transaction ledger. Warranty and service intervals are the freshness model. A receipt or invoice is provenance, and a `prim.invoice` can be cited rather than copied.

### `prim.ovf` — Open Vehicle Format

**Authority:** one vehicle, by VIN.

**Records:** VIN and identity · titles and registration references · mileage observations · scheduled maintenance · service and repair records with shop and parts · recalls and campaigns · tires · modifications · insurance references · fuel or charging history · incidents · ownership transfers.

**Boundary:** one vehicle, not a fleet and not a dealership CRM. A household with three cars holds three packs; the household composition is a reference, not a merge.

**Why:** it is the cleanest test case in the whole set. Bounded record types, a natural unique identifier, an obvious resale moment where the file has immediate cash value, and a validator that can actually check something (mileage monotonicity, service interval compliance, open recalls). Ship it to prove the pattern cheaply.

### `prim.ophf` — Open Personal Health Format

**Authority:** one person's health record, held by that person.

**Records:** conditions · medications with dose and dates · allergies and reactions · immunizations · procedures · labs and results with reference ranges · care team · appointments · insurance and coverage references · documents · directives · and an explicit disclosure and access model.

**Boundary:** a person's own record. Not an EHR, not a clinical decision system, not a provider-side product. It receives portal exports and imports; it does not become an interoperability layer.

**Why it's hardest and still necessary:** every new provider relationship starts with a person reciting their own history from memory, badly. This is the domain where the OKF trust ladder and fail-closed rules matter most, and where a profile must be conservative: consent and disclosure scope are first-class fields, not metadata. Do not start here — start with `prim.ovf`, then `prim.ohf` — but design toward it.

---

## Tier 2

| Profile | Authority | Distinctive records | Boundary |
|---------|-----------|--------------------|----------|
| `prim.ocf` | One person's working life | Roles · skills with evidence · work samples · claims and the proof behind each · references · compensation history · preferences · active opportunities | A résumé and a job-board profile are both *views*. Not an ATS, not a recruiting pipeline. |
| `prim.otf` | One trip | Travelers · itinerary legs · bookings and confirmations · lodging · reservations · entry and document requirements · receipts · change history | Per-occurrence, like `prim.omf` is per-meeting. Not a booking engine. Expenses cite `prim.opff` rather than duplicating it. |
| `prim.oef` | Continuity when a person cannot act | Trusted contacts and roles · document location references · asset and obligation inventory · beneficiary designations · instructions · account and subscription references · recovery policy · review dates | **References and policy only — never raw secrets or credentials.** Not a password manager, not legal advice. |
| `prim.olf` | People, records, and descent | Individuals · relationships · events with sources · source documents and images · conflicting evidence · confidence · living-person permissions | Genealogy with provenance, where uncertainty is representable. GEDCOM import is provenance, not the authority. Personal memory and intent stay in `prim.emf`. |

---

## Deliberately *not* new profiles

Restraint is the point. Each of these was considered and folded, because minting a profile per noun destroys the category.

| Considered | Why not | Where it goes |
|-----------|---------|---------------|
| Insurance | Coverage is an attribute of a thing, not a domain | Policy references inside `prim.ohf`, `prim.ovf`, `prim.ophf`; the policy document is a cited file |
| Household / family unit | Mostly people plus references to other packs | Residents in `prim.ohf`, shared money in `prim.opff`, intent and routines in `prim.emf` |
| Personal research or a pending decision | Already the exact shape of research and investigation | `prim.orf`, scoped personally |
| Memory and life archive | Human intent plus durable memory is already a profile | `prim.emf`; recordings of specific occurrences in `prim.osf` / `prim.omf` |
| Calendar / commitments | Occurrences are covered; standing commitments are intent | `prim.omf` per occurrence, `prim.emf` for standing obligations |
| Digital accounts and subscriptions | A continuity concern, not a life domain | `prim.oef` references and recovery policy |
| Home renovation, move, wedding | These are plans, not durable domains | `prim.docket` citing the relevant pack |

Two naming notes: `opf` is taken by the product graph, so "Open Property Format" is unavailable — hence `ohf`. Avoid `odf` entirely; it collides with OpenDocument.

---

## Sequencing

```
prim.opff   shipped   proves the pattern
prim.ovf    next      cheapest complete proof: hard id, checkable validator, resale moment
prim.ohf    then      highest human demand, richest record set
prim.ocf    then      low privacy risk, immediate personal utility
prim.otf    then      per-occurrence, cites opff and ohf — tests composition
prim.oef    then      requires the reference-not-secret discipline to be settled
prim.ophf   last      needs the strictest consent and disclosure model
prim.olf    opportunistic
```

The composition test arrives at `prim.otf`: a trip that cites a finance pack for expenses and a vehicle pack for a road trip, without merging domains. Per FAMILY.md rule 3, cross-reference beats unification.

## Admission requirement

Before any of these gets a repo and a registry entry, it must state, in its own SPEC:

1. The one real-world thing a person would call theirs.
2. What the pack is authoritative for — and the adjacent system it refuses to become.
3. The record kinds, including the ones that carry history, evidence, and freshness.
4. Its validator's fail-closed rules.
5. Its surface tool and the `as` role that tool plays (`ledger`, `editor`, …).
6. Which existing profiles it cites instead of absorbing.

A candidate that cannot fill in 2 and 6 is a feature request for an existing profile, or a Prim Tool — not a new type.

---

See also: [FAMILY.md](./FAMILY.md) · [registry/registry.json](./registry/registry.json) · [WHAT-IS-PRIM.md](./WHAT-IS-PRIM.md) · [SPEC.md](./SPEC.md) · [prim.opff](https://github.com/eidos-agi/prim.opff)
