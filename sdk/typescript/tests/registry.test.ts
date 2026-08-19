import assert from "node:assert/strict";

import {
  getTool,
  getType,
  listTools,
  listTypes,
  registerTool,
  registerType,
  resetRegistry,
} from "../src/registry.ts";

resetRegistry();

assert.ok(listTypes().length >= 1);
assert.ok(getType("docket"));
assert.equal(getType("docket")?.okf, false);
const listed = getTool("docket-prim");
assert.ok(listed);
assert.equal(listed.kind, "surface");
assert.equal(listed.direction, "talk");
assert.equal(listed.counterpart, "human");
assert.equal(listed.cites, "docket");
assert.equal(listTools({ kind: "surface", cites: "docket" }).length, 1);

const extra = registerType({
  name: "demo",
  repo: "eidos-agi/prim.demo",
  description: "test only",
  okf: false,
  status: "emerging",
});
assert.equal(extra.name, "demo");
assert.throws(() =>
  registerType({
    name: "demo",
    repo: "eidos-agi/prim.demo",
    description: "dup",
    okf: false,
    status: "emerging",
  }),
);
assert.throws(() =>
  registerTool({
    name: "orphan",
    kind: "surface",
    direction: "talk",
    cites: "missing",
  }),
);
const tool = registerTool({
  name: "demo-talk",
  kind: "surface",
  direction: "talk",
  cites: "demo",
});
assert.equal(tool.counterpart, "human");
assert.throws(() =>
  registerTool({
    name: "demo-talk",
    kind: "surface",
    direction: "talk",
    cites: "demo",
  }),
);
resetRegistry();
assert.equal(getType("demo"), undefined);
assert.ok(getTool("docket-prim"));
console.log("registry.test.ts ok");
