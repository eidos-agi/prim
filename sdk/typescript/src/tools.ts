/** SPEC §10 — Prim Tools operate on a Prim. They are not a tenth primitive. */

export const TOOL_KINDS = Object.freeze(["surface", "connector"] as const);
export type ToolKind = (typeof TOOL_KINDS)[number];

export const TOOL_DIRECTIONS = Object.freeze(["emit", "talk", "receive"] as const);
export type ToolDirection = (typeof TOOL_DIRECTIONS)[number];

export type ToolCounterpart = "human" | "system";

export type PrimTool = {
  name: string;
  kind: ToolKind;
  direction: ToolDirection;
  cites: string;
};

export function counterpartOf(kind: ToolKind): ToolCounterpart {
  return kind === "surface" ? "human" : "system";
}

export function isToolKind(value: string): value is ToolKind {
  return (TOOL_KINDS as readonly string[]).includes(value);
}

export function isToolDirection(value: string): value is ToolDirection {
  return (TOOL_DIRECTIONS as readonly string[]).includes(value);
}

export function createTool(tool: PrimTool): Readonly<PrimTool> {
  if (!isToolKind(tool.kind)) {
    throw new Error(`unknown Prim Tool kind: ${String(tool.kind)}`);
  }
  if (!isToolDirection(tool.direction)) {
    throw new Error(`unknown Prim Tool direction: ${String(tool.direction)}`);
  }
  if (!String(tool.name || "").trim()) {
    throw new Error("a Prim Tool needs a name");
  }
  if (!String(tool.cites || "").trim()) {
    throw new Error("a Prim Tool must cite a Prim");
  }
  return Object.freeze({
    name: tool.name,
    kind: tool.kind,
    direction: tool.direction,
    cites: tool.cites,
  });
}
