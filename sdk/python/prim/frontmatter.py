"""YAML-ish frontmatter reader for Prim pack faces.

Deliberately stdlib-only. Prim packs use a small, flat-or-one-level-nested
subset of YAML in `index.md`; pulling in PyYAML to read it would make every
profile repo carry a dependency to open a file it can already read.

If a pack needs full YAML, parse it with a real parser downstream — this
module is for the face, not for arbitrary documents.
"""
from __future__ import annotations

__all__ = ["parse", "split"]


def split(text: str) -> tuple[str, str]:
    """Return (frontmatter_block, body). Empty block when there is no face."""
    if not text.startswith("---"):
        return "", text
    end = text.find("\n---", 3)
    if end == -1:
        return "", text
    body_start = text.find("\n", end + 1)
    return text[3:end], text[body_start + 1:] if body_start != -1 else ""


def _strip_quotes(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    return value


def parse(text: str) -> dict:
    """Parse a pack face into a dict. One level of nesting; lists of scalars."""
    block, _ = split(text)
    face: dict = {}
    current: str | None = None

    for line in block.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue

        indent = len(line) - len(line.lstrip())
        stripped = line.strip()

        if stripped.startswith("- "):
            if current is not None and isinstance(face.get(current), list):
                face[current].append(_strip_quotes(stripped[2:]))
            continue

        if ":" not in stripped:
            continue

        key, _, value = stripped.partition(":")
        key, value = key.strip(), value.strip()

        if indent >= 2 and current and isinstance(face.get(current), dict):
            face[current][key] = _strip_quotes(value)
            continue

        current = key
        if value == "":
            face[key] = {}
        elif value == "[]":
            face[key] = []
        else:
            face[key] = _strip_quotes(value)

    # A key that opened as a nested map but never got children is just empty.
    return face
