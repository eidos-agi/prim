# Prim SDKs

Reference implementations of the **category-level** Prim conventions: open a pack, read its face, check the shared gates, write an interchange archive.

Profile rules (OCSF, OMF, OPAF, OSF, …) live in their own repositories and build on top of these. Nothing profile-specific belongs here.

| Language | Path | Status |
|---|---|---|
| Python | [`python/`](python) | v0.1.0 — stdlib only |

## Why this exists

Every profile repo was re-implementing the same three things: frontmatter parsing, pack loading, and archive handling. Three copies of a bug is three fixes.

## Python

```python
from prim import open_prim

p = open_prim("ford-group.prim.zip")   # dir, .prim.zip, .prim, or .prim.tar.gz
p.profile                              # 'ocsf'
p.face["okf_version"]                  # '0.2'
p.validate_base()                      # [] when the SPEC §4 gates pass
p.write("ford-group.prim.tar.gz")      # SPEC §5.2 interchange
```

Run the check:

```bash
python3 sdk/python/tests/test_pack.py
```

No dependencies, by design. A validator you cannot run is not a gate.
