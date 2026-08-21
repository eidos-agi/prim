/** A loaded prim pack, as the player sees it. */
export type PrimFiles = Record<string, string | Uint8Array>;

export type PrimFace = {
  title: string;
  profile: string;
  type: string;
  body: string;
};

export type PrimPack = {
  kind: string;
  project: { name: string };
  files: PrimFiles;
  face: PrimFace;
  names: string[];
  identity?: Record<string, unknown>;
};

export type RenderOpts = {
  filename?: string;
  chrome?: boolean;
  tab?: string;
};

export function getFile(files: PrimFiles, name: string): string | Uint8Array | "";
export function detectKind(files: PrimFiles): string;
export function parsePrim(files: PrimFiles): PrimPack;
export function parseObif(files: PrimFiles): PrimPack;
export function unzipPrim(buf: ArrayBuffer | Uint8Array): Promise<PrimFiles>;
export function loadPrim(src: string): Promise<PrimFiles>;
export function readPrimFile(file: Blob): Promise<PrimFiles>;
export function renderObif(el: Element, pack: PrimPack, opts?: RenderOpts): void;
export function renderPrim(el: Element, pack: PrimPack, opts?: RenderOpts): void;

/** Custom element. Pairing is the tag: <showprim filename="yadda.prim"> */
export class ShowPrim extends HTMLElement {
  static observedAttributes: ["src", "filename"];
  open(): Promise<void>;
}

export {};
