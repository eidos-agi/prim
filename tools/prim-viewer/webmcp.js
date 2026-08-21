/**
 * prim-viewer-webmcp — connector / talk / cites * / as webmcp
 *
 * The player is the human surface. This is how a model talks to it.
 * Spec: document.modelContext. Chrome still ships navigator.modelContext.
 * Without a native implementation the same object lands on both, plus
 * globalThis.modelContext, so an in-page agent can call the tools.
 */

const SECRET =
  /(api[_-]?key|secret|password|bearer\s|BEGIN [A-Z ]*PRIVATE KEY|sk-[A-Za-z0-9]{20,})/i;

const PLAYERS = new Set();
let unbindNative = null;

function publishContext(ctx) {
  if (typeof globalThis !== "undefined") globalThis.modelContext = ctx;
  const hosts = [];
  if (typeof document !== "undefined") hosts.push(document);
  if (typeof navigator !== "undefined") hosts.push(navigator);
  for (const host of hosts) {
    try {
      if (host.modelContext?.registerTool) continue;
    } catch {
      /* native getter may throw */
    }
    try {
      Object.defineProperty(host, "modelContext", {
        value: ctx,
        configurable: true,
        enumerable: true,
      });
    } catch {
      try {
        host.modelContext = ctx;
      } catch {
        /* read-only native slot */
      }
    }
  }
  return ctx;
}

function fallbackContext() {
  if (typeof globalThis === "undefined") return null;
  if (globalThis.modelContext?.registerTool) return globalThis.modelContext;
  const tools = new Map();
  const ctx = {
    registerTool(tool) {
      tools.set(tool.name, tool);
      return { name: tool.name };
    },
    unregister(name) {
      tools.delete(name);
    },
    unregisterTool(name) {
      tools.delete(name);
    },
    async getTools() {
      return [...tools.values()].map(({ execute, ...rest }) => rest);
    },
    async executeTool(tool, input) {
      const name = typeof tool === "string" ? tool : tool?.name;
      const hit = tools.get(name);
      if (!hit) throw new Error("no tool " + name);
      return hit.execute(input || {}, { signal: undefined });
    },
    _tools: tools,
  };
  return publishContext(ctx);
}

export function modelContext() {
  if (typeof document !== "undefined" && document.modelContext?.registerTool) {
    return document.modelContext;
  }
  if (typeof navigator !== "undefined" && navigator.modelContext?.registerTool) {
    return navigator.modelContext;
  }
  return fallbackContext();
}

export function result(data) {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  const body = data && typeof data === "object" && !Array.isArray(data) ? data : { value: data };
  return { ...body, content: [{ type: "text", text }] };
}

export function playerOf(el) {
  if (el && PLAYERS.has(el)) return el;
  const list = [...PLAYERS];
  return (
    list.find((p) => {
      try {
        return p.status?.().open;
      } catch {
        return false;
      }
    }) ||
    list[0] ||
    (typeof document !== "undefined" ? document.querySelector("show-prim") : null)
  );
}

function requirePlayer(el) {
  const p = playerOf(el);
  if (!p) throw new Error("no prim-viewer on this page");
  return p;
}

export function toolsFor(getPlayer) {
  return [
    {
      name: "prim-status",
      title: "Prim status",
      description:
        "What prim-viewer has open: filename, kind, title, current tab, tabs, file names. The pack stays the file.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      async execute() {
        const p = getPlayer();
        if (!p?.status) return result({ open: false, tool: "prim-viewer-webmcp" });
        return result({ tool: "prim-viewer-webmcp", ...p.status() });
      },
    },
    {
      name: "prim-open",
      title: "Open a prim",
      description:
        "Open a .prim / .prim.zip (or a pack directory URL) in the player. Same as setting src= on <show-prim>.",
      inputSchema: {
        type: "object",
        properties: {
          src: { type: "string", description: "URL of a .prim, .prim.zip, or pack directory" },
          filename: { type: "string", description: "Optional display name" },
        },
        required: ["src"],
      },
      annotations: { readOnlyHint: false },
      async execute(input) {
        const p = getPlayer();
        if (!p?.openSrc) throw new Error("no prim-viewer on this page");
        await p.openSrc(input.src, input.filename);
        return result(p.status());
      },
    },
    {
      name: "prim-tab",
      title: "Switch tab",
      description: "Switch the player tab (face, mark, color, type, voice, rules, pack, …).",
      inputSchema: {
        type: "object",
        properties: {
          tab: { type: "string", description: "Tab id from prim-status.tabs" },
        },
        required: ["tab"],
      },
      annotations: { readOnlyHint: false },
      async execute(input) {
        const p = getPlayer();
        if (!p?.setTab) throw new Error("no prim-viewer on this page");
        p.setTab(input.tab);
        return result(p.status());
      },
    },
    {
      name: "prim-files",
      title: "List pack files",
      description: "List pack-relative file names in the open prim. Does not return contents.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      async execute() {
        const p = getPlayer();
        if (!p?.status) throw new Error("no prim-viewer on this page");
        const s = p.status();
        return result({ filename: s.filename, files: s.files || [] });
      },
    },
    {
      name: "prim-face",
      title: "Read the face",
      description: "Read the open prim's face (title, profile, type, body). The pack stays the file.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      async execute() {
        const p = getPlayer();
        if (!p?.face) throw new Error("no prim-viewer on this page");
        return result(p.face());
      },
    },
    {
      name: "prim-read",
      title: "Read a pack file",
      description:
        "Read a text file from the open prim by pack-relative path (index.md, identity.json, …). Refuses secrets and binary.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Pack-relative path, no .." },
        },
        required: ["path"],
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      async execute(input) {
        const p = getPlayer();
        if (!p?.readFile) throw new Error("no prim-viewer on this page");
        return result(p.readFile(input.path));
      },
    },
  ];
}

function registerNative(tools) {
  const ctx = modelContext();
  if (!ctx?.registerTool) return () => {};
  const cleaners = [];
  for (const tool of tools) {
    const ac = typeof AbortController !== "undefined" ? new AbortController() : null;
    try {
      const ret = ctx.registerTool(tool, ac ? { signal: ac.signal } : undefined);
      if (ret && typeof ret.then === "function") ret.catch(() => {});
    } catch {
      try {
        ctx.registerTool(tool);
      } catch {
        /* native WebMCP missing or already registered */
      }
    }
    cleaners.push(() => {
      ac?.abort();
      try {
        ctx.unregister?.(tool.name);
      } catch {}
      try {
        ctx.unregisterTool?.(tool.name);
      } catch {}
    });
  }
  return () => {
    for (const c of cleaners) c();
  };
}

export function bindWebmcp(el) {
  if (!el) return () => {};
  PLAYERS.add(el);
  el._webmcp = true;
  if (!unbindNative) {
    const tools = toolsFor(() => requirePlayer());
    unbindNative = registerNative(tools);
  }
  return () => {
    PLAYERS.delete(el);
    el._webmcp = false;
    if (PLAYERS.size === 0 && unbindNative) {
      unbindNative();
      unbindNative = null;
    }
  };
}

export { PLAYERS, SECRET };
