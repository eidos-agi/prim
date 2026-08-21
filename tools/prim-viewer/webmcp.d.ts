export type WebmcpContent = { type: "text"; text: string };
export type WebmcpResult = { content: WebmcpContent[]; [key: string]: unknown };

export type WebmcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input?: Record<string, unknown>) => Promise<WebmcpResult>;
};

export function modelContext(): {
  registerTool: (tool: WebmcpTool, opts?: { signal?: AbortSignal }) => unknown;
  unregister?: (name: string) => void;
  getTools?: () => unknown[];
  executeTool?: (name: string, input?: Record<string, unknown>) => Promise<WebmcpResult>;
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
