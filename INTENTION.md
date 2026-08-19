# Prim Intention

## North Star

There are Prims and Prim Tools. Prims are the primitive units of knowledge and durable memory in an agent-native world. Prim Tools operate on them.

Traditional application files (documents, spreadsheets, presentations, notes) were designed for human tools first. Agents are forced to reverse-engineer meaning from them.

Prims reverse the relationship:

1. Knowledge is stored in structured, validated, evidence-backed form.
2. Agents and humans both treat the Prim as the source of truth.
3. Interfaces, documents, and visualizations are generated on demand from the Prim.
4. Pure data formats remain specialized. Everything else can become a projection.

## Design commitments

### 1. Primitive, not product-specific
A Prim is a fundamental building block, not a feature of any single application. Prim itself has a closed set of primitives (file, face, authority, constraint, log, validator, ui, compose, trust). Profiles add domains. They do not invent a second category. **Prim Tools** (surface / connector) operate on a Prim. They are not a tenth primitive and not new pack types (`prim.surface`, `prim.connector` do not exist).

### 2. AI-native by default
Agents must be able to open, validate, query, reason over, and update a Prim without custom parsers or brittle scraping.

### 3. Evidence and trust are first-class
Claims carry provenance, trust tiers (human > job > agent), timestamps, and hashes. Validation is fail-closed where required.

### 4. Memory that outlives sessions
A Prim is durable memory. It can be versioned, superseded, forked, and shared across agents and time.

### 5. No fixed UX
There is no canonical interface. `ui` is how anything opens a Prim. A Prim Tool operates on that file: surface talks to a human, connector talks to a system. The file itself remains the source of truth.

### 6. Human-readable remains a feature
Prims must still be inspectable and understandable by people. Opacity is not a goal.

### 7. Additive and profile-based
The underlying format family (OKF) is designed to grow through additive profiles rather than monolithic versions. New domains (corporate structure, brand, research, etc.) become new profiles without breaking existing Prims.

## What success looks like

People say:

> “Just send me the prim.”

and it feels obvious.

Spreadsheets, Word docs, and decks become optional views rather than the primary store of important knowledge.

Agents stop re-deriving the same facts from unstructured sources because the Prim already exists.

## Relationship to Eidos

Prim is the category and product identity.

Eidos develops the underlying open format family (OKF profiles) and tools that make Prims real, reliable, and interoperable.
