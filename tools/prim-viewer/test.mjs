import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const read = (name) => readFileSync(join(dir, name), "utf8");

const pkg = JSON.parse(read("package.json"));
assert.equal(pkg.name, "@eidos-agi/prim-viewer");
assert.equal(pkg.exports["."].default, "./showprim.js");
assert.equal(pkg.exports["./react"].default, "./react.js");
assert.equal(pkg.exports["./next"].default, "./next.js");
assert.ok(pkg.peerDependencies.react);

const next = read("next.js");
assert.ok(
  next.startsWith('"use client"') || next.startsWith("'use client'"),
  "next.js must start with 'use client' so App Router server pages can import it",
);
assert.match(next, /from "\.\/react\.js"/);

const react = read("react.js");
assert.match(react, /from "react"/);
assert.match(react, /import "\.\/showprim\.js"/);
assert.match(react, /createElement\("showprim"/);
assert.match(react, /export const ShowPrim/);
assert.doesNotMatch(react, /^["']use client["']/m);

const player = read("showprim.js");
assert.match(player, /customElements\.define\("showprim"/);
assert.match(player, /export class ShowPrim|class ShowPrim/);

const dts = read("react.d.ts");
assert.match(dts, /export type ShowPrimProps/);
assert.match(dts, /filename\?: string/);

console.log("ok @eidos-agi/prim-viewer");
