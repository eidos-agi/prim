/** SPEC §9 — primitives of Prim itself. */

export type Primitive = {
  name: string;
  role: string;
  notThis: string;
};

export const PRIMITIVES: readonly Primitive[] = Object.freeze([
  Object.freeze({
    name: "file",
    role: "The Prim — directory or interchange archive",
    notThis: "A PDF, xlsx, or HTML export",
  }),
  Object.freeze({
    name: "face",
    role: "index.md identity; how anything opens a Prim",
    notThis: "The story, the graph, the claims",
  }),
  Object.freeze({
    name: "authority",
    role: "Profile semantic file(s) pointed from the face",
    notThis: "A projection, a bible, a render",
  }),
  Object.freeze({
    name: "constraint",
    role: "bible/evidence that gates authority",
    notThis: "A second authority",
  }),
  Object.freeze({
    name: "log",
    role: "Append-only production memory",
    notThis: "A changelog written into authority",
  }),
  Object.freeze({
    name: "validator",
    role: "Category gates plus a registered profile validator",
    notThis: "An optional linter",
  }),
  Object.freeze({
    name: "ui",
    role: "View plugin keyed profile/subtype",
    notThis: "A fixed application shipped with the file",
  }),
  Object.freeze({
    name: "compose",
    role: "Cite another Prim; do not merge",
    notThis: "A copy of the neighbor's claims",
  }),
  Object.freeze({
    name: "trust",
    role: "human: > job: > agent:",
    notThis: "A confidence score",
  }),
]);

export const PRIMITIVE_NAMES = Object.freeze(PRIMITIVES.map((p) => p.name));

export function primitive(name: string): Primitive {
  const item = PRIMITIVES.find((p) => p.name === name);
  if (!item) throw new Error(`unknown Prim primitive: ${name}`);
  return item;
}

export const IDENTITY_FACE_KEYS = new Set([
  "okf_version",
  "obf_version",
  "orf_version",
  "opaf_version",
  "ocsf_version",
  "profile",
  "type",
  "subtype",
  "title",
  "status",
  "description",
  "obf_id",
  "orf_id",
  "opaf_id",
  "okf_id",
  "verified",
  "compose",
  "tags",
  "source",
]);

export const LOG_FACE_KEYS = new Set(["log"]);
export const CONSTRAINT_FACE_KEYS = new Set(["bible", "evidence", "schema", "provenance"]);
export const PROJECTION_FACE_KEYS = new Set(["renders"]);
