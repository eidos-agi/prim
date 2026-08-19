# Prim Intention

## North Star

There are Prims and Prim Tools. A Prim is the file that stores the information. A Prim Tool is how you interact with it.

Traditional application files (documents, spreadsheets, presentations, notes) were designed for human tools first. Agents are forced to reverse-engineer meaning from them.

Prims reverse the relationship:

1. The structured store *is* the file.
2. Agents and humans both treat that file as the source of truth.
3. Interfaces and exports are generated or operated on demand (ui opens; a tool cites).
4. OKF is one grammar some prims use. Prim is allowed to evolve without being OKF.

## Design commitments

### 1. Primitive, not product-specific
A Prim is a fundamental building block, not a feature of any single application. Prim itself has a closed set of primitives (file, face, authority, constraint, log, validator, ui, compose, trust). Profiles add domains. They do not invent a second category. **Prim Tools** (surface / connector) operate on a Prim. They are not a tenth primitive and not new pack types (`prim.surface`, `prim.connector` do not exist).

### 2. AI-native by default
Agents must be able to open, validate, query, reason over, and update a Prim without custom parsers or brittle scraping.

### 3. Evidence and trust are profile rules
When the domain is claims, the profile may require provenance, trust tiers (human > job > agent), timestamps, hashes, and fail-closed gates. That is not the membership test for a Prim.

### 4. Memory that outlives sessions
A Prim is durable memory. It can be versioned, superseded, forked, and shared across agents and time.

### 5. No fixed UX
There is no canonical interface. `ui` is how anything opens a Prim. A Prim Tool operates on that file: surface talks to a human, connector talks to a system. The file itself remains the source of truth.

### 6. Human-readable remains a feature
Prims must still be inspectable and understandable by people. Opacity is not a goal.

### 7. Additive profiles, not one format
New domains become `prim.<name>`. Some of those profiles will be OKF packs. Some will not (`docket-prim` is a Prim; `docket-md` stays markdown). Prim does not freeze itself to OKF.

## What success looks like

People say:

> “Just send me the prim.”

and it feels obvious.

Spreadsheets, Word docs, and decks become optional views rather than the primary store of important knowledge.

Agents stop re-deriving the same facts from unstructured sources because the Prim already exists.

## Relationship to Eidos

Prim is the category and product identity.

Eidos develops Prim profiles and tools. OKF is one lineage of those profiles, not the category.
