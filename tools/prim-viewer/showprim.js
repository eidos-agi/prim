/**
 * prim-viewer — Flash for .prim files.
 *
 *   <script type="module" src="showprim.js"></script>
 *   <showprim filename="yadda.prim"></showprim>
 *   <showprim src="/path/to/pack.prim.zip"></showprim>
 *
 * The pack stays the file. This surface cites it. Unknown profiles
 * fall back to the face (SPEC §9). OBIF projects a brand board.
 */
const TEXT = /\.(md|json|jsonl|txt|svg|css|html|csv|ics)$/i;
const BIN = /\.(png|jpe?g|gif|webp|woff2?|ttf|otf|nes|z64|n64|v64|wad)$/i;

export function getFile(files, name) {
  if (files[name]) return files[name];
  const key = Object.keys(files).find((k) => k === name || k.endsWith("/" + name) || k.replace(/^.*\//, "") === name);
  return key ? files[key] : "";
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;",
  }[c]));
}

function faceMatter(md) {
  const text = String(md || "");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const body = m ? m[2] : text;
  const field = (k) => ((text.match(new RegExp("^" + k + ":\\s*(.+)$", "m")) || [])[1] || "").trim();
  return { title: field("title"), profile: field("profile"), type: field("type"), body: body.trim() };
}

export function detectKind(files) {
  const has = (name) => {
    const v = getFile(files, name);
    return !!(v && (typeof v === "string" ? v.trim() : v.byteLength));
  };
  if (has("identity.json")) return "obif";
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

export async function loadPrim(src) {
  if (typeof src !== "string") throw new Error("need a path");
  const url = src;
  if (/\/$/.test(url) || !/\.(prim|zip|json|md)(\.zip)?$/i.test(url)) {
    const base = url.replace(/\/?$/, "/");
    const index = await fetch(base + "index.md").then((r) => (r.ok ? r.text() : ""));
    const identity = await fetch(base + "identity.json").then((r) => (r.ok ? r.text() : ""));
    const files = {};
    if (index) files["index.md"] = index;
    if (identity) files["identity.json"] = identity;
    if (!index && !identity) throw new Error("no prim at " + url);
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
  const display = identity?.typography?.roles?.find((r) => /display|body/i.test(r.role))?.family || "Georgia, serif";
  const ui = identity?.typography?.roles?.find((r) => /UI|ui|sans/i.test(r.role))?.family || "system-ui, sans-serif";
  const mono = identity?.typography?.roles?.find((r) => /mono/i.test(r.role))?.family || "ui-monospace, monospace";
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
  :host { display: block; color: var(--ink, #111); font: 15px/1.45 var(--ui, system-ui, sans-serif); }
  * { box-sizing: border-box; }
  .player { border: 1px solid #e4e2dc; border-radius: 16px; overflow: hidden; background: var(--paper, #f4f3ef); }
  .player.over { outline: 2px solid var(--ink, #111); outline-offset: 2px; }
  .bar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; padding: 10px 14px; border-bottom: 1px solid #e4e2dc; background: #fffcf8; }
  .bar .file { font: 12px/1.2 var(--mono, ui-monospace, monospace); }
  .bar .tool { margin-left: auto; color: #6a6a66; font: 11px/1.2 var(--mono, ui-monospace, monospace); letter-spacing: 0.08em; text-transform: uppercase; }
  .drop-hint { color: #6a6a66; font: 11px/1.2 var(--mono, ui-monospace, monospace); }
  nav { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 12px; border-bottom: 1px solid #e4e2dc; }
  nav button { height: 28px; padding: 0 10px; border: 0; border-radius: 999px; background: transparent; color: inherit; font: 12px/1 var(--ui); cursor: pointer; }
  nav button.on { background: var(--ink, #111); color: var(--paper, #f4f3ef); }
  .stage { padding: 18px 16px 22px; min-height: 280px; }
  .empty { min-height: 280px; display: grid; place-content: center; text-align: center; gap: 8px; color: #6a6a66; }
  .empty b { color: var(--ink, #111); font-weight: 500; }
  h2, h3 { font-family: var(--display, Georgia, serif); font-weight: 400; letter-spacing: -0.03em; margin: 0 0 8px; }
  h2 { font-size: 28px; }
  h3 { font-size: 20px; }
  p { margin: 0 0 10px; }
  .mute { color: var(--mute, #6a6a66); }
  .kicker { margin: 0 0 6px; color: #6a6a66; font: 11px/1.2 var(--mono, ui-monospace, monospace); }
  .marks { display: grid; gap: 16px; }
  .marks img { max-width: 100%; height: auto; display: block; }
  .mono-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: end; }
  .mono-row img { width: 72px; height: 72px; }
  .swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .swatch { border: 1px solid #e4e2dc; border-radius: 14px; overflow: hidden; background: #fffcf8; cursor: pointer; text-align: left; padding: 0; font: inherit; color: inherit; }
  .swatch .chip { height: 56px; }
  .swatch .meta { padding: 10px 12px 12px; }
  .swatch .meta b { display: block; font-family: var(--display, Georgia, serif); font-weight: 400; }
  .swatch .meta small { display: block; margin-top: 4px; font: 11px/1.3 var(--mono, ui-monospace, monospace); color: #6a6a66; }
  .typegrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; }
  .typecard { border: 1px solid #e4e2dc; border-radius: 14px; padding: 16px; background: #fffcf8; }
  .typecard .aa { font-size: 42px; line-height: 1; }
  ol.voice { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
  ol.voice li { border: 1px solid #e4e2dc; border-radius: 12px; padding: 12px 14px; background: #fffcf8; }
  .rules { display: grid; gap: 8px; }
  .rules p { margin: 0; padding: 10px 12px; border-radius: 12px; border: 1px solid #e4e2dc; background: #fffcf8; }
  .files { font: 12px/1.6 var(--mono, ui-monospace, monospace); margin: 0; padding-left: 18px; color: #6a6a66; }
  .toast { position: absolute; right: 16px; bottom: 16px; background: var(--ink, #111); color: var(--paper, #f4f3ef); font: 12px/1 var(--mono, ui-monospace, monospace); padding: 8px 10px; border-radius: 8px; opacity: 0; transition: opacity .2s; pointer-events: none; }
  .toast.on { opacity: 1; }
  .err { padding: 24px; color: #825b2b; font: 13px/1.4 var(--mono, ui-monospace, monospace); }
`;

function tabsFor(pack) {
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
  return [["face", "Face"], ["pack", "Pack"]];
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
  const body = (pack.face?.body || "").split(/\n/).map((line) => {
    if (line.startsWith("# ")) return `<h2>${esc(line.slice(2))}</h2>`;
    if (!line.trim()) return "";
    return `<p>${esc(line)}</p>`;
  }).join("");
  return `<div>
    <p class="kicker">${esc(pack.kind)} · the file is the prim</p>
    ${body}
  </div>`;
}

function renderPackTab(pack, filename) {
  const id = pack.identity || {};
  const prov = id.provenance ? `${id.provenance.by || ""} · ${id.provenance.at || ""}` : "";
  return `<div>
    <p class="kicker">${esc(filename || pack.project.name)}</p>
    <h3>${esc(pack.project.name)}</h3>
    <p class="mute">${esc(pack.kind)} prim. This is a view. The pack stays the file.</p>
    ${prov ? `<p class="kicker">${esc(prov)}</p>` : ""}
    <ol class="files">${(pack.names || []).map((n) => `<li>${esc(n)}</li>`).join("")}</ol>
  </div>`;
}

function pane(pack, tab, filename) {
  if (tab === "mark") return renderMark(pack);
  if (tab === "color") return renderColor(pack);
  if (tab === "type") return renderType(pack);
  if (tab === "voice") return renderVoice(pack);
  if (tab === "rules") return renderRules(pack);
  if (tab === "pack") return renderPackTab(pack, filename);
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
  let tab = opts.tab || tabs[0][0];
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

  const draw = () => {
    const nav = tabs.map(([id, label]) => `<button type="button" data-tab="${id}" class="${id === tab ? "on" : ""}">${esc(label)}</button>`).join("");
    const inner = `
      ${chrome ? `<div class="bar">
        <span class="file">${esc(filename)}</span>
        <span class="drop-hint">drop a .prim</span>
        <span class="tool">prim-viewer</span>
      </div>` : ""}
      <nav>${nav}</nav>
      <div class="stage">${pane(pack, tab, filename)}</div>
      <div class="toast" hidden>copied</div>
    `;
    if (el.shadowRoot) {
      root.innerHTML = `<style>${CSS}</style><div class="player">${inner}</div>`;
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
  draw();
}

function emptyHTML() {
  return `<div class="player"><div class="empty"><b>Drop a .prim</b><span>or set filename= on this tag. The pack stays the file.</span></div></div>`;
}

class ShowPrim extends HTMLElement {
  static get observedAttributes() { return ["src", "filename"]; }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._gen = 0;
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
    this.open();
  }
  disconnectedCallback() {
    this.removeEventListener("dragover", this._onOver);
    this.removeEventListener("dragleave", this._onLeave);
    this.removeEventListener("drop", this._onDrop);
    window.removeEventListener("message", this._onMsg);
  }
  attributeChangedCallback() { if (this.isConnected) this.open(); }
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
      this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="err">${esc(err.message || err)}</div>`;
    }
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
      this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="err">${esc(err.message || err)}</div>`;
    }
  }
  #show(files, filename) {
    const pack = parsePrim(files);
    mount(this, pack, { filename, chrome: this.getAttribute("chrome") !== "0" });
  }
}

if (typeof customElements !== "undefined" && !customElements.get("showprim")) {
  customElements.define("showprim", ShowPrim);
}

export { ShowPrim };
