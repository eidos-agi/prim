"""Open, inspect, and package a Prim.

Implements the shared conventions in SPEC.md §4 and the packaging rules in
§5 — nothing profile-specific. A profile validator builds on top of this;
it should not re-implement archive handling or face parsing.
"""
from __future__ import annotations

import os
import re
import tarfile
import tempfile
import zipfile
from pathlib import Path

from . import frontmatter

__all__ = ["Pack", "open_prim", "BASE_REQUIRED", "PrimError"]

# SPEC §5.2 — the interchange forms a tool that "opens a prim" should accept.
ZIP_SUFFIXES = (".prim.zip", ".prim", ".prim.7z")
TAR_SUFFIXES = (".prim.tar.gz", ".prim.tgz")

# SPEC §4 — index.md is the required face. Profiles add their own required keys.
BASE_REQUIRED = ("okf_version", "profile", "type")

_SECRET = re.compile(
    r"(?i)(api[_-]?key|secret|password|bearer\s|BEGIN [A-Z ]*PRIVATE KEY|sk-[A-Za-z0-9]{20,})"
)


class PrimError(Exception):
    """Raised when something is not a Prim, or cannot be made into one."""


class Pack:
    """A Prim in canonical directory form.

    `root` is the pack root — the directory containing `index.md`. Archives are
    extracted to a temp dir on open; the directory form stays canonical (SPEC §5.1).
    """

    def __init__(self, root: str | os.PathLike, _tmp: tempfile.TemporaryDirectory | None = None):
        self.root = Path(root)
        self._tmp = _tmp  # held so extraction survives as long as the Pack does
        index = self.root / "index.md"
        if not index.is_file():
            raise PrimError(f"no index.md at pack root: {self.root}")
        self.face = frontmatter.parse(index.read_text(encoding="utf-8"))

    # --- identity -------------------------------------------------------

    @property
    def profile(self) -> str | None:
        return self.face.get("profile")

    @property
    def type(self) -> str | None:
        return self.face.get("type")

    def __repr__(self) -> str:
        return f"<Pack profile={self.profile!r} type={self.type!r} root={self.root}>"

    # --- contents -------------------------------------------------------

    def files(self, pattern: str = "**/*") -> list[Path]:
        """Every file in the pack, relative paths, sorted and deterministic."""
        return sorted(p for p in self.root.glob(pattern) if p.is_file())

    def read(self, relpath: str) -> str:
        return (self.root / relpath).read_text(encoding="utf-8")

    def face_of(self, relpath: str) -> dict:
        """Parse the frontmatter of any document in the pack, not just index.md."""
        return frontmatter.parse(self.read(relpath))

    # --- shared gates ---------------------------------------------------

    def validate_base(self) -> list[str]:
        """Category-level checks only (SPEC §4). Profiles add their own.

        Returns a list of human-readable problems; empty means it passed.
        """
        problems: list[str] = []

        for key in BASE_REQUIRED:
            if not self.face.get(key):
                problems.append(f"index.md missing required key: {key}")

        if not (self.root / "log.md").is_file():
            problems.append("log.md absent (strongly recommended by SPEC §4)")

        for path in self.files("**/*.md"):
            text = path.read_text(encoding="utf-8", errors="ignore")
            if _SECRET.search(text):
                problems.append(f"{path.relative_to(self.root)}: secret-shaped string")

        return problems

    # --- packaging (SPEC §5.2) -----------------------------------------

    def write(self, out: str | os.PathLike) -> Path:
        """Write the pack to a `.prim.zip` / `.prim` / `.prim.tar.gz`.

        Rule 3: the archive root IS the pack root — no extra wrapping folder.
        """
        out = Path(out)
        name = out.name

        if name.endswith(TAR_SUFFIXES):
            with tarfile.open(out, "w:gz") as tar:
                for path in self.files():
                    tar.add(path, arcname=str(path.relative_to(self.root)))
        elif name.endswith(ZIP_SUFFIXES) or name.endswith(".zip"):
            with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
                for path in self.files():
                    zf.write(path, arcname=str(path.relative_to(self.root)))
        else:
            raise PrimError(
                f"unknown interchange form: {name} "
                f"(expected one of {ZIP_SUFFIXES + TAR_SUFFIXES})"
            )
        return out


def open_prim(source: str | os.PathLike) -> Pack:
    """Open a directory pack or any supported interchange archive (SPEC §5.2 rule 4)."""
    source = Path(source)

    if source.is_dir():
        return Pack(source)

    if not source.is_file():
        raise PrimError(f"not found: {source}")

    tmp = tempfile.TemporaryDirectory(prefix="prim-")
    name = source.name

    if name.endswith(TAR_SUFFIXES) or name.endswith(".tar.gz"):
        with tarfile.open(source, "r:gz") as tar:
            _safe_extract_tar(tar, tmp.name)
    elif name.endswith(ZIP_SUFFIXES) or name.endswith(".zip"):
        with zipfile.ZipFile(source) as zf:
            _safe_extract_zip(zf, tmp.name)
    else:
        raise PrimError(f"unknown interchange form: {name}")

    root = Path(tmp.name)
    # Rule 3 says the archive root is the pack root, but tolerate one wrapping
    # folder on read — being strict on write and lenient on read costs nothing.
    if not (root / "index.md").is_file():
        entries = [p for p in root.iterdir() if p.is_dir()]
        if len(entries) == 1 and (entries[0] / "index.md").is_file():
            root = entries[0]

    return Pack(root, _tmp=tmp)


def _safe_extract_tar(tar: tarfile.TarFile, dest: str) -> None:
    """Refuse path traversal — an archive from someone else is untrusted input."""
    base = os.path.realpath(dest)
    for member in tar.getmembers():
        target = os.path.realpath(os.path.join(dest, member.name))
        if not target.startswith(base + os.sep) and target != base:
            raise PrimError(f"unsafe path in archive: {member.name}")
    tar.extractall(dest)


def _safe_extract_zip(zf: zipfile.ZipFile, dest: str) -> None:
    base = os.path.realpath(dest)
    for name in zf.namelist():
        target = os.path.realpath(os.path.join(dest, name))
        if not target.startswith(base + os.sep) and target != base:
            raise PrimError(f"unsafe path in archive: {name}")
    zf.extractall(dest)
