/** Open, inspect, and package a Prim. SPEC §4 / §5. No profile rules. */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";

import { parse, type Face, type FaceValue } from "./face.ts";
import {
  CONSTRAINT_FACE_KEYS,
  IDENTITY_FACE_KEYS,
  LOG_FACE_KEYS,
  PROJECTION_FACE_KEYS,
} from "./primitives.ts";
import { trustTier } from "./trust.ts";
import { listTools, type RegisteredTool } from "./registry.ts";
import type { ToolKind } from "./tools.ts";
import { resolveView, viewKey, type View } from "./ui.ts";
import { validate } from "./validator.ts";

export const ZIP_SUFFIXES = [".prim.zip", ".prim", ".prim.7z"] as const;
export const TAR_SUFFIXES = [".prim.tar.gz", ".prim.tgz"] as const;
export const BASE_REQUIRED = ["okf_version", "profile", "type"] as const;

export type PackFiles = Record<string, string | Uint8Array>;
export type PackSource = string | { files: PackFiles };
export type PackPair = {
  profile: string | null;
  title: string | null;
  viewKey: string;
  tools: readonly RegisteredTool[];
  surface: RegisteredTool | null;
  connector: RegisteredTool | null;
};

const SECRET =
  /(api[_-]?key|secret|password|bearer\s|BEGIN [A-Z ]*PRIVATE KEY|sk-[A-Za-z0-9]{20,})/i;
const FACE_PATH =
  /^(?![a-z][a-z0-9+.-]*:\/\/)(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+\.[A-Za-z][A-Za-z0-9]{1,15}$/;
const SCHEMEISH = /^[A-Za-z][A-Za-z0-9_-]*:/;

export class PrimError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrimError";
  }
}

function isFacePath(value: string): boolean {
  if (!value || value.startsWith("/") || value.split("/").includes("..")) return false;
  if (SCHEMEISH.test(value) && !value.includes("://")) return false;
  return FACE_PATH.test(value);
}

function walkFiles(root: string): string[] {
  const out: string[] = [];
  const visit = (dir: string) => {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, ent.name);
      if (ent.isDirectory()) visit(p);
      else if (ent.isFile()) out.push(p);
    }
  };
  visit(root);
  return out.sort();
}

function run(cmd: string, args: string[], cwd?: string): string {
  const result = spawnSync(cmd, args, { encoding: "utf8", cwd });
  if (result.error) throw new PrimError(`${cmd} missing: ${result.error.message}`);
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || "").trim();
    throw new PrimError(`${cmd} failed: ${err || result.status}`);
  }
  return result.stdout || "";
}

function endsWithAny(name: string, suffixes: readonly string[]): boolean {
  return suffixes.some((s) => name.endsWith(s));
}

function assertSafeArchiveName(name: string): void {
  safeRel(name, "archive");
}

function safeRel(rel: string, label = "path"): string {
  const norm = String(rel || "").replace(/\\/g, "/");
  if (!norm || norm.startsWith("/") || norm.split("/").includes("..")) {
    throw new PrimError(`unsafe ${label}: ${rel}`);
  }
  return norm;
}

export class Pack {
  readonly root: string;
  readonly face: Face;
  #tmp?: string;

  constructor(root: string, tmp?: string) {
    this.root = resolve(root);
    this.#tmp = tmp;
    const index = join(this.root, "index.md");
    if (!existsSync(index) || !statSync(index).isFile()) {
      throw new PrimError(`no index.md at pack root: ${this.root}`);
    }
    this.face = parse(readFileSync(index, "utf8"));
  }

  get profile(): string | undefined {
    const v = this.face.profile;
    return typeof v === "string" ? v : undefined;
  }

  get type(): string | undefined {
    const v = this.face.type;
    return typeof v === "string" ? v : undefined;
  }

  get subtype(): string | undefined {
    const v = this.face.subtype;
    return typeof v === "string" ? v : undefined;
  }

  get title(): string | undefined {
    const v = this.face.title;
    return typeof v === "string" ? v : undefined;
  }

  get viewKey(): string {
    return viewKey(this.face);
  }

  view(): View {
    return resolveView(this.face);
  }

  /** Registered Prim Tools that cite this pack's profile. The pack stays the file. */
  tools(filter?: { kind?: ToolKind; as?: string }): readonly RegisteredTool[] {
    const cites = this.profile;
    if (!cites) return [];
    return listTools({ cites, kind: filter?.kind, as: filter?.as });
  }

  surface(filter?: { as?: string }): RegisteredTool | undefined {
    return this.tools({ kind: "surface", as: filter?.as })[0];
  }

  connector(filter?: { as?: string }): RegisteredTool | undefined {
    return this.tools({ kind: "connector", as: filter?.as })[0];
  }

  pair(): PackPair {
    return Object.freeze({
      profile: this.profile ?? null,
      title: this.title ?? null,
      viewKey: this.viewKey,
      tools: this.tools(),
      surface: this.surface() ?? null,
      connector: this.connector() ?? null,
    });
  }

  validate(): string[] {
    return validate(this);
  }

  trust(): string | null {
    const verified = this.face.verified;
    if (verified && typeof verified === "object" && !Array.isArray(verified)) {
      const by = verified.by;
      const tier = trustTier(typeof by === "string" ? by : undefined);
      if (tier) return tier;
    }
    const source = this.face.source;
    if (source && typeof source === "object" && !Array.isArray(source)) {
      const raw = source.authority;
      const mark = typeof raw === "string" ? raw : undefined;
      return trustTier(mark) || trustTier(mark ? `${mark}:` : undefined);
    }
    return trustTier(source !== undefined ? String(source) : undefined);
  }

  authorityPaths(): string[] {
    const skip = new Set([
      ...IDENTITY_FACE_KEYS,
      ...LOG_FACE_KEYS,
      ...CONSTRAINT_FACE_KEYS,
      ...PROJECTION_FACE_KEYS,
    ]);
    return this.facePathValues()
      .filter(([key]) => !skip.has(key))
      .map(([, rel]) => rel);
  }

  constraintPaths(): string[] {
    const found = this.facePathValues()
      .filter(([key]) => CONSTRAINT_FACE_KEYS.has(key))
      .map(([, rel]) => rel);
    for (const name of ["bible", "evidence"]) {
      if (
        existsSync(join(this.root, name)) &&
        statSync(join(this.root, name)).isDirectory() &&
        !found.some((item) => item === name || item.startsWith(`${name}/`))
      ) {
        found.push(name);
      }
    }
    return found;
  }

  projectionPaths(): string[] {
    const found = this.facePathValues()
      .filter(([key]) => PROJECTION_FACE_KEYS.has(key))
      .map(([, rel]) => rel);
    if (
      existsSync(join(this.root, "renders")) &&
      statSync(join(this.root, "renders")).isDirectory() &&
      !found.some((item) => item === "renders" || item.startsWith("renders/"))
    ) {
      found.push("renders");
    }
    return found;
  }

  logFile(): string | null {
    const path = join(this.root, "log.md");
    return existsSync(path) && statSync(path).isFile() ? path : null;
  }

  files(pattern = "**/*"): string[] {
    const all = walkFiles(this.root).map((p) => relative(this.root, p).replace(/\\/g, "/"));
    if (pattern === "**/*") return all;
    if (pattern.startsWith("**/") && pattern.includes("*", 3)) {
      const ext = pattern.slice(pattern.lastIndexOf("*") + 1);
      return all.filter((p) => p.endsWith(ext));
    }
    return all.filter((p) => p.includes(pattern));
  }

  read(relpath: string): string {
    return readFileSync(join(this.root, safeRel(relpath)), "utf8");
  }

  readBytes(relpath: string): Buffer {
    return readFileSync(join(this.root, safeRel(relpath)));
  }

  jsonl<T = unknown>(relpath: string): T[] {
    return this.read(relpath)
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as T);
  }

  faceOf(relpath: string): Face {
    return parse(this.read(relpath));
  }

  close(): void {
    if (!this.#tmp) return;
    rmSync(this.#tmp, { recursive: true, force: true });
    this.#tmp = undefined;
  }

  appendLog(line: string, when?: string): void {
    const day = when || new Date().toISOString().slice(0, 10);
    let text = line.trim();
    if (text.startsWith("- ")) text = text.slice(2).trim();
    const bullet = `- ${day} — ${text}\n`;
    const log = join(this.root, "log.md");
    if (!existsSync(log)) {
      writeFileSync(log, `# Log\n\n${bullet}`, "utf8");
      return;
    }
    let existing = readFileSync(log, "utf8");
    if (!existing.endsWith("\n")) existing += "\n";
    writeFileSync(log, existing + bullet, "utf8");
  }

  composeTargets(): string[] {
    const raw = this.face.compose;
    if (typeof raw === "string") return raw ? [raw] : [];
    if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
    return [];
  }

  validateBase(): string[] {
    const problems: string[] = [];

    for (const key of BASE_REQUIRED) {
      if (!this.face[key]) problems.push(`index.md missing required key: ${key}`);
    }

    if (!existsSync(join(this.root, "log.md")) || !statSync(join(this.root, "log.md")).isFile()) {
      problems.push("log.md absent (strongly recommended by SPEC §4)");
    }

    const rootReal = resolve(this.root);
    for (const [key, rel] of this.facePathValues()) {
      const target = resolve(this.root, rel);
      const relToRoot = relative(rootReal, target);
      if (relToRoot.startsWith("..") || relToRoot.split(sep).includes("..")) {
        problems.push(`index.md ${key}: path escapes pack: ${rel}`);
        continue;
      }
      if (!existsSync(target) || !statSync(target).isFile()) {
        problems.push(`index.md ${key}: missing file ${rel}`);
      }
    }

    for (const item of this.composeTargets()) {
      if (SCHEMEISH.test(item) && !item.includes("://")) continue;
      if (isFacePath(item)) {
        if (!existsSync(join(this.root, item)) || !statSync(join(this.root, item)).isFile()) {
          problems.push(`index.md compose: missing file ${item}`);
        }
        continue;
      }
      const other = join(this.root, item);
      if (existsSync(other) && statSync(other).isDirectory()) {
        if (!existsSync(join(other, "index.md"))) {
          problems.push(`index.md compose: ${item} has no index.md`);
        }
      } else if (!existsSync(other)) {
        problems.push(`index.md compose: missing pack ${item}`);
      }
    }

    for (const rel of this.files("**/*.md")) {
      if (SECRET.test(this.read(rel))) {
        problems.push(`${rel}: secret-shaped string`);
      }
    }

    return problems;
  }

  write(out: string): string {
    const dest = resolve(out);
    const name = dest.split(/[/\\]/).pop() || dest;
    if (existsSync(dest)) rmSync(dest);

    if (endsWithAny(name, TAR_SUFFIXES) || name.endsWith(".tar.gz")) {
      run("tar", ["-czf", dest, "-C", this.root, "."]);
    } else if (endsWithAny(name, ZIP_SUFFIXES) || name.endsWith(".zip")) {
      run("zip", ["-rq", dest, "."], this.root);
    } else {
      throw new PrimError(
        `unknown interchange form: ${name} (expected one of ${[...ZIP_SUFFIXES, ...TAR_SUFFIXES].join(", ")})`,
      );
    }
    return dest;
  }

  facePathValues(): [string, string][] {
    const found: [string, string][] = [];
    for (const [key, value] of Object.entries(this.face)) {
      if (key === "compose") continue;
      if (typeof value === "string" && isFacePath(value)) found.push([key, value]);
      else if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "string" && isFacePath(item)) found.push([key, item]);
        }
      }
    }
    return found;
  }
}

function materialize(files: PackFiles): Pack {
  const tmp = mkdtempSync(join(tmpdir(), "prim-"));
  for (const [rel, body] of Object.entries(files)) {
    const dest = join(tmp, safeRel(rel, "pack file"));
    mkdirSync(dirname(dest), { recursive: true });
    if (typeof body === "string") writeFileSync(dest, body, "utf8");
    else writeFileSync(dest, Buffer.from(body));
  }
  return new Pack(tmp, tmp);
}

export function openPrim(source: PackSource): Pack {
  if (typeof source !== "string") return materialize(source.files);
  const path = resolve(source);
  if (existsSync(path) && statSync(path).isDirectory()) return new Pack(path);
  if (!existsSync(path) || !statSync(path).isFile()) {
    throw new PrimError(`not found: ${path}`);
  }

  const tmp = mkdtempSync(join(tmpdir(), "prim-"));
  const name = path.split(/[/\\]/).pop() || path;

  if (endsWithAny(name, TAR_SUFFIXES) || name.endsWith(".tar.gz")) {
    run("tar", ["-xzf", path, "-C", tmp]);
  } else if (endsWithAny(name, ZIP_SUFFIXES) || name.endsWith(".zip")) {
    const listing = run("unzip", ["-Z", "-1", path]);
    for (const entry of listing.split("\n").filter(Boolean)) assertSafeArchiveName(entry);
    run("unzip", ["-qo", path, "-d", tmp]);
  } else {
    throw new PrimError(`unknown interchange form: ${name}`);
  }

  let root = tmp;
  if (!existsSync(join(root, "index.md"))) {
    const entries = readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory());
    if (entries.length === 1 && existsSync(join(root, entries[0].name, "index.md"))) {
      root = join(root, entries[0].name);
    }
  }

  return new Pack(root, tmp);
}

export type { Face, FaceValue };
