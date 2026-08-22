/**
 * prim-viewer — Flash for .prim files.
 *
 *   <script type="module" src="showprim.js"></script>
 *   <show-prim filename="yadda.prim"></show-prim>
 *
 *   import { ShowPrim } from "@eidos-agi/prim-viewer/react"
 *   import { ShowPrim } from "@eidos-agi/prim-viewer/next"
 *   <ShowPrim filename="yadda.prim" />
 *   WebMCP: prim-status, prim-open, prim-tab, prim-files, prim-face, prim-read
 *   (connector prim-viewer-webmcp — a model talks to this player)
 *
 * The pack stays the file. This surface cites it. Unknown profiles
 * fall back to the face (SPEC §9). OBIF projects a brand board.
 */
import { bindWebmcp, SECRET } from "./webmcp.js";
const TEXT = /\.(md|json|jsonl|txt|svg|css|html|csv|ics)$/i;
const BIN = /\.(png|jpe?g|gif|webp|woff2?|ttf|otf|nes|z64|n64|v64|wad)$/i;

export function getFile(files, name) {
  if (files[name]) return files[name];
  const key = Object.keys(files).find((k) => k === name || k.endsWith("/" + name) || k.replace(/^.*\//, "") === name);
  return key ? files[key] : "";
}

function esc(s) {
  const AMP = String.fromCharCode(38);
  return String(s ?? "").replace(/[&<>"']/g, (c) => {
    if (c === "&") return AMP + "amp;";
    if (c === "<") return AMP + "lt;";
    if (c === ">") return AMP + "gt;";
    if (c === '"') return AMP + "quot;";
    return AMP + "#39;";
  });
}

function faceMatter(md) {
  const text = String(md || "");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const head = m ? m[1] : "";
  const body = m ? m[2] : text;
  const field = (k) => ((head.match(new RegExp("^" + k + ":\\s*(.+)$", "m")) || [])[1] || "").trim();
  return {
    title: field("title"),
    nav: field("nav"),
    group: field("group"),
    profile: field("profile"),
    type: field("type"),
    body: body.trim(),
  };
}

export function detectKind(files) {
  const has = (name) => {
    const v = getFile(files, name);
    return !!(v && (typeof v === "string" ? v.trim() : v.byteLength));
  };
  if (has("docs.json")) return "docs";
  if (has("identity.json")) {
    try {
      JSON.parse(getFile(files, "identity.json") || "");
      return "obif";
    } catch { /* HTML or junk is not a brand prim */ }
  }
  if (has("tasks.jsonl")) return "docket";
  if (has("slides.jsonl")) return "deck";
  if (has("lines.jsonl")) return "invoice";
  if (has("turns.jsonl")) return "session";
  if (has("arcade.json")) return "arcade";
  if (has("accounts.jsonl") || has("finance.json")) return "opff";
  const face = faceMatter(getFile(files, "index.md"));
  return face.profile || "";
}

export function parsePrim(files) {
  const kind = detectKind(files);
  const face = faceMatter(getFile(files, "index.md"));
  const names = Object.keys(files).map((k) => k.replace(/^.*\//, "")).filter(Boolean);
  if (kind === "obif") {
    let identity = {};
    try { identity = JSON.parse(getFile(files, "identity.json") || "{}"); } catch {}
    const name = identity.brand?.display_name || face.title || "brand";
    return { kind: "obif", project: { name }, identity, files, face, names };
  }
  return {
    kind: kind || "prim",
    project: { name: face.title || kind || "prim" },
    files,
    face,
    names,
  };
}

export function parseObif(files) {
  return parsePrim(files);
}

function flatten(files) {
  const keys = Object.keys(files).filter((k) => k && !k.endsWith("/") && !k.includes("__MACOSX"));
  const tops = new Set(keys.map((k) => k.split("/")[0]));
  if (tops.size === 1 && keys.every((k) => k.includes("/"))) {
    const top = [...tops][0];
    const next = {};
    for (const [k, v] of Object.entries(files)) {
      if (k.endsWith("/") || k.includes("__MACOSX")) continue;
      next[k.slice(top.length + 1)] = v;
    }
    return next;
  }
  const next = {};
  for (const [k, v] of Object.entries(files)) {
    if (k.endsWith("/") || k.includes("__MACOSX")) continue;
    next[k.replace(/^\.\//, "")] = v;
  }
  return next;
}

async function inflateRaw(packed) {
  const ds = new DecompressionStream("deflate-raw");
  const stream = new Blob([packed]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function unzipPrim(buf) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = bytes.byteLength - 22;
  while (eocd >= 0 && view.getUint32(eocd, true) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error("not a prim zip");
  const n = view.getUint16(eocd + 8, true);
  let cd = view.getUint32(eocd + 16, true);
  const files = {};
  const dec = new TextDecoder();
  for (let i = 0; i < n; i++) {
    const method = view.getUint16(cd + 10, true);
    const comp = view.getUint32(cd + 20, true);
    const namelen = view.getUint16(cd + 28, true);
    const extra = view.getUint16(cd + 30, true);
    const comment = view.getUint16(cd + 32, true);
    const local = view.getUint32(cd + 42, true);
    const name = dec.decode(bytes.slice(cd + 46, cd + 46 + namelen));
    const locName = view.getUint16(local + 26, true);
    const locExtra = view.getUint16(local + 28, true);
    const dataStart = local + 30 + locName + locExtra;
    const packed = bytes.slice(dataStart, dataStart + comp);
    let out;
    if (method === 0) out = packed;
    else if (method === 8) out = await inflateRaw(packed);
    else throw new Error("unsupported zip method " + method);
    if (!name.endsWith("/")) {
      files[name] = TEXT.test(name) ? dec.decode(out) : out;
    }
    cd += 46 + namelen + extra + comment;
  }
  return flatten(files);
}

const PACK_FILE = /^(?:\.\/)?([A-Za-z0-9._/-]+\.(?:md|json|jsonl|ya?ml|txt|svg|css|png|jpe?g|gif|webp))$/i;

export function packPaths(text) {
  const out = [];
  const seen = new Set();
  const add = (raw) => {
    const n = String(raw || "").trim().replace(/^\.\//, "").split("#")[0].split("?")[0].replace(/^["']|["']$/g, "");
    if (!n || n.includes("..") || n.startsWith("/") || /:\/\//.test(n) || seen.has(n)) return;
    if (!PACK_FILE.test(n)) return;
    seen.add(n);
    out.push(n);
  };
  const src = String(text || "");
  const matter = src.match(/^---\n([\s\S]*?)\n---/);
  if (matter) {
    for (const line of matter[1].split("\n")) {
      const kv = line.match(/^[A-Za-z0-9_-]+:\s+(\S+)$/);
      if (kv) add(kv[1]);
      const item = line.match(/^\s*-\s+(\S+)\s*$/);
      if (item) add(item[1]);
    }
  }
  for (const m of src.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) add(m[1]);
  return out;
}

export async function loadPrim(src) {
  if (typeof src !== "string") throw new Error("need a path");
  const url = src;
  if (/\/$/.test(url) || !/\.(prim|zip|json|md)(\.zip)?$/i.test(url)) {
    const base = url.replace(/\/?$/, "/");
    const files = {};
    const missed = new Set();
    const get = async (path) => {
      if (files[path] != null) return files[path];
      if (missed.has(path)) return "";
      const res = await fetch(base + path);
      if (!res.ok) {
        missed.add(path);
        return "";
      }
      const type = (res.headers.get("content-type") || "").toLowerCase();
      if (BIN.test(path) || type.startsWith("image/")) {
        const buf = new Uint8Array(await res.arrayBuffer());
        const head = new TextDecoder().decode(buf.slice(0, 72));
        if (type.includes("text/html") || /^\s*</.test(head)) {
          missed.add(path);
          return "";
        }
        files[path] = buf;
        return buf;
      }
      const text = await res.text();
      if (type.includes("text/html") || /^\s*<(!doctype|html)\b/i.test(text)) {
        missed.add(path);
        return "";
      }
      files[path] = text;
      return text;
    };
    const index = await get("index.md");
    await get("identity.json");
    await get("log.md");
    if (!index && !files["identity.json"]) throw new Error("no prim at " + url);
    const queue = [...packPaths(index || "")];
    while (queue.length) {
      const path = queue.shift();
      const text = await get(path);
      if (typeof text === "string" && text) queue.push(...packPaths(text).filter((p) => files[p] == null && !missed.has(p)));
    }
    return flatten(files);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("could not fetch " + url);
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf[0] === 0x50 && buf[1] === 0x4b) return unzipPrim(buf);
  const text = new TextDecoder().decode(buf);
  if (text.trim().startsWith("{")) {
    return { "identity.json": text, "index.md": "---\nprofile: obif\ntype: brand\n---\n" };
  }
  return { "index.md": text };
}

export async function readPrimFile(file) {
  const buf = new Uint8Array(await file.arrayBuffer());
  if (buf[0] === 0x50 && buf[1] === 0x4b) return unzipPrim(buf);
  const text = new TextDecoder().decode(buf);
  if (text.trim().startsWith("{")) {
    return { "identity.json": text, "index.md": "---\nprofile: obif\ntype: brand\n---\n" };
  }
  return flatten({ "index.md": text });
}

function assetUrl(pack, idOrPath) {
  const identity = pack.identity || {};
  const assets = identity.assets || [];
  const rec = assets.find((a) => a.id === idOrPath || a.path === idOrPath);
  const path = rec?.path || idOrPath;
  if (path && pack.files[path]) return blobFor(path, pack.files[path]);
  const byName = getFile(pack.files, String(path).replace(/^.*\//, ""));
  if (byName) return blobFor(path, byName);
  if (rec?.url) return rec.url;
  return "";
}

const blobs = new Map();
function blobFor(name, data) {
  const key = name + ":" + (typeof data === "string" ? data.length : data.byteLength);
  if (blobs.has(key)) return blobs.get(key);
  const mime = name.endsWith(".svg")
    ? "image/svg+xml"
    : name.endsWith(".png")
      ? "image/png"
      : /\.jpe?g$/i.test(name)
        ? "image/jpeg"
        : "application/octet-stream";
  const blob = typeof data === "string" ? new Blob([data], { type: mime }) : new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  blobs.set(key, url);
  return url;
}

function tokens(identity) {
  return identity?.color?.tokens || [];
}

function hexOf(identity, pred, fallback) {
  const hit = tokens(identity).find(pred);
  return hit?.hex || fallback;
}

function theme(identity) {
  const t = tokens(identity);
  const paper = hexOf(identity, (x) => x.role === "neutral" && /50$/.test(x.token || ""), t.find((x) => x.role === "neutral")?.hex) || "#f4f3ef";
  const ink = hexOf(identity, (x) => x.role === "primary", "#111111");
  const accent = hexOf(identity, (x) => x.role === "accent" && !x.semantic, t.find((x) => x.role === "accent")?.hex) || "#b47e3c";
  const mute = hexOf(identity, (x) => (x.token || "").endsWith("500") && x.role !== "accent", "#6a6a66");
  const sans = '"Instrument Sans", "Segoe UI", sans-serif';
  const display = identity?.typography?.roles?.find((r) => /display|body/i.test(r.role))?.family || sans;
  const ui = identity?.typography?.roles?.find((r) => /UI|ui|sans/i.test(r.role))?.family || sans;
  const mono = identity?.typography?.roles?.find((r) => /mono/i.test(r.role))?.family || '"IBM Plex Mono", ui-monospace, monospace';
  return { paper, ink, accent, mute, display, ui, mono };
}

function boards(identity) {
  const t = tokens(identity);
  const listed = identity?.color?.boards;
  if (listed?.length) {
    return listed.map((b) => {
      const key = String(b.id || b.name || "").replace(/^board:/, "");
      const swatches = t.filter((x) => (x.token || x.id || "").includes(key));
      const preferred =
        swatches.find((x) => /-(?:50|800|500|600)$/.test(x.token || "") && (x.role === "primary" || x.role === "accent" || x.role === "semantic" || x.role === "neutral")) ||
        swatches[0];
      return {
        name: key,
        meaning: b.meaning || "",
        job: b.job || "",
        hex: preferred?.hex || "#ccc",
        tokens: swatches,
      };
    });
  }
  return t.map((x) => ({
    name: x.token || x.id,
    meaning: x.role || "",
    job: x.job || "",
    hex: x.hex,
    tokens: [x],
  }));
}

const CSS = `
  @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap");
  :host { display: block; height: 100%; color: var(--ink, #111); font: 16px/1.5 var(--ui, "Instrument Sans", "Segoe UI", sans-serif); -webkit-font-smoothing: antialiased; }
  * { box-sizing: border-box; }
  ::selection { background: var(--ink, #111); color: var(--paper, #f4f3ef); }
  .player { border: 1px solid #e4e2dc; border-radius: 16px; overflow: hidden; background: var(--paper, #f4f3ef); }
  .player.page { border: 0; border-radius: 0; height: 100%; display: grid; grid-template-rows: 1fr; }
  .player.page.chrome { grid-template-rows: auto auto 1fr; }
  .player.page .stage { min-height: 0; overflow: auto; padding: 0; }
  .player.over { outline: 2px solid var(--ink, #111); outline-offset: 2px; }
  .read { display: grid; grid-template-columns: 16rem minmax(0, 1fr); min-height: 100%; }
  @media (max-width: 800px) { .read { grid-template-columns: 1fr; } .side { border-right: 0; border-bottom: 1px solid #e4e2dc; } }
  .side { padding: 2rem 1.25rem 3rem; border-right: 1px solid #e4e2dc; }
  .side a { display: block; width: 100%; margin: 0; padding: 0.45rem 0; border: 0; border-radius: 0; background: transparent; color: #6a6a66; font: 0.9rem/1.35 var(--ui); text-align: left; text-decoration: none; cursor: pointer; }
  .side a:hover { color: var(--ink, #111); }
  .side a.on { background: transparent; color: var(--ink, #111); }
  .side .kicker { margin: 0 0 1.25rem; color: #8a8a84; font: 500 0.7rem/1.2 var(--ui); letter-spacing: 0.16em; text-transform: uppercase; }
  .side .nest { padding-left: 0.75rem; }
  .side .group { margin: 1.35rem 0 0.2rem; color: #8a8a84; font: 500 0.7rem/1.2 var(--ui); letter-spacing: 0.16em; text-transform: uppercase; }
  .side .kicker + .group, .side .kicker + a { margin-top: 0; }
  .pager { display: flex; justify-content: space-between; gap: 1rem; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #e4e2dc; }
  .pager a { max-width: 48%; }
  .pager .fwd { margin-left: auto; text-align: right; }
  .pager a span { display: block; margin: 0 0 0.2rem; color: #8a8a84; font: 500 0.7rem/1.2 var(--ui); letter-spacing: 0.16em; text-transform: uppercase; }
  article.prose .pager a { text-decoration: none; }
  article.prose { padding: 2.5rem 2.5rem 6rem; max-width: 44rem; }
  article.prose h1, article.prose h2, article.prose h3 { text-wrap: balance; font-family: var(--display, "Instrument Sans", "Segoe UI", sans-serif); font-weight: 500; letter-spacing: -0.03em; }
  article.prose h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); line-height: 1.1; margin: 0 0 1.25rem; }
  article.prose h2 { font-size: 1.35rem; margin: 2rem 0 0.6rem; }
  article.prose h3 { font-size: 1.05rem; margin: 1.5rem 0 0.4rem; }
  article.prose p, article.prose li { font-size: 1.05rem; line-height: 1.55; color: #111; }
  article.prose p { text-wrap: pretty; margin: 0 0 0.9rem; }
  article.prose ul, article.prose ol { padding-left: 1.2rem; margin: 0 0 1rem; }
  article.prose ul ul { margin: 0.3rem 0 0.5rem; }
  article.prose code { font: 0.88em/1.4 var(--mono, "IBM Plex Mono", ui-monospace, monospace); }
  article.prose pre { overflow: auto; padding: 1rem 1.1rem; border: 1px solid #e4e2dc; border-radius: 12px; background: #fffcf8; font: 0.8rem/1.45 var(--mono, "IBM Plex Mono", ui-monospace, monospace); }
  article.prose blockquote { margin: 1.25rem 0 1.5rem; padding: 0 0 0 1rem; border-left: 1px solid var(--ink, #111); font-size: 1.25rem; font-weight: 500; letter-spacing: -0.03em; }
  article.prose blockquote p { margin: 0.2rem 0; font-size: inherit; }
  article.prose table { border-collapse: collapse; width: 100%; margin: 0 0 1.25rem; font-size: 0.92rem; }
  article.prose th, article.prose td { border-bottom: 1px solid #e4e2dc; padding: 0.55rem 0.65rem 0.55rem 0; text-align: left; }
  article.prose th { font-weight: 500; }
  article.prose a { color: inherit; text-decoration: underline; text-decoration-color: #cfcbc3; text-underline-offset: 3px; }
  article.prose img { max-width: 100%; height: auto; display: block; }
  .story-frames { display: grid; gap: 0.65rem; margin: 1.35rem 0 1.75rem; }
  .story-frames.pair, .story-frames.shots { grid-template-columns: 1fr 1fr; }
  @media (max-width: 640px) { .story-frames.pair, .story-frames.shots { grid-template-columns: 1fr; } }
  .story-frames figure { margin: 0; }
  .story-frames img { width: 100%; border-radius: 12px; border: 1px solid #e4e2dc; }
  .story-frames figcaption { margin-top: 0.4rem; color: #6a6a66; font-size: 0.85rem; line-height: 1.35; }
  .bar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; padding: 10px 14px; border-bottom: 1px solid #e4e2dc; background: #fffcf8; }
  .bar .file { font: 12px/1.2 var(--mono, "IBM Plex Mono", ui-monospace, monospace); }
  .bar .tool { margin-left: auto; color: #6a6a66; font: 11px/1.2 var(--mono, "IBM Plex Mono", ui-monospace, monospace); letter-spacing: 0.08em; text-transform: uppercase; }
  .drop-hint { color: #6a6a66; font: 11px/1.2 var(--mono, "IBM Plex Mono", ui-monospace, monospace); }
  nav.tabs { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 12px; border-bottom: 1px solid #e4e2dc; }
  nav.tabs button { height: 28px; padding: 0 10px; border: 0; border-radius: 999px; background: transparent; color: inherit; font: 12px/1 var(--ui); cursor: pointer; }
  nav.tabs button.on { background: var(--ink, #111); color: var(--paper, #f4f3ef); }
  .stage { padding: 18px 16px 22px; min-height: 280px; }
  .empty { min-height: 280px; display: grid; place-content: center; text-align: center; gap: 8px; color: #6a6a66; }
  .empty b { color: var(--ink, #111); font-weight: 500; }
  h2, h3 { font-family: var(--display, "Instrument Sans", "Segoe UI", sans-serif); font-weight: 500; letter-spacing: -0.03em; margin: 0 0 8px; }
  h2 { font-size: 28px; }
  h3 { font-size: 20px; }
  p { margin: 0 0 10px; }
  .mute { color: var(--mute, #6a6a66); }
  .kicker { margin: 0 0 6px; color: #6a6a66; font: 11px/1.2 var(--mono, "IBM Plex Mono", ui-monospace, monospace); }
  .marks { display: grid; gap: 16px; }
  .marks img { max-width: 100%; height: auto; display: block; }
  .mono-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: end; }
  .mono-row img { width: 72px; height: 72px; }
  .swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .swatch { border: 1px solid #e4e2dc; border-radius: 14px; overflow: hidden; background: #fffcf8; cursor: pointer; text-align: left; padding: 0; font: inherit; color: inherit; }
  .swatch .chip { height: 56px; }
  .swatch .meta { padding: 10px 12px 12px; }
  .swatch .meta b { display: block; font-family: var(--display, "Instrument Sans", "Segoe UI", sans-serif); font-weight: 500; }
  .swatch .meta small { display: block; margin-top: 4px; font: 11px/1.3 var(--mono, "IBM Plex Mono", ui-monospace, monospace); color: #6a6a66; }
  .typegrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; }
  .typecard { border: 1px solid #e4e2dc; border-radius: 14px; padding: 16px; background: #fffcf8; }
  .typecard .aa { font-size: 42px; line-height: 1; }
  ol.voice { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
  ol.voice li { border: 1px solid #e4e2dc; border-radius: 12px; padding: 12px 14px; background: #fffcf8; }
  .rules { display: grid; gap: 8px; }
  .rules p { margin: 0; padding: 10px 12px; border-radius: 12px; border: 1px solid #e4e2dc; background: #fffcf8; }
  .files { font: 12px/1.6 var(--mono, "IBM Plex Mono", ui-monospace, monospace); margin: 0; padding-left: 18px; color: #6a6a66; }
  .toast { position: absolute; right: 16px; bottom: 16px; background: var(--ink, #111); color: var(--paper, #f4f3ef); font: 12px/1 var(--mono, "IBM Plex Mono", ui-monospace, monospace); padding: 8px 10px; border-radius: 8px; opacity: 0; transition: opacity .2s; pointer-events: none; }
  .toast.on { opacity: 1; }
  .err { padding: 24px; color: #825b2b; font: 13px/1.4 var(--mono, "IBM Plex Mono", ui-monospace, monospace); }
`;

function listTree(body, names) {
  const roots = [];
  const stack = [{ depth: -1, children: roots }];
  for (const line of String(body || "").split("\n")) {
    const m = /^( *)[-*]\s+(.*)$/.exec(line);
    if (!m) continue;
    const depth = Math.min(6, Math.floor(m[1].length / 2));
    const rest = m[2].trim();
    const link = /^\[([^\]]+)\]\(([^)]+\.md)(?:#[^)]*)?\)/.exec(rest);
    const page = link ? link[2].replace(/^\.\//, "").split("#")[0] : "";
    const node = {
      title: (link ? link[1] : rest).replace(/[*`]/g, ""),
      page: page && names.has(page) ? page : "",
      children: [],
    };
    while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
    stack[stack.length - 1].children.push(node);
    stack.push({ depth, children: node.children });
  }
  return roots;
}

function walkPages(nodes, out) {
  for (const n of nodes || []) {
    if (n.page) out.push(n.page);
    if (n.children?.length) walkPages(n.children, out);
  }
  return out;
}

export function navTree(pack) {
  const names = new Set((pack.names || []).filter((n) => /\.md$/i.test(n) && n.toLowerCase() !== "log.md"));
  const index = String(getFile(pack.files, "index.md") || "");
  const roots = listTree(faceMatter(index).body || index, names);
  if (!roots.length) {
    const order = [];
    if (names.has("index.md")) order.push("index.md");
    for (const m of index.matchAll(/^\s*[-*]\s+\[[^\]]*\]\(([^)]+\.md)\)/gm)) {
      const p = m[1].replace(/^\.\//, "").split("#")[0];
      if (names.has(p) && !order.includes(p)) order.push(p);
    }
    for (const n of names) if (!order.includes(n)) order.push(n);
    return order.map((page) => ({ title: pageTitle(pack, page), page, children: [] }));
  }
  const seen = walkPages(roots, []);
  if (names.has("index.md") && !seen.includes("index.md")) {
    return [{ title: pageTitle(pack, "index.md"), page: "index.md", children: [] }, ...roots];
  }
  return roots;
}

export function pagesFor(pack) {
  const names = (pack.names || []).filter((n) => /\.md$/i.test(n) && n.toLowerCase() !== "log.md");
  const fromTree = walkPages(navTree(pack), []);
  const rest = names.filter((n) => !fromTree.includes(n));
  return fromTree.length ? [...fromTree, ...rest] : names;
}

export function pageTitle(pack, name) {
  const raw = String(getFile(pack.files, name) || "");
  const face = faceMatter(raw);
  if (face.nav) return face.nav;
  if (face.title) return face.title;
  const h = (face.body || raw).match(/^#\s+(.+)$/m);
  return (h && h[1]) || name.replace(/\.md$/i, "");
}

function mdInline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (all, label, href) => {
      const path = String(href || "").split("#")[0];
      if (PACK_FILE.test(path.replace(/^\.\//, ""))) {
        return `<a href="#${esc(path.replace(/^\.\//, ""))}" data-page="${esc(path.replace(/^\.\//, ""))}">${esc(label)}</a>`;
      }
      return `<a href="${esc(href)}">${esc(label)}</a>`;
    });
}

function packImg(pack, href) {
  const path = String(href || "").replace(/^\.\//, "").split("#")[0].split("?")[0];
  if (!path || !pack) return path;
  const data = getFile(pack.files, path);
  if (data) return blobFor(path, data);
  return path;
}

function takeList(lines, i, indent) {
  const items = [];
  while (i < lines.length) {
    const m = /^(\s*)[-*]\s+(.*)$/.exec(lines[i]);
    if (!m) break;
    const d = m[1].length;
    if (d < indent) break;
    if (d > indent) break;
    i += 1;
    let inner = "";
    if (i < lines.length) {
      const nxt = /^(\s*)[-*]\s/.exec(lines[i]);
      if (nxt && nxt[1].length > d) {
        const nested = takeList(lines, i, nxt[1].length);
        inner = nested.html;
        i = nested.i;
      }
    }
    items.push(`<li>${mdInline(m[2])}${inner}</li>`);
  }
  return { html: `<ul>${items.join("")}</ul>`, i };
}

function renderMd(md, pack) {
  const { body } = faceMatter(md);
  const lines = String(body || md || "").replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  const out = [];
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }
    if (line.startsWith("```")) {
      const buf = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) { buf.push(lines[i]); i += 1; }
      if (i < lines.length) i += 1;
      out.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }
    if (line.startsWith("|") && i + 1 < lines.length && /^\|[\s\-:|]+\|$/.test(lines[i + 1])) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(lines[i].split("|").slice(1, -1).map((c) => c.trim()));
        i += 1;
      }
      const hdr = rows[0] || [];
      const bodyRows = rows.slice(2);
      out.push("<table><thead><tr>" + hdr.map((c) => `<th>${mdInline(c)}</th>`).join("") + "</tr></thead><tbody>" +
        bodyRows.map((r) => "<tr>" + r.map((c) => `<td>${mdInline(c)}</td>`).join("") + "</tr>").join("") +
        "</tbody></table>");
      continue;
    }
    const hm = /^(#{1,3})\s+(.*)$/.exec(line);
    if (hm) {
      out.push(`<h${hm[1].length}>${mdInline(hm[2])}</h${hm[1].length}>`);
      i += 1;
      continue;
    }
    if (/^!\[[^\]]*\]\([^)]+\)\s*$/.test(line.trim())) {
      const figs = [];
      while (i < lines.length && /^!\[[^\]]*\]\([^)]+\)\s*$/.test(lines[i].trim())) {
        const im = /^!\[([^\]]*)\]\(([^)]+)\)/.exec(lines[i].trim());
        i += 1;
        if (!im) continue;
        const src = packImg(pack, im[2]);
        const cap = im[1] ? `<figcaption>${esc(im[1])}</figcaption>` : "";
        figs.push(`<figure><img alt="${esc(im[1])}" src="${esc(src)}">${cap}</figure>`);
      }
      const cls = figs.length === 2 ? "pair" : figs.length > 2 ? "shots" : "single";
      out.push(`<div class="story-frames ${cls}">${figs.join("")}</div>`);
      continue;
    }
    if (/^\s*[-*]\s/.test(line)) {
      const indent = (/^(\s*)/.exec(line) || ["", ""])[1].length;
      const nested = takeList(lines, i, indent);
      out.push(nested.html);
      i = nested.i;
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${mdInline(lines[i].replace(/^\d+\.\s/, ""))}</li>`);
        i += 1;
      }
      out.push(`<ol>${items.join("")}</ol>`);
      continue;
    }
    if (line.startsWith(">")) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      out.push(`<blockquote>${buf.filter(Boolean).map((p) => `<p>${mdInline(p)}</p>`).join("")}</blockquote>`);
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^#{1,3}\s/.test(lines[i]) && !lines[i].startsWith("```") && !lines[i].startsWith("|") && !/^\s*[-*]\s/.test(lines[i]) && !/^\d+\.\s/.test(lines[i]) && !lines[i].startsWith(">") && !/^!\[/.test(lines[i].trim())) {
      para.push(lines[i]);
      i += 1;
    }
    out.push(`<p>${mdInline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

export function tabsFor(pack) {
  if (pack.kind === "obif") {
    const id = pack.identity || {};
    const tabs = [];
    if (id.logo || pack.names.some((n) => /wordmark|logo|monogram/i.test(n))) tabs.push(["mark", "Mark"]);
    if (id.color) tabs.push(["color", "Color"]);
    if (id.typography) tabs.push(["type", "Type"]);
    if (id.voice) tabs.push(["voice", "Voice"]);
    if (id.usage_rules || id.imagery) tabs.push(["rules", "Rules"]);
    tabs.push(["pack", "Pack"]);
    return tabs;
  }
  const log = String(getFile(pack.files, "log.md") || "").trim();
  if (pagesFor(pack).length > 1) {
    const tabs = [["read", "Read"], ["face", "Face"]];
    if (log) tabs.push(["history", "History"]);
    tabs.push(["pack", "Pack"]);
    return tabs;
  }
  const tabs = [["face", "Face"]];
  if (log) tabs.push(["history", "History"]);
  tabs.push(["pack", "Pack"]);
  return tabs;
}

function renderHistory(pack) {
  return `<div>
    <p class="kicker">log.md · the prim keeps this</p>
    <article class="prose">${renderMd(getFile(pack.files, "log.md") || "", pack)}</article>
  </div>`;
}

function renderMark(pack) {
  const id = pack.identity || {};
  const variants = id.logo?.variants || [];
  const word = variants.find((v) => v.role === "primary") || variants[0];
  const icons = variants.filter((v) => v !== word);
  const wordSrc = word ? assetUrl(pack, word.asset_id) : assetUrl(pack, "assets/wordmark.svg");
  const pos = id.brand?.positioning || pack.face?.body || "";
  const mis = (word?.misuse || []).join(", ");
  return `<div class="marks">
    ${wordSrc ? `<img alt="${esc(id.brand?.display_name || "wordmark")}" src="${esc(wordSrc)}">` : ""}
    <p class="mute">${esc(pos)}</p>
    ${mis ? `<p class="kicker">${esc(mis.replace(/_/g, " "))}</p>` : ""}
    <div class="mono-row">${icons.map((v) => {
      const src = assetUrl(pack, v.asset_id);
      return src ? `<img alt="${esc(v.role || v.id)}" src="${esc(src)}">` : "";
    }).join("")}</div>
  </div>`;
}

function renderColor(pack) {
  const id = pack.identity || {};
  const items = boards(id);
  return `<div>
    <p class="kicker">${esc((id.color?.constraints || []).join(" · ") || "color")}</p>
    <div class="swatches">${items.map((b) => `
      <button type="button" class="swatch" data-hex="${esc(b.hex)}" title="copy ${esc(b.hex)}">
        <div class="chip" style="background:${esc(b.hex)}"></div>
        <div class="meta">
          <b>${esc(b.name)}${b.meaning ? " is " + esc(b.meaning) : ""}.</b>
          <small>${esc(b.hex)}${b.job ? " · " + esc(b.job) : ""}</small>
        </div>
      </button>`).join("")}</div>
  </div>`;
}

function renderType(pack) {
  const roles = pack.identity?.typography?.roles || [];
  return `<div class="typegrid">${roles.map((r) => {
    const stack = [r.family, ...(r.fallback || [])].filter(Boolean).join(", ");
    return `<div class="typecard">
      <p class="aa" style="font-family:${esc(stack)}">Aa</p>
      <p class="kicker">${esc(r.role)}</p>
      <p>${esc(r.job || r.family)}</p>
    </div>`;
  }).join("")}</div>`;
}

function renderVoice(pack) {
  const v = pack.identity?.voice || {};
  const attrs = v.attributes || [];
  const rules = v.rules || [];
  const items = attrs.length ? attrs : rules.map((r) => r.do || r.id);
  return `<ol class="voice">${items.map((law, i) => {
    const rule = rules[i];
    const how = rule?.do_say?.[0] || rule?.do || rule?.note || "";
    return `<li><p class="kicker">${String(i + 1).padStart(2, "0")}</p><p>${esc(law)}</p>${how ? `<p class="mute">${esc(how)}</p>` : ""}</li>`;
  }).join("")}</ol>`;
}

function renderRules(pack) {
  const id = pack.identity || {};
  const usage = id.usage_rules || [];
  const img = (id.imagery?.rules || []).map((r) => r.do || r.id);
  const rows = [
    ...usage.map((u) => u.rule || u.id),
    ...img,
  ].filter(Boolean);
  return `<div class="rules">${rows.map((r) => `<p>${esc(r)}</p>`).join("")}</div>`;
}

function renderFace(pack) {
  return `<div>
    <p class="kicker">${esc(pack.kind)} · the file is the prim</p>
    <article class="prose">${renderMd(getFile(pack.files, "index.md") || pack.face?.body || "", pack)}</article>
  </div>`;
}

function renderNav(nodes, current, pack) {
  return (nodes || []).map((n) => {
    const kids = n.children?.length ? `<div class="nest">${renderNav(n.children, current, pack)}</div>` : "";
    if (!n.page) return `<p class="group">${esc(n.title)}</p>${kids}`;
    const on = n.page === current ? "on" : "";
    return `<a href="#${esc(n.page)}" data-page="${esc(n.page)}" class="${on}">${esc(n.title || pageTitle(pack, n.page))}</a>${kids}`;
  }).join("");
}

function renderRead(pack, page) {
  const pages = pagesFor(pack);
  const current = pages.includes(page) ? page : pages[0] || "index.md";
  const i = pages.indexOf(current);
  const prev = i > 0 ? pages[i - 1] : "";
  const next = i >= 0 && i < pages.length - 1 ? pages[i + 1] : "";
  const pager = (prev || next) ? `<nav class="pager">
    ${prev ? `<a href="#${esc(prev)}" data-page="${esc(prev)}"><span>Previous</span>${esc(pageTitle(pack, prev))}</a>` : "<span></span>"}
    ${next ? `<a class="fwd" href="#${esc(next)}" data-page="${esc(next)}"><span>Next</span>${esc(pageTitle(pack, next))}</a>` : ""}
  </nav>` : "";
  return `<div class="read">
    <nav class="side">
      <p class="kicker">${esc(pack.project?.name || "prim")}</p>
      ${renderNav(navTree(pack), current, pack)}
    </nav>
    <article class="prose">${renderMd(getFile(pack.files, current) || "", pack)}${pager}</article>
  </div>`;
}

function renderPackTab(pack, filename) {
  const id = pack.identity || {};
  const prov = id.provenance ? `${id.provenance.by || ""} · ${id.provenance.at || ""}` : "";
  return `<div>
    <p class="kicker">${esc(filename || pack.project.name)}</p>
    <h3>${esc(pack.project.name)}</h3>
    <p class="mute">${esc(pack.kind)} prim. This is a view. The pack stays the file.</p>
    ${pagesFor(pack).length > 1 ? `<p><a href="#index.md" data-tab="read">Read</a></p>` : ""}
    ${prov ? `<p class="kicker">${esc(prov)}</p>` : ""}
    <ol class="files">${(pack.names || []).map((n) => `<li>${esc(n)}</li>`).join("")}</ol>
  </div>`;
}

function pane(pack, tab, filename, page) {
  if (tab === "mark") return renderMark(pack);
  if (tab === "color") return renderColor(pack);
  if (tab === "type") return renderType(pack);
  if (tab === "voice") return renderVoice(pack);
  if (tab === "rules") return renderRules(pack);
  if (tab === "pack") return renderPackTab(pack, filename);
  if (tab === "history") return renderHistory(pack);
  if (tab === "read") return renderRead(pack, page);
  return renderFace(pack);
}

export function renderObif(el, pack, opts = {}) {
  mount(el, pack, opts);
}

export function renderPrim(el, pack, opts = {}) {
  mount(el, pack, opts);
}

function mount(el, pack, opts = {}) {
  const filename = opts.filename || pack.project?.name || "untitled.prim";
  const th = theme(pack.identity);
  const tabs = tabsFor(pack);
  const pages = pagesFor(pack);
  const hashPage = String(location.hash || "").replace(/^#/, "");
  let tab = opts.tab || tabs[0][0];
  if (hashPage === "history" && tabs.some(([id]) => id === "history")) tab = "history";
  else if (hashPage === "pack") tab = "pack";
  else if (hashPage === "face") tab = "face";
  else if (opts.tab) tab = opts.tab;
  let page = pages.includes(hashPage) ? hashPage : (opts.page || pages[0] || "index.md");
  const chrome = opts.chrome !== false;

  const applyTheme = (node) => {
    node.style.setProperty("--paper", th.paper);
    node.style.setProperty("--ink", th.ink);
    node.style.setProperty("--accent", th.accent);
    node.style.setProperty("--mute", th.mute);
    node.style.setProperty("--display", th.display);
    node.style.setProperty("--ui", th.ui);
    node.style.setProperty("--mono", th.mono);
  };

  const root = el.shadowRoot || el;
  const host = el.shadowRoot ? el : el;
  applyTheme(host);

  const goPage = (name) => {
    if (!pages.includes(name)) return;
    page = name;
    if (typeof history !== "undefined") history.replaceState(null, "", "#" + name);
    draw();
  };

  const draw = () => {
    const nav = tabs.map(([id, label]) => `<button type="button" data-tab="${id}" class="${id === tab ? "on" : ""}">${esc(label)}</button>`).join("");
    const inner = `
      ${chrome ? `<div class="bar">
        <span class="file">${esc(filename)}</span>
        <span class="drop-hint">drop a .prim</span>
        <span class="tool">prim-viewer${el._webmcp ? " · webmcp" : ""}</span>
      </div>
      <nav class="tabs">${nav}</nav>` : ""}
      <div class="stage">${pane(pack, tab, filename, page)}</div>
      <div class="toast" hidden>copied</div>
    `;
    const skin = chrome ? "player chrome" : "player page";
    if (el.shadowRoot) {
      root.innerHTML = `<style>${CSS}</style><div class="${skin}">${inner}</div>`;
    } else {
      if (!root.querySelector("style[data-showprim]")) {
        const st = document.createElement("style");
        st.dataset.showprim = "1";
        st.textContent = CSS.replaceAll(":host", ".showprim-host");
        root.prepend(st);
      }
      let player = root.querySelector(".player");
      if (!player) {
        player = document.createElement("div");
        player.className = "player";
        root.appendChild(player);
      }
      el.classList.add("showprim-host");
      player.innerHTML = inner;
    }
    const box = el.shadowRoot ? root : root.querySelector(".player");
    box.querySelectorAll("[data-tab]").forEach((b) => {
      b.addEventListener("click", () => { tab = b.dataset.tab; draw(); });
    });
    box.querySelectorAll("[data-page]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        goPage(b.dataset.page);
      });
    });
    box.querySelectorAll("[data-hex]").forEach((b) => {
      b.addEventListener("click", async () => {
        const hex = b.dataset.hex;
        try { await navigator.clipboard.writeText(hex); } catch {}
        const toast = box.querySelector(".toast");
        if (toast) {
          toast.hidden = false;
          toast.textContent = hex;
          toast.classList.add("on");
          setTimeout(() => toast.classList.remove("on"), 1200);
        }
      });
    });
  };
  const ctl = {
    pack,
    filename,
    tabs: tabs.map(([id, label]) => ({ id, label })),
    get tab() {
      return tab;
    },
    setTab(id) {
      const hit = tabs.find(([t]) => t === id);
      if (!hit) throw new Error("no tab " + id + " — have " + tabs.map(([t]) => t).join(", "));
      tab = id;
      if (typeof history !== "undefined") {
        if (id === "history" || id === "pack" || id === "face") history.replaceState(null, "", "#" + id);
        else if (id === "read" && page) history.replaceState(null, "", "#" + page);
      }
      draw();
    },
  };
  el._ctl = ctl;
  draw();
  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", () => {
      const next = String(location.hash || "").replace(/^#/, "");
      if (next === "history" && tabs.some(([id]) => id === "history")) { tab = "history"; draw(); return; }
      if (next === "pack" || next === "face") { tab = next; draw(); return; }
      if (pages.includes(next) && next !== page) {
        page = next;
        if (tabs.some(([id]) => id === "read")) tab = "read";
        draw();
      }
    });
  }
  return ctl;
}

function emptyHTML() {
  return `<div class="player"><div class="empty"><b>Drop a .prim</b><span>or set filename= on this tag. The pack stays the file.</span></div></div>`;
}

class ShowPrim extends (typeof HTMLElement === "undefined" ? class {} : HTMLElement) {
  static get observedAttributes() { return ["src", "filename", "tab"]; }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._gen = 0;
    this._unbindMcp = null;
    this._onDrop = (e) => this.#drop(e);
    this._onOver = (e) => { e.preventDefault(); this.shadowRoot.querySelector(".player")?.classList.add("over"); };
    this._onLeave = () => this.shadowRoot.querySelector(".player")?.classList.remove("over");
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `<style>${CSS}</style>${emptyHTML()}`;
    this.addEventListener("dragover", this._onOver);
    this.addEventListener("dragleave", this._onLeave);
    this.addEventListener("drop", this._onDrop);
    window.addEventListener("message", this._onMsg);
    if (this.getAttribute("webmcp") !== "0") this._unbindMcp = bindWebmcp(this);
    this.open();
  }
  disconnectedCallback() {
    this.removeEventListener("dragover", this._onOver);
    this.removeEventListener("dragleave", this._onLeave);
    this.removeEventListener("drop", this._onDrop);
    window.removeEventListener("message", this._onMsg);
    this._unbindMcp?.();
    this._unbindMcp = null;
  }
  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === "tab") {
      const id = this.getAttribute("tab");
      if (id && this._ctl) this._ctl.setTab(id);
      return;
    }
    this.open();
  }
  _onMsg = async (e) => {
    const d = e.data;
    if (!d || d.type !== "prim-drop") return;
    const bytes = d.bytes instanceof ArrayBuffer ? new Uint8Array(d.bytes) : d.bytes;
    if (!bytes) return;
    const files = bytes[0] === 0x50 ? await unzipPrim(bytes) : { "index.md": new TextDecoder().decode(bytes) };
    this.#show(files, d.name || "dropped.prim");
  };
  async open() {
    const src = this.getAttribute("src") || this.getAttribute("filename");
    if (!src) return;
    const token = ++this._gen;
    try {
      const files = await loadPrim(src);
      if (token !== this._gen) return;
      this.#show(files, src.split("/").pop());
    } catch (err) {
      if (token !== this._gen) return;
      this._ctl = null;
      this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="err">${esc(err.message || err)}</div>`;
    }
  }
  async openSrc(src, filename) {
    if (filename) this.setAttribute("filename", filename);
    this.setAttribute("src", src);
    await this.open();
  }
  setTab(id) {
    if (!this._ctl) throw new Error("no prim open");
    this._ctl.setTab(id);
  }
  status() {
    const c = this._ctl;
    if (!c) return { open: false };
    return {
      open: true,
      filename: c.filename,
      kind: c.pack.kind,
      title: c.pack.project?.name || "",
      tab: c.tab,
      tabs: c.tabs.map((t) => t.id),
      files: c.pack.names || [],
      brand: c.pack.identity?.brand?.display_name || undefined,
    };
  }
  face() {
    const c = this._ctl;
    if (!c) throw new Error("no prim open");
    const f = c.pack.face || {};
    const body = String(f.body || "");
    return {
      title: f.title,
      profile: f.profile || c.pack.kind,
      type: f.type,
      body: body.length > 4000 ? body.slice(0, 4000) + "…" : body,
    };
  }
  readFile(path) {
    const c = this._ctl;
    if (!c) throw new Error("no prim open");
    const name = String(path || "").replace(/^\.\//, "");
    if (!name || name.includes("..") || name.startsWith("/")) throw new Error("bad path");
    const data = getFile(c.pack.files, name);
    if (data === "" || data == null) throw new Error("no file " + name);
    if (typeof data !== "string") return { path: name, binary: true, bytes: data.byteLength };
    if (SECRET.test(data)) throw new Error("refused: looks like a secret");
    if (data.length > 80_000) return { path: name, truncated: true, text: data.slice(0, 80_000) };
    return { path: name, text: data };
  }
  async #drop(e) {
    e.preventDefault();
    this.shadowRoot.querySelector(".player")?.classList.remove("over");
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    try {
      const files = await readPrimFile(file);
      this.#show(files, file.name);
    } catch (err) {
      this._ctl = null;
      this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="err">${esc(err.message || err)}</div>`;
    }
  }
  #show(files, filename) {
    const pack = parsePrim(files);
    this._ctl = mount(this, pack, {
      filename,
      chrome: this.getAttribute("chrome") !== "0",
      tab: this.getAttribute("tab") || undefined,
    });
  }
}

if (typeof customElements !== "undefined" && !customElements.get("show-prim")) {
  customElements.define("show-prim", ShowPrim);
}

export { ShowPrim };
