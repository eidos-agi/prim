#!/usr/bin/env node
/** Category CLI. Profile validators register on the SDK; this is not a book tool. */

import { PrimError, openPrim } from "./pack.ts";

const [cmd, target] = process.argv.slice(2);

if (!cmd || !target) {
  console.error("usage: prim <open|validate> <path>");
  process.exit(2);
}

try {
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
  console.error("usage: prim <open|validate> <path>");
  process.exit(2);
} catch (err) {
  if (err instanceof PrimError) {
    console.error(err.message);
    process.exit(1);
  }
  throw err;
}
