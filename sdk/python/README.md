# prim (Python)

Category-level Prim SDK. Stdlib only.

## Install

Vendor it, or add `sdk/python` to your path. Not on PyPI yet.

```bash
export PYTHONPATH="$PWD/sdk/python:$PYTHONPATH"
```

## API

| Call | Does |
|---|---|
| `open_prim(source)` | Open a directory pack or a `.prim.zip` / `.prim` / `.prim.tar.gz` (SPEC §5.2 rule 4) |
| `Pack.face` | Parsed `index.md` frontmatter |
| `Pack.face_of(relpath)` | Frontmatter of any document in the pack |
| `Pack.files(pattern)` | Sorted, deterministic file list |
| `Pack.read(relpath)` | File contents |
| `Pack.validate_base()` | Shared SPEC §4 gates — returns problems, `[]` means pass |
| `Pack.write(out)` | Write an interchange archive; root is the pack root, no wrapping folder |

`validate_base()` checks only what the category guarantees: `okf_version` / `profile` / `type` present, `log.md` recommended, no secret-shaped strings. Profiles enforce their own gates on top.

## Notes

- **Frontmatter is parsed without PyYAML.** Pack faces use a small flat-or-one-level-nested subset; requiring a dependency to open a file you can already read is the wrong trade. Parse full YAML downstream if a profile needs it.
- **Archive extraction refuses path traversal.** A prim from someone else is untrusted input.
- **Lenient on read, strict on write.** SPEC §5.2 rule 3 says the archive root is the pack root; `write()` always does that, while `open_prim()` tolerates one wrapping folder.
