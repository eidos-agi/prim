# Contributing to Prim

Prim is early and deliberately open. The specification, the family map, and the packaging rules are all MIT so they can be argued with in public. Disagreement is more useful to us right now than agreement.

## Ways to contribute

**Argue with the spec.** [SPEC.md](./SPEC.md) is at `v0.4.0-draft`. If a rule is ambiguous, unimplementable, or wrong, open an issue with the specific section. A concrete counter-example beats a general objection.

**Propose a profile.** Prim is the category; domain profiles (`prim.<name>`) carry the rules for a domain. See [FAMILY.md](./FAMILY.md) for composition rules and the existing map. A new profile proposal should state the domain, what a claim looks like in it, what validation must reject, and one worked example pack.

**Break a pack.** Take [`examples/minimal-concept`](./examples/minimal-concept), construct a pack that should fail validation, and tell us if it passes. Validation is meant to be fail-closed; a pack that validates when it shouldn't is the most valuable bug report we can get.

**Improve the SDK or viewer.** [`sdk/typescript`](./sdk/typescript) (open, face, validate, write) and [`tools/prim-viewer`](./tools/prim-viewer).

## Ground rules

- **Evidence-first applies to us too.** If a change is justified by a claim about how agents or tools behave, cite the source or show the repro.
- **Profiles are additive.** Existing Prims must keep validating. A change that invalidates previously valid packs needs an explicit migration note and a version bump.
- **The store is not the surface.** Proposals that add fixed UX to the format itself will be pushed back to a Prim Tool.
- **Naming.** `prim.<profile>` for domain profiles. There is no `prim.surface` or `prim.connector` — Prim Tools are operators, not pack types. See [BRAND.md](./BRAND.md).

## Opening an issue

Include the spec section or file path, what you expected, what happened, and the smallest pack that reproduces it. If you're proposing rather than reporting, say what breaks today without the change.

## Pull requests

Small and single-purpose. Reference the issue or spec section. Spec changes should update `SPEC.md` and any affected example in the same PR — a spec that describes something the examples don't do is worse than no spec.

## License

By contributing you agree your contributions are licensed under the [MIT License](./LICENSE).
