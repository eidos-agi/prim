#!/usr/bin/env node
/** Category CLI. Profile validators register on the SDK; this is not a book tool. */

import { PrimError, openPrim } from "./pack.ts";
import { getTool, getType, listTools, listTypes } from "./registry.ts";

const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd) {
  usage();
  process.exit(2);
}

try {
  if (cmd === "registry") {
    registryCmd(args.slice(1));
    process.exit(0);
  }
  const target = args[1];
  if (!target) {
    usage();
    process.exit(2);
  }
  const pack = openPrim(target);
  if (cmd === "open") {
    process.stdout.write(
      `${JSON.stringify({
        profile: pack.profile,
        type: pack.type,
        subtype: pack.subtype,
        viewKey: pack.viewKey,
        trust: pack.trust(),
      })}\n`,
    );
    process.exit(0);
  }
  if (cmd === "validate") {
    const problems = pack.validate();
    for (const item of problems) process.stdout.write(`${item}\n`);
    process.exit(problems.length ? 1 : 0);
  }
  usage();
  process.exit(2);
} catch (err) {
  if (err instanceof PrimError) {
    console.error(err.message);
    process.exit(1);
  }
  throw err;
}

function usage(): void {
  console.error("usage: prim <open|validate> <path>");
  console.error("       prim registry [types|tools|type <name>|tool <name>]");
}

function registryCmd(rest: string[]): void {
  const sub = rest[0] ?? "all";
  if (sub === "types" || sub === "all") {
    if (sub === "all") process.stdout.write("types:\n");
    for (const t of listTypes()) {
      process.stdout.write(`${t.name}\t${t.repo}\t${t.okf ? "okf" : "store"}\t${t.status}\n`);
    }
  }
  if (sub === "tools" || sub === "all") {
    if (sub === "all") process.stdout.write("tools:\n");
    for (const tool of listTools()) {
      process.stdout.write(
        `${tool.name}\t${tool.kind}/${tool.direction}\tcites ${tool.cites}\n`,
      );
    }
    if (sub === "all") return;
  }
  if (sub === "types" || sub === "tools") return;
  if (sub === "type") {
    const name = rest[1];
    const t = name ? getType(name) : undefined;
    if (!t) {
      console.error(name ? `unknown type: ${name}` : "usage: prim registry type <name>");
      process.exit(1);
    }
    process.stdout.write(`${JSON.stringify(t, null, 2)}\n`);
    return;
  }
  if (sub === "tool") {
    const name = rest[1];
    const tool = name ? getTool(name) : undefined;
    if (!tool) {
      console.error(name ? `unknown tool: ${name}` : "usage: prim registry tool <name>");
      process.exit(1);
    }
    process.stdout.write(`${JSON.stringify(tool, null, 2)}\n`);
    return;
  }
  usage();
  process.exit(2);
}
