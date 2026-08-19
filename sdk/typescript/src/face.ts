/** Face parser. One-level nest, no YAML library. SPEC §4. */

export type FaceValue = string | FaceMap | FaceValue[];
export type FaceMap = { [key: string]: FaceValue };
export type Face = FaceMap;

export function split(text: string): [string, string] {
  if (!text.startsWith("---")) return ["", text];
  const end = text.indexOf("\n---", 3);
  if (end === -1) return ["", text];
  const bodyStart = text.indexOf("\n", end + 1);
  return [text.slice(3, end), bodyStart === -1 ? "" : text.slice(bodyStart + 1)];
}

function stripQuotes(value: string): string {
  const v = value.trim();
  if (v.length >= 2 && v[0] === v[v.length - 1] && (v[0] === '"' || v[0] === "'")) {
    return v.slice(1, -1);
  }
  return v;
}

export function parse(text: string): Face {
  const [block] = split(text);
  const face: Face = {};
  let current: string | null = null;

  for (const line of block.split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const indent = line.length - line.trimStart().length;
    const stripped = line.trim();

    if (stripped.startsWith("- ")) {
      if (current == null) continue;
      const existing = face[current];
      if (!Array.isArray(existing)) face[current] = [];
      (face[current] as FaceValue[]).push(stripQuotes(stripped.slice(2)));
      continue;
    }

    if (!stripped.includes(":")) continue;
    const i = stripped.indexOf(":");
    const key = stripped.slice(0, i).trim();
    const value = stripped.slice(i + 1).trim();
    const cur = current ? face[current] : undefined;

    if (indent >= 2 && current && cur && typeof cur === "object" && !Array.isArray(cur)) {
      (cur as FaceMap)[key] = stripQuotes(value);
      continue;
    }

    current = key;
    if (value === "") face[key] = {};
    else if (value === "[]") face[key] = [];
    else face[key] = stripQuotes(value);
  }

  return face;
}
