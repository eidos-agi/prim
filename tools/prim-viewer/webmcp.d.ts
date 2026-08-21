export type WebmcpContent = { type: "text"; text: string };
export type WebmcpResult = { content: WebmcpContent[]; [key: string]: unknown };

export type WebmcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute: (input?: Record<string, unknown>, opts?: { signal?: AbortSignal }) => Promise<WebmcpResult>;
};

export function modelContext(): {
  registerTool: (tool: WebmcpTool, opts?: { signal?: AbortSignal }) => unknown;
  unregister?: (name: string) => void;
  unregisterTool?: (name: string) => void;
  getTools?: () => unknown[] | Promise<unknown[]>;
  executeTool?: (tool: string | { name: string }, input?: Record<string, unknown>) => Promise<WebmcpResult>;
} | null;

export function result(data: unknown): WebmcpResult;
export function toolsFor(getPlayer: () => {
  status?: () => unknown;
  openSrc?: (src: string, filename?: string) => Promise<unknown>;
  setTab?: (tab: string) => void;
  face?: () => unknown;
  readFile?: (path: string) => unknown;
} | null): WebmcpTool[];

export function bindWebmcp(el: { _webmcp?: boolean }): () => void;
export function playerOf(el?: unknown): unknown;
export const SECRET: RegExp;
