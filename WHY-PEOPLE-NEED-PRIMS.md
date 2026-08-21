# Why People Need Prims

The category docs explain *what* a Prim is. This one explains *who needs one, and why they would care* — starting from ordinary people rather than from agent architecture.

> The short version: people should own the important, changing parts of their lives as small, intelligible files that survive an app, a vendor, a device, or an assistant.

---

## 1. The human problem

Nobody wakes up needing a portable knowledge format. People wake up needing to:

- know what they spent and what is about to be due
- remember which contractor fixed the water heater, and when
- prove the truck's service history to a buyer
- tell a new doctor what they are allergic to and what they already tried
- hand a house-sitter, a spouse, an executor, or a new assistant the facts of a life

Today those facts are scattered across bank portals, camera rolls, inboxes, PDFs, spreadsheets, calendars, and memory. Every app holds a slice and calls it an account. Exports are incomplete, arrive in whatever shape the vendor decided, and are only meaningful inside the product that produced them.

The cost is not abstract:

- **Re-explaining.** Every new tool, service provider, or assistant starts from zero.
- **Lock-in by fragmentation.** Leaving a product means losing the accumulated context, not just the subscription.
- **Decay.** History, decisions, and evidence are the first things lost, because no app is responsible for them.
- **No handoff.** There is nothing you can give someone that means "this is my home" or "this is our money."

The answer is not a universal personal database. It is a set of **bounded, recognizable files a person can name, inspect, hand over, and keep.**

---

## 2. What a Prim gives a person

A Prim is the store. A Prim Tool is a surface or connector that cites it. That split is what makes the file worth owning:

| Property | What it means to a person |
|----------|---------------------------|
| The file is the authority | The app can be replaced without losing the reality it described |
| Human-inspectable | You can open it and understand what it says about you |
| Durable | History, decisions, and evidence accumulate instead of resetting |
| Portable | "Send me the prim" works between people, tools, and assistants |
| No fixed UX | A ledger, a dashboard, a chat, or an agent are all just views |

An agent working on a Prim is working on something the person owns, with a defined scope, rather than on a temporary context window or a vendor's account.

---

## 3. The test

A domain deserves a Prim when all of these hold:

1. **Recognizable ownership** — the person says "my money," "my home," "my car," "our trip."
2. **It accumulates** — history, decisions, evidence, and relationships build up over time.
3. **They would carry it** — moving tools or assistants without it would be a loss.
4. **Multiple interfaces, one meaning** — several tools can help, none should own what it means.
5. **Both readers work** — a human can read the file; an agent can validate and operate on its structure.

The inverse test matters just as much. **A new UI, runtime, connector, or workflow is not a Prim.** If it disappeared and there is no durable human thing worth retaining, it is a surface, connector, cache, or event stream. Registering a pack type per interface is the anti-pattern; a tool cites a registered type instead.

---

## 4. `prim.opff` is the proof

Personal finance is the clearest existing demonstration, and it is worth reading as a template rather than as one profile among many.

`prim.opff` does not model "a finance feature." It models a household's money as a thing the household possesses: accounts, transactions, categories, rules, review and reconciliation state, freshness, and provenance live in the pack. Bank feeds and imports are **inputs and provenance**, not the authority. `opff-editor` is a ledger surface that cites the pack.

> Don't send the bank CSV. Send the finance prim. The ledger is a view of that file.

Two things make it work, and both generalize:

- **A real boundary.** It is personal and household finance. It deliberately does not drift into being a bank connector, an accounting system, or a capital-diligence tool. `prim.ocsf` exists for corporate structure and capital; the boundary is what keeps each pack intelligible.
- **Operational honesty.** Imports, stable transaction identifiers, review queues, stale-account verification, and reconciliation state are in the model because real life has them.

A profile that skips either one produces a schema nobody keeps.

---

## 5. The personal Prims people would actually keep

### The essential set

**Finance** — `prim.opff`. Accounts, transactions, categories, bills, rules, reconciliation, provenance. The one people feel immediately.

**Home** — property facts, rooms, appliances and model numbers, manuals, warranties, maintenance schedule, repair history, contractors, utility and insurance references, photographs, active projects. The file you hand over and say: *this is our home, help us take care of it.*

**Vehicle** — identity and lifecycle: registration, insurance references, mileage, service and repair records, recalls, tires, parts, modifications, manuals, sale history. A complete portable service history instead of a dealership account and a pile of receipts.

**Health** — person-controlled record: care team, medications, allergies, conditions, immunizations, labs, appointments, insurance references, and explicit sharing boundaries. This one demands unusually strong consent, provenance, and access rules. That is a reason to design it deliberately, not a reason to leave a person's record fragmented.

**Household** — the shared operating record for people who live together: members, pets, recurring responsibilities, inventories, routines, emergency information, shared services, agreements. A consented record of a shared life, not a file about people.

**Career** — roles, skills, work samples, claims and the evidence behind them, references, preferences, goals, active opportunities. A résumé is one projection; a job-board profile is another. Neither should be the authority.

**Travel** — one trip: travelers, itinerary, bookings, lodging, reservations, receipts, entry requirements, preferences, and what changed. Stays useful when the airline, hotel, or itinerary app does not.

**Commitments and time** — not merely events: recurring responsibilities, availability rules, protected time, milestones, and which obligations can move. It lets a new assistant understand a person's time without a calendar product owning that reality.

**Estate and digital life** — trusted contacts, document references, asset and obligation inventory, beneficiaries, instructions, review dates, ownership transitions; alongside devices, subscriptions, domains, recovery procedures, and account references. These store **policy, pointers, and secure references — never raw secrets.**

**Memory and family history** — events, stories, photographs, recordings, artifacts, context, provenance, uncertainty, permissions. The point is not a photo dump; it is preserving what a memory means and where it came from.

### The next tier

Insurance across domains · a pet · a garden or plot of land · a collection (books, tools, art, instruments) · a personally significant project (renovation, move, wedding, legal matter, build) · a decision under research, with its question, sources, alternatives, conclusion, and revisit conditions.

---

## 6. Why this matters for agents

The value is not that an agent can read another document format. It is that a person can hand an agent **a bounded thing they own**, with a real scope and a durable authority.

A person should be able to say:

> "This is my house. Help me take care of it."

or:

> "This is our finance prim. Tell me what changed, reconcile what you can, and show me what needs a decision."

The agent opens the file, cites it, proposes changes, validates, and produces views. It must not quietly convert the file into a proprietary account, treat session context as the authority, or make the person re-explain their life at every tool change.

---

## 7. The principle

**Prims are living files for the parts of life people need to carry forward.**

The file is the durable authority. The interface is replaceable. The person stays in control.

---

See also: [WHAT-IS-PRIM.md](./WHAT-IS-PRIM.md) · [INTENTION.md](./INTENTION.md) · [SPEC.md](./SPEC.md) · [FAMILY.md](./FAMILY.md) · [registry/registry.json](./registry/registry.json)
