"""Prim SDK — open, inspect, and package Prims.

    from prim import open_prim

    p = open_prim("ford-group.prim.zip")
    p.profile          # 'ocsf'
    p.validate_base()  # [] when the category-level gates pass
    p.write("out.prim.tar.gz")

Category-level only. Profile rules (OCSF, OMF, OPAF, …) live in their own
repositories and build on this.
"""
from .pack import Pack, PrimError, open_prim, BASE_REQUIRED
from . import frontmatter

__version__ = "0.1.0"
__all__ = ["Pack", "PrimError", "open_prim", "BASE_REQUIRED", "frontmatter", "__version__"]
