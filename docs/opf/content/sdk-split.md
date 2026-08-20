# Each Prim type has an internal SDK

Accepted 2026-08-19 (CT) by Daniel. Status is held in the graph as an accepted decision, not a closed meeting.

## The split

The **category SDK** (`prim/sdk`, `@eidos-agi/prim`) opens a pack, reads the face, writes interchange archives, runs shared gates, and registers validators and views. Profile repos were already copying pack load, frontmatter, and zip. Three copies of a bug is three fixes. Nothing profile-specific belongs here.

The **profile SDK** lives in `prim.<type>`. That is the type’s internal SDK: store shape, fail-closed rules, and verbs only that type has. Docket creates tasks. OMF imports a Plaud occurrence and will not let an agent author a binding decision. Brand commits identity bytes. Those are not interchangeable.

## Same pattern as Grayscale file plugins

One kernel. One plugin per type. The plugin is the type’s SDK. The host does not grow a type switch.

## Ruled out

- One mega SDK with every domain type inside the kernel — that is a type switch. The category README forbids it.
- Kernel only, no profile SDK — OMF import and docket `task-create` are not the same job. A type that only needs “open and show the face” is not ready for its own SDK; register a validator and stop.

## Not this pack

Execution stays in docket. Meeting occurrences stay in OMF. This OPF is the product graph for the SDK split.
