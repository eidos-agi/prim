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
assert.equal(pkg.exports["./webmcp"].default, "./webmcp.js");
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
assert.match(react, /createElement\("show-prim"/);
assert.match(react, /export const ShowPrim/);
assert.doesNotMatch(react, /^["']use client["']/m);

const player = read("showprim.js");
assert.match(player, /from "\.\/webmcp\.js"/);
assert.match(player, /customElements\.define\("show-prim"/);
assert.match(player, /bindWebmcp/);
assert.match(player, /prim-status|webmcp/);

const { toolsFor } = await import("./webmcp.js");
const fake = {
  _tab: "mark",
  status() {
    return {
      open: true,
      filename: "x.prim",
      kind: "obif",
      tab: this._tab,
      tabs: ["mark", "color"],
      files: ["identity.json"],
    };
  },
  setTab(t) {
    this._tab = t;
  },
  face() {
    return { title: "X", profile: "obif", type: "brand", body: "hi" };
  },
  readFile(p) {
    if (p !== "identity.json") throw new Error("no file");
    return { path: p, text: "{}" };
  },
  async openSrc(src) {
    this._src = src;
    return this.status();
  },
};
const tools = Object.fromEntries(toolsFor(() => fake).map((t) => [t.name, t]));
for (const name of ["prim-status", "prim-open", "prim-tab", "prim-files", "prim-face", "prim-read"]) {
  assert.ok(tools[name], name);
}
const st = await tools["prim-status"].execute({});
assert.equal(st.kind, "obif");
assert.ok(st.content?.[0]?.text);
await tools["prim-tab"].execute({ tab: "color" });
assert.equal(fake._tab, "color");
const face = await tools["prim-face"].execute({});
assert.equal(face.profile, "obif");
const file = await tools["prim-read"].execute({ path: "identity.json" });
assert.equal(file.text, "{}");

console.log("ok @eidos-agi/prim-viewer");
