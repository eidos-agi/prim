"""One runnable check. Fails if the pack round-trip or the base gates break.

    python3 sdk/python/tests/test_pack.py
"""
import sys, tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from prim import open_prim, frontmatter, PrimError  # noqa: E402

FACE = """---
okf_version: "0.2"
profile: ocsf
type: entity_structure
title: "Fictional Holdings"
tags: []
source:
  authority: human
  note: "invented"
---

Body text.
"""


def build(tmp: Path) -> Path:
    pack = tmp / "fictional"
    pack.mkdir()
    (pack / "index.md").write_text(FACE, encoding="utf-8")
    (pack / "log.md").write_text("# Log\n\n- created\n", encoding="utf-8")
    return pack


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        pack_dir = build(tmp)

        # face parsing: scalars, quoted strings, empty list, nested map
        face = frontmatter.parse(FACE)
        assert face["okf_version"] == "0.2", face
        assert face["profile"] == "ocsf", face
        assert face["title"] == "Fictional Holdings", face
        assert face["tags"] == [], face
        assert face["source"]["authority"] == "human", face

        # directory form
        p = open_prim(pack_dir)
        assert p.profile == "ocsf"
        assert p.type == "entity_structure"
        assert p.validate_base() == [], p.validate_base()

        # round-trip through both required interchange forms (SPEC §5.2)
        for ext in (".prim.zip", ".prim.tar.gz"):
            out = p.write(tmp / f"fictional{ext}")
            back = open_prim(out)
            assert back.face == p.face, ext
            assert back.validate_base() == [], ext
            # rule 3: archive root is the pack root, no wrapping folder
            names = {f.name for f in back.files()}
            assert "index.md" in names, ext

        # base gates actually fail when they should
        broken = tmp / "broken"
        broken.mkdir()
        (broken / "index.md").write_text("---\nprofile: ocsf\n---\n", encoding="utf-8")
        problems = open_prim(broken).validate_base()
        assert any("okf_version" in x for x in problems), problems
        assert any("log.md" in x for x in problems), problems

        # a secret in the pack is a problem, not a shrug
        leaky = tmp / "leaky"
        leaky.mkdir()
        (leaky / "index.md").write_text(FACE, encoding="utf-8")
        (leaky / "log.md").write_text("api_key: sk-abcdefghijklmnopqrstuvwxyz01\n", encoding="utf-8")
        assert any("secret" in x for x in open_prim(leaky).validate_base())

        # not a prim
        empty = tmp / "empty"
        empty.mkdir()
        try:
            open_prim(empty)
        except PrimError:
            pass
        else:
            raise AssertionError("expected PrimError for a directory with no index.md")

    print("ok — face parse, dir open, zip+tar round-trip, base gates, secret scan, non-prim")
    return 0


if __name__ == "__main__":
    sys.exit(main())
