/** Category registry: Prim types and Prim Tools. Not a tenth primitive. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  counterpartOf,
  createTool,
  type PrimTool,
  type ToolKind,
} from "./tools.ts";

export type TypeStatus = "active" | "emerging" | "private";

export type PrimType = {
  name: string;
  repo: string;
  description: string;
  okf: boolean;
  status: TypeStatus;
};

export type RegisteredTool = PrimTool & {
  counterpart: "human" | "system";
  as?: string;
  bin?: string;
  repo?: string;
};

export type Registry = {
  version: number;
  types: PrimType[];
  tools: RegisteredTool[];
};

type RawRegistry = {
  version: number;
  types: PrimType[];
  tools: PrimTool[];
};

function committedPath(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "../../../registry/registry.json");
}

function loadRaw(source?: string): RawRegistry {
  const path = source ?? committedPath();
  return JSON.parse(readFileSync(path, "utf8")) as RawRegistry;
}

function hydrate(raw: RawRegistry): Registry {
  const types = raw.types.map((t) => freezeType(t));
  const names = new Set(types.map((t) => t.name));
  const tools = raw.tools.map((tool) => hydrateTool(tool, names));
  return Object.freeze({
    version: raw.version,
    types: Object.freeze(types),
    tools: Object.freeze(tools),
  });
}

function freezeType(t: PrimType): PrimType {
  if (!String(t.name || "").trim()) throw new Error("a Prim type needs a name");
  if (!String(t.repo || "").trim()) throw new Error(`type ${t.name} needs a repo`);
  return Object.freeze({ ...t });
}

function hydrateTool(
  tool: PrimTool,
  typeNames: Set<string>,
): RegisteredTool {
  const created = createTool(tool);
  if (!typeNames.has(created.cites)) {
    throw new Error(`tool ${created.name} cites unknown type: ${created.cites}`);
  }
  return Object.freeze({
    ...created,
    counterpart: counterpartOf(created.kind),
  });
}

let current: Registry = hydrate(loadRaw());

export function loadRegistry(source?: string): Registry {
  current = hydrate(loadRaw(source));
  return current;
}

export function registry(): Registry {
  return current;
}

export function listTypes(): readonly PrimType[] {
  return current.types;
}

export function listTools(filter?: {
  kind?: ToolKind;
  cites?: string;
  as?: string;
}): readonly RegisteredTool[] {
  return current.tools.filter((tool) => {
    if (filter?.kind && tool.kind !== filter.kind) return false;
    if (filter?.cites && tool.cites !== filter.cites) return false;
    if (filter?.as && tool.as !== filter.as) return false;
    return true;
  });
}

export function getType(name: string): PrimType | undefined {
  return current.types.find((t) => t.name === name);
}

export function getTool(name: string): RegisteredTool | undefined {
  return current.tools.find((t) => t.name === name);
}

export function registerType(type: PrimType): PrimType {
  if (getType(type.name)) {
    throw new Error(`Prim type already registered: ${type.name}`);
  }
  const next = freezeType(type);
  current = Object.freeze({
    ...current,
    types: Object.freeze([...current.types, next]),
  });
  return next;
}

export function registerTool(tool: PrimTool): RegisteredTool {
  if (getTool(tool.name)) {
    throw new Error(`Prim Tool already registered: ${tool.name}`);
  }
  const names = new Set(current.types.map((t) => t.name));
  const next = hydrateTool(tool, names);
  current = Object.freeze({
    ...current,
    tools: Object.freeze([...current.tools, next]),
  });
  return next;
}

export function resetRegistry(source?: string): Registry {
  return loadRegistry(source);
}
