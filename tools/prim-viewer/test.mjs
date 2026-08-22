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
assert.match(player, /export function packPaths/);

const { packPaths } = await import("./showprim.js");
assert.deepEqual(
  packPaths("---\ntitle: Prim\nlog: log.md\nwhat: what.md\n---\n\nSee [Spec](spec.md) and https://x.com."),
  ["log.md", "what.md", "spec.md"],
);

const { pagesFor, pageTitle, parsePrim } = await import("./showprim.js");
const docs = parsePrim({
  "index.md": "---\ntitle: Prim\nnav: Prim\ngroup: Start\nwhy: why.md\n---\n\n# Prim\n\n- [Why Prim](why.md)\n- [What](what.md)\n- [Spec](spec.md)\n",
  "why.md": "---\ntitle: Why Prim\nnav: Why Prim\ngroup: Start\n---\n\n# Why Prim\n",
  "what.md": "---\ntitle: What a Prim is\nnav: What\ngroup: Start\n---\n\n# What a Prim is\n",
  "spec.md": "---\ntitle: Category spec\nnav: Spec\ngroup: Reference\n---\n\n# Category spec\n",
  "log.md": "# Log\n",
});
assert.deepEqual(pagesFor(docs), ["index.md", "why.md", "what.md", "spec.md"]);
assert.equal(pageTitle(docs, "spec.md"), "Spec");
assert.equal(pageTitle(docs, "why.md"), "Why Prim");
assert.equal(pageTitle(docs, "what.md"), "What");

const { toolsFor, bindWebmcp, modelContext } = await import("./webmcp.js");
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
  assert.ok(tools[name].title, name + " title");
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

fake._tab = "mark";
bindWebmcp(fake);
const ctx = modelContext();
assert.ok(ctx?.registerTool);
assert.ok(ctx?.executeTool);
const listed = await ctx.getTools();
assert.deepEqual(
  listed.map((t) => t.name),
  ["prim-status", "prim-open", "prim-tab", "prim-files", "prim-face", "prim-read"],
);
const viaName = await ctx.executeTool("prim-status", {});
assert.equal(viaName.open, true);
await ctx.executeTool({ name: "prim-tab" }, { tab: "color" });
assert.equal(fake._tab, "color");
assert.equal(globalThis.modelContext, ctx);

console.log("ok @eidos-agi/prim-viewer");
