#!/usr/bin/env python3
"""Fail-closed validator for prim.person. Pack is a directory."""
from __future__ import annotations
import json, re, sys
from pathlib import Path
TOKEN = re.compile(r"^[a-z][a-z0-9.-]*$")

def face_fields(text: str) -> dict[str, str]:
    if not text.startswith("---"):
        return {}
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}
    out = {}
    for line in parts[1].splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out

def problems(pack: Path) -> list[str]:
    found = []
    face_path = pack / "index.md"
    if not face_path.is_file():
        return ["missing index.md"]
    face = face_fields(face_path.read_text(encoding="utf-8"))
    if face.get("profile") != "person":
        found.append("face profile must be person")
    rel = face.get("person")
    if not rel:
        found.append("face must point person: at person.json")
        return found
    if "/" in rel or rel.startswith(".") or rel != Path(rel).name:
        found.append("person: must be a single filename in the pack root")
        return found
    auth = pack / rel
    if not auth.is_file():
        found.append(f"missing authority {rel}")
        return found
    try:
        data = json.loads(auth.read_text(encoding="utf-8"))
    except json.JSONDecodeError as err:
        found.append(f"{rel} is not JSON: {err}")
        return found
    if not isinstance(data, dict):
        found.append(f"{rel} must be an object")
        return found
    if not TOKEN.match(str(data.get("id") or "")):
        found.append("id must match [a-z][a-z0-9.-]*")
    if not str(data.get("name") or "").strip():
        found.append("name is required")
    for key in ("phones", "emails"):
        val = data.get(key)
        if val is not None and (not isinstance(val, list) or any(not isinstance(x, str) for x in val)):
            found.append(f"{key} must be an array of strings")
    return found

def main(argv):
    if len(argv) != 2:
        print("usage: validate.py <pack-dir>", file=sys.stderr)
        return 2
    pack = Path(argv[1])
    if not pack.is_dir():
        print("pack must be a directory", file=sys.stderr)
        return 2
    found = problems(pack)
    if found:
        print("\n".join(found))
        return 1
    print("ok")
    return 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
