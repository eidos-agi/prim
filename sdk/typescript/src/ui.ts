/** Prim UI — a view plugin, not a book app. SPEC §9. */

import type { Face } from "./face.ts";

export type View = {
  key: string;
  profile: string;
  subtype?: string | null;
  projects: string;
};

export function viewKey(face: Face | null | undefined): string {
  if (!face) return "okf/face";
  const profile = String(face.profile || "okf");
  const tail = face.subtype || face.type || "face";
  return `${profile}/${tail}`;
}

export function createView(view: View): View {
  return Object.freeze({
    key: view.key,
    profile: view.profile,
    subtype: view.subtype ?? null,
    projects: view.projects ?? "face",
  });
}

export const FACE_VIEW = createView({ key: "okf/face", profile: "okf", projects: "face" });

const views = new Map<string, View>([[FACE_VIEW.key, FACE_VIEW]]);

export function registerView(view: View): void {
  views.set(view.key, view);
}

export function resolveView(face: Face | null | undefined): View {
  const key = viewKey(face);
  return views.get(key) ?? FACE_VIEW;
}
